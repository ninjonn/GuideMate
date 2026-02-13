import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FoglalasService } from './foglalas.service';

describe('FoglalasService', () => {
  const prisma = {
    foglalas: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const service = new FoglalasService(prisma as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('foglalások listázása – csak saját foglalások', async () => {
    prisma.foglalas.findMany.mockResolvedValue([
      {
        foglalas_id: 1,
        felhasznalo_id: 1,
        foglalas_tipus: 'repulo',
        indulasi_hely: 'BUD',
        erkezesi_hely: 'CDG',
        indulasi_ido: new Date('2026-01-10T10:00:00.000Z'),
        erkezesi_ido: new Date('2026-01-10T12:00:00.000Z'),
        jaratszam: 'AF123',
        hely: null,
        cim: null,
        kezdo_datum: null,
        veg_datum: null,
        letrehozva: new Date('2026-01-01T10:00:00.000Z'),
      },
    ]);

    const result = await service.listForUser(1);

    expect(result.osszesen).toBe(1);
    expect(prisma.foglalas.findMany).toHaveBeenCalledWith({
      where: { felhasznalo_id: 1 },
      orderBy: { indulasi_ido: 'asc' },
    });
  });

  it('foglalás létrehozás – siker', async () => {
    prisma.foglalas.create.mockResolvedValue({
      foglalas_id: 2,
      felhasznalo_id: 1,
      foglalas_tipus: 'repulo',
      indulasi_hely: 'BUD',
      erkezesi_hely: 'CDG',
      indulasi_ido: new Date('2026-01-10T10:00:00.000Z'),
      erkezesi_ido: new Date('2026-01-10T12:00:00.000Z'),
      jaratszam: 'AF123',
      hely: null,
      cim: null,
      kezdo_datum: null,
      veg_datum: null,
      letrehozva: new Date('2026-01-01T10:00:00.000Z'),
    });

    const result = await service.createForUser(1, {
      tipus: 'repulo',
      indulasi_hely: 'BUD',
      erkezesi_hely: 'CDG',
      indulasi_ido: '2026-01-10T10:00:00.000Z',
      erkezesi_ido: '2026-01-10T12:00:00.000Z',
      jaratszam: 'AF123',
    });

    expect(result.azonosito).toBe(2);
  });

  it('foglalás módosítás – hiba, ha nincs ilyen foglalás', async () => {
    prisma.foglalas.findUnique.mockResolvedValue(null);

    await expect(
      service.updateFoglalas(1, 10, { tipus: 'repulo' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('foglalás módosítás – tiltva, ha másé a foglalás', async () => {
    prisma.foglalas.findUnique.mockResolvedValue({
      foglalas_id: 10,
      felhasznalo_id: 2,
      foglalas_tipus: 'repulo',
      indulasi_hely: 'BUD',
      erkezesi_hely: 'CDG',
      indulasi_ido: new Date('2026-01-10T10:00:00.000Z'),
      erkezesi_ido: new Date('2026-01-10T12:00:00.000Z'),
      jaratszam: 'AF123',
      hely: null,
      cim: null,
      kezdo_datum: null,
      veg_datum: null,
      letrehozva: new Date('2026-01-01T10:00:00.000Z'),
    });

    await expect(
      service.updateFoglalas(1, 10, { tipus: 'repulo', indulasi_hely: 'BUD' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('foglalás módosítás – hiba, ha nincs módosítandó adat', async () => {
    prisma.foglalas.findUnique.mockResolvedValue({
      foglalas_id: 10,
      felhasznalo_id: 1,
      foglalas_tipus: 'repulo',
      indulasi_hely: 'BUD',
      erkezesi_hely: 'CDG',
      indulasi_ido: new Date('2026-01-10T10:00:00.000Z'),
      erkezesi_ido: new Date('2026-01-10T12:00:00.000Z'),
      jaratszam: 'AF123',
      hely: null,
      cim: null,
      kezdo_datum: null,
      veg_datum: null,
      letrehozva: new Date('2026-01-01T10:00:00.000Z'),
    });

    await expect(service.updateFoglalas(1, 10, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('foglalás törlés – hiba, ha nincs ilyen foglalás', async () => {
    prisma.foglalas.findUnique.mockResolvedValue(null);

    await expect(service.deleteFoglalas(1, 10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('foglalás törlés – tiltva, ha másé a foglalás', async () => {
    prisma.foglalas.findUnique.mockResolvedValue({
      foglalas_id: 10,
      felhasznalo_id: 2,
    });

    await expect(service.deleteFoglalas(1, 10)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('foglalás törlés – sikeres', async () => {
    prisma.foglalas.findUnique.mockResolvedValue({
      foglalas_id: 10,
      felhasznalo_id: 1,
    });
    prisma.foglalas.delete.mockResolvedValue({});

    const result = await service.deleteFoglalas(1, 10);

    expect(result).toEqual({
      sikeres: true,
      uzenet: 'Foglalas sikeresen torolve',
      torolt_foglalas_id: 10,
    });
  });
});
