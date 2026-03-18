import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ParticipantService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureParticipant(
    utazasId: number,
    userId: number,
  ): Promise<void> {
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }
  }
}
