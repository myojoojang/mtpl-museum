import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { Artwork, Department, MuseumApi } from '../types/museum';

export function createMuseumApi(client: Pick<AxiosInstance, 'get'> = axios.create({
  baseURL: 'https://collectionapi.metmuseum.org/public/collection',
  timeout: 20000,
})): MuseumApi {
  return {
    async getDepartments(options) {
      const { data } = await client.get<{ departments: Department[] }>('/v1/departments', options);
      return data.departments || [];
    },
    async search({ keyword, departmentId, offset, limit, ...options }) {
      const filters = typeof departmentId === 'number'
        ? { departmentId }
        : { q: keyword, isHighlight: true };
      const { data } = await client.get<{ objectIDs: number[] | null; total: number }>(
        '/v1.1/search',
        { ...options, params: { hasImages: true, ...filters, offset, limit } },
      );
      return { ids: data.objectIDs || [], total: data.total };
    },
    async getArtworks(ids, options) {
      const artworks: Artwork[] = [];
      let failed = 0;
      // Load five at a time, retaining the order and any successful results.
      for (let start = 0; start < ids.length; start += 5) {
        const batch = await Promise.all(ids.slice(start, start + 5).map(async id => {
          try {
            const { data } = await client.get<Artwork>(`/v1/objects/${id}`, options);
            return data;
          } catch (error) {
            if (axios.isCancel(error)) throw error;
            failed += 1;
            return null;
          }
        }));
        artworks.push(...batch.filter((artwork): artwork is Artwork => artwork !== null));
      }
      return { artworks, failed };
    },
  };
}

export const museumApi = createMuseumApi();
