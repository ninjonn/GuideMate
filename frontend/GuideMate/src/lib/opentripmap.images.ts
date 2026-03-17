import { apiFetch } from "./api";
import { IMAGE_FETCH_LIMIT } from "./opentripmap.constants";
import type { Place } from "./opentripmap.types";

type ImageProxyResponse = {
  url: string | null;
};

const buildImageQuery = (place: Place) => {
  const name = place.name?.trim();
  if (!name) return "";
  const address = place.address?.split(",")[0]?.trim();
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

export const enrichPlacesWithImages = async (places: Place[]) => {
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
