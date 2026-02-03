import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';
import { ImagesService } from './images.service';

@Controller('api/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Public()
  @Get()
  async getImage(@Query('query') query?: string) {
    const normalized = query?.trim();
    if (!normalized) {
      throw new BadRequestException('Hiányzó query paraméter.');
    }
    return this.imagesService.searchImage(normalized);
  }
}
