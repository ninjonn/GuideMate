import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateFoglalasDto } from './dto/create-foglalas.dto';
import { UpdateFoglalasDto } from './dto/update-foglalas.dto';
import {
  mapCreateDtoToData,
  mapToListItem,
  mapUpdateDtoToData,
} from './foglalas.mapper';
import {
  FoglalasCreateResponse,
  FoglalasDeleteResponse,
  FoglalasListResponse,
  FoglalasUpdateResponse,
} from './foglalas.types';

@Injectable()
export class FoglalasService {
  constructor(private readonly prisma: PrismaService) {}

  // Foglalasok listazasa egy utazashoz.
  async listForTrip(
    userId: number,
    utazasId: number,
  ): Promise<FoglalasListResponse> {
    // Csak a resztvevok lathatjak.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    // Idorendi lista, hogy konzisztens legyen a kliens oldal.
    const foglalasok = await this.prisma.foglalas.findMany({
      where: { utazas_id: utazasId },
      orderBy: { indulasi_ido: 'asc' },
    });

    // DB rekordok atalakitasa az API formatumra.
    const items = foglalasok.map((foglalas) => mapToListItem(foglalas));

    return {
      foglalasok: items,
      osszesen: items.length,
    };
  }

  // Uj foglalas letrehozasa egy utazashoz.
  async createForTrip(
    userId: number,
    utazasId: number,
    dto: CreateFoglalasDto,
  ): Promise<FoglalasCreateResponse> {
    // Csak a resztvevok hozhatnak letre foglalast.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    // A DTO-bol DB-barat adatokat keszitunk.
    const data = mapCreateDtoToData(dto);
    const created = await this.prisma.foglalas.create({
      data: {
        utazas_id: utazasId,
        ...data,
      },
    });

    // Visszaadjuk az uj rekordot az API formatumban.
    const response = mapToListItem(created);
    return {
      utazas_id: utazasId,
      letrehozas_datuma: created.letrehozva.toISOString(),
      ...response,
    };
  }

  // Foglalas frissitese ID alapjan.
  async updateFoglalas(
    userId: number,
    foglalasId: number,
    dto: UpdateFoglalasDto,
  ): Promise<FoglalasUpdateResponse> {
    // Megnezzuk, hogy letezik-e a foglalas.
    const existing = await this.prisma.foglalas.findUnique({
      where: { foglalas_id: foglalasId },
    });
    if (!existing) {
      throw new NotFoundException('Foglalas nem talalhato.');
    }

    // Jog ellenorzes az utazas resztvevoi alapjan.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: existing.utazas_id, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    // Csak a megadott mezoket frissitjuk.
    const updatedData = mapUpdateDtoToData(existing, dto);
    if (Object.keys(updatedData).length === 0) {
      throw new BadRequestException('Nincs megadott modositando adat.');
    }

    // DB update es visszateres az uj ertekekkel.
    const updated = await this.prisma.foglalas.update({
      where: { foglalas_id: foglalasId },
      data: updatedData,
    });

    return {
      ...mapToListItem(updated),
      sikeres: true,
    };
  }

  // Foglalas torlese ID alapjan.
  async deleteFoglalas(
    userId: number,
    foglalasId: number,
  ): Promise<FoglalasDeleteResponse> {
    // Ellenorizzuk, hogy letezik-e a rekord.
    const existing = await this.prisma.foglalas.findUnique({
      where: { foglalas_id: foglalasId },
    });
    if (!existing) {
      throw new NotFoundException('Foglalas nem talalhato.');
    }

    // Jog ellenorzes az utazas resztvevoi alapjan.
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: existing.utazas_id, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }

    // Egyszeru torles, nincs kapcsolt tabla itt.
    await this.prisma.foglalas.delete({ where: { foglalas_id: foglalasId } });

    return {
      sikeres: true,
      uzenet: 'Foglalas sikeresen torolve',
      torolt_foglalas_id: foglalasId,
    };
  }
}
