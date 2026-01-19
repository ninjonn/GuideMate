import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminService } from './admin.service';
import type {
  AdminStatsResponse,
  AdminUserDeleteResponse,
  AdminUserDetailResponse,
  AdminUserListResponse,
  AdminUserRoleResponse,
} from './admin.service';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

type AuthedRequest = Request & { user?: { sub: number; email: string } };

@Controller('api/admin')
@UseGuards(AuthGuard)
// Admin vegpontok: felhasznalok es statisztikak.
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private getUserId(req: AuthedRequest): number {
    // A token payloadban varjuk az admin azonositojat.
    const authed = req.user;
    if (!authed || !authed.sub) {
      throw new UnauthorizedException('Nincs felhasznalo a tokenben.');
    }
    return authed.sub;
  }

  @Get('felhasznalok')
  // Osszes felhasznalo listazasa.
  listUsers(
    @Req() req: AuthedRequest,
    @Query() query: AdminUserQueryDto,
  ): Promise<AdminUserListResponse> {
    const adminId = this.getUserId(req);
    return this.adminService.listUsers(adminId, query);
  }

  @Get('felhasznalok/:id')
  // Felhasznalo reszletek lekerese.
  getUser(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<AdminUserDetailResponse> {
    const adminId = this.getUserId(req);
    return this.adminService.getUser(adminId, userId);
  }

  @Put('felhasznalok/:id')
  // Felhasznalo szerepkor modositas.
  updateUserRole(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<AdminUserRoleResponse> {
    const adminId = this.getUserId(req);
    return this.adminService.updateUserRole(adminId, userId, dto);
  }

  @Delete('felhasznalok/:id')
  // Felhasznalo torlese.
  deleteUser(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<AdminUserDeleteResponse> {
    const adminId = this.getUserId(req);
    return this.adminService.deleteUser(adminId, userId);
  }

  @Get('statisztikak')
  // Rendszer statisztikak.
  getStats(@Req() req: AuthedRequest): Promise<AdminStatsResponse> {
    const adminId = this.getUserId(req);
    return this.adminService.getStats(adminId);
  }
}
