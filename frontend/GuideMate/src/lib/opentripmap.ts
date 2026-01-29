
// API KULCSOK
const GEOAPIFY_API_KEY = "589fb45a2e214ff38069dffee50a6d77";
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

type NominatimResult = {
  lat: string;
  lon: string;
  boundingbox?: string[];
  type?: string;
  class?: string;
  addresstype?: string;
  display_name?: string;
  address?: {
    country?: string;
    country_code?: string;
    state?: string;
    city?: string;
  };
};

type GeoapifyFeature = {
  properties: {
    name?: string;
    type?: string;
    place_id?: string | number;
    formatted?: string;
    street?: string;
    address_line1?: string;
    address_line2?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
};

const NOMINATIM_HEADERS = {
  'User-Agent': 'TravelApp/1.0',
};

const searchNominatim = async (
  query: string,
  options?: { limit?: number; addressdetails?: boolean; extratags?: boolean; countrycodes?: string }
) => {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: String(options?.limit ?? 1),
  });
  if (options?.addressdetails) {
    params.set('addressdetails', '1');
  }
  if (options?.extratags) {
    params.set('extratags', '1');
  }
  if (options?.countrycodes) {
    params.set('countrycodes', options.countrycodes);
  }
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: NOMINATIM_HEADERS,
  });
  if (!res.ok) {
    console.error("❌ Nominatim hiba:", res.status);
    throw new Error("Hely keresési hiba");
  }
  const data = await res.json();
  return data as NominatimResult[];
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
  console.log(`🔍 Keresés (Nominatim): ${cityName}`);
  
  try {
    const data = await searchNominatim(cityName, { limit: 1, addressdetails: true, extratags: true });

    if (!data || data.length === 0) {
      console.error("❌ Város nem található:", cityName);
      throw new Error("Hely nem található");
    }
    
    const item = data[0];
    const countryName = item.address?.country;
    const countryCode = item.address?.country_code?.toLowerCase();
    const isCountry =
      item.addresstype === 'country' ||
      item.type === 'country' ||
      (item.class === 'boundary' &&
        Boolean(item.address?.country_code) &&
        !item.address?.state &&
        !item.address?.city);

    if (isCountry && countryCode) {
      const capitalCoords = await getCapitalCoordinates(countryCode, countryName);
      if (capitalCoords) {
        console.log(`✅ Ország találat, főváros koordináták: ${capitalCoords.lat}, ${capitalCoords.lon}`);
        return {
          ...capitalCoords,
          isCountry: true,
          countryCode,
          countryName,
        };
      }
    }

    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const bbox = Array.isArray(item.boundingbox) ? item.boundingbox : null;
    if (bbox && bbox.length === 4) {
      const south = parseFloat(bbox[0]);
      const north = parseFloat(bbox[1]);
      const west = parseFloat(bbox[2]);
      const east = parseFloat(bbox[3]);
      if (
        !Number.isNaN(south) &&
        !Number.isNaN(north) &&
        !Number.isNaN(west) &&
        !Number.isNaN(east)
      ) {
        const centerLat = (south + north) / 2;
        const centerLon = (west + east) / 2;
        console.log(`✅ Koordináták (bbox közép): ${centerLat}, ${centerLon}`);
        return { lat: centerLat, lon: centerLon, isCountry, countryCode, countryName };
      }
    }
    console.log(`✅ Koordináták: ${lat}, ${lon}`);
    return { lat, lon, isCountry, countryCode, countryName };
  } catch (error) {
    console.error("❌ Koordináta keresés hiba:", error);
    throw error;
  }
}

async function getCapitalCoordinates(countryCode: string, countryName?: string): Promise<CoordinatesResult | null> {
  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/alpha/${encodeURIComponent(countryCode)}?fields=capital,capitalInfo`,
    );
    if (!res.ok) {
      console.warn("⚠️ RestCountries API hiba:", res.status);
      throw new Error("RestCountries API hiba");
    }
    const data = await res.json();
    const entry = Array.isArray(data) ? data[0] : data;
    const capitalInfo = entry?.capitalInfo?.latlng;
    if (Array.isArray(capitalInfo) && capitalInfo.length === 2) {
      return { lat: capitalInfo[0], lon: capitalInfo[1], isCountry: true, countryCode, countryName };
    }
    const capitalName = Array.isArray(entry?.capital) ? entry.capital[0] : undefined;
    if (capitalName) {
      const nominatimCapital = await searchNominatim(capitalName, {
        limit: 1,
        addressdetails: false,
        countrycodes: countryCode,
      });
      const capitalItem = nominatimCapital?.[0];
      if (capitalItem) {
        const lat = parseFloat(capitalItem.lat);
        const lon = parseFloat(capitalItem.lon);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
          return { lat, lon, isCountry: true, countryCode, countryName };
        }
      }
    }
  } catch (error) {
    console.warn("⚠️ Főváros koordináta keresés sikertelen", error);
  }

  if (countryName) {
    try {
      const fallback = await searchNominatim(`${countryName} capital`, {
        limit: 1,
        addressdetails: false,
        countrycodes: countryCode,
      });
      const fallbackItem = fallback?.[0];
      if (fallbackItem) {
        const lat = parseFloat(fallbackItem.lat);
        const lon = parseFloat(fallbackItem.lon);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
          return { lat, lon, isCountry: true, countryCode, countryName };
        }
      }
    } catch (error) {
      console.warn("⚠️ Főváros fallback sikertelen", error);
    }
  }

  return null;
}

// 1B. SPECIFIKUS HELY KERESÉSE + SZŰRÉS (pl. "Louvre")
export async function searchAndFilterPlaces(
  placeName: string,
  lat: number,
  lon: number
) {
  console.log(`🔍 Specifikus hely keresése: ${placeName}`);
  
  try {
    // Előbb megkeresem a konkrét helyet
    const placeRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'TravelApp/1.0'
        }
      }
    );
    
    if (!placeRes.ok) {
      throw new Error("Hely keresési hiba");
    }
    
    const placeData = await placeRes.json();
    
    if (!placeData || placeData.length === 0) {
      throw new Error("Hely nem található");
    }

    const foundPlace = placeData[0];
    console.log(`✅ Hely találva: ${foundPlace.name}`);
    
    // Most keresek hasonló nevű helyeket az adott város közelében
    const url = `https://api.geoapify.com/v2/places?text=${encodeURIComponent(placeName)}&filter=circle:${lon},${lat},15000&limit=50&apiKey=${GEOAPIFY_API_KEY}`;
    
    console.log("📡 Geoapify API hívás szűréshez...");
    
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error("❌ Geoapify API hiba:", res.status);
      // Ha Geoapify nem működik, csak az egy helyet adjuk vissza
      const singlePlace: Place = {
        xid: `nominatim-${foundPlace.place_id}`,
        name: foundPlace.name,
        rate: 1,
        kinds: foundPlace.type || "landmark",
        point: {
          lon: parseFloat(foundPlace.lon),
          lat: parseFloat(foundPlace.lat)
        },
        address: foundPlace.display_name,
        image: undefined,
      };
      return [singlePlace];
    }
    
    const data = await res.json();
    console.log(`✅ Geoapify találatok: ${data.features?.length || 0}`);
    
    if (!data.features || data.features.length === 0) {
      // Csak az egy helyet adjuk vissza
      const singlePlace: Place = {
        xid: `nominatim-${foundPlace.place_id}`,
        name: foundPlace.name,
        rate: 1,
        kinds: foundPlace.type || "landmark",
        point: {
          lon: parseFloat(foundPlace.lon),
          lat: parseFloat(foundPlace.lat)
        },
        address: foundPlace.display_name,
        image: undefined,
      };
      return [singlePlace];
    }
    
    // SZŰRÉS: Csak azok a helyek, amelyek TARTALMAZZÁK a keresett szót
    const searchTermLower = placeName.toLowerCase();
    const filteredFeatures = (data.features as GeoapifyFeature[]).filter((feature) => {
      const name = feature.properties.name || "";
      return name.toLowerCase().includes(searchTermLower);
    });

    console.log(`✅ Szűrés után: ${filteredFeatures.length} hely`);
    
    // Ha nincs szűrt eredmény, adjuk vissza az összes találatot
    const featuresToUse = filteredFeatures.length > 0 ? filteredFeatures : data.features.slice(0, 10);
    
    const places = featuresToUse
      .map((feature: GeoapifyFeature) => {
        const props = feature.properties;
        const name = props.name || "Névtelen";
        const lon = feature.geometry.coordinates[0];
        const lat = feature.geometry.coordinates[1];
        const address = props.formatted || "";
        
        return {
          xid: `geoapify-${props.place_id || Math.random()}`,
          name,
          rate: 1,
          kinds: props.type || "place",
          point: { lon, lat },
          address,
          image: undefined,
        };
      })
      .filter((p: Place) => p.name && p.name !== "Névtelen");
    
    console.log(`✅ Végleges lista: ${places.length}`);
    return places;
    
  } catch (error) {
    console.error("❌ Hely keresés hiba:", error);
    // Ha valami balul sül el, inkább térjünk vissza üres listával, hogy a városi lista tudjon futni.
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
  
  const category = SEARCH_CATEGORIES.find(c => c.id === categoryId);
  if (!category) {
    console.error("❌ Ismeretlen kategória:", categoryId);
    return { items: [], hasMore: false };
  }

  console.log(`🔍 Helyek keresése: ${category.label} (${lat}, ${lon})`);

  const limit = options.limit ?? 30;
  const offset = options.offset ?? 0;
  const radius = options.radius ?? 5000;
  
  const url = `https://api.geoapify.com/v2/places?categories=${category.categories}&filter=circle:${lon},${lat},${radius}&limit=${limit}&offset=${offset}&apiKey=${GEOAPIFY_API_KEY}`;
  
  console.log("📡 Geoapify API hívás...");
  
  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error("❌ Geoapify API hiba:", res.status);
      if (res.status === 401 || res.status === 403) {
        console.error("⚠️ Érvénytelen Geoapify API kulcs!");
        throw new Error("Érvénytelen API kulcs");
      }
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    console.log(`✅ Geoapify találatok: ${data.features?.length || 0}`);
    
    if (!data.features || data.features.length === 0) {
      console.warn("⚠️ Nincs találat");
      return { items: [], hasMore: false };
    }

    const rawCount = Array.isArray(data.features) ? data.features.length : 0;
    const places = (data.features as GeoapifyFeature[])
      .slice(0, limit)
      .map((feature) => {
        const props = feature.properties;
        const name = props.name || props.street || props.address_line1 || "Névtelen";
        const lon = feature.geometry.coordinates[0];
        const lat = feature.geometry.coordinates[1];
        const address = props.formatted || props.address_line2;
        
        return {
          xid: `geoapify-${props.place_id || Math.random()}`,
          name,
          rate: 1,
          kinds: category.label,
          point: { lon, lat },
          address,
          image: undefined,
        };
      })
      .filter((p: Place) => p.name && p.name !== "Névtelen");

    console.log(`✅ Szűrt találatok: ${places.length}`);
    return {
      items: places,
      hasMore: rawCount >= limit,
    };
    
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
