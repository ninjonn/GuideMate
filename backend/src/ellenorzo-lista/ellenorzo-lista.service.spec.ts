import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from 'src/prisma.service';
import { EllenorzoListaService } from './ellenorzo-lista.service';

describe('EllenorzoListaService', () => {
  const prismaMock = {
    utazasResztvevo: {
      findFirst: jest.fn(),
    },
    ellenorzoLista: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    listaElem: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const service = new EllenorzoListaService(
    prismaMock as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
  });

  it('listForTrip – tiltva, ha nem résztvevő', async () => {
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue(null);

    await expect(service.listForTrip(1, 10)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('listForTrip – sikeres listázás', async () => {
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 10,
      felhasznalo_id: 1,
    });
    prismaMock.ellenorzoLista.findMany.mockResolvedValue([
      {
        lista_id: 1,
        lista_nev: 'Pakolás',
        elemek: [{ elem_id: 101, megnevezes: 'Útlevél', kipipalva: false }],
      },
    ]);

    const result = await service.listForTrip(1, 10);

    expect(result.osszesen).toBe(1);
    expect(result.ellenorzolistak[0].elemek[0].megnevezes).toBe('Útlevél');
  });

  it('createForTrip – sikeres létrehozás', async () => {
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 10,
      felhasznalo_id: 1,
    });
    prismaMock.ellenorzoLista.create.mockResolvedValue({
      lista_id: 2,
      utazas_id: 10,
      lista_nev: 'Checklist',
    });

    const result = await service.createForTrip(1, 10, {
      lista_nev: 'Checklist',
    });

    expect(result.lista_id).toBe(2);
    expect(result.utazas_id).toBe(10);
    expect(result.lista_nev).toBe('Checklist');
  });

  it('deleteLista – NotFound, ha nincs ilyen lista', async () => {
    prismaMock.ellenorzoLista.findUnique.mockResolvedValue(null);

    await expect(service.deleteLista(1, 99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deleteLista – sikeres törlés elemszámmal', async () => {
    prismaMock.ellenorzoLista.findUnique.mockResolvedValue({
      lista_id: 2,
      utazas_id: 10,
      lista_nev: 'Checklist',
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 10,
      felhasznalo_id: 1,
    });
    prismaMock.listaElem.deleteMany.mockResolvedValue({ count: 3 });
    prismaMock.ellenorzoLista.delete.mockResolvedValue({});

    const result = await service.deleteLista(1, 2);

    expect(result.sikeres).toBe(true);
    expect(result.torolt_elemek_szama).toBe(3);
  });
});
