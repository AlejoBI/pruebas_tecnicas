// =============================================================================
// main.ts - PUNTO DE ENTRADA
// =============================================================================
// Este archivo es lo primero que se ejecuta cuando corres `npm run start:dev`.
// Su trabajo: crear la app NestJS, configurar pipes globales, y arrancar el servidor.
//
// PIPE GLOBAL (ValidationPipe):
// Sin esto, NestJS NO valida ni transforma los DTOs.
// Los decoradores @IsEmail, @MinLength, etc. solo funcionan si el pipe está activo.
//
// OPCIONES DEL PIPE:
// - whitelist: true         → elimina propiedades que NO están en el DTO
//                              (ej: si mandas {name, email, hacker} → solo {name, email})
// - forbidNonWhitelisted: true → lanza error 400 si hay propiedades extra
// - transform: true          → convierte el body al tipo del DTO automáticamente
// =============================================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe GLOBAL: aplica a TODOS los endpoints de la app.
  // Si no lo configuras, los DTOs son solo "documentación" — no validan nada.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
