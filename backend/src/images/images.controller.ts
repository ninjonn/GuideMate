import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ImagesService } from './images.service';

// Szigorubb limit a kulso (Pexels) API koltseg ellen: 30 keres / perc / IP.
@Throttle({ default: { limit: 30, ttl: 60000 } })
@Controller('api/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  async getImage(@Query('query') query?: string) {
    const normalized = query?.trim();
    if (!normalized) {
      throw new BadRequestException('Hiányzó query paraméter.');
    }
    return this.imagesService.searchImage(normalized);
  }
}
