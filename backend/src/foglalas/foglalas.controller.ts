import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { FoglalasService } from './foglalas.service';
import {
  FoglalasCreateResponse,
  FoglalasDeleteResponse,
  FoglalasListResponse,
  FoglalasUpdateResponse,
} from './foglalas.types';
import { CreateFoglalasDto } from './dto/create-foglalas.dto';
import { UpdateFoglalasDto } from './dto/update-foglalas.dto';

type AuthedRequest = Request & { user?: { sub: number; email: string } };

@Controller('api')
@UseGuards(AuthGuard)
// Foglalas vegpontok bejelentkezett felhasznaloknak.
export class FoglalasController {
  constructor(private readonly foglalasService: FoglalasService) {}

  private getUserId(req: AuthedRequest): number {
    // A token payloadban varjuk a felhasznalo azonositojat.
    const authed = req.user;
    if (!authed || !authed.sub) {
      throw new UnauthorizedException('Nincs felhasznalo a tokenben.');
    }
    return authed.sub;
  }

  @Get('foglalasok')
  // Foglalasok listazasa a bejelentkezett felhasznalonak.
  listForUser(@Req() req: AuthedRequest): Promise<FoglalasListResponse> {
    const userId = this.getUserId(req);
    return this.foglalasService.listForUser(userId);
  }

  @Post('foglalasok')
  // Uj foglalas letrehozasa a felhasznalohoz kotve.
  createForUser(
    @Req() req: AuthedRequest,
    @Body() dto: CreateFoglalasDto,
  ): Promise<FoglalasCreateResponse> {
    const userId = this.getUserId(req);
    return this.foglalasService.createForUser(userId, dto);
  }

  @Put('foglalasok/:id')
  // Foglalas frissitese ID alapjan.
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) foglalasId: number,
    @Body() dto: UpdateFoglalasDto,
  ): Promise<FoglalasUpdateResponse> {
    // A service ellenorzi a jogosultsagot.
    const userId = this.getUserId(req);
    return this.foglalasService.updateFoglalas(userId, foglalasId, dto);
  }

  @Delete('foglalasok/:id')
  // Foglalas torlese ID alapjan.
  remove(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) foglalasId: number,
  ): Promise<FoglalasDeleteResponse> {
    // A torles elott jog ellenorzes tortenik.
    const userId = this.getUserId(req);
    return this.foglalasService.deleteFoglalas(userId, foglalasId);
  }
}
