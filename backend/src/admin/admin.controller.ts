import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserId } from 'src/auth/user-id.decorator';
import { AdminService } from './admin.service';
import type {
  AdminStatsResponse,
  AdminUserDeleteResponse,
  AdminUserDetailResponse,
  AdminUserListResponse,
  AdminUserRoleResponse,
} from './admin.types';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('api/admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('felhasznalok')
  listUsers(
    @UserId() adminId: number,
    @Query() query: AdminUserQueryDto,
  ): Promise<AdminUserListResponse> {
    return this.adminService.listUsers(adminId, query);
  }

  @Get('felhasznalok/:id')
  getUser(
    @UserId() adminId: number,
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<AdminUserDetailResponse> {
    return this.adminService.getUser(adminId, userId);
  }

  @Put('felhasznalok/:id')
  updateUserRole(
    @UserId() adminId: number,
    @Param('id', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<AdminUserRoleResponse> {
    return this.adminService.updateUserRole(adminId, userId, dto);
  }

  @Delete('felhasznalok/:id')
  deleteUser(
    @UserId() adminId: number,
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<AdminUserDeleteResponse> {
    return this.adminService.deleteUser(adminId, userId);
  }

  @Get('statisztikak')
  getStats(@UserId() adminId: number): Promise<AdminStatsResponse> {
    return this.adminService.getStats(adminId);
  }
}
