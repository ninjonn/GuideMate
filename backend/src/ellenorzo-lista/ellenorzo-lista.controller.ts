import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { EllenorzoListaService } from './ellenorzo-lista.service';
import type {
  EllenorzoListaCreateResponse,
  EllenorzoListaDeleteResponse,
  EllenorzoListaListResponse,
} from './ellenorzo-lista.service';
import { CreateEllenorzoListaDto } from './dto/create-ellenorzo-lista.dto';

type AuthedRequest = Request & { user?: { sub: number; email: string } };

@Controller('api')
@UseGuards(AuthGuard)
// Ellenorzolista vegpontok bejelentkezett felhasznaloknak.
export class EllenorzoListaController {
  constructor(private readonly ellenorzoListaService: EllenorzoListaService) {}

  private getUserId(req: AuthedRequest): number {
    // A token payloadban varjuk a felhasznalo azonositojat.
    const authed = req.user;
    if (!authed || !authed.sub) {
      throw new UnauthorizedException('Nincs felhasznalo a tokenben.');
    }
    return authed.sub;
  }

  @Get('utazasok/:utazasId/ellenorzolista')
  // Ellenorzolistak listazasa egy adott utazashoz.
  list(
    @Req() req: AuthedRequest,
    @Param('utazasId', ParseIntPipe) utazasId: number,
  ): Promise<EllenorzoListaListResponse> {
    const userId = this.getUserId(req);
    return this.ellenorzoListaService.listForTrip(userId, utazasId);
  }

  @Post('utazasok/:utazasId/ellenorzolista')
  // Uj ellenorzolista letrehozasa egy utazashoz.
  create(
    @Req() req: AuthedRequest,
    @Param('utazasId', ParseIntPipe) utazasId: number,
    @Body() dto: CreateEllenorzoListaDto,
  ): Promise<EllenorzoListaCreateResponse> {
    const userId = this.getUserId(req);
    return this.ellenorzoListaService.createForTrip(userId, utazasId, dto);
  }

  @Delete('ellenorzolista/:id')
  // Ellenorzolista torlese az osszes elem torlesevel.
  remove(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) listaId: number,
  ): Promise<EllenorzoListaDeleteResponse> {
    const userId = this.getUserId(req);
    return this.ellenorzoListaService.deleteLista(userId, listaId);
  }
}
