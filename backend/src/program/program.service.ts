import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ParticipantService } from 'src/participant.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import type {
  ProgramListResponse,
  ProgramCreateResponse,
  ProgramUpdateResponse,
  ProgramDeleteResponse,
} from './program.types';

export type {
  ProgramListResponse,
  ProgramCreateResponse,
  ProgramUpdateResponse,
  ProgramDeleteResponse,
} from './program.types';

@Injectable()
export class ProgramService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly participantService: ParticipantService,
  ) {}

  async listForTrip(
    userId: number,
    utazasId: number,
  ): Promise<ProgramListResponse> {
    await this.participantService.ensureParticipant(utazasId, userId);

    const programok = await this.prisma.program.findMany({
      where: { utazas_id: utazasId },
      orderBy: { nap_datum: 'asc' },
    });

    const items = programok.map((program) => ({
      azonosito: program.program_id,
      nev: program.program_nev,
      leiras: program.leiras,
      nap_datum: this.formatDate(program.nap_datum),
      kezdo_ido: program.kezdo_ido,
      veg_ido: program.veg_ido,
      letrehozas_datuma: program.letrehozva.toISOString(),
    }));

    return { programok: items, osszesen: items.length };
  }

  async createForTrip(
    userId: number,
    utazasId: number,
    dto: CreateProgramDto,
  ): Promise<ProgramCreateResponse> {
    await this.participantService.ensureParticipant(utazasId, userId);

    const napDatumValue = new Date(dto.nap_datum);
    const created = await this.prisma.program.create({
      data: {
        utazas_id: utazasId,
        program_nev: dto.nev,
        leiras: dto.leiras ?? null,
        nap_datum: napDatumValue,
        kezdo_ido: dto.kezdo_ido,
        veg_ido: dto.veg_ido,
      },
    });

    await this.extendTripDateRangeIfNeeded(utazasId, napDatumValue);

    const napDatum =
      this.formatDate(created.nap_datum) ??
      created.letrehozva.toISOString().slice(0, 10);

    return {
      azonosito: created.program_id,
      utazas_id: created.utazas_id,
      nev: created.program_nev,
      leiras: created.leiras,
      nap_datum: napDatum,
      kezdo_ido: created.kezdo_ido,
      veg_ido: created.veg_ido,
      letrehozas_datuma: created.letrehozva.toISOString(),
    };
  }

  async updateProgram(
    userId: number,
    programId: number,
    dto: UpdateProgramDto,
  ): Promise<ProgramUpdateResponse> {
    const existing = await this.prisma.program.findUnique({
      where: { program_id: programId },
    });
    if (!existing) {
      throw new NotFoundException('Program nem talalhato.');
    }

    await this.participantService.ensureParticipant(existing.utazas_id, userId);

    if ((dto.kezdo_ido && !dto.veg_ido) || (!dto.kezdo_ido && dto.veg_ido)) {
      throw new BadRequestException('A kezdo es veg ido egyutt kotelezo.');
    }

    const data: {
      program_nev?: string;
      leiras?: string | null;
      nap_datum?: Date;
      kezdo_ido?: string;
      veg_ido?: string;
    } = {};

    if (dto.nev) data.program_nev = dto.nev;
    if (dto.leiras !== undefined) {
      data.leiras = dto.leiras.trim() ? dto.leiras : null;
    }

    let napDatumValue: Date | undefined;
    if (dto.nap_datum) {
      napDatumValue = new Date(dto.nap_datum);
      data.nap_datum = napDatumValue;
    }
    if (dto.kezdo_ido) data.kezdo_ido = dto.kezdo_ido;
    if (dto.veg_ido) data.veg_ido = dto.veg_ido;

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nincs megadott modositando adat.');
    }

    const updated = await this.prisma.program.update({
      where: { program_id: programId },
      data,
    });

    if (napDatumValue) {
      await this.extendTripDateRangeIfNeeded(existing.utazas_id, napDatumValue);
    }

    return {
      azonosito: updated.program_id,
      nev: updated.program_nev,
      leiras: updated.leiras,
      nap_datum: this.formatDate(updated.nap_datum),
      kezdo_ido: updated.kezdo_ido,
      veg_ido: updated.veg_ido,
      sikeres: true,
    };
  }

  async deleteProgram(
    userId: number,
    programId: number,
  ): Promise<ProgramDeleteResponse> {
    const existing = await this.prisma.program.findUnique({
      where: { program_id: programId },
    });
    if (!existing) {
      throw new NotFoundException('Program nem talalhato.');
    }

    await this.participantService.ensureParticipant(existing.utazas_id, userId);
    await this.prisma.program.delete({ where: { program_id: programId } });

    return {
      sikeres: true,
      uzenet: 'Program sikeresen torolve',
      torolt_program_id: programId,
    };
  }

  private formatDate(date: Date | null): string | null {
    if (!date) return null;
    return date.toISOString().slice(0, 10);
  }

  private async extendTripDateRangeIfNeeded(
    utazasId: number,
    napDatum: Date,
  ): Promise<void> {
    const utazas = await this.prisma.utazas.findUnique({
      where: { utazas_id: utazasId },
      select: { kezdo_datum: true, veg_datum: true },
    });
    if (!utazas) return;

    const updateData: { kezdo_datum?: Date; veg_datum?: Date } = {};
    if (napDatum < utazas.kezdo_datum) updateData.kezdo_datum = napDatum;
    if (napDatum > utazas.veg_datum) updateData.veg_datum = napDatum;

    if (Object.keys(updateData).length > 0) {
      await this.prisma.utazas.update({
        where: { utazas_id: utazasId },
        data: updateData,
      });
    }
  }
}
