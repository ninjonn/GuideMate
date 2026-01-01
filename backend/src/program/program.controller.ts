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
import {
  ProgramCreateResponse,
  ProgramDeleteResponse,
  ProgramListResponse,
  ProgramService,
  ProgramUpdateResponse,
} from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

type AuthedRequest = Request & { user?: { sub: number; email: string } };

@Controller('api')
@UseGuards(AuthGuard)
// Program vegpontok bejelentkezett felhasznaloknak.
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  private getUserId(req: AuthedRequest): number {
    // A token payloadban varjuk a felhasznalo azonositojat.
    const authed = req.user;
    if (!authed || !authed.sub) {
      throw new UnauthorizedException('Nincs felhasznalo a tokenben.');
    }
    return authed.sub;
  }

  @Get('utazasok/:utazasId/programok')
  // Programok listazasa egy adott utazashoz.
  list(
    @Req() req: AuthedRequest,
    @Param('utazasId', ParseIntPipe) utazasId: number,
  ): Promise<ProgramListResponse> {
    // Csak resztvevo kaphat listat.
    const userId = this.getUserId(req);
    return this.programService.listForTrip(userId, utazasId);
  }

  @Post('utazasok/:utazasId/programok')
  // Uj program letrehozasa egy utazashoz.
  create(
    @Req() req: AuthedRequest,
    @Param('utazasId', ParseIntPipe) utazasId: number,
    @Body() dto: CreateProgramDto,
  ): Promise<ProgramCreateResponse> {
    // A DTO validalt, a service menti a rekordot.
    const userId = this.getUserId(req);
    return this.programService.createForTrip(userId, utazasId, dto);
  }

  @Put('programok/:id')
  // Program frissitese ID alapjan.
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) programId: number,
    @Body() dto: UpdateProgramDto,
  ): Promise<ProgramUpdateResponse> {
    // A service ellenorzi a jogosultsagot.
    const userId = this.getUserId(req);
    return this.programService.updateProgram(userId, programId, dto);
  }

  @Delete('programok/:id')
  // Program torlese ID alapjan.
  remove(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) programId: number,
  ): Promise<ProgramDeleteResponse> {
    // A torles elott jog ellenorzes tortenik.
    const userId = this.getUserId(req);
    return this.programService.deleteProgram(userId, programId);
  }
}
