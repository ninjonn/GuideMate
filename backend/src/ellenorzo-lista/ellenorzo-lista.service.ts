import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateEllenorzoListaDto } from './dto/create-ellenorzo-lista.dto';

// Lista elemek valasz formatuma.
export type EllenorzoListaElemItem = {
  elem_id: number;
  megnevezes: string;
  kipipalva: boolean;
};

// Ellenorzolista valasz formatuma, elemekkel.
export type EllenorzoListaItem = {
  lista_id: number;
  lista_nev: string;
  elemek: EllenorzoListaElemItem[];
};

// Listazas valasz, osszes elem szammal.
export type EllenorzoListaListResponse = {
  ellenorzolistak: EllenorzoListaItem[];
  osszesen: number;
};

// Letrehozas valasz, letrehozas_datuma mezovel.
export type EllenorzoListaCreateResponse = {
  lista_id: number;
  utazas_id: number;
  lista_nev: string;
  letrehozas_datuma: string;
};

// Torles valasz, torolt elemek szamaval.
export type EllenorzoListaDeleteResponse = {
  sikeres: boolean;
  uzenet: string;
  torolt_lista_id: number;
  torolt_elemek_szama: number;
};

@Injectable()
export class EllenorzoListaService {
  constructor(private readonly prisma: PrismaService) {}

  // Ellenorzolistak listazasa egy utazashoz.
  async listForTrip(
    userId: number,
    utazasId: number,
  ): Promise<EllenorzoListaListResponse> {
    // Csak a resztvevok lathatjak.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    const listak = await this.prisma.ellenorzoLista.findMany({
      where: { utazas_id: utazasId },
      include: {
        elemek: {
          orderBy: { elem_id: 'asc' },
        },
      },
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

    return {
      ellenorzolistak: items,
      osszesen: items.length,
    };
  }

  // Uj ellenorzolista letrehozasa egy utazashoz.
  async createForTrip(
    userId: number,
    utazasId: number,
    dto: CreateEllenorzoListaDto,
  ): Promise<EllenorzoListaCreateResponse> {
    // Csak a resztvevok hozhatnak letre listat.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    const created = await this.prisma.ellenorzoLista.create({
      data: {
        utazas_id: utazasId,
        lista_nev: dto.lista_nev,
      },
    });

    return {
      lista_id: created.lista_id,
      utazas_id: created.utazas_id,
      lista_nev: created.lista_nev,
      letrehozas_datuma: new Date().toISOString(),
    };
  }

  // Ellenorzolista torlese, elemekkel egyutt.
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

    // Jog ellenorzes az utazas resztvevoi alapjan.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: existing.utazas_id, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

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
