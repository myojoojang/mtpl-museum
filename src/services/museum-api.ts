import type {
  Artwork, CancellationCheck, Department, MuseumApi, MuseumHttpClient,
} from '../types/museum';

interface DepartmentsResponse { departments: Department[] | null }
interface SearchResponse { objectIDs: number[] | null; total: number }

export function createMuseumApi(
  client: MuseumHttpClient,
  isCancelled: CancellationCheck = () => false,
): MuseumApi {
  return {
    async getDepartments(options = {}) {
      const { data } = await client.get<DepartmentsResponse>('/departments', options);
      return data.departments || [];
    },
    async search({ keyword = '', departmentId, ...options }) {
      const params: { hasImages: boolean; q: string; departmentId?: number; isHighlight?: boolean } = {
        hasImages: true, q: keyword,
      };
      if (departmentId != null) params.departmentId = departmentId;
      else params.isHighlight = true;
      const { data } = await client.get<SearchResponse>('/search', { ...options, params });
      return { ids: data.objectIDs || [], total: data.total || 0 };
    },
    async getArtworks(ids, options = {}) {
      const results: Array<Artwork | undefined> = new Array(ids.length);
      let cursor = 0;
      let failed = 0;
      async function worker(): Promise<void> {
        while (cursor < ids.length) {
          const index = cursor++;
          try {
            const { data } = await client.get<Artwork>(`/objects/${ids[index]}`, options);
            results[index] = data;
          } catch (error) {
            if (isCancelled(error)) throw error;
            failed += 1;
          }
        }
      }
      await Promise.all(Array.from({ length: Math.min(5, ids.length) }, worker));
      return { artworks: results.filter((artwork): artwork is Artwork => artwork !== undefined), failed };
    },
  };
}
