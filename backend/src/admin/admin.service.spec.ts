import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { PrismaService } from 'src/prisma.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  const prismaMock = {
    felhasznalo: {
      findUnique: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    utazasResztvevo: {
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
    program: {
      count: jest.fn(),
    },
    foglalas: {
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
    ellenorzoLista: {
      count: jest.fn(),
    },
    userAccessToken: {
      deleteMany: jest.fn(),
    },
    utazas: {
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const service = new AdminService(prismaMock as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(<T>(operations: Promise<T>[]) =>
      Promise.all(operations),
    );
  });

  it('listUsers – Unauthorized, ha admin user nem létezik', async () => {
    prismaMock.felhasznalo.findUnique.mockResolvedValue(null);

    await expect(service.listUsers(1, {})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('listUsers – Forbidden, ha nem admin', async () => {
    prismaMock.felhasznalo.findUnique.mockResolvedValue({
      szerepkor: 'felhasznalo',
    });

    await expect(service.listUsers(1, {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('listUsers – sikeres lista válasz', async () => {
    prismaMock.felhasznalo.findUnique.mockResolvedValue({ szerepkor: 'admin' });
    prismaMock.felhasznalo.count.mockResolvedValue(1);
    prismaMock.felhasznalo.findMany.mockResolvedValue([
      {
        felhasznalo_id: 2,
        nev: 'Teszt User',
        email: 'teszt@example.com',
        szerepkor: 'felhasznalo',
        letrehozva: new Date('2026-01-01T00:00:00.000Z'),
        _count: { utazasResztvevok: 3 },
      },
    ]);

    const result = await service.listUsers(1, { oldal: 1, limit: 20 });

    expect(result.osszesen).toBe(1);
    expect(result.felhasznalok[0].utazasok_szama).toBe(3);
  });

  it('listUsers – keresés és user role filter ággal', async () => {
    prismaMock.felhasznalo.findUnique.mockResolvedValue({ szerepkor: 'admin' });
    prismaMock.felhasznalo.count.mockResolvedValue(0);
    prismaMock.felhasznalo.findMany.mockResolvedValue([]);

    await service.listUsers(1, {
      kereses: 'teszt',
      szerepkor: 'user',
      oldal: 2,
      limit: 5,
    });

    expect(prismaMock.felhasznalo.count).toHaveBeenCalledWith({
      where: {
        OR: [{ nev: { contains: 'teszt' } }, { email: { contains: 'teszt' } }],
        szerepkor: 'felhasznalo',
      },
    });
  });

  it('getUser – NotFound, ha user nem létezik', async () => {
    prismaMock.felhasznalo.findUnique
      .mockResolvedValueOnce({ szerepkor: 'admin' })
      .mockResolvedValueOnce(null);

    await expect(service.getUser(1, 99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('getUser – sikeres részletes válasz', async () => {
    prismaMock.felhasznalo.findUnique
      .mockResolvedValueOnce({ szerepkor: 'admin' })
      .mockResolvedValueOnce({
        felhasznalo_id: 2,
        nev: 'User',
        email: 'u@example.com',
        szerepkor: 'felhasznalo',
        letrehozva: new Date('2026-01-01T00:00:00.000Z'),
      });
    prismaMock.utazasResztvevo.count.mockResolvedValue(3);
    prismaMock.program.count.mockResolvedValue(4);
    prismaMock.foglalas.count.mockResolvedValue(5);
    prismaMock.ellenorzoLista.count.mockResolvedValue(6);

    const result = await service.getUser(1, 2);

    expect(result.azonosito).toBe(2);
    expect(result.hozzaadott_elemek).toEqual({
      programok: 4,
      foglalasok: 5,
      ellenorzolistak: 6,
    });
  });

  it('updateUserRole – sikeres szerepkör frissítés', async () => {
    prismaMock.felhasznalo.findUnique
      .mockResolvedValueOnce({ szerepkor: 'admin' })
      .mockResolvedValueOnce({
        felhasznalo_id: 2,
        nev: 'User',
        email: 'u@example.com',
        szerepkor: 'felhasznalo',
      });
    prismaMock.felhasznalo.update.mockResolvedValue({
      felhasznalo_id: 2,
      nev: 'User',
      email: 'u@example.com',
      szerepkor: 'admin',
    });

    const result = await service.updateUserRole(1, 2, { szerepkor: 'admin' });

    expect(result.sikeres).toBe(true);
    expect(result.szerepkor).toBe('admin');
  });

  it('updateUserRole – NotFound, ha user nem létezik', async () => {
    prismaMock.felhasznalo.findUnique
      .mockResolvedValueOnce({ szerepkor: 'admin' })
      .mockResolvedValueOnce(null);

    await expect(
      service.updateUserRole(1, 999, { szerepkor: 'user' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deleteUser – sikeres törlés', async () => {
    prismaMock.felhasznalo.findUnique
      .mockResolvedValueOnce({ szerepkor: 'admin' })
      .mockResolvedValueOnce({
        felhasznalo_id: 2,
        nev: 'User',
        email: 'u@example.com',
        szerepkor: 'felhasznalo',
      });
    prismaMock.userAccessToken.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.foglalas.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.utazasResztvevo.deleteMany.mockResolvedValue({ count: 2 });
    prismaMock.felhasznalo.delete.mockResolvedValue({});

    const result = await service.deleteUser(1, 2);

    expect(result.sikeres).toBe(true);
    expect(result.torolt_felhasznalo_id).toBe(2);
    expect(result.torolt_utazasok).toBe(2);
  });

  it('deleteUser – NotFound, ha user nem létezik', async () => {
    prismaMock.felhasznalo.findUnique
      .mockResolvedValueOnce({ szerepkor: 'admin' })
      .mockResolvedValueOnce(null);

    await expect(service.deleteUser(1, 999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('getStats – sikeres statisztika válasz', async () => {
    prismaMock.felhasznalo.findUnique.mockResolvedValue({ szerepkor: 'admin' });
    prismaMock.felhasznalo.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(1);
    prismaMock.utazas.count
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    prismaMock.program.count.mockResolvedValue(20);
    prismaMock.foglalas.count.mockResolvedValue(12);
    prismaMock.ellenorzoLista.count.mockResolvedValue(7);

    const result = await service.getStats(1);

    expect(result.felhasznalok.osszesen).toBe(10);
    expect(result.utazasok.aktiv).toBe(4);
    expect(result.programok.osszesen).toBe(20);
  });
});
