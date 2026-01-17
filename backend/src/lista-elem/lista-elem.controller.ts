import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ListaElemService } from './lista-elem.service';
import type {
  ListaElemCreateResponse,
  ListaElemDeleteResponse,
  ListaElemUpdateResponse,
} from './lista-elem.service';
import { CreateListaElemDto } from './dto/create-lista-elem.dto';
import { UpdateListaElemDto } from './dto/update-lista-elem.dto';

type AuthedRequest = Request & { user?: { sub: number; email: string } };

@Controller('api')
@UseGuards(AuthGuard)
// Ellenorzolista elemek vegpontok bejelentkezett felhasznaloknak.
export class ListaElemController {
  constructor(private readonly listaElemService: ListaElemService) {}

  private getUserId(req: AuthedRequest): number {
    // A token payloadban varjuk a felhasznalo azonositojat.
    const authed = req.user;
    if (!authed || !authed.sub) {
      throw new UnauthorizedException('Nincs felhasznalo a tokenben.');
    }
    return authed.sub;
  }

  @Post('ellenorzolista/:listaId/elemek')
  // Uj elem hozzaadasa egy ellenorzolistahoz.
  create(
    @Req() req: AuthedRequest,
    @Param('listaId', ParseIntPipe) listaId: number,
    @Body() dto: CreateListaElemDto,
  ): Promise<ListaElemCreateResponse> {
    const userId = this.getUserId(req);
    return this.listaElemService.createForLista(userId, listaId, dto);
  }

  @Put('ellenorzolista/elemek/:id')
  // Elem modositas vagy kipipalas.
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) elemId: number,
    @Body() dto: UpdateListaElemDto,
  ): Promise<ListaElemUpdateResponse> {
    const userId = this.getUserId(req);
    return this.listaElemService.updateElem(userId, elemId, dto);
  }

  @Delete('ellenorzolista/elemek/:id')
  // Elem torlese ID alapjan.
  remove(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) elemId: number,
  ): Promise<ListaElemDeleteResponse> {
    const userId = this.getUserId(req);
    return this.listaElemService.deleteElem(userId, elemId);
  }
}
