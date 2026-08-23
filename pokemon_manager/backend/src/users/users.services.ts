// =============================================================================
// users.service.ts - LÓGICA DE NEGOCIO PARA USUARIOS
// =============================================================================
// Este service habla con la base de datos a través de TypeORM.
//
// INYECCIÓN DE DEPENDENCIAS:
// No hacemos "new Repository()" manualmente. NestJS crea la instancia
// y la "inyecta" en el constructor. Por eso usamos @InjectRepository(User).
//
// Repository<User> es un objeto que TypeORM genera automáticamente
// con métodos para hablar con la tabla "users": findOne, find, create, save, delete.
//
// FLUJO:
// Controller recibe petición → llama a este service → service habla con BD → retorna resultado
// =============================================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }
}
