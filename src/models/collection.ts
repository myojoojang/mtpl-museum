import { MAX_SEARCH_RESULTS, MAX_SEARCH_PAGE_SIZE } from '../config/collection';
import { sampleIds } from '../utils/sampling';
import type {
  Artwork, CancellationCheck, CollectionQuery, MuseumApi, RequestHandle, RequestOptions, SearchResult,
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
    const selected = state.ids;
    const result = await api.getArtworks(selected, options);
    if (!isCurrent()) return;
    state.artworks = result.artworks;
    state.failed = result.failed;
    if (selected.length && !result.artworks.length) {
      state.error = 'Unable to load artworks. Please try again.';
    }
  }

  async function fetchPage(options: RequestOptions, isCurrent: () => boolean): Promise<void> {
    if (!query) return;
    const activeQuery = { ...query };
    const isDepartment = activeQuery.departmentId != null;
    searchFailed = true;
    state.ids = [];

    // Discover a department's size before choosing a random bounded window.
    // Keyword searches request only the page the visitor selected.
    let departmentResult: SearchResult | undefined;
    if (isDepartment && !state.total) {
      departmentResult = await api.search({ ...activeQuery, offset: 0, limit: 1, ...options });
      if (!isCurrent()) return;
      state.total = departmentResult.total;
    }

    const reachable = Math.min(state.total, MAX_SEARCH_RESULTS);
    const limit = isDepartment
      ? Math.min(MAX_SEARCH_PAGE_SIZE, Math.max(state.pageSize, 100), reachable)
      : Math.min(state.pageSize, MAX_SEARCH_RESULTS - (state.page - 1) * state.pageSize);
    const offset = isDepartment
      ? Math.floor(Math.random() * (Math.max(0, reachable - limit) + 1))
      : (state.page - 1) * state.pageSize;
    const result = isDepartment && reachable <= 1 && departmentResult
      ? departmentResult
      : await api.search({ ...activeQuery, offset, limit, ...options });
    if (!isCurrent()) return;
    state.ids = isDepartment ? sampleIds(result.ids, state.pageSize) : result.ids;
    state.total = result.total;
    searchFailed = false;
    await fetchArtworks(options, isCurrent);
  }

  function refresh(): Promise<void> {
    if (!query) return Promise.resolve();
    return run(fetchPage, 'Unable to load the collection. Please try again.');
  }

  function load(nextQuery: CollectionQuery): Promise<void> {
    if (disposed) return Promise.resolve();
    query = { ...nextQuery };
    state.ids = [];
    state.total = 0;
    state.page = 1;
    return refresh();
  }

  return {
    state,
    load,
    refresh,
    setPage(page: number) {
      const pageCount = Math.max(1, Math.ceil(Math.min(state.total, MAX_SEARCH_RESULTS) / state.pageSize));
      if (disposed || !Number.isInteger(page) || page < 1 || page > pageCount) return Promise.resolve();
      state.page = page;
      return refresh();
    },
    setPageSize(size: number) {
      if (disposed || !Number.isInteger(size) || size < 1 || size > MAX_SEARCH_PAGE_SIZE) {
        return Promise.resolve();
      }
      state.pageSize = size;
      state.page = 1;
      return refresh();
    },
    retry() {
      return searchFailed ? refresh() : run(fetchArtworks, 'Unable to load artworks. Please try again.');
    },
    dispose() {
      disposed = true;
      cancel();
      state.loading = false;
    },
  };
}
