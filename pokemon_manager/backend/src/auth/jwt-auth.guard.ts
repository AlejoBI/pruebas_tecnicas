// =============================================================================
// jwt-auth.guard.ts - PORTERO DE RUTAS PROTEGIDAS
// =============================================================================
// Un Guard se coloca ANTES de un controller. Si el token es inválido o no existe,
// rechaza la petición antes de que llegue al endpoint.
//
// USO:
// @UseGuards(JwtAuthGuard)
// @Get('pokemon')
// findAll(@Request() req) {
//   const userId = req.user.userId; // ← viene del validate() de JwtStrategy
// }
//
// Sin el guard → cualquiera puede acceder.
// Con el guard → necesitas header: Authorization: Bearer <token>
// =============================================================================

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
