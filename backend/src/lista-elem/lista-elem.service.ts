import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateListaElemDto } from './dto/create-lista-elem.dto';
import { UpdateListaElemDto } from './dto/update-lista-elem.dto';

// Letrehozas valasz formatum.
export type ListaElemCreateResponse = {
  elem_id: number;
  lista_id: number;
  megnevezes: string;
  kipipalva: boolean;
  letrehozas_datuma: string;
};

// Frissites valasz formatum.
export type ListaElemUpdateResponse = {
  elem_id: number;
  megnevezes: string;
  kipipalva: boolean;
  sikeres: boolean;
};

// Torles valasz formatum.
export type ListaElemDeleteResponse = {
  sikeres: boolean;
  uzenet: string;
  torolt_elem_id: number;
};

@Injectable()
export class ListaElemService {
  constructor(private readonly prisma: PrismaService) {}

  // Uj elem letrehozasa egy ellenorzolistahoz.
  async createForLista(
    userId: number,
    listaId: number,
    dto: CreateListaElemDto,
  ): Promise<ListaElemCreateResponse> {
    const lista = await this.prisma.ellenorzoLista.findUnique({
      where: { lista_id: listaId },
    });
    if (!lista) {
      throw new NotFoundException('Ellenorzolista nem talalhato.');
    }

    // Jog ellenorzes az utazas resztvevoi alapjan.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: lista.utazas_id, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    const created = await this.prisma.listaElem.create({
      data: {
        lista_id: listaId,
        megnevezes: dto.megnevezes,
      },
    });

    return {
      elem_id: created.elem_id,
      lista_id: created.lista_id,
      megnevezes: created.megnevezes,
      kipipalva: created.kipipalva,
      letrehozas_datuma: new Date().toISOString(),
    };
  }

  // Elem frissitese ID alapjan.
  async updateElem(
    userId: number,
    elemId: number,
    dto: UpdateListaElemDto,
  ): Promise<ListaElemUpdateResponse> {
    const existing = await this.prisma.listaElem.findUnique({
      where: { elem_id: elemId },
      include: { lista: true },
    });
    if (!existing) {
      throw new NotFoundException('Elem nem talalhato.');
    }

    // Jog ellenorzes az utazas resztvevoi alapjan.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: existing.lista.utazas_id, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    const data: { megnevezes?: string; kipipalva?: boolean } = {};
    if (dto.megnevezes) {
      data.megnevezes = dto.megnevezes;
    }
    if (dto.kipipalva !== undefined) {
      data.kipipalva = dto.kipipalva;
    }
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nincs megadott modositando adat.');
    }

    const updated = await this.prisma.listaElem.update({
      where: { elem_id: elemId },
      data,
    });

    return {
      elem_id: updated.elem_id,
      megnevezes: updated.megnevezes,
      kipipalva: updated.kipipalva,
      sikeres: true,
    };
  }

  // Elem torlese ID alapjan.
  async deleteElem(
    userId: number,
    elemId: number,
  ): Promise<ListaElemDeleteResponse> {
    const existing = await this.prisma.listaElem.findUnique({
      where: { elem_id: elemId },
      include: { lista: true },
    });
    if (!existing) {
      throw new NotFoundException('Elem nem talalhato.');
    }

    // Jog ellenorzes az utazas resztvevoi alapjan.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: existing.lista.utazas_id, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    await this.prisma.listaElem.delete({ where: { elem_id: elemId } });

    return {
      sikeres: true,
      uzenet: 'Elem sikeresen torolve',
      torolt_elem_id: elemId,
    };
  }
}
