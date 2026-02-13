import type { PrismaService } from 'src/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const prisma = {
    felhasznalo: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    utazasResztvevo: {
      count: jest.fn(),
    },
  };

  const service = new UsersService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findOneById – undefined, ha nincs találat', async () => {
    prisma.felhasznalo.findUnique.mockResolvedValue(null);

    await expect(service.findOneById(99)).resolves.toBeUndefined();
  });

  it('findOneById – mapping sikeres', async () => {
    prisma.felhasznalo.findUnique.mockResolvedValue({
      felhasznalo_id: 3,
      nev: 'Teszt Elek',
      email: 'teszt@example.com',
      jelszo_hash: 'hash',
      szerepkor: 'felhasznalo',
      letrehozva: new Date('2026-01-03T10:00:00.000Z'),
    });

    await expect(service.findOneById(3)).resolves.toEqual({
      userId: 3,
      username: 'Teszt Elek',
      email: 'teszt@example.com',
      passwordHash: 'hash',
      role: 'felhasznalo',
      createdAt: new Date('2026-01-03T10:00:00.000Z'),
    });
  });

  it('findOneByEmail – undefined, ha nincs találat', async () => {
    prisma.felhasznalo.findUnique.mockResolvedValue(null);

    await expect(service.findOneByEmail('nincs@email.hu')).resolves.toBeUndefined();
  });

  it('createUser – alap szerepkör felhasznalo', async () => {
    prisma.felhasznalo.create.mockResolvedValue({
      felhasznalo_id: 1,
      nev: 'Admin Jelolt',
      email: 'admin@example.com',
      jelszo_hash: 'hashed-pass',
      szerepkor: 'felhasznalo',
      letrehozva: new Date('2026-01-01T10:00:00.000Z'),
    });

    const result = await service.createUser({
      username: 'Admin Jelolt',
      email: 'admin@example.com',
      passwordHash: 'hashed-pass',
    });

    expect(prisma.felhasznalo.create).toHaveBeenCalledWith({
      data: {
        nev: 'Admin Jelolt',
        email: 'admin@example.com',
        jelszo_hash: 'hashed-pass',
        szerepkor: 'felhasznalo',
      },
    });
    expect(result.role).toBe('felhasznalo');
  });

  it('profil frissítés – siker', async () => {
    prisma.felhasznalo.update.mockResolvedValue({
      felhasznalo_id: 3,
      nev: 'Uj Nev',
      email: 'new@b.com',
      jelszo_hash: 'hash',
      szerepkor: 'felhasznalo',
      letrehozva: new Date('2026-01-03T10:00:00.000Z'),
    });

    const result = await service.updateProfile(3, {
      username: 'Uj Nev',
      email: 'new@b.com',
    });

    expect(prisma.felhasznalo.update).toHaveBeenCalledWith({
      where: { felhasznalo_id: 3 },
      data: { nev: 'Uj Nev', email: 'new@b.com' },
    });
    expect(result.username).toBe('Uj Nev');
    expect(result.email).toBe('new@b.com');
  });

  it('jelszó változtatás – siker', async () => {
    prisma.felhasznalo.update.mockResolvedValue({});

    await expect(service.updatePasswordHash(4, 'hash')).resolves.toBeUndefined();

    expect(prisma.felhasznalo.update).toHaveBeenCalledWith({
      where: { felhasznalo_id: 4 },
      data: { jelszo_hash: 'hash' },
    });
  });

  it('countTripsForUser – visszaadja a darabszámot', async () => {
    prisma.utazasResztvevo.count.mockResolvedValue(7);

    await expect(service.countTripsForUser(5)).resolves.toBe(7);
    expect(prisma.utazasResztvevo.count).toHaveBeenCalledWith({
      where: { felhasznalo_id: 5 },
    });
  });
});
