export type Place = {
  xid: string;
  name: string;
  rate: number;
  kinds: string;
  point: {
    lon: number;
    lat: number;
  };
  image?: string;
  address?: string;
};

export type SearchCategory = {
  id: string;
  label: string;
  categories: string;
  imageCategory: string;
};

export type PlacesOptions = {
  limit?: number;
  offset?: number;
  radius?: number;
};

export type PlacesResult = {
  items: Place[];
  hasMore: boolean;
};

export type CoordinatesResult = {
  lat: number;
  lon: number;
  isCountry?: boolean;
  countryCode?: string;
  countryName?: string;
};
