import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UtazasQueryDto } from './dto/utazas-query.dto';
import { CreateUtazasDto } from './dto/create-utazas.dto';
import { UpdateUtazasDto } from './dto/update-utazas.dto';

// Lista tetel, a listazas API formatumahoz igazodva.
export type UtazasListItem = {
  azonosito: number;
  cim: string;
  leiras: string | null;
  kezdo_datum: string;
  veg_datum: string;
  programok_szama: number;
  jegyek_szama: number;
  ellenorzolistak_szama: number;
};

// Lista valasz, osszesites es lapozas mezokkel.
export type UtazasListResponse = {
  utazasok: UtazasListItem[];
  osszesen: number;
  oldal: number;
  oldalak_szama: number;
};

// Reszletes utazas nezet, programokkal es foglalasokkal.
export type UtazasDetailResponse = {
  azonosito: number;
  cim: string;
  leiras: string | null;
  kezdo_datum: string;
  veg_datum: string;
  letrehozas_datuma: string;
  programok: { azonosito: number; nev: string; nap_datum: string | null }[];
  foglalasok: { azonosito: number; tipus: string; jaratszam: string | null }[];
};

// Letrehozas utani valasz, alap mezokkel.
export type UtazasCreateResponse = {
  azonosito: number;
  cim: string;
  leiras: string | null;
  kezdo_datum: string;
  veg_datum: string;
  letrehozas_datuma: string;
};

// Frissites valasz, sikeres jelzessel.
export type UtazasUpdateResponse = {
  azonosito: number;
  cim: string;
  leiras: string | null;
  kezdo_datum: string;
  veg_datum: string;
  sikeres: boolean;
};

// Torles valasz, egyszeru visszajelzessel.
export type UtazasDeleteResponse = {
  sikeres: boolean;
  uzenet: string;
  torolt_utazas_id: number;
};

@Injectable()
export class UtazasService {
  constructor(private readonly prisma: PrismaService) {}

  // Utazasok listazasa a bejelentkezett felhasznalonak.
  async listForUser(
    userId: number,
    query: UtazasQueryDto,
  ): Promise<UtazasListResponse> {
    const oldal = query.oldal ?? 1;
    const limit = query.limit ?? 10;

    // Torolt statuszra most ures listat adunk vissza.
    if (query.statusz === 'torolt') {
      return {
        utazasok: [],
        osszesen: 0,
        oldal,
        oldalak_szama: 0,
      };
    }

    const where = {
      resztvevok: { some: { felhasznalo_id: userId } },
    };

    // Aktiv/lezart szures a veg_datum alapjan.
    if (query.statusz === 'aktiv') {
      (where as { veg_datum?: { gte: Date } }).veg_datum = { gte: new Date() };
    } else if (query.statusz === 'lezart') {
      (where as { veg_datum?: { lt: Date } }).veg_datum = { lt: new Date() };
    }

    // Egyszeru rendezes datum vagy nev szerint.
    let orderBy: { kezdo_datum?: 'asc'; nev?: 'asc' } | undefined;
    if (query.rendez === 'datum') {
      orderBy = { kezdo_datum: 'asc' };
    } else if (query.rendez === 'nev') {
      orderBy = { nev: 'asc' };
    }

    const skip = (oldal - 1) * limit;

    // Egy tranzakcioban szamolunk es listazunk.
    const [osszesen, rows] = await this.prisma.$transaction([
      this.prisma.utazas.count({ where }),
      this.prisma.utazas.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              programok: true,
              foglalasok: true,
              listak: true,
            },
          },
        },
      }),
    ]);

    // DB mezok atalakitasa az API valasz formatumara.
    const utazasok = rows.map((row) => ({
      azonosito: row.utazas_id,
      cim: row.nev,
      leiras: row.leiras,
      kezdo_datum: this.formatDate(row.kezdo_datum),
      veg_datum: this.formatDate(row.veg_datum),
      programok_szama: row._count.programok,
      jegyek_szama: row._count.foglalasok,
      ellenorzolistak_szama: row._count.listak,
    }));

    // Oldalak szama a teljes elemszam es a limit alapjan.
    return {
      utazasok,
      osszesen,
      oldal,
      oldalak_szama: osszesen === 0 ? 0 : Math.ceil(osszesen / limit),
    };
  }

  // Egy utazas reszletei, csak a resztvevoknek.
  async getForUser(
    userId: number,
    utazasId: number,
  ): Promise<UtazasDetailResponse> {
    // Az utazas alapadatai, programokkal es foglalasokkal.
    const utazas = await this.prisma.utazas.findUnique({
      where: { utazas_id: utazasId },
      include: {
        programok: {
          select: { program_id: true, program_nev: true, nap_datum: true },
        },
        foglalasok: {
          select: { foglalas_id: true, foglalas_tipus: true, jaratszam: true },
        },
      },
    });

    // Nincs ilyen utazas.
    if (!utazas) {
      throw new NotFoundException('Utazas nem talalhato.');
    }

    // Csak resztvevo lathatja.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });

    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    // A letrehozas_datuma egy egyszeru referencia datum.
    const letrehozva = participant.csatlakozas_ideje ?? utazas.kezdo_datum;

    // Valasz formatum osszerakasa.
    return {
      azonosito: utazas.utazas_id,
      cim: utazas.nev,
      leiras: utazas.leiras,
      kezdo_datum: this.formatDate(utazas.kezdo_datum),
      veg_datum: this.formatDate(utazas.veg_datum),
      letrehozas_datuma: letrehozva.toISOString(),
      programok: utazas.programok.map((program) => ({
        azonosito: program.program_id,
        nev: program.program_nev,
        nap_datum: program.nap_datum
          ? this.formatDate(program.nap_datum)
          : null,
      })),
      foglalasok: utazas.foglalasok.map((foglalas) => ({
        azonosito: foglalas.foglalas_id,
        tipus: foglalas.foglalas_tipus,
        jaratszam: foglalas.jaratszam,
      })),
    };
  }

  // Uj utazas letrehozasa, a bejelentkezett felhasznalot hozzarendeljuk.
  async createForUser(
    userId: number,
    dto: CreateUtazasDto,
  ): Promise<UtazasCreateResponse> {
    // Az input datumokat Date-re alakitjuk.
    const now = new Date();
    const created = await this.prisma.utazas.create({
      data: {
        nev: dto.cim,
        leiras: dto.leiras ?? null,
        kezdo_datum: new Date(dto.kezdo_datum),
        veg_datum: new Date(dto.veg_datum),
        resztvevok: {
          create: {
            felhasznalo_id: userId,
            csatlakozas_ideje: now,
          },
        },
      },
    });

    // Letrehozas utan a formatalt valaszt adjuk vissza.
    return {
      azonosito: created.utazas_id,
      cim: created.nev,
      leiras: created.leiras,
      kezdo_datum: this.formatDate(created.kezdo_datum),
      veg_datum: this.formatDate(created.veg_datum),
      letrehozas_datuma: now.toISOString(),
    };
  }

  // Utazas frissitese, csak ha a felhasznalo resztvevo.
  async updateForUser(
    userId: number,
    utazasId: number,
    dto: UpdateUtazasDto,
  ): Promise<UtazasUpdateResponse> {
    // Frissiteshez is kell resztvevoi jogosultsag.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });

    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    // Csak a megadott mezoket frissitjuk.
    const data: {
      nev?: string;
      leiras?: string | null;
      kezdo_datum?: Date;
      veg_datum?: Date;
    } = {};

    if (dto.cim) {
      data.nev = dto.cim;
    }
    // Leiras lehet ures is, ilyenkor null-ra allitjuk.
    if (dto.leiras !== undefined) {
      data.leiras = dto.leiras ?? null;
    }
    if (dto.kezdo_datum) {
      data.kezdo_datum = new Date(dto.kezdo_datum);
    }
    if (dto.veg_datum) {
      data.veg_datum = new Date(dto.veg_datum);
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nincs megadott modositando adat.');
    }

    // Aktualis adatokat mentunk vissza.
    const updated = await this.prisma.utazas.update({
      where: { utazas_id: utazasId },
      data,
    });

    // Sikeres frissites visszajelzese.
    return {
      azonosito: updated.utazas_id,
      cim: updated.nev,
      leiras: updated.leiras,
      kezdo_datum: this.formatDate(updated.kezdo_datum),
      veg_datum: this.formatDate(updated.veg_datum),
      sikeres: true,
    };
  }

  // Utazas torlese, az osszes kapcsolt rekorddal.
  async deleteForUser(
    userId: number,
    utazasId: number,
  ): Promise<UtazasDeleteResponse> {
    // Torleshez is resztvevoi jogosultsag kell.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });

    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    // Torles a kapcsolt rekordok miatt tranzakcioban.
    await this.prisma.$transaction(async (tx) => {
      const programok = await tx.program.findMany({
        where: { utazas_id: utazasId },
        select: { program_id: true },
      });
      const programIds = programok.map((p) => p.program_id);
      // Program latnivalo rekordok torlese.
      if (programIds.length > 0) {
        await tx.programLatnivalo.deleteMany({
          where: { program_id: { in: programIds } },
        });
      }

      const listak = await tx.ellenorzoLista.findMany({
        where: { utazas_id: utazasId },
        select: { lista_id: true },
      });
      const listaIds = listak.map((l) => l.lista_id);
      // Lista elemek torlese a listakhoz.
      if (listaIds.length > 0) {
        await tx.listaElem.deleteMany({
          where: { lista_id: { in: listaIds } },
        });
      }

      // Kozvetlen kapcsolatok torlese.
      await tx.program.deleteMany({ where: { utazas_id: utazasId } });
      await tx.foglalas.deleteMany({ where: { utazas_id: utazasId } });
      await tx.ellenorzoLista.deleteMany({ where: { utazas_id: utazasId } });
      await tx.utazasResztvevo.deleteMany({ where: { utazas_id: utazasId } });
      await tx.utazas.delete({ where: { utazas_id: utazasId } });
    });

    // Egyszeru visszajelzes a torlesrol.
    return {
      sikeres: true,
      uzenet: 'Utazas sikeresen torolve',
      torolt_utazas_id: utazasId,
    };
  }

  private formatDate(date: Date): string {
    // YYYY-MM-DD formatumra vagjuk a datumot.
    return date.toISOString().slice(0, 10);
  }
}
