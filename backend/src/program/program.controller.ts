import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserId } from 'src/auth/user-id.decorator';
import { ProgramService } from './program.service';
import type {
  ProgramCreateResponse,
  ProgramDeleteResponse,
  ProgramListResponse,
  ProgramUpdateResponse,
} from './program.types';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Controller('api')
@UseGuards(AuthGuard)
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Get('utazasok/:utazasId/programok')
  list(
    @UserId() userId: number,
    @Param('utazasId', ParseIntPipe) utazasId: number,
  ): Promise<ProgramListResponse> {
    return this.programService.listForTrip(userId, utazasId);
  }

  @Post('utazasok/:utazasId/programok')
  create(
    @UserId() userId: number,
    @Param('utazasId', ParseIntPipe) utazasId: number,
    @Body() dto: CreateProgramDto,
  ): Promise<ProgramCreateResponse> {
    return this.programService.createForTrip(userId, utazasId, dto);
  }

  @Put('programok/:id')
  update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) programId: number,
    @Body() dto: UpdateProgramDto,
  ): Promise<ProgramUpdateResponse> {
    return this.programService.updateProgram(userId, programId, dto);
  }

  @Delete('programok/:id')
  remove(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) programId: number,
  ): Promise<ProgramDeleteResponse> {
    return this.programService.deleteProgram(userId, programId);
  }
}
