import { sampleIds } from '../utils/sampling';
import type {
  Artwork, CancellationCheck, CollectionQuery, MuseumApi, RequestHandle, RequestOptions,
} from '../types/museum';

export interface CollectionState {
  ids: number[];
  artworks: Artwork[];
  total: number;
  failed: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string;
}

export interface CollectionDependencies {
  api: Pick<MuseumApi, 'search' | 'getArtworks'>;
  createRequest(): RequestHandle;
  isCancelled: CancellationCheck;
}

export interface Collection {
  state: CollectionState;
  load(query: CollectionQuery): Promise<void>;
  refresh(): Promise<void>;
  setPage(page: number): Promise<void>;
  setPageSize(size: number): Promise<void>;
  retry(): Promise<void>;
  dispose(): void;
}

type Operation = (options: RequestOptions, isCurrent: () => boolean) => Promise<void>;

// This model owns request lifetimes and collection state. Vue observes `state`
// when a component includes it in data; the model itself has no UI dependency.
export function createCollection({ api, createRequest, isCancelled }: CollectionDependencies): Collection {
  const state: CollectionState = {
    ids: [], artworks: [], total: 0, failed: 0,
    page: 1, pageSize: 10, loading: false, error: '',
  };
  let query: CollectionQuery | null = null;
  let request: RequestHandle | null = null;
  let searchFailed = false;
  let disposed = false;

  function cancel() {
    if (request) request.cancel();
    request = null;
  }

  async function run(operation: Operation, message: string): Promise<void> {
    if (disposed) return;
    cancel();
    const current = createRequest();
    request = current;
    state.loading = true;
    state.error = '';
    state.failed = 0;
    state.artworks = [];
    const isCurrent = () => request === current;
    try {
      await operation({ cancelToken: current.token }, isCurrent);
    } catch (error) {
      if (isCurrent() && !isCancelled(error)) state.error = message;
    } finally {
      if (isCurrent()) {
        state.loading = false;
        request = null;
      }
    }
  }

  async function fetchArtworks(options: RequestOptions, isCurrent: () => boolean): Promise<void> {
    if (!query) return;
    const start = (state.page - 1) * state.pageSize;
    const selected = query.departmentId == null
      ? state.ids.slice(start, start + state.pageSize)
      : sampleIds(state.ids, state.pageSize);
    const result = await api.getArtworks(selected, options);
    if (!isCurrent()) return;
    state.artworks = result.artworks;
    state.failed = result.failed;
    if (selected.length && !result.artworks.length) {
      state.error = 'Unable to load artworks. Please try again.';
    }
  }

  function load(nextQuery: CollectionQuery): Promise<void> {
    if (disposed) return Promise.resolve();
    query = { ...nextQuery };
    state.ids = [];
    state.total = 0;
    state.page = 1;
    searchFailed = false;
    return run(async (options, isCurrent) => {
      let result;
      try {
        result = await api.search({ ...nextQuery, ...options });
      } catch (error) {
        if (isCurrent() && !isCancelled(error)) searchFailed = true;
        throw error;
      }
      if (!isCurrent()) return;
      state.ids = result.ids;
      state.total = result.total;
      await fetchArtworks(options, isCurrent);
    }, 'Unable to load the collection. Please try again.');
  }

  function refresh(): Promise<void> {
    if (!query) return Promise.resolve();
    return run(fetchArtworks, 'Unable to load artworks. Please try again.');
  }

  return {
    state,
    load,
    refresh,
    setPage(page: number) {
      state.page = page;
      return refresh();
    },
    setPageSize(size: number) {
      state.pageSize = size;
      state.page = 1;
      return refresh();
    },
    retry() { return searchFailed && query ? load(query) : refresh(); },
    dispose() {
      disposed = true;
      cancel();
      state.loading = false;
    },
  };
}
