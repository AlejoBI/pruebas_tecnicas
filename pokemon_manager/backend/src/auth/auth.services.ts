// =============================================================================
// auth.service.ts - LÓGICA DE AUTENTICACIÓN
// =============================================================================
// Contiene la lógica central: register (crear usuario) y login (retornar JWT).
//
// FLUJO DE REGISTER:
// 1. Verificar que el email no exista ya
// 2. Hashear la password con bcrypt (nunca guardar texto plano)
// 3. Guardar en la BD
// 4. Retornar todo EXCEPTO la password (nunca exponer hashes)
//
// FLUJO DE LOGIN:
// 1. Buscar usuario por email
// 2. Comparar password hasheada con bcrypt.compare()
// 3. Si coincide: firmar JWT con { sub: userId, email }
// 4. Retornar el token
//
// SEGURIDAD:
// - Usamos el mismo mensaje de error para "email no existe" y "password incorrecta"
//   para evitar que un atacante descubra qué emails están registrados.
// - bcrypt.hash() con 10 rondas de salt: convierte "password123" → "$2a$10$x7kL9..."
//   Esto es unidireccional: no se puede "deshashear".
// - bcrypt.compare() sabe comparar el texto plano con el hash sin decodificarlo.
// =============================================================================

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../users/users.services';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService, // Inyectado por NestJS
    private readonly jwtService: JwtService, // Inyectado por NestJS
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword: string = await bcrypt.hash(dto.password, 10);
    const newUser = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    const { password: _, ...result } = newUser; // _ = "sé que existe pero no lo uso"
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
