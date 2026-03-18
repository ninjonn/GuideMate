import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserId } from 'src/auth/user-id.decorator';
import { UtazasService } from './utazas.service';
import type {
  UtazasCreateResponse,
  UtazasDeleteResponse,
  UtazasDetailResponse,
  UtazasListResponse,
  UtazasUpdateResponse,
} from './utazas.types';
import { UtazasQueryDto } from './dto/utazas-query.dto';
import { CreateUtazasDto } from './dto/create-utazas.dto';
import { UpdateUtazasDto } from './dto/update-utazas.dto';

@Controller('api/utazasok')
@UseGuards(AuthGuard)
export class UtazasController {
  constructor(private readonly utazasService: UtazasService) {}

  @Get()
  list(
    @UserId() userId: number,
    @Query() query: UtazasQueryDto,
  ): Promise<UtazasListResponse> {
    return this.utazasService.listForUser(userId, query);
  }

  @Get(':id')
  getOne(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) utazasId: number,
  ): Promise<UtazasDetailResponse> {
    return this.utazasService.getForUser(userId, utazasId);
  }

  @Post()
  create(
    @UserId() userId: number,
    @Body() dto: CreateUtazasDto,
  ): Promise<UtazasCreateResponse> {
    return this.utazasService.createForUser(userId, dto);
  }

  @Put(':id')
  update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) utazasId: number,
    @Body() dto: UpdateUtazasDto,
  ): Promise<UtazasUpdateResponse> {
    return this.utazasService.updateForUser(userId, utazasId, dto);
  }

  @Delete(':id')
  remove(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) utazasId: number,
  ): Promise<UtazasDeleteResponse> {
    return this.utazasService.deleteForUser(userId, utazasId);
  }
}
