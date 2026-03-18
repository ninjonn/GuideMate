import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ParticipantService } from './participant.service';

@Global()
@Module({
  providers: [PrismaService, ParticipantService],
  exports: [PrismaService, ParticipantService],
})
export class PrismaModule {}
