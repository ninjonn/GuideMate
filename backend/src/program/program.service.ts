import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

// Lista tetel, program adatokkal.
export type ProgramListItem = {
  azonosito: number;
  nev: string;
  nap_datum: string | null;
  letrehozas_datuma: string;
};

// Lista valasz, osszes elem szammal.
export type ProgramListResponse = {
  programok: ProgramListItem[];
  osszesen: number;
};

// Letrehozas utani valasz, utazas_id-val.
export type ProgramCreateResponse = {
  azonosito: number;
  utazas_id: number;
  nev: string;
  nap_datum: string;
  letrehozas_datuma: string;
};

// Frissites valasz, sikeres jelzessel.
export type ProgramUpdateResponse = {
  azonosito: number;
  nev: string;
  nap_datum: string | null;
  sikeres: boolean;
};

// Torles valasz, visszajelzessel.
export type ProgramDeleteResponse = {
  sikeres: boolean;
  uzenet: string;
  torolt_program_id: number;
};

@Injectable()
export class ProgramService {
  constructor(private readonly prisma: PrismaService) {}

  // Programok listazasa egy utazashoz.
  async listForTrip(
    userId: number,
    utazasId: number,
  ): Promise<ProgramListResponse> {
    // Csak a resztvevok lathatjak.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    // Programok lekerese idorendi sorrendben.
    const programok = await this.prisma.program.findMany({
      where: { utazas_id: utazasId },
      orderBy: { nap_datum: 'asc' },
    });

    // Valasz formatum osszerakasa.
    const items = programok.map((program) => {
      // Letrehozas datuma egyszeruen a nap_datum, ha nincs akkor most.
      const letrehozva = program.nap_datum ?? new Date();
      return {
        azonosito: program.program_id,
        nev: program.program_nev,
        nap_datum: this.formatDate(program.nap_datum),
        letrehozas_datuma: letrehozva.toISOString(),
      };
    });

    return {
      programok: items,
      osszesen: items.length,
    };
  }

  // Uj program letrehozasa egy utazashoz.
  async createForTrip(
    userId: number,
    utazasId: number,
    dto: CreateProgramDto,
  ): Promise<ProgramCreateResponse> {
    // Csak a resztvevok hozhatnak letre programot.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    const now = new Date();
    const created = await this.prisma.program.create({
      data: {
        utazas_id: utazasId,
        program_nev: dto.nev,
        nap_datum: new Date(dto.nap_datum),
      },
    });

    // A nap_datum formatumot biztositjuk a valaszhoz.
    const napDatum =
      this.formatDate(created.nap_datum) ??
      this.formatDate(now) ??
      now.toISOString().slice(0, 10);

    return {
      azonosito: created.program_id,
      utazas_id: created.utazas_id,
      nev: created.program_nev,
      nap_datum: napDatum,
      letrehozas_datuma: now.toISOString(),
    };
  }

  // Program frissitese ID alapjan.
  async updateProgram(
    userId: number,
    programId: number,
    dto: UpdateProgramDto,
  ): Promise<ProgramUpdateResponse> {
    // Megnezzuk, hogy letezik-e a program.
    const existing = await this.prisma.program.findUnique({
      where: { program_id: programId },
    });
    if (!existing) {
      throw new NotFoundException('Program nem talalhato.');
    }

    // Jog ellenorzes az utazas resztvevoi alapjan.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: existing.utazas_id, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    // Csak a megadott mezoket frissitjuk.
    const data: { program_nev?: string; nap_datum?: Date | null } = {};
    if (dto.nev) {
      data.program_nev = dto.nev;
    }
    if (dto.nap_datum) {
      data.nap_datum = new Date(dto.nap_datum);
    }
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nincs megadott modositando adat.');
    }

    const updated = await this.prisma.program.update({
      where: { program_id: programId },
      data,
    });

    return {
      azonosito: updated.program_id,
      nev: updated.program_nev,
      nap_datum: this.formatDate(updated.nap_datum),
      sikeres: true,
    };
  }

  // Program torlese ID alapjan.
  async deleteProgram(
    userId: number,
    programId: number,
  ): Promise<ProgramDeleteResponse> {
    // Megnezzuk, hogy letezik-e a program.
    const existing = await this.prisma.program.findUnique({
      where: { program_id: programId },
    });
    if (!existing) {
      throw new NotFoundException('Program nem talalhato.');
    }

    // Jog ellenorzes az utazas resztvevoi alapjan.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: existing.utazas_id, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    // Kapcsolt rekordok torlese (programLatnivalo) + program torlese.
    await this.prisma.$transaction(async (tx) => {
      await tx.programLatnivalo.deleteMany({
        where: { program_id: programId },
      });
      await tx.program.delete({ where: { program_id: programId } });
    });

    return {
      sikeres: true,
      uzenet: 'Program sikeresen torolve',
      torolt_program_id: programId,
    };
  }

  private formatDate(date: Date | null): string | null {
    // YYYY-MM-DD formatumra vagjuk a datumot.
    if (!date) {
      return null;
    }
    return date.toISOString().slice(0, 10);
  }
}
