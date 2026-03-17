
import { apiFetch } from "./api";
import {
  MAPBOX_API_KEY,
  MAPBOX_STYLES,
  SEARCH_CATEGORIES,
} from "./opentripmap.constants";
import { enrichPlacesWithImages } from "./opentripmap.images";
import { buildQueryParams } from "./opentripmap.utils";
import type {
  CoordinatesResult,
  Place,
  PlacesOptions,
  PlacesResult,
} from "./opentripmap.types";

export type {
  CoordinatesResult,
  Place,
  PlacesOptions,
  PlacesResult,
  SearchCategory,
} from "./opentripmap.types";

export { SEARCH_CATEGORIES };

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
  const selectedStyle = MAPBOX_STYLES[style] || MAPBOX_STYLES.streets;
  return `https://api.mapbox.com/styles/v1/${selectedStyle}/tiles/{z}/{x}/{y}@2x?access_token=${MAPBOX_API_KEY}`;
}
