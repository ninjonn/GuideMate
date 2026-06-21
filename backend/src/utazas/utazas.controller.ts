import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
  ResztvevoListResponse,
  MeghivoResponse,
  EltavolitasResponse,
  SzerepValtoztatásResponse,
} from './utazas.types';
import { UtazasQueryDto } from './dto/utazas-query.dto';
import { CreateUtazasDto } from './dto/create-utazas.dto';
import { UpdateUtazasDto } from './dto/update-utazas.dto';
import { MeghivoDto } from './dto/meghivo.dto';
import { SzerepValtoztatasDto } from './dto/szerep-valtoztatas.dto';

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

  @Get(':id/resztvevok')
  listParticipants(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) utazasId: number,
  ): Promise<ResztvevoListResponse> {
    return this.utazasService.listParticipants(userId, utazasId);
  }

  @Post(':id/meghivok')
  invite(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) utazasId: number,
    @Body() dto: MeghivoDto,
  ): Promise<MeghivoResponse> {
    return this.utazasService.inviteByEmail(userId, utazasId, dto);
  }

  @Patch(':id/resztvevok/:targetId')
  changeParticipantRole(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) utazasId: number,
    @Param('targetId', ParseIntPipe) targetId: number,
    @Body() dto: SzerepValtoztatasDto,
  ): Promise<SzerepValtoztatásResponse> {
    return this.utazasService.changeParticipantRole(
      userId,
      utazasId,
      targetId,
      dto,
    );
  }

  @Delete(':id/resztvevok/:targetId')
  removeParticipant(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) utazasId: number,
    @Param('targetId', ParseIntPipe) targetId: number,
  ): Promise<EltavolitasResponse> {
    return this.utazasService.removeParticipant(userId, utazasId, targetId);
  }
}
