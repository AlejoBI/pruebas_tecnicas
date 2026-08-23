// =============================================================================
// users.entity.ts - DEFINICIÓN DE LA TABLA "users"
// =============================================================================
// Una Entity es una clase TypeScript que TypeORM convierte en una tabla SQL.
// Cada decorador @... define una columna de la tabla.
//
// TIPOS DE COLUMNAS:
// @PrimaryGeneratedColumn → ID autoincremental (1, 2, 3...)
// @Column                 → Columna normal (texto, número, etc.)
// @CreateDateColumn       → Se llena automáticamente con la fecha de creación
// @UpdateDateColumn       → Se actualiza automáticamente al modificar el registro
//
// NOTA: Especificar el type explícitamente (ej: type: 'varchar') es necesario
// porque el CLI de TypeORM a veces no puede inferir el tipo sin emitDecoratorMetadata.
// En producción es buena práctica ser explícito.
// =============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
