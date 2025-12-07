import { Module } from '@nestjs/common';
import { HelyszinController } from './helyszin.controller';
import { HelyszinService } from './helyszin.service';

@Module({
  controllers: [HelyszinController],
  providers: [HelyszinService],
  exports: [HelyszinService],
})
export class HelyszinModule {}
