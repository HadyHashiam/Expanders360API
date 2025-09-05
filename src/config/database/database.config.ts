import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Session } from '../../Modules/session/session.entity';
import { User } from '../../Modules/users/entities/user.entity';
import { Match } from '../../Modules/matches/entities/matches.entity';
import { Client } from '../../Modules/users/clients/entities/client.entity';
import { Vendor } from '../../Modules/vendor/entities/vendor.entity';
import { Project } from '../../Modules/projects/entities/project.entity';
import { SystemConfig } from '../../Modules/config/system-config/entities/system-config.entity';
// Configuring TypeORM database connection
export const databaseConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('DB_HOST'),
  port: config.get<number>('DB_PORT'),
  username: config.get<string>('DB_USERNAME'),
  password: config.get<string>('DB_PASSWORD'),
  database: config.get<string>('DB_NAME'),
  synchronize: true, 
  entities: [Session, User, Client, Project, Vendor, Match , SystemConfig ],
  // logging: ['error', 'schema', 'query'], // Detailed logging for debugging
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

