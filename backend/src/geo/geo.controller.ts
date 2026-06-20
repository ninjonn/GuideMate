import { Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GeoService } from './geo.service';

// Szigorubb limit a kulso (Geoapify) API koltseg ellen: 30 keres / perc / IP.
@Throttle({ default: { limit: 30, ttl: 60000 } })
@Controller('api/geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('coordinates')
  getCoordinates(@Query('query') query: string) {
    return this.geoService.getCoordinates(query);
  }

  @Get('places')
  getPlaces(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('categoryId') categoryId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('radius') radius?: string,
  ) {
    return this.geoService.getPlaces({
      lat,
      lon,
      categoryId,
      limit,
      offset,
      radius,
    });
  }

  @Get('search')
  searchPlaces(
    @Query('text') text: string,
    @Query('query') query: string,
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ) {
    return this.geoService.searchPlaces({
      text: text || query,
      lat,
      lon,
    });
  }
}
