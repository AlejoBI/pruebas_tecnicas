// =============================================================================
// auth.module.ts - MÓDULO DE AUTENTICACIÓN
// =============================================================================
// Agrupa TODO lo relacionado con auth: controller, service, JWT, Passport.
//
// DECISIÓN CLAVE: register() vs registerAsync()
// ================================================
// Usamos registerAsync() PORQUE necesitamos leer process.env para JWT_SECRET.
//
// register() ejecuta su código AL IMPORTAR el archivo (antes de que .env se cargue).
// registerAsync() APLAZA la ejecución hasta que NestJS instancia los módulos
// (después de que ConfigModule ya cargó el .env).
//
// REGLA: Si necesitas leer process.env o ConfigService → SIEMPRE registerAsync().
//         Si es un valor hardcoded (ej: tests) → register() está bien.
// =============================================================================

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.services';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule, // Necesario para buscar/crear usuarios en la BD
    PassportModule, // Habilita el sistema de autenticación de NestJS
    ConfigModule, // Necesario para inyectar ConfigService en registerAsync

    // JwtModule: configura cómo se crean y verifican los tokens JWT.
    // registerAsync = lee las variables de entorno DESPUÉS de que .env está cargado.
    // imports + inject = le dice a Nest: "dame ConfigService para usarlo en useFactory"
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // getOrThrow: lanza error si la variable no existe.
        // Es seguro aquí porque env.validation.ts ya verificó que existen al arrancar.
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.getOrThrow<number>('JWT_EXPIRES') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
