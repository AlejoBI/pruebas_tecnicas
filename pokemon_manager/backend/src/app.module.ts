// =============================================================================
// ARCHIVO PRINCIPAL: App Module
// =============================================================================
// Este es el "árbol raíz" de NestJS. Cada módulo se registra aquí.
// NestJS lee este archivo y conecta todo: controllers, services, BD, auth.
//
// ORDEN DE CARGA (importante para entender el flujo):
// 1. ConfigModule → carga .env y lo hace global
// 2. TypeOrmModule → conecta a MySQL usando las variables del paso 1
// 3. AuthModule → configura JWT usando las variables del paso 1
// 4. UsersModule → registra la entidad User para TypeORM
// =============================================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { validate } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PokemonModule } from './pokemon/pokemon.module';

@Module({
  imports: [
    // ConfigModule: lee el archivo .env y ejecuta la función validate()
    // Si falta alguna variable, el servidor CRASHEA aquí (fail-fast).
    // isGlobal: true = cualquier módulo puede usar ConfigService sin importarlo.
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),

    // TypeOrmModule: conecta a MySQL.
    // forRootAsync = lee la config después de que ConfigModule ya cargó el .env.
    // autoLoadEntities: true = detecta automáticamente las entities registradas.
    TypeOrmModule.forRootAsync({
      useFactory: () => getDatabaseConfig(),
    }),

    // CacheModule: habilita el sistema de caché de NestJS.
    // Por defecto usa almacenamiento en memoria (no necesita Redis).
    // ttl: tiempo de vida en milisegundos (300000 = 5 minutos).
    CacheModule.register({
      isGlobal: true,
      ttl: 300000,
    }),

    // Módulos de funcionalidad
    AuthModule, // POST /auth/register, POST /auth/login
    UsersModule, // Service para buscar/crear usuarios en la <BD></BD>
    PokemonModule, // GET /pokemon/:id, GET /pokemon?name=...
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
