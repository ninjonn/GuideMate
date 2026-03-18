import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ParticipantService } from 'src/participant.service';
import { CreateEllenorzoListaDto } from './dto/create-ellenorzo-lista.dto';
import type {
  EllenorzoListaListResponse,
  EllenorzoListaCreateResponse,
  EllenorzoListaDeleteResponse,
} from './ellenorzo-lista.types';

export type {
  EllenorzoListaListResponse,
  EllenorzoListaCreateResponse,
  EllenorzoListaDeleteResponse,
} from './ellenorzo-lista.types';

@Injectable()
export class EllenorzoListaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly participantService: ParticipantService,
  ) {}

  async listForTrip(
    userId: number,
    utazasId: number,
  ): Promise<EllenorzoListaListResponse> {
    await this.participantService.ensureParticipant(utazasId, userId);

    const listak = await this.prisma.ellenorzoLista.findMany({
      where: { utazas_id: utazasId },
      include: { elemek: { orderBy: { elem_id: 'asc' } } },
      orderBy: { lista_id: 'asc' },
    });

    const items = listak.map((lista) => ({
      lista_id: lista.lista_id,
      lista_nev: lista.lista_nev,
      elemek: lista.elemek.map((elem) => ({
        elem_id: elem.elem_id,
        megnevezes: elem.megnevezes,
        kipipalva: elem.kipipalva,
      })),
    }));

    return { ellenorzolistak: items, osszesen: items.length };
  }

  async createForTrip(
    userId: number,
    utazasId: number,
    dto: CreateEllenorzoListaDto,
  ): Promise<EllenorzoListaCreateResponse> {
    await this.participantService.ensureParticipant(utazasId, userId);

    const created = await this.prisma.ellenorzoLista.create({
      data: { utazas_id: utazasId, lista_nev: dto.lista_nev },
    });

    return {
      lista_id: created.lista_id,
      utazas_id: created.utazas_id,
      lista_nev: created.lista_nev,
      letrehozas_datuma: new Date().toISOString(),
    };
  }

  async deleteLista(
    userId: number,
    listaId: number,
  ): Promise<EllenorzoListaDeleteResponse> {
    const existing = await this.prisma.ellenorzoLista.findUnique({
      where: { lista_id: listaId },
    });
    if (!existing) {
      throw new NotFoundException('Ellenorzolista nem talalhato.');
    }

    await this.participantService.ensureParticipant(existing.utazas_id, userId);

    const toroltElemekSzama = await this.prisma.$transaction(async (tx) => {
      const deleted = await tx.listaElem.deleteMany({
        where: { lista_id: listaId },
      });
      await tx.ellenorzoLista.delete({ where: { lista_id: listaId } });
      return deleted.count;
    });

    return {
      sikeres: true,
      uzenet: 'Ellenorzolista sikeresen torolve',
      torolt_lista_id: listaId,
      torolt_elemek_szama: toroltElemekSzama,
    };
  }
}
