import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { SignUpHuDto } from './dto/sign-up-hu.dto';
import { SignInHuDto } from './dto/sign-in-hu.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Publikus regisztracio, DTO validacio utan a service vegzi a mentest.
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('regisztracio')
  signUpHu(@Body() dto: SignUpHuDto) {
    // A DTO mar validalt, itt csak tovabbitjuk a parametereket.
    return this.authService.signUpHu(
      dto.vezeteknev,
      dto.keresztnev,
      dto.email,
      dto.jelszo,
    );
  }

  // Publikus bejelentkezes, JWT tokent ad vissza.
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('bejelentkezes')
  signInHu(@Body() dto: SignInHuDto) {
    // A service ellenorzi a jelszot es elkuldi a tokent.
    return this.authService.signInHu(dto.email, dto.jelszo);
  }
}
