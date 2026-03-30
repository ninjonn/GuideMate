import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ParticipantService } from 'src/participant.service';
import { UtazasQueryDto } from './dto/utazas-query.dto';
import { CreateUtazasDto } from './dto/create-utazas.dto';
import { UpdateUtazasDto } from './dto/update-utazas.dto';
import type {
  UtazasListResponse,
  UtazasDetailResponse,
  UtazasWithProgramok,
  UtazasCreateResponse,
  UtazasUpdateResponse,
  UtazasDeleteResponse,
} from './utazas.types';

export type {
  UtazasListResponse,
  UtazasDetailResponse,
  UtazasCreateResponse,
  UtazasUpdateResponse,
  UtazasDeleteResponse,
} from './utazas.types';

@Injectable()
export class UtazasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly participantService: ParticipantService,
  ) {}

  async listForUser(
    userId: number,
    query: UtazasQueryDto,
  ): Promise<UtazasListResponse> {
    const oldal = query.oldal ?? 1;
    const limit = query.limit ?? 10;

    if (query.statusz === 'torolt') {
      return { utazasok: [], osszesen: 0, oldal, oldalak_szama: 0 };
    }

    const where: Prisma.UtazasWhereInput = {
      resztvevok: { some: { felhasznalo_id: userId } },
    };

    if (query.statusz === 'aktiv') {
      where.veg_datum = { gte: new Date() };
    } else if (query.statusz === 'lezart') {
      where.veg_datum = { lt: new Date() };
    }

    let orderBy: { kezdo_datum?: 'asc'; nev?: 'asc' } | undefined;
    if (query.rendez === 'datum') {
      orderBy = { kezdo_datum: 'asc' };
    } else if (query.rendez === 'nev') {
      orderBy = { nev: 'asc' };
    }

    const skip = (oldal - 1) * limit;

    const [osszesen, rows] = await this.prisma.$transaction([
      this.prisma.utazas.count({ where }),
      this.prisma.utazas.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: { select: { programok: true, listak: true } },
        },
      }),
    ]);

    const utazasok = rows.map((row) => ({
      azonosito: row.utazas_id,
      cim: row.nev,
      leiras: row.leiras,
      kezdo_datum: this.formatDate(row.kezdo_datum),
      veg_datum: this.formatDate(row.veg_datum),
      programok_szama: row._count.programok,
      jegyek_szama: 0,
      ellenorzolistak_szama: row._count.listak,
    }));

    return {
      utazasok,
      osszesen,
      oldal,
      oldalak_szama: osszesen === 0 ? 0 : Math.ceil(osszesen / limit),
    };
  }

  async getForUser(
    userId: number,
    utazasId: number,
  ): Promise<UtazasDetailResponse> {
    const utazas = (await this.prisma.utazas.findUnique({
      where: { utazas_id: utazasId },
      include: {
        programok: {
          select: {
            program_id: true,
            program_nev: true,
            leiras: true,
            nap_datum: true,
            kezdo_ido: true,
            veg_ido: true,
          },
        },
      },
    })) as UtazasWithProgramok | null;

    if (!utazas) {
      throw new NotFoundException('Utazas nem talalhato.');
    }

    await this.participantService.ensureParticipant(utazasId, userId);

    return {
      azonosito: utazas.utazas_id,
      cim: utazas.nev,
      leiras: utazas.leiras,
      kezdo_datum: this.formatDate(utazas.kezdo_datum),
      veg_datum: this.formatDate(utazas.veg_datum),
      letrehozas_datuma: utazas.letrehozva.toISOString(),
      programok: utazas.programok.map((program) => ({
        azonosito: program.program_id,
        nev: program.program_nev,
        leiras: program.leiras,
        nap_datum: this.formatDate(program.nap_datum),
        kezdo_ido: program.kezdo_ido,
        veg_ido: program.veg_ido,
      })),
    };
  }

  async createForUser(
    userId: number,
    dto: CreateUtazasDto,
  ): Promise<UtazasCreateResponse> {
    const created = await this.prisma.utazas.create({
      data: {
        nev: dto.cim,
        leiras: dto.leiras ?? null,
        kezdo_datum: new Date(dto.kezdo_datum),
        veg_datum: new Date(dto.veg_datum),
        resztvevok: {
          create: { felhasznalo_id: userId, csatlakozas_ideje: new Date() },
        },
      },
    });

    return {
      azonosito: created.utazas_id,
      cim: created.nev,
      leiras: created.leiras,
      kezdo_datum: this.formatDate(created.kezdo_datum),
      veg_datum: this.formatDate(created.veg_datum),
      letrehozas_datuma: created.letrehozva.toISOString(),
    };
  }

  async updateForUser(
    userId: number,
    utazasId: number,
    dto: UpdateUtazasDto,
  ): Promise<UtazasUpdateResponse> {
    await this.participantService.ensureParticipant(utazasId, userId);

    const data: {
      nev?: string;
      leiras?: string | null;
      kezdo_datum?: Date;
      veg_datum?: Date;
    } = {};

    if (dto.cim) data.nev = dto.cim;
    if (dto.leiras !== undefined) data.leiras = dto.leiras ?? null;
    if (dto.kezdo_datum) data.kezdo_datum = new Date(dto.kezdo_datum);
    if (dto.veg_datum) data.veg_datum = new Date(dto.veg_datum);

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nincs megadott modositando adat.');
    }

    const updated = await this.prisma.utazas.update({
      where: { utazas_id: utazasId },
      data,
    });

    return {
      azonosito: updated.utazas_id,
      cim: updated.nev,
      leiras: updated.leiras,
      kezdo_datum: this.formatDate(updated.kezdo_datum),
      veg_datum: this.formatDate(updated.veg_datum),
      sikeres: true,
    };
  }

  async deleteForUser(
    userId: number,
    utazasId: number,
  ): Promise<UtazasDeleteResponse> {
    await this.participantService.ensureParticipant(utazasId, userId);

    await this.prisma.$transaction(async (tx) => {
      const listak = await tx.ellenorzoLista.findMany({
        where: { utazas_id: utazasId },
        select: { lista_id: true },
      });
      const listaIds = listak.map((l) => l.lista_id);
      if (listaIds.length > 0) {
        await tx.listaElem.deleteMany({
          where: { lista_id: { in: listaIds } },
        });
      }
      await tx.program.deleteMany({ where: { utazas_id: utazasId } });
      await tx.ellenorzoLista.deleteMany({ where: { utazas_id: utazasId } });
      await tx.utazasResztvevo.deleteMany({ where: { utazas_id: utazasId } });
      await tx.utazas.delete({ where: { utazas_id: utazasId } });
    });

    return {
      sikeres: true,
      uzenet: 'Utazas sikeresen torolve',
      torolt_utazas_id: utazasId,
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
