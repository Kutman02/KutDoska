// Типы для локаций
export type LocationType = 'city' | 'district';

export interface Location {
  _id: string;
  name: string;
  type: LocationType;
  parent?: string | Location | null;
  districts?: string[] | Location[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationWithDistricts extends Location {
  parent: Location | null;
  districts: Location[];
}

export interface CreateLocationData {
  name: string;
  type: LocationType;
  parent?: string | null;
}

