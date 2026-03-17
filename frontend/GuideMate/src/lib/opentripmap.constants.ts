import type { SearchCategory } from "./opentripmap.types";

export const MAPBOX_API_KEY =
  "pk.eyJ1IjoidmlyYWdiZW5lZGVrMDYiLCJhIjoiY21rcDVuazBpMGQ3bTNkczkyaXgwcWtsaCJ9.8U__-HsFg4GAqf0Ispqo2g";

export const MAPBOX_STYLES: Record<string, string> = {
  streets: "mapbox/streets-v12",
  satellite: "mapbox/satellite-v9",
  outdoors: "mapbox/outdoors-v12",
  light: "mapbox/light-v11",
  dark: "mapbox/dark-v11",
};

export const IMAGE_FETCH_LIMIT = 12;

export const SEARCH_CATEGORIES: SearchCategory[] = [
  {
    id: "interesting_places",
    label: "Népszerű",
    categories: "tourism.attraction,tourism.sights,heritage,building.historic",
    imageCategory: "landmark architecture",
  },
  {
    id: "museums",
    label: "Múzeum",
    categories: "entertainment.museum,entertainment.culture",
    imageCategory: "museum art gallery",
  },
  {
    id: "natural",
    label: "Park",
    categories: "leisure.park,natural",
    imageCategory: "park nature landscape",
  },
  {
    id: "foods",
    label: "Étterem",
    categories: "catering.restaurant",
    imageCategory: "restaurant interior",
  },
];
