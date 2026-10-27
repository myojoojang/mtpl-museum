import axios from 'axios';
import type { CancelTokenSource } from 'axios';
import { MAX_SEARCH_RESULTS } from '../config/collection';
import { sampleIds } from '../utils/sampling';
import type { Artwork, CollectionQuery, MuseumApi } from '../types/museum';

interface CollectionState {
  artworks: Artwork[];
  total: number;
  failed: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string;
}

export function createCollection(api: Pick<MuseumApi, 'search' | 'getArtworks'>) {
  const state: CollectionState = {
    artworks: [], total: 0, failed: 0, page: 1, pageSize: 10, loading: false, error: '',
  };
  let request: CancelTokenSource | null = null;
  let department: { id: number; total: number } | null = null;
  let disposed = false;

  async function load(query: CollectionQuery, page = 1, pageSize = 10): Promise<void> {
    const start = (page - 1) * pageSize;
    if (disposed || start < 0 || start >= MAX_SEARCH_RESULTS) return;
    request?.cancel();
    const current = axios.CancelToken.source();
    request = current;
    const options = { cancelToken: current.token };
    Object.assign(state, { artworks: [], total: 0, failed: 0, page, pageSize, loading: true, error: '' });

    try {
      let offset = start;
      let limit = Math.min(pageSize, MAX_SEARCH_RESULTS - start);
      const departmentId = query.departmentId;
      const isDepartment = typeof departmentId === 'number';
      if (isDepartment) {
        // A count and a random search window replace the original unbounded ID list.
        if (!department || department.id !== departmentId) {
          const result = await api.search({ ...query, offset: 0, limit: 1, ...options });
          if (request !== current) return;
          department = { id: departmentId, total: result.total };
        }
        const total = Math.min(department.total, MAX_SEARCH_RESULTS);
        limit = Math.min(100, total);
        offset = Math.floor(Math.random() * (Math.max(0, total - limit) + 1));
      }
      const result = limit > 0
        ? await api.search({ ...query, offset, limit, ...options })
        : { ids: [], total: 0 };
      if (request !== current) return;
      state.total = result.total;
      const ids = isDepartment ? sampleIds(result.ids, pageSize) : result.ids;
      const { artworks, failed } = await api.getArtworks(ids, options);
      if (request !== current) return;
      state.artworks = artworks;
      state.failed = failed;
      if (ids.length && !artworks.length) state.error = 'Unable to load artworks. Please try again.';
    } catch (error) {
      if (request === current && !axios.isCancel(error)) {
        state.error = 'Unable to load the collection. Please try again.';
      }
    } finally {
      if (request === current) {
        state.loading = false;
        request = null;
      }
    }
  }

  return {
    state,
    load,
    dispose() {
      disposed = true;
      request?.cancel();
      request = null;
      state.loading = false;
    },
  };
}
