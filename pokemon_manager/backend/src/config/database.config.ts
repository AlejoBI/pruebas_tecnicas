// =============================================================================
// database.config.ts - CONFIGURACIÓN DE LA BASE DE DATOS
// =============================================================================
// Lee las variables de entorno y retorna un objeto TypeOrmModuleOptions.
//
// ¿Por qué una función y no leer process.env directamente en app.module.ts?
// Porque es más fácil de testear, reutilizar y mantener en un solo lugar.
// Si mañana cambias de MySQL a PostgreSQL, solo modificas este archivo.
//
// Por qué getDatabaseConfig() lee process.env directamente y NO ConfigService:
// - La validación en env.validation.ts ya garantizó que todas las variables existen
// - ConfigModule con isGlobal: true las carga en process.env antes de que esto se ejecute
// - No necesitas inyectar ConfigService en una función simple
// =============================================================================

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV !== 'production', // true en dev, false en prod
});
