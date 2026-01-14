import { Module } from '@nestjs/common';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';

@Module({
  // Program modul: controller + service, a program vegpontokhoz.
  controllers: [ProgramController],
  providers: [ProgramService],
  exports: [ProgramService],
})
export class ProgramModule {}
