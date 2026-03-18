import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserId } from 'src/auth/user-id.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller(['api/felhasznalok'])
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profil')
  getProfile(@UserId() userId: number) {
    return this.usersService.getProfile(userId);
  }

  @Put('profil')
  updateProfile(@UserId() userId: number, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfileFromDto(userId, dto);
  }

  @Put('jelszo')
  changePassword(@UserId() userId: number, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(userId, dto);
  }
}
