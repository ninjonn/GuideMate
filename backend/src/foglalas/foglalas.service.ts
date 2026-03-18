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

  async listForUser(userId: number): Promise<FoglalasListResponse> {
    const foglalasok = await this.prisma.foglalas.findMany({
      where: { felhasznalo_id: userId },
      orderBy: { indulasi_ido: 'asc' },
    });

    const items = foglalasok.map(mapToListItem);
    return { foglalasok: items, osszesen: items.length };
  }

  async createForUser(
    userId: number,
    dto: CreateFoglalasDto,
  ): Promise<FoglalasCreateResponse> {
    const data = mapCreateDtoToData(dto);
    const created = await this.prisma.foglalas.create({
      data: { felhasznalo_id: userId, ...data },
    });

    return {
      letrehozas_datuma: created.letrehozva.toISOString(),
      ...mapToListItem(created),
    };
  }

  async updateFoglalas(
    userId: number,
    foglalasId: number,
    dto: UpdateFoglalasDto,
  ): Promise<FoglalasUpdateResponse> {
    const existing = await this.findOrThrow(foglalasId);
    this.ensureAccess(userId, existing);

    const updatedData = mapUpdateDtoToData(existing, dto);
    if (Object.keys(updatedData).length === 0) {
      throw new BadRequestException('Nincs megadott modositando adat.');
    }

    const updated = await this.prisma.foglalas.update({
      where: { foglalas_id: foglalasId },
      data: updatedData,
    });

    return { ...mapToListItem(updated), sikeres: true };
  }

  async deleteFoglalas(
    userId: number,
    foglalasId: number,
  ): Promise<FoglalasDeleteResponse> {
    const existing = await this.findOrThrow(foglalasId);
    this.ensureAccess(userId, existing);

    await this.prisma.foglalas.delete({ where: { foglalas_id: foglalasId } });

    return {
      sikeres: true,
      uzenet: 'Foglalas sikeresen torolve',
      torolt_foglalas_id: foglalasId,
    };
  }

  private async findOrThrow(foglalasId: number) {
    const existing = await this.prisma.foglalas.findUnique({
      where: { foglalas_id: foglalasId },
    });
    if (!existing) {
      throw new NotFoundException('Foglalas nem talalhato.');
    }
    return existing;
  }

  private ensureAccess(
    userId: number,
    foglalas: { felhasznalo_id: number | null },
  ): void {
    if (!foglalas.felhasznalo_id || foglalas.felhasznalo_id !== userId) {
      throw new ForbiddenException('Nincs jogosultsag a foglalashoz.');
    }
  }
}
