import type { AxiosRequestConfig } from 'axios';

export type MetadataValue = string | number | boolean | null
  | MetadataValue[] | { [key: string]: MetadataValue | undefined };
export type MetadataRecord = { [key: string]: MetadataValue | undefined };

export interface Artwork extends MetadataRecord {
  objectID: number;
  title?: string;
  primaryImage?: string;
  primaryImageSmall?: string;
  additionalImages?: string[];
  culture?: string;
  country?: string;
  objectDate?: string;
  medium?: string;
  dimensions?: string;
  accessionYear?: string;
}

export interface Department {
  departmentId: number;
  displayName: string;
}

export interface CollectionQuery {
  keyword: string;
  departmentId?: number;
}

export interface SearchQuery extends CollectionQuery {
  offset: number;
  limit: number;
}

export type RequestOptions = Pick<AxiosRequestConfig, 'cancelToken'>;

export interface SearchResult {
  ids: number[];
  total: number;
}

export interface ArtworksResult {
  artworks: Artwork[];
  failed: number;
}

export interface MuseumApi {
  getDepartments(options?: RequestOptions): Promise<Department[]>;
  search(query: SearchQuery & RequestOptions): Promise<SearchResult>;
  getArtworks(ids: readonly number[], options?: RequestOptions): Promise<ArtworksResult>;
}
