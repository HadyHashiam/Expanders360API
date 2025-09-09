import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { databaseConfig } from './database/database.config';

// Build base options from the same Nest database config
const configService = new ConfigService();
const base = databaseConfig(configService) as unknown as DataSourceOptions;

// Override for CLI (ts-node): use TS globs for entities/migrations
const options: DataSourceOptions = {
  ...base,
  // entities are only required for generation; use TS globs here
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  // Nest-specific options like autoLoadEntities are ignored by TypeORM DataSource
} as DataSourceOptions;

export default new DataSource(options);


