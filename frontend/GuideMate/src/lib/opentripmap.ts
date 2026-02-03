
import { apiFetch } from "./api";

// API KULCSOK
const MAPBOX_API_KEY = "pk.eyJ1IjoidmlyYWdiZW5lZGVrMDYiLCJhIjoiY21rcDVuazBpMGQ3bTNkczkyaXgwcWtsaCJ9.8U__-HsFg4GAqf0Ispqo2g";

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

type ImageProxyResponse = {
  url: string | null;
};

const IMAGE_FETCH_LIMIT = 12;

const buildImageQuery = (place: Place) => {
  const name = place.name?.trim();
  if (!name) return '';
  const address = place.address?.split(',')[0]?.trim();
  if (address && !address.toLowerCase().includes(name.toLowerCase())) {
    return `${name} ${address}`.trim();
  }
  return name;
};

const fetchPlaceImage = async (place: Place): Promise<string | undefined> => {
  const query = buildImageQuery(place);
  if (!query) return undefined;
  try {
    const res = await apiFetch<ImageProxyResponse>(
      `/api/images?query=${encodeURIComponent(query)}`,
      {},
      false,
    );
    return res.url ?? undefined;
  } catch {
    return undefined;
  }
};

const enrichPlacesWithImages = async (places: Place[]) => {
  if (places.length === 0) return places;
  const limit = Math.min(IMAGE_FETCH_LIMIT, places.length);
  const head = places.slice(0, limit);
  const tail = places.slice(limit);
  const enriched = await Promise.all(
    head.map(async (place) => {
      if (place.image) return place;
      const image = await fetchPlaceImage(place);
      return { ...place, image };
    }),
  );
  return [...enriched, ...tail];
};

const buildQueryParams = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });
  return searchParams.toString();
};

// 4 KATEGÓRIA - NÉPSZERŰ, MÚZEUM, PARK, ÉTTEREM
export const SEARCH_CATEGORIES: SearchCategory[] = [
  {
    id: "interesting_places",
    label: "Népszerű",
    categories: "tourism.attraction,tourism.sights,heritage,building.historic",
    imageCategory: "landmark architecture"
  },
  {
    id: "museums",
    label: "Múzeum",
    categories: "entertainment.museum,entertainment.culture",
    imageCategory: "museum art gallery"
  },
  {
    id: "natural",
    label: "Park",
    categories: "leisure.park,natural",
    imageCategory: "park nature landscape"
  },
  {
    id: "foods",
    label: "Étterem",
    categories: "catering.restaurant",
    imageCategory: "restaurant interior"
  },
];

// 1. Koordináták (OpenStreetMap - Nominatim)
export async function getCoordinates(cityName: string): Promise<CoordinatesResult> {
  console.log(`🔍 Keresés (backend): ${cityName}`);
  try {
    const query = buildQueryParams({ query: cityName });
    return await apiFetch<CoordinatesResult>(`/api/geo/coordinates?${query}`);
  } catch (error) {
    console.error("❌ Koordináta keresés hiba:", error);
    throw error;
  }
}

// 1B. SPECIFIKUS HELY KERESÉSE + SZŰRÉS (pl. "Louvre")
export async function searchAndFilterPlaces(
  placeName: string,
  lat: number,
  lon: number
) {
  console.log(`🔍 Specifikus hely keresése (backend): ${placeName}`);

  try {
    const query = buildQueryParams({ text: placeName, lat, lon });
    const places = await apiFetch<Place[]>(`/api/geo/search?${query}`);
    return await enrichPlacesWithImages(places);
  } catch (error) {
    console.error("❌ Hely keresés hiba:", error);
    return [];
  }
}

// 2. Helyek (Geoapify API + Pexels képek)
export async function getPlaces(
  lat: number,
  lon: number,
  categoryId: string = "interesting_places",
  options: PlacesOptions = {}
): Promise<PlacesResult> {
  const category = SEARCH_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) {
    console.error("❌ Ismeretlen kategória:", categoryId);
    return { items: [], hasMore: false };
  }

  console.log(`🔍 Helyek keresése (backend): ${category.label} (${lat}, ${lon})`);

  try {
    const query = buildQueryParams({
      lat,
      lon,
      categoryId,
      limit: options.limit,
      offset: options.offset,
      radius: options.radius,
    });
    const res = await apiFetch<PlacesResult>(`/api/geo/places?${query}`);
    const itemsWithImages = await enrichPlacesWithImages(res.items ?? []);
    return { items: itemsWithImages, hasMore: res.hasMore ?? false };
  } catch (error) {
    console.error("❌ Geoapify API hiba:", error);
    return { items: [], hasMore: false };
  }
}

// Mapbox térképstílus URL generálása
export function getMapboxTileUrl(style: string = "streets") {
  const styles: { [key: string]: string } = {
    streets: "mapbox/streets-v12",
    satellite: "mapbox/satellite-v9",
    outdoors: "mapbox/outdoors-v12",
    light: "mapbox/light-v11",
    dark: "mapbox/dark-v11"
  };
  
  const selectedStyle = styles[style] || styles.streets;
  return `https://api.mapbox.com/styles/v1/${selectedStyle}/tiles/{z}/{x}/{y}@2x?access_token=${MAPBOX_API_KEY}`;
}
