import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaService } from 'src/prisma.service';
import { ParticipantService } from 'src/participant.service';
import { ProgramService } from './program.service';

describe('ProgramService', () => {
  const prismaMock = {
    utazasResztvevo: {
      findFirst: jest.fn(),
    },
    program: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    utazas: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const participantService = new ParticipantService(
    prismaMock as unknown as PrismaService,
  );
  const service = new ProgramService(
    prismaMock as unknown as PrismaService,
    participantService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('program létrehozás – tiltva, ha nem résztvevő', async () => {
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue(null);

    await expect(
      service.createForTrip(1, 10, {
        nev: 'Louvre',
        nap_datum: '2026-01-10',
        kezdo_ido: '10:00',
        veg_ido: '12:00',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('programok listázása – tiltva, ha nem résztvevő', async () => {
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue(null);

    await expect(service.listForTrip(1, 10)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('programok listázása – sikeres mapping', async () => {
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 10,
      felhasznalo_id: 1,
    });
    prismaMock.program.findMany.mockResolvedValue([
      {
        program_id: 2,
        utazas_id: 10,
        program_nev: 'Louvre',
        leiras: 'Muzeum',
        nap_datum: new Date('2026-01-10T00:00:00.000Z'),
        kezdo_ido: '10:00',
        veg_ido: '12:00',
        letrehozva: new Date('2026-01-01T10:00:00.000Z'),
      },
    ]);

    const result = await service.listForTrip(1, 10);

    expect(result).toEqual({
      programok: [
        {
          azonosito: 2,
          nev: 'Louvre',
          leiras: 'Muzeum',
          nap_datum: '2026-01-10',
          kezdo_ido: '10:00',
          veg_ido: '12:00',
          letrehozas_datuma: '2026-01-01T10:00:00.000Z',
        },
      ],
      osszesen: 1,
    });
  });

  it('program létrehozás – siker, és bővíti az utazás dátumtartományát', async () => {
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 10,
      felhasznalo_id: 1,
    });
    prismaMock.program.create.mockResolvedValue({
      program_id: 3,
      utazas_id: 10,
      program_nev: 'Eiffel',
      leiras: null,
      nap_datum: new Date('2026-01-05T00:00:00.000Z'),
      kezdo_ido: '09:00',
      veg_ido: '10:00',
      letrehozva: new Date('2026-01-01T10:00:00.000Z'),
    });
    prismaMock.utazas.findUnique.mockResolvedValue({
      kezdo_datum: new Date('2026-01-10T00:00:00.000Z'),
      veg_datum: new Date('2026-01-20T00:00:00.000Z'),
    });
    prismaMock.utazas.update.mockResolvedValue({});

    const result = await service.createForTrip(1, 10, {
      nev: 'Eiffel',
      nap_datum: '2026-01-05',
      kezdo_ido: '09:00',
      veg_ido: '10:00',
    });

    expect(prismaMock.utazas.update).toHaveBeenCalledWith({
      where: { utazas_id: 10 },
      data: { kezdo_datum: new Date('2026-01-05T00:00:00.000Z') },
    });
    expect(result.azonosito).toBe(3);
  });

  it('program módosítás – hiba, ha nincs ilyen program', async () => {
    prismaMock.program.findUnique.mockResolvedValue(null);

    await expect(
      service.updateProgram(1, 20, { nev: 'Uj nev' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('program módosítás – hiba, ha csak egyik idő van megadva', async () => {
    prismaMock.program.findUnique.mockResolvedValue({
      program_id: 1,
      utazas_id: 10,
      program_nev: 'Louvre',
      leiras: null,
      nap_datum: new Date('2026-01-10'),
      kezdo_ido: '10:00',
      veg_ido: '12:00',
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 10,
      felhasznalo_id: 1,
    });

    await expect(
      service.updateProgram(1, 1, { kezdo_ido: '11:00' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('program módosítás – hiba, ha nincs módosítandó mező', async () => {
    prismaMock.program.findUnique.mockResolvedValue({
      program_id: 1,
      utazas_id: 10,
      program_nev: 'Louvre',
      leiras: null,
      nap_datum: new Date('2026-01-10'),
      kezdo_ido: '10:00',
      veg_ido: '12:00',
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 10,
      felhasznalo_id: 1,
    });

    await expect(service.updateProgram(1, 1, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('program módosítás – siker, és frissítheti az utazás végét', async () => {
    prismaMock.program.findUnique.mockResolvedValue({
      program_id: 1,
      utazas_id: 10,
      program_nev: 'Louvre',
      leiras: null,
      nap_datum: new Date('2026-01-10'),
      kezdo_ido: '10:00',
      veg_ido: '12:00',
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 10,
      felhasznalo_id: 1,
    });
    prismaMock.program.update.mockResolvedValue({
      program_id: 1,
      utazas_id: 10,
      program_nev: 'Louvre uj',
      leiras: null,
      nap_datum: new Date('2026-01-25'),
      kezdo_ido: '11:00',
      veg_ido: '13:00',
    });
    prismaMock.utazas.findUnique.mockResolvedValue({
      kezdo_datum: new Date('2026-01-10'),
      veg_datum: new Date('2026-01-20'),
    });
    prismaMock.utazas.update.mockResolvedValue({});

    const result = await service.updateProgram(1, 1, {
      nev: 'Louvre uj',
      nap_datum: '2026-01-25',
      kezdo_ido: '11:00',
      veg_ido: '13:00',
    });

    expect(result.sikeres).toBe(true);
    expect(prismaMock.utazas.update).toHaveBeenCalledWith({
      where: { utazas_id: 10 },
      data: { veg_datum: new Date('2026-01-25T00:00:00.000Z') },
    });
  });

  it('program törlés – tiltva, ha nem résztvevő', async () => {
    prismaMock.program.findUnique.mockResolvedValue({
      program_id: 1,
      utazas_id: 10,
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue(null);

    await expect(service.deleteProgram(1, 1)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('program törlés – sikeres', async () => {
    prismaMock.program.findUnique.mockResolvedValue({
      program_id: 1,
      utazas_id: 10,
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 10,
      felhasznalo_id: 1,
    });
    prismaMock.program.delete.mockResolvedValue({} as never);

    const result = await service.deleteProgram(1, 1);

    expect(result).toEqual({
      sikeres: true,
      uzenet: 'Program sikeresen torolve',
      torolt_program_id: 1,
    });
  });
});
