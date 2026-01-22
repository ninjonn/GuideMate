// src/lib/opentripmap.ts

// API KULCSOK
const GEOAPIFY_API_KEY = "589fb45a2e214ff38069dffee50a6d77";
const PEXELS_API_KEY = "wEFsExQusKxKRu9Q0iIwuVIZ3sWfa9AQxQrBkMknaCn1WwLhVptoUbLL";
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
export async function getCoordinates(cityName: string) {
  console.log(`🔍 Keresés (Nominatim): ${cityName}`);
  
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'TravelApp/1.0'
        }
      }
    );
    
    if (!res.ok) {
      console.error("❌ Nominatim hiba:", res.status);
      throw new Error("Hely keresési hiba");
    }
    
    const data = await res.json();
    
    if (!data || data.length === 0) {
      console.error("❌ Város nem található:", cityName);
      throw new Error("Hely nem található");
    }
    
    console.log(`✅ Koordináták: ${data[0].lat}, ${data[0].lon}`);
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
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
        image: `https://source.unsplash.com/400x300/?${encodeURIComponent(placeName)}&sig=1`
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
        image: `https://source.unsplash.com/400x300/?${encodeURIComponent(placeName)}&sig=1`
      };
      return [singlePlace];
    }
    
    // SZŰRÉS: Csak azok a helyek, amelyek TARTALMAZZÁK a keresett szót
    const searchTermLower = placeName.toLowerCase();
    const filteredFeatures = data.features.filter((feature: any) => {
      const name = feature.properties.name || "";
      return name.toLowerCase().includes(searchTermLower);
    });

    console.log(`✅ Szűrés után: ${filteredFeatures.length} hely`);
    
    // Ha nincs szűrt eredmény, adjuk vissza az összes találatot
    const featuresToUse = filteredFeatures.length > 0 ? filteredFeatures : data.features.slice(0, 10);
    
    // Párhuzamos kép lekérések
    const placesWithImages = await Promise.all(
      featuresToUse.map(async (feature: any, index: number) => {
        const props = feature.properties;
        const name = props.name || "Névtelen";
        const lon = feature.geometry.coordinates[0];
        const lat = feature.geometry.coordinates[1];
        const address = props.formatted || "";
        
        const image = `https://source.unsplash.com/400x300/?${encodeURIComponent(name)}&sig=${index}`;
        
        return {
          xid: `geoapify-${props.place_id || Math.random()}`,
          name: name,
          rate: 1,
          kinds: props.type || "place",
          point: { lon, lat },
          address,
          image
        };
      })
    );
    
    const places = placesWithImages.filter((p) => p.name && p.name !== "Névtelen");
    
    console.log(`✅ Végleges lista: ${places.length}`);
    return places;
    
  } catch (error) {
    console.error("❌ Hely keresés hiba:", error);
    throw error;
  }
}

// Kép keresés Pexels API-val
async function getPexelsImage(query: string): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      }
    );
    
    if (!res.ok) {
      console.warn(`⚠️ Pexels API hiba: ${res.status}`);
      return undefined;
    }
    
    const data = await res.json();
    
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.medium;
    }
    
    return undefined;
  } catch (error) {
    console.error("❌ Pexels kép lekérés hiba:", error);
    return undefined;
  }
}

// 2. Helyek (Geoapify API + Pexels képek)
export async function getPlaces(lat: number, lon: number, categoryId: string = "interesting_places") {
  
  const category = SEARCH_CATEGORIES.find(c => c.id === categoryId);
  if (!category) {
    console.error("❌ Ismeretlen kategória:", categoryId);
    return [];
  }

  console.log(`🔍 Helyek keresése: ${category.label} (${lat}, ${lon})`);
  
  const url = `https://api.geoapify.com/v2/places?categories=${category.categories}&filter=circle:${lon},${lat},5000&limit=50&apiKey=${GEOAPIFY_API_KEY}`;
  
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
      return [];
    }
    
    // Párhuzamos kép lekérések
    const placesWithImages = await Promise.all(
      data.features
        .slice(0, 50)
        .map(async (feature: any, index: number) => {
          const props = feature.properties;
          const name = props.name || props.street || props.address_line1 || "Névtelen";
          const lon = feature.geometry.coordinates[0];
          const lat = feature.geometry.coordinates[1];
          const address = props.formatted || props.address_line2;
          
          let image = undefined;
          
          if (index < 10 && name && name !== "Névtelen") {
            image = await getPexelsImage(`${name} ${category.imageCategory}`);
          }
          
          if (!image) {
            image = `https://source.unsplash.com/400x300/?${encodeURIComponent(category.imageCategory)}&sig=${index}`;
          }
          
          return {
            xid: `geoapify-${props.place_id || Math.random()}`,
            name: name,
            rate: 1,
            kinds: category.label,
            point: { lon, lat },
            address,
            image
          };
        })
    );
    
    const places = placesWithImages.filter((p) => p.name && p.name !== "Névtelen");
    
    console.log(`✅ Szűrt találatok: ${places.length}`);
    return places;
    
  } catch (error) {
    console.error("❌ Geoapify API hiba:", error);
    return [];
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
