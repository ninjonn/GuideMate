import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';
import { GeoService } from './geo.service';

@Controller('api/geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Public()
  @Get('coordinates')
  getCoordinates(@Query('query') query: string) {
    return this.geoService.getCoordinates(query);
  }

  @Public()
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

  @Public()
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
