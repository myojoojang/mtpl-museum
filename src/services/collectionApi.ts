import axios from 'axios';
import type { Artwork, CollectionQuery, Department, SearchResult } from '../types/collection';

const API_URL = 'https://collectionapi.metmuseum.org/public/collection';

export const collectionApi = {
  async getDepartments(): Promise<Department[]> {
    const { data } = await axios.get<{ departments: Department[] }>(`${API_URL}/v1/departments`);

    return data.departments;
  },
  async search({ keyword, departmentId }: CollectionQuery): Promise<SearchResult> {
    const filters = typeof departmentId === 'number'
      ? { departmentId }
      : { isHighlight: true };
    const { data } = await axios.get<{
      objectIDs: number[] | null;
      total: number;
    }>(
      `${API_URL}/v1.1/search`,
      {
        params: {
          q: keyword,
          hasImages: true,
          ...filters,
        },
      },
    );

    return {
      ids: data.objectIDs || [],
      total: data.total,
    };
  },
  async getArtworks(ids: readonly number[]): Promise<Artwork[]> {
    const artworkRequests = ids.map(async (objectId) => {
      const { data } = await axios.get<Artwork>(`${API_URL}/v1/objects/${objectId}`);

      return data;
    });

    const artworks = await Promise.all(artworkRequests);

    return artworks.filter((artwork) => {
      const imageUrls = [
        artwork.primaryImageSmall,
        artwork.primaryImage,
        ...(artwork.additionalImages || []),
      ];

      return imageUrls.some((imageUrl) => {
        return Boolean(imageUrl);
      });
    });
  },
};
