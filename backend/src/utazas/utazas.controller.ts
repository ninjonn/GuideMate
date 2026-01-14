import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  UtazasCreateResponse,
  UtazasDeleteResponse,
  UtazasDetailResponse,
  UtazasListResponse,
  UtazasService,
  UtazasUpdateResponse,
} from './utazas.service';
import { UtazasQueryDto } from './dto/utazas-query.dto';
import { CreateUtazasDto } from './dto/create-utazas.dto';
import { UpdateUtazasDto } from './dto/update-utazas.dto';

type AuthedRequest = Request & { user?: { sub: number; email: string } };

@Controller('api/utazasok')
@UseGuards(AuthGuard)
// Utazas vegpontok bejelentkezett felhasznaloknak.
export class UtazasController {
  constructor(private readonly utazasService: UtazasService) {}

  private getUserId(req: AuthedRequest): number {
    // A token payloadban varjuk a felhasznalo azonositojat.
    const authed = req.user;
    if (!authed || !authed.sub) {
      throw new UnauthorizedException('Nincs felhasznalo a tokenben.');
    }
    return authed.sub;
  }

  @Get()
  // Utazasok listazasa statusz, rendezes es lapozas alapjan.
  list(
    @Req() req: AuthedRequest,
    @Query() query: UtazasQueryDto,
  ): Promise<UtazasListResponse> {
    // Tokenbol kinyerjuk a user id-t, a query DTO mar validalt.
    const userId = this.getUserId(req);
    // A service felel a szuresert, rendezesert es a formatalt valaszert.
    return this.utazasService.listForUser(userId, query);
  }

  @Get(':id')
  // Egy utazas reszletei, csak resztvevoknek.
  getOne(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) utazasId: number,
  ): Promise<UtazasDetailResponse> {
    // Az utazas azonositoja URL param, ParseIntPipe ellenorzi.
    const userId = this.getUserId(req);
    // A service ellenorzi a jogosultsagot es osszerakja a reszleteket.
    return this.utazasService.getForUser(userId, utazasId);
  }

  @Post()
  // Uj utazas letrehozasa, a bejelentkezett felhasznaloval.
  create(
    @Req() req: AuthedRequest,
    @Body() dto: CreateUtazasDto,
  ): Promise<UtazasCreateResponse> {
    // A body DTO validalt, itt csak tovabbitjuk a service-nek.
    const userId = this.getUserId(req);
    // Letrehozas utan a service visszaadja a formatalt valaszt.
    return this.utazasService.createForUser(userId, dto);
  }

  @Put(':id')
  // Utazas frissitese, csak ha a felhasznalo resztvevo.
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) utazasId: number,
    @Body() dto: UpdateUtazasDto,
  ): Promise<UtazasUpdateResponse> {
    // Azonosito + validalt DTO a frissiteshez.
    const userId = this.getUserId(req);
    // A service csak a megadott mezoket frissiti.
    return this.utazasService.updateForUser(userId, utazasId, dto);
  }

  @Delete(':id')
  // Utazas torlese a kapcsolt adatokkal.
  remove(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) utazasId: number,
  ): Promise<UtazasDeleteResponse> {
    // Csak resztvevo torolhet, ezt a service vizsgalja.
    const userId = this.getUserId(req);
    // A service torli a kapcsolt rekordokat is.
    return this.utazasService.deleteForUser(userId, utazasId);
  }
}
