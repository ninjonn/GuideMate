import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  // Users modul: service + controller, hogy a felhasznalo vegpontok elerhetok legyenek.
  // A service-t exportaljuk, hogy mas modulok (pl. auth) is hasznalhassak.
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
