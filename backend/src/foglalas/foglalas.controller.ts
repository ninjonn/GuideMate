import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserId } from 'src/auth/user-id.decorator';
import { FoglalasService } from './foglalas.service';
import {
  FoglalasCreateResponse,
  FoglalasDeleteResponse,
  FoglalasListResponse,
  FoglalasUpdateResponse,
} from './foglalas.types';
import { CreateFoglalasDto } from './dto/create-foglalas.dto';
import { UpdateFoglalasDto } from './dto/update-foglalas.dto';

@Controller('api')
@UseGuards(AuthGuard)
export class FoglalasController {
  constructor(private readonly foglalasService: FoglalasService) {}

  @Get('foglalasok')
  listForUser(@UserId() userId: number): Promise<FoglalasListResponse> {
    return this.foglalasService.listForUser(userId);
  }

  @Post('foglalasok')
  createForUser(
    @UserId() userId: number,
    @Body() dto: CreateFoglalasDto,
  ): Promise<FoglalasCreateResponse> {
    return this.foglalasService.createForUser(userId, dto);
  }

  @Put('foglalasok/:id')
  update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) foglalasId: number,
    @Body() dto: UpdateFoglalasDto,
  ): Promise<FoglalasUpdateResponse> {
    return this.foglalasService.updateFoglalas(userId, foglalasId, dto);
  }

  @Delete('foglalasok/:id')
  remove(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) foglalasId: number,
  ): Promise<FoglalasDeleteResponse> {
    return this.foglalasService.deleteFoglalas(userId, foglalasId);
  }
}
