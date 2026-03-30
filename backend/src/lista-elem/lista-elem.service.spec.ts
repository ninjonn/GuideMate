import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaService } from 'src/prisma.service';
import { ListaElemService } from './lista-elem.service';

describe('ListaElemService', () => {
  const prismaMock = {
    ellenorzoLista: {
      findUnique: jest.fn(),
    },
    utazasResztvevo: {
      findFirst: jest.fn(),
    },
    listaElem: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const service = new ListaElemService(prismaMock as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createForLista – NotFound, ha nincs lista', async () => {
    prismaMock.ellenorzoLista.findUnique.mockResolvedValue(null);

    await expect(
      service.createForLista(1, 10, { megnevezes: 'Útlevél' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('createForLista – tiltva, ha nincs jogosultság', async () => {
    prismaMock.ellenorzoLista.findUnique.mockResolvedValue({
      lista_id: 10,
      utazas_id: 20,
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue(null);

    await expect(
      service.createForLista(1, 10, { megnevezes: 'Útlevél' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('createForLista – sikeres létrehozás', async () => {
    prismaMock.ellenorzoLista.findUnique.mockResolvedValue({
      lista_id: 10,
      utazas_id: 20,
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 20,
      felhasznalo_id: 1,
    });
    prismaMock.listaElem.create.mockResolvedValue({
      elem_id: 1,
      lista_id: 10,
      megnevezes: 'Útlevél',
      kipipalva: false,
    });

    const result = await service.createForLista(1, 10, {
      megnevezes: 'Útlevél',
    });

    expect(result.elem_id).toBe(1);
    expect(result.megnevezes).toBe('Útlevél');
  });

  it('updateElem – BadRequest, ha nincs módosítandó adat', async () => {
    prismaMock.listaElem.findUnique.mockResolvedValue({
      elem_id: 1,
      megnevezes: 'Útlevél',
      kipipalva: false,
      lista: { utazas_id: 20 },
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 20,
      felhasznalo_id: 1,
    });

    await expect(service.updateElem(1, 1, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('updateElem – NotFound, ha elem nem létezik', async () => {
    prismaMock.listaElem.findUnique.mockResolvedValue(null);

    await expect(service.updateElem(1, 99, { kipipalva: true })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updateElem – tiltva, ha nincs jogosultság', async () => {
    prismaMock.listaElem.findUnique.mockResolvedValue({
      elem_id: 1,
      megnevezes: 'Útlevél',
      kipipalva: false,
      lista: { utazas_id: 20 },
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue(null);

    await expect(service.updateElem(1, 1, { kipipalva: true })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('updateElem – sikeres frissítés', async () => {
    prismaMock.listaElem.findUnique.mockResolvedValue({
      elem_id: 1,
      megnevezes: 'Útlevél',
      kipipalva: false,
      lista: { utazas_id: 20 },
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 20,
      felhasznalo_id: 1,
    });
    prismaMock.listaElem.update.mockResolvedValue({
      elem_id: 1,
      megnevezes: 'Útlevél',
      kipipalva: true,
    });

    const result = await service.updateElem(1, 1, { kipipalva: true });
    expect(result.sikeres).toBe(true);
    expect(result.kipipalva).toBe(true);
  });

  it('deleteElem – NotFound, ha elem nem létezik', async () => {
    prismaMock.listaElem.findUnique.mockResolvedValue(null);

    await expect(service.deleteElem(1, 99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deleteElem – tiltva, ha nincs jogosultság', async () => {
    prismaMock.listaElem.findUnique.mockResolvedValue({
      elem_id: 1,
      lista: { utazas_id: 20 },
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue(null);

    await expect(service.deleteElem(1, 1)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('deleteElem – sikeres törlés', async () => {
    prismaMock.listaElem.findUnique.mockResolvedValue({
      elem_id: 1,
      lista: { utazas_id: 20 },
    });
    prismaMock.utazasResztvevo.findFirst.mockResolvedValue({
      utazas_id: 20,
      felhasznalo_id: 1,
    });
    prismaMock.listaElem.delete.mockResolvedValue({});

    const result = await service.deleteElem(1, 1);

    expect(result.sikeres).toBe(true);
    expect(result.torolt_elem_id).toBe(1);
  });
});
