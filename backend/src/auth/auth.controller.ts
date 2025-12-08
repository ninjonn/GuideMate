import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { SignUpHuDto } from './dto/sign-up-hu.dto';
import { SignInHuDto } from './dto/sign-in-hu.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('regisztracio')
  signUpHu(@Body() dto: SignUpHuDto) {
    return this.authService.signUpHu(
      dto.vezeteknev,
      dto.keresztnev,
      dto.email,
      dto.jelszo,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('bejelentkezes')
  signInHu(@Body() dto: SignInHuDto) {
    return this.authService.signInHu(dto.email, dto.jelszo);
  }
}
