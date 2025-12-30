import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Prisma service globalisan elerheto legyen, ne kelljen minden modulba berakni.
@Global()
@Module({
  // A PrismaService minden modulban elerheto legyen.
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
