import { Module } from '@nestjs/common';
import { LatnivaloController } from './latnivalo.controller';
import { LatnivaloService } from './latnivalo.service';

@Module({
  controllers: [LatnivaloController],
  providers: [LatnivaloService],
  exports: [LatnivaloService],
})
export class LatnivaloModule {}
