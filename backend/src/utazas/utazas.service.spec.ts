import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaService } from 'src/prisma.service';
import { ParticipantService } from 'src/participant.service';
import { UtazasService } from './utazas.service';

describe('UtazasService', () => {
  const prismaMock = {
    utazas: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    utazasResztvevo: {
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
    program: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    ellenorzoLista: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    listaElem: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const participantService = new ParticipantService(
    prismaMock as unknown as PrismaService,
  );
  const service = new UtazasService(
    prismaMock as unknown as PrismaService,
    participantService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('utazás listázás – torolt státusznál üres lista', async () => {
    const result = await service.listForUser(1, { statusz: 'torolt' });

    expect(result).toEqual({
      utazasok: [],
      osszesen: 0,
      oldal: 1,
      oldalak_szama: 0,
    });
  });

  it('utazás listázás – siker lapozással', async () => {
    prismaMock.utazas.count.mockResolvedValue(1);
    prismaMock.utazas.findMany.mockResolvedValue([
      {
        utazas_id: 2,
        nev: 'Parizs',
        leiras: null,
        kezdo_datum: new Date('2026-02-01'),
        veg_datum: new Date('2026-02-03'),
        _count: { programok: 4, listak: 1 },
      },
    ]);
    prismaMock.$transaction.mockImplementation(async (ops) => Promise.all(ops));

    const result = await service.listForUser(1, {
      oldal: 1,
      limit: 10,
      rendez: 'nev',
    });

    expect(result).toEqual({
      utazasok: [
        {
          azonosito: 2,
          cim: 'Parizs',
          leiras: null,
          kezdo_datum: '2026-02-01',
          veg_datum: '2026-02-03',
          programok_szama: 4,
          jegyek_szama: 0,
          ellenorzolistak_szama: 1,
        },
      ],
      osszesen: 1,
      oldal: 1,
      oldalak_szama: 1,
    });
  });

  it('utazás részletek – hiba, ha nincs ilyen utazás', async () => {
    prismaMock.utazas.findUnique.mockResolvedValue(null);

    await expect(service.getForUser(1, 99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('utazás részletek – tiltva, ha nem résztvevő', async () => {
    prismaMock.utazas.findUnique.mockResolvedValue({
      utazas_id: 10,
      nev: 'Parizs',
      leiras: null,
      kezdo_datum: new Date('2026-01-10'),
      veg_datum: new Date('2026-01-12'),
      letrehozva: new Date('2026-01-01T10:00:00.000Z'),
      programok: [],
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue(null);

    await expect(service.getForUser(1, 10)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('utazás részletek – siker', async () => {
    prismaMock.utazas.findUnique.mockResolvedValue({
      utazas_id: 10,
      nev: 'Parizs',
      leiras: 'Kirandulas',
      kezdo_datum: new Date('2026-01-10'),
      veg_datum: new Date('2026-01-12'),
      letrehozva: new Date('2026-01-01T10:00:00.000Z'),
      programok: [
        {
          program_id: 1,
          program_nev: 'Louvre',
          leiras: null,
          nap_datum: new Date('2026-01-10'),
          kezdo_ido: '10:00',
          veg_ido: '12:00',
        },
      ],
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 10,
      felhasznalo_id: 1,
    });

    const result = await service.getForUser(1, 10);
    expect(result.programok).toHaveLength(1);
    expect(result.letrehozas_datuma).toBe('2026-01-01T10:00:00.000Z');
  });

  it('utazás létrehozás – siker', async () => {
    prismaMock.utazas.create.mockResolvedValue({
      utazas_id: 1,
      nev: 'Trip',
      leiras: null,
      kezdo_datum: new Date('2026-01-01'),
      veg_datum: new Date('2026-01-02'),
      letrehozva: new Date('2026-01-01T10:00:00.000Z'),
    });

    const result = await service.createForUser(1, {
      cim: 'Trip',
      leiras: undefined,
      kezdo_datum: '2026-01-01',
      veg_datum: '2026-01-02',
    });

    expect(result).toEqual({
      azonosito: 1,
      cim: 'Trip',
      leiras: null,
      kezdo_datum: '2026-01-01',
      veg_datum: '2026-01-02',
      letrehozas_datuma: '2026-01-01T10:00:00.000Z',
    });
  });

  it('utazás módosítás – tiltva, ha nem résztvevő', async () => {
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue(null);

    await expect(
      service.updateForUser(1, 2, { cim: 'X' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('utazás módosítás – hiba, ha nincs adat', async () => {
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({ utazas_id: 2 });

    await expect(service.updateForUser(1, 2, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('utazás módosítás – siker', async () => {
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({ utazas_id: 2 });
    prismaMock.utazas.update.mockResolvedValue({
      utazas_id: 2,
      nev: 'Uj cim',
      leiras: 'Uj leiras',
      kezdo_datum: new Date('2026-01-02'),
      veg_datum: new Date('2026-01-04'),
    });

    const result = await service.updateForUser(1, 2, {
      cim: 'Uj cim',
      leiras: 'Uj leiras',
      kezdo_datum: '2026-01-02',
      veg_datum: '2026-01-04',
    });

    expect(result).toEqual({
      azonosito: 2,
      cim: 'Uj cim',
      leiras: 'Uj leiras',
      kezdo_datum: '2026-01-02',
      veg_datum: '2026-01-04',
      sikeres: true,
    });
  });

  it('utazás törlés – tiltva, ha nem résztvevő', async () => {
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue(null);

    await expect(service.deleteForUser(1, 2)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('utazás törlés – siker, kapcsolt rekordok törlésével', async () => {
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 2,
      felhasznalo_id: 1,
    });
    prismaMock.$transaction.mockImplementation(
      (callback: (prisma: unknown) => Promise<unknown>) =>
        callback({
          program: {
            findMany: jest.fn().mockResolvedValue([{ program_id: 11 }]),
            deleteMany: jest.fn().mockResolvedValue({}),
          },
          ellenorzoLista: {
            findMany: jest.fn().mockResolvedValue([{ lista_id: 22 }]),
            deleteMany: jest.fn().mockResolvedValue({}),
          },
          listaElem: { deleteMany: jest.fn().mockResolvedValue({}) },
          utazasResztvevo: { deleteMany: jest.fn().mockResolvedValue({}) },
          utazas: { delete: jest.fn().mockResolvedValue({}) },
        }),
    );

    const result = await service.deleteForUser(1, 2);

    expect(result).toEqual({
      sikeres: true,
      uzenet: 'Utazas sikeresen torolve',
      torolt_utazas_id: 2,
    });
  });
});
