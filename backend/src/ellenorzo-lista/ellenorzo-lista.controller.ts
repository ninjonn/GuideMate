import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserId } from 'src/auth/user-id.decorator';
import { EllenorzoListaService } from './ellenorzo-lista.service';
import type {
  EllenorzoListaCreateResponse,
  EllenorzoListaDeleteResponse,
  EllenorzoListaListResponse,
} from './ellenorzo-lista.types';
import { CreateEllenorzoListaDto } from './dto/create-ellenorzo-lista.dto';

@Controller('api')
@UseGuards(AuthGuard)
export class EllenorzoListaController {
  constructor(private readonly ellenorzoListaService: EllenorzoListaService) {}

  @Get('utazasok/:utazasId/ellenorzolista')
  list(
    @UserId() userId: number,
    @Param('utazasId', ParseIntPipe) utazasId: number,
  ): Promise<EllenorzoListaListResponse> {
    return this.ellenorzoListaService.listForTrip(userId, utazasId);
  }

  @Post('utazasok/:utazasId/ellenorzolista')
  create(
    @UserId() userId: number,
    @Param('utazasId', ParseIntPipe) utazasId: number,
    @Body() dto: CreateEllenorzoListaDto,
  ): Promise<EllenorzoListaCreateResponse> {
    return this.ellenorzoListaService.createForTrip(userId, utazasId, dto);
  }

  @Delete('ellenorzolista/:id')
  remove(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) listaId: number,
  ): Promise<EllenorzoListaDeleteResponse> {
    return this.ellenorzoListaService.deleteLista(userId, listaId);
  }
}
