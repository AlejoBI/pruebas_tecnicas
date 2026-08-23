// =============================================================================
// users.module.ts - MÓDULO DE USUARIOS
// =============================================================================
// Agrupa la entity User y el UsersService.
//
// EXPORTS es clave: sin esto, AuthModule NO podría usar UsersService.
// Es como una puerta: lo que está en exports es accesible desde afuera.
//
// TypeOrmModule.forFeature([User]) le dice a TypeORM: "registra esta entity
// para que este módulo pueda usar el Repository correspondiente".
// =============================================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UserService } from './users.services';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService], // Sin esto, AuthModule no podría inyectar UsersService
})
export class UsersModule {}
