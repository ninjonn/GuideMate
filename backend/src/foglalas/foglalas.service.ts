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

  // Foglalasok listazasa a bejelentkezett felhasznalonak.
  async listForUser(userId: number): Promise<FoglalasListResponse> {
    const foglalasok = await this.prisma.foglalas.findMany({
      where: { felhasznalo_id: userId },
      orderBy: { indulasi_ido: 'asc' },
    });

    const items = foglalasok.map((foglalas) => mapToListItem(foglalas));

    return {
      foglalasok: items,
      osszesen: items.length,
    };
  }

  // Uj foglalas letrehozasa a felhasznalohoz kotve.
  async createForUser(
    userId: number,
    dto: CreateFoglalasDto,
  ): Promise<FoglalasCreateResponse> {
    const data = mapCreateDtoToData(dto);
    const created = await this.prisma.foglalas.create({
      data: {
        felhasznalo_id: userId,
        ...data,
      },
    });

    const response = mapToListItem(created);
    return {
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

    this.ensureFoglalasAccess(userId, existing);

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

    this.ensureFoglalasAccess(userId, existing);

    // Egyszeru torles, nincs kapcsolt tabla itt.
    await this.prisma.foglalas.delete({ where: { foglalas_id: foglalasId } });

    return {
      sikeres: true,
      uzenet: 'Foglalas sikeresen torolve',
      torolt_foglalas_id: foglalasId,
    };
  }

  private ensureFoglalasAccess(
    userId: number,
    foglalas: { felhasznalo_id: number | null },
  ): void {
    if (!foglalas.felhasznalo_id || foglalas.felhasznalo_id !== userId) {
      throw new ForbiddenException('Nincs jogosultsag a foglalashoz.');
    }
  }
}
