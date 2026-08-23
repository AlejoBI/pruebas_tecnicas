// =============================================================================
// jwt.strategy.ts - ESTRATEGIA DE AUTENTICACIÓN JWT
// =============================================================================
// PassportStrategy define CÓMO extraer y validar credenciales de cada petición.
//
// FLUJO:
// 1. Recibe petición con header: Authorization: Bearer eyJhbGci...
// 2. ExtractJwt.fromAuthHeaderAsBearerToken() extrae el token
// 3. Verifica la firma con JWT_SECRET
// 4. Verifica que no esté expirado (ignoreExpiration: false)
// 5. Ejecuta validate() con el payload decodificado
// 6. El objeto que retorna validate() se convierte en request.user
//
// ¿POR QUÉ NO ES ASYNC?
// El método validate() no necesita await — el token ya fue verificado por Passport.
// Si lo haces async sin await, ESLint te da el error "no-unsafe-assignment".
// =============================================================================

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lee del header Authorization
      ignoreExpiration: false,                                    // Rechaza tokens expirados
      secretOrKey: process.env.JWT_SECRET!,                      // ! = "la validación ya garantizó que existe"
    });
  }

  validate(payload: { sub: number; email: string }) {
    // Este objeto se convierte en request.user para todos los controllers
    // que usen JwtAuthGuard.
    return { userId: payload.sub, email: payload.email };
  }
}
