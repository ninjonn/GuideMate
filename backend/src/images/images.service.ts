import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ImageCacheEntry = {
  url: string | null;
  expiresAt: number;
};

@Injectable()
export class ImagesService {
  private readonly cache = new Map<string, ImageCacheEntry>();
  private readonly ttlMs = 1000 * 60 * 60 * 6; // 6 óra
  private readonly maxCacheSize = 500;

  constructor(private readonly configService: ConfigService) {}

  async searchImage(query: string): Promise<{ url: string | null }> {
    const key = query.trim().toLowerCase();
    if (key.length < 2) {
      return { url: null };
    }

    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return { url: cached.url };
    }
    if (cached) {
      this.cache.delete(key);
    }

    const apiKey = this.configService.get<string>('PEXELS_API_KEY');
    if (!apiKey) {
      return { url: null };
    }

    const url = await this.fetchFromPexels(apiKey, query);
    this.setCache(key, url);
    return { url };
  }

  private async fetchFromPexels(apiKey: string, query: string): Promise<string | null> {
    const params = new URLSearchParams({
      query,
      per_page: '1',
      orientation: 'landscape',
    });
    const res = await fetch(`https://api.pexels.com/v1/search?${params.toString()}`, {
      headers: { Authorization: apiKey },
    });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as {
      photos?: Array<{ src?: { medium?: string; large?: string; landscape?: string } }>;
    };
    const photo = data.photos?.[0];
    return photo?.src?.medium || photo?.src?.landscape || photo?.src?.large || null;
  }

  private setCache(key: string, url: string | null) {
    if (this.cache.size >= this.maxCacheSize) {
      this.pruneCache();
    }
    this.cache.set(key, { url, expiresAt: Date.now() + this.ttlMs });
  }

  private pruneCache() {
    const now = Date.now();
    for (const [k, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(k);
      }
    }
    if (this.cache.size < this.maxCacheSize) return;
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
    }
  }
}
