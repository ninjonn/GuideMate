import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ParticipantService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureParticipant(utazasId: number, userId: number): Promise<void> {
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });
    if (!participant) {
      throw new ForbiddenException('Nincs jogosultsag az utazashoz.');
    }
  }

  async ensureEditor(utazasId: number, userId: number): Promise<void> {
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });
    if (!participant || participant.szerep === 'megtekineto') {
      throw new ForbiddenException('Nincs szerkesztesi jogosultsag.');
    }
  }

  async ensureOwner(utazasId: number, userId: number): Promise<void> {
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });
    if (!participant || participant.szerep !== 'tulajdonos') {
      throw new ForbiddenException('Csak a tulajdonos hajthatja vegre ezt a muveletet.');
    }
  }

  async getRole(utazasId: number, userId: number): Promise<string | null> {
    const participant = await this.prisma.utazasResztvevo.findFirst({
      where: { utazas_id: utazasId, felhasznalo_id: userId },
    });
    return participant?.szerep ?? null;
  }
}
