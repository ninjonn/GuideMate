import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
  place_id?: string | number;
  name?: string;
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
  'User-Agent': 'GuideMate/1.0',
};

const SEARCH_CATEGORIES = [
  {
    id: 'interesting_places',
    label: 'Népszerű',
    categories: 'tourism.attraction,tourism.sights,heritage,building.historic',
  },
  {
    id: 'museums',
    label: 'Múzeum',
    categories: 'entertainment.museum,entertainment.culture',
  },
  {
    id: 'natural',
    label: 'Park',
    categories: 'leisure.park,natural',
  },
  {
    id: 'foods',
    label: 'Étterem',
    categories: 'catering.restaurant',
  },
];

@Injectable()
export class GeoService {
  constructor(private readonly configService: ConfigService) {}

  async getCoordinates(query?: string): Promise<CoordinatesResult> {
    const trimmed = query?.trim();
    if (!trimmed) {
      throw new BadRequestException('Hiányzó keresés');
    }

    const data = await this.searchNominatim(trimmed, {
      limit: 1,
      addressdetails: true,
      extratags: true,
    });

    if (!data.length) {
      throw new NotFoundException('Hely nem található');
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
      const capitalCoords = await this.getCapitalCoordinates(countryCode, countryName);
      if (capitalCoords) {
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
        return { lat: centerLat, lon: centerLon, isCountry, countryCode, countryName };
      }
    }

    return { lat, lon, isCountry, countryCode, countryName };
  }

  async getPlaces(params: {
    lat?: string;
    lon?: string;
    categoryId?: string;
    limit?: string;
    offset?: string;
    radius?: string;
  }): Promise<PlacesResult> {
    const lat = Number(params.lat);
    const lon = Number(params.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new BadRequestException('Érvénytelen koordináták');
    }

    const categoryId = params.categoryId || 'interesting_places';
    const category = SEARCH_CATEGORIES.find((c) => c.id === categoryId);
    if (!category) {
      return { items: [], hasMore: false };
    }

    const apiKey = this.configService.get<string>('GEOAPIFY_API_KEY');
    if (!apiKey) {
      return { items: [], hasMore: false };
    }

    const limit = this.parseNumber(params.limit, 30);
    const offset = this.parseNumber(params.offset, 0);
    const radius = this.parseNumber(params.radius, 5000);

    const url =
      `https://api.geoapify.com/v2/places?categories=${category.categories}` +
      `&filter=circle:${lon},${lat},${radius}` +
      `&limit=${limit}&offset=${offset}` +
      `&apiKey=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      return { items: [], hasMore: false };
    }
    const data = (await res.json()) as { features?: GeoapifyFeature[] };
    if (!data.features || data.features.length === 0) {
      return { items: [], hasMore: false };
    }

    const rawCount = Array.isArray(data.features) ? data.features.length : 0;
    const places = data.features
      .slice(0, limit)
      .map((feature) => {
        const props = feature.properties;
        const name = props.name || props.street || props.address_line1 || 'Névtelen';
        const placeLon = feature.geometry.coordinates[0];
        const placeLat = feature.geometry.coordinates[1];
        const address = props.formatted || props.address_line2;

        return {
          xid: `geoapify-${props.place_id ?? `${placeLat}-${placeLon}`}`,
          name,
          rate: 1,
          kinds: category.label,
          point: { lon: placeLon, lat: placeLat },
          address,
          image: undefined,
        };
      })
      .filter((p) => p.name && p.name !== 'Névtelen');

    return {
      items: places,
      hasMore: rawCount >= limit,
    };
  }

  async searchPlaces(params: {
    text?: string;
    lat?: string;
    lon?: string;
  }): Promise<Place[]> {
    const text = params.text?.trim();
    if (!text) {
      throw new BadRequestException('Hiányzó keresés');
    }

    const lat = Number(params.lat);
    const lon = Number(params.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new BadRequestException('Érvénytelen koordináták');
    }

    const placeData = await this.searchNominatim(text, { limit: 1 });
    if (!placeData.length) {
      throw new NotFoundException('Hely nem található');
    }

    const foundPlace = placeData[0];
    const apiKey = this.configService.get<string>('GEOAPIFY_API_KEY');
    if (!apiKey) {
      return [this.toSinglePlace(foundPlace)];
    }

    const url =
      `https://api.geoapify.com/v2/places?text=${encodeURIComponent(text)}` +
      `&filter=circle:${lon},${lat},15000&limit=50&apiKey=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      return [this.toSinglePlace(foundPlace)];
    }

    const data = (await res.json()) as { features?: GeoapifyFeature[] };
    if (!data.features || data.features.length === 0) {
      return [this.toSinglePlace(foundPlace)];
    }

    const searchTermLower = text.toLowerCase();
    const filtered = data.features.filter((feature) => {
      const name = feature.properties.name || '';
      return name.toLowerCase().includes(searchTermLower);
    });

    if (filtered.length === 0) {
      return [this.toSinglePlace(foundPlace)];
    }
    const featuresToUse = filtered;
    return featuresToUse
      .map((feature) => {
        const props = feature.properties;
        const name = props.name || 'Névtelen';
        const placeLon = feature.geometry.coordinates[0];
        const placeLat = feature.geometry.coordinates[1];
        const address = props.formatted || '';
        return {
          xid: `geoapify-${props.place_id ?? `${placeLat}-${placeLon}`}`,
          name,
          rate: 1,
          kinds: props.type || 'place',
          point: { lon: placeLon, lat: placeLat },
          address,
          image: undefined,
        };
      })
      .filter((p) => p.name && p.name !== 'Névtelen');
  }

  private async searchNominatim(
    query: string,
    options?: {
      limit?: number;
      addressdetails?: boolean;
      extratags?: boolean;
      countrycodes?: string;
    },
  ) {
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
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      { headers: NOMINATIM_HEADERS },
    );
    if (!res.ok) {
      throw new BadRequestException('Hely keresési hiba');
    }
    const data = (await res.json()) as NominatimResult[];
    return data ?? [];
  }

  private async getCapitalCoordinates(
    countryCode: string,
    countryName?: string,
  ): Promise<CoordinatesResult | null> {
    try {
      const res = await fetch(
        `https://restcountries.com/v3.1/alpha/${encodeURIComponent(
          countryCode,
        )}?fields=capital,capitalInfo`,
      );
      if (!res.ok) {
        throw new Error('RestCountries API hiba');
      }
      const data = (await res.json()) as any;
      const entry = Array.isArray(data) ? data[0] : data;
      const capitalInfo = entry?.capitalInfo?.latlng;
      if (Array.isArray(capitalInfo) && capitalInfo.length === 2) {
        return {
          lat: capitalInfo[0],
          lon: capitalInfo[1],
          isCountry: true,
          countryCode,
          countryName,
        };
      }
      const capitalName = Array.isArray(entry?.capital) ? entry.capital[0] : undefined;
      if (capitalName) {
        const nominatimCapital = await this.searchNominatim(capitalName, {
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
    } catch {
      // ignore
    }

    if (countryName) {
      try {
        const fallback = await this.searchNominatim(`${countryName} capital`, {
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
      } catch {
        // ignore
      }
    }

    return null;
  }

  private toSinglePlace(foundPlace: NominatimResult): Place {
    return {
      xid: `nominatim-${foundPlace.place_id ?? foundPlace.lat}-${foundPlace.lon}`,
      name: foundPlace.name || foundPlace.display_name || 'Névtelen',
      rate: 1,
      kinds: foundPlace.type || 'landmark',
      point: {
        lon: parseFloat(foundPlace.lon),
        lat: parseFloat(foundPlace.lat),
      },
      address: foundPlace.display_name,
      image: undefined,
    };
  }

  private parseNumber(value: string | undefined, fallback: number) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
