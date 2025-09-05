  import 'dotenv/config'; 
import { DataSource } from 'typeorm';
import { Session } from './Modules/session/session.entity';
import { User } from './Modules/users/entities/user.entity';
import { Match } from './Modules/matches/entities/matches.entity';
import { Client } from './Modules/users/clients/entities/client.entity';
import { Vendor } from './Modules/vendor/entities/vendor.entity';
import { Project } from './Modules/projects/entities/project.entity';
import { SystemConfig } from './Modules/config/system-config/entities/system-config.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  entities: [Session, User, Client, Project, Vendor, Match, SystemConfig],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false, 
  
   ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

});

