import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import type {
  AdminUserListResponse,
  AdminUserDetailResponse,
  AdminUserRoleResponse,
  AdminUserDeleteResponse,
  AdminStatsResponse,
} from './admin.types';

export type {
  AdminUserListResponse,
  AdminUserDetailResponse,
  AdminUserRoleResponse,
  AdminUserDeleteResponse,
  AdminStatsResponse,
} from './admin.types';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(
    adminId: number,
    query: AdminUserQueryDto,
  ): Promise<AdminUserListResponse> {
    await this.ensureAdmin(adminId);

    const oldal = query.oldal ?? 1;
    const limit = query.limit ?? 20;
    const skip = (oldal - 1) * limit;

    const where: Prisma.FelhasznaloWhereInput = {};
    const search = query.kereses?.trim();
    if (search) {
      where.OR = [
        { nev: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const roleFilter = query.szerepkor
      ? this.mapRoleInput(query.szerepkor)
      : undefined;
    if (roleFilter) where.szerepkor = roleFilter;

    const [osszesen, rows] = await this.prisma.$transaction([
      this.prisma.felhasznalo.count({ where }),
      this.prisma.felhasznalo.findMany({
        where,
        orderBy: { letrehozva: 'desc' },
        skip,
        take: limit,
        select: {
          felhasznalo_id: true,
          nev: true,
          email: true,
          szerepkor: true,
          letrehozva: true,
          _count: { select: { utazasResztvevok: true } },
        },
      }),
    ]);

    const felhasznalok = rows.map((row) => ({
      azonosito: row.felhasznalo_id,
      nev: row.nev,
      email: row.email,
      szerepkor: row.szerepkor,
      regisztracio_datum: row.letrehozva.toISOString(),
      utazasok_szama: row._count.utazasResztvevok,
    }));

    return {
      felhasznalok,
      osszesen,
      oldal,
      oldalak_szama: osszesen === 0 ? 0 : Math.ceil(osszesen / limit),
    };
  }

  async getUser(
    adminId: number,
    userId: number,
  ): Promise<AdminUserDetailResponse> {
    await this.ensureAdmin(adminId);

    const user = await this.prisma.felhasznalo.findUnique({
      where: { felhasznalo_id: userId },
      select: {
        felhasznalo_id: true,
        nev: true,
        email: true,
        szerepkor: true,
        letrehozva: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Felhasznalo nem talalhato.');
    }

    const [utazasokSzama, programokSzama, foglalasokSzama, listakSzama] =
      await this.prisma.$transaction([
        this.prisma.utazasResztvevo.count({
          where: { felhasznalo_id: userId },
        }),
        this.prisma.program.count({
          where: {
            utazas: {
              resztvevok: { some: { felhasznalo_id: userId } },
            },
          },
        }),
        this.prisma.foglalas.count({ where: { felhasznalo_id: userId } }),
        this.prisma.ellenorzoLista.count({
          where: {
            utazas: {
              resztvevok: { some: { felhasznalo_id: userId } },
            },
          },
        }),
      ]);

    return {
      azonosito: user.felhasznalo_id,
      nev: user.nev,
      email: user.email,
      szerepkor: user.szerepkor,
      regisztracio_datum: user.letrehozva.toISOString(),
      utazasok_szama: utazasokSzama,
      hozzaadott_elemek: {
        programok: programokSzama,
        foglalasok: foglalasokSzama,
        ellenorzolistak: listakSzama,
      },
    };
  }

  async updateUserRole(
    adminId: number,
    userId: number,
    dto: UpdateUserRoleDto,
  ): Promise<AdminUserRoleResponse> {
    await this.ensureAdmin(adminId);

    const role = this.mapRoleInput(dto.szerepkor);
    const existing = await this.prisma.felhasznalo.findUnique({
      where: { felhasznalo_id: userId },
    });
    if (!existing) {
      throw new NotFoundException('Felhasznalo nem talalhato.');
    }

    const updated = await this.prisma.felhasznalo.update({
      where: { felhasznalo_id: userId },
      data: { szerepkor: role },
    });

    return {
      azonosito: updated.felhasznalo_id,
      nev: updated.nev,
      email: updated.email,
      szerepkor: updated.szerepkor,
      sikeres: true,
      uzenet: 'Felhasznalo jogosultsaga frissitve',
    };
  }

  async deleteUser(
    adminId: number,
    userId: number,
  ): Promise<AdminUserDeleteResponse> {
    await this.ensureAdmin(adminId);

    const existing = await this.prisma.felhasznalo.findUnique({
      where: { felhasznalo_id: userId },
    });
    if (!existing) {
      throw new NotFoundException('Felhasznalo nem talalhato.');
    }

    const [, , resztvevoResult] = await this.prisma.$transaction([
      this.prisma.userAccessToken.deleteMany({
        where: { felhasznalo_id: userId },
      }),
      this.prisma.foglalas.deleteMany({ where: { felhasznalo_id: userId } }),
      this.prisma.utazasResztvevo.deleteMany({
        where: { felhasznalo_id: userId },
      }),
    ]);

    await this.prisma.felhasznalo.delete({
      where: { felhasznalo_id: userId },
    });

    return {
      sikeres: true,
      uzenet: 'Felhasznalo sikeresen torolve',
      torolt_felhasznalo_id: userId,
      torolt_utazasok: resztvevoResult.count,
      torolt_programok: 0,
    };
  }

  async getStats(adminId: number): Promise<AdminStatsResponse> {
    await this.ensureAdmin(adminId);

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const [
      felhasznalokOsszesen,
      adminok,
      regularUsers,
      maiRegisztraciok,
      utazasokOsszesen,
      aktivUtazasok,
      lezartUtazasok,
      maiUtazasok,
      programokOsszesen,
      foglalasokOsszesen,
      listakOsszesen,
    ] = await this.prisma.$transaction([
      this.prisma.felhasznalo.count(),
      this.prisma.felhasznalo.count({ where: { szerepkor: 'admin' } }),
      this.prisma.felhasznalo.count({ where: { szerepkor: 'felhasznalo' } }),
      this.prisma.felhasznalo.count({
        where: { letrehozva: { gte: today } },
      }),
      this.prisma.utazas.count(),
      this.prisma.utazas.count({ where: { veg_datum: { gte: now } } }),
      this.prisma.utazas.count({ where: { veg_datum: { lt: now } } }),
      this.prisma.utazas.count({ where: { letrehozva: { gte: today } } }),
      this.prisma.program.count(),
      this.prisma.foglalas.count(),
      this.prisma.ellenorzoLista.count(),
    ]);

    return {
      felhasznalok: {
        osszesen: felhasznalokOsszesen,
        adminok,
        regular_users: regularUsers,
        mai_regisztraciok: maiRegisztraciok,
      },
      utazasok: {
        osszesen: utazasokOsszesen,
        aktiv: aktivUtazasok,
        lezart: lezartUtazasok,
        mai_letrehozasok: maiUtazasok,
      },
      programok: { osszesen: programokOsszesen },
      foglalasok: { osszesen: foglalasokOsszesen },
      ellenorzolistak: { osszesen: listakOsszesen },
      utolso_frissites: now.toISOString(),
    };
  }

  private async ensureAdmin(userId: number): Promise<void> {
    const user = await this.prisma.felhasznalo.findUnique({
      where: { felhasznalo_id: userId },
      select: { szerepkor: true },
    });
    if (!user) {
      throw new UnauthorizedException('Felhasznalo nem talalhato.');
    }
    if (user.szerepkor !== 'admin') {
      throw new ForbiddenException('Nincs admin jogosultsag.');
    }
  }

  private mapRoleInput(role: 'admin' | 'user'): 'admin' | 'felhasznalo' {
    if (role === 'admin') return 'admin';
    if (role === 'user') return 'felhasznalo';
    throw new BadRequestException('Ismeretlen szerepkor.');
  }
}
