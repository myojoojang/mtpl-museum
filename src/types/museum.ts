export interface Artwork {
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

export interface SearchResult {
  ids: number[];
  total: number;
}
