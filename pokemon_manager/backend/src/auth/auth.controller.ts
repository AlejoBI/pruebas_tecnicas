// =============================================================================
// auth.controller.ts - ENDPOINTS DE AUTENTICACIÓN
// =============================================================================
// Recibe las peticiones HTTP y las delega al service.
//
// REGLA: El controller NO tiene lógica de negocio.
// Solo recibe datos, los pasa al service, y retorna lo que devuelva.
//
// DECORADORES:
// @Controller('auth')  → todas las rutas empiezan con /auth
// @Post('register')    → responde a POST /auth/register
// @Body()              → extrae y valida el body de la petición con el DTO
// =============================================================================

import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.services';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserId } from '../common/decorators/user-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard) // Protege la ruta con JWT
  getProfile(@UserId() userId: number) {
    return this.authService.getProfile(userId);
  }
}
