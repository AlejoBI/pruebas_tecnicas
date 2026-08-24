// =============================================================================
// env.validation.ts - VALIDACIÓN DE VARIABLES DE ENTORNO
// =============================================================================
// Este archivo se ejecuta UNA VEZ al arrancar el servidor.
// Si falta alguna variable o tiene tipo incorrecto → el servidor CRASHEA.
//
// ¿Por qué no simplemente leer process.env directamente?
// Porque process.env retorna strings para TODO (incluso "3306" en vez de 3306).
// Sin validación, tu servidor arrancaría con DB_PORT="3306" (string)
// y cuando TypeORM espera un número, recibiría un string → error runtime.
//
// CON VALIDACIÓN:
// 1. plainToInstance convierte process.env en un objeto tipado
// 2. enableImplicitConversion: true convierte "3306" → 3306 automáticamente
// 3. validateSync verifica que todo esté correcto
// 4. Si hay errores → el servidor NUNCA arranca (fail-fast)
//
// El "!" después de cada propiedad le dice a TypeScript: "estas propiedades
// SÍ van a existir después de la validación, confía en mí".
// =============================================================================

import { plainToInstance, Transform } from 'class-transformer';
import { IsString, IsNumber, IsNotEmpty, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DB_HOST!: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  DB_PORT!: number;

  @IsString()
  @IsNotEmpty()
  DB_USER!: string;

  @IsString()
  @IsNotEmpty()
  DB_PASS!: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  JWT_EXPIRES!: number;
}

export function validate(config: Record<string, unknown>) {
  // plainToInstance: toma un objeto "plano" (process.env) y lo convierte
  // en una instancia de EnvironmentVariables con decoradores de validación.
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true, // "3306" → 3306, "true" → true, etc.
  });

  // validateSync: ejecuta todas las validaciones de forma síncrona.
  // Si DB_PORT no es convertible a número → error.
  // Si falta JWT_SECRET → error.
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints || {}).join(', '))
      .join('\n');
    throw new Error(`Variables de entorno invalidas:\n${messages}`);
  }

  return validated;
}
