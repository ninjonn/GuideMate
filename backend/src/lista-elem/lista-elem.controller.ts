import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserId } from 'src/auth/user-id.decorator';
import { ListaElemService } from './lista-elem.service';
import type {
  ListaElemCreateResponse,
  ListaElemDeleteResponse,
  ListaElemUpdateResponse,
} from './lista-elem.types';
import { CreateListaElemDto } from './dto/create-lista-elem.dto';
import { UpdateListaElemDto } from './dto/update-lista-elem.dto';

@Controller('api')
@UseGuards(AuthGuard)
export class ListaElemController {
  constructor(private readonly listaElemService: ListaElemService) {}

  @Post('ellenorzolista/:listaId/elemek')
  create(
    @UserId() userId: number,
    @Param('listaId', ParseIntPipe) listaId: number,
    @Body() dto: CreateListaElemDto,
  ): Promise<ListaElemCreateResponse> {
    return this.listaElemService.createForLista(userId, listaId, dto);
  }

  @Put('ellenorzolista/elemek/:id')
  update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) elemId: number,
    @Body() dto: UpdateListaElemDto,
  ): Promise<ListaElemUpdateResponse> {
    return this.listaElemService.updateElem(userId, elemId, dto);
  }

  @Delete('ellenorzolista/elemek/:id')
  remove(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) elemId: number,
  ): Promise<ListaElemDeleteResponse> {
    return this.listaElemService.deleteElem(userId, elemId);
  }
}
