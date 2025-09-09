import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { databaseConfig } from '../config/database/database.config';
import { seedDatabase } from './postgresql-seed';
import { User } from '../Modules/users/entities/user.entity';
import { Client } from '../Modules/users/clients/entities/client.entity';
import { Vendor } from '../Modules/vendor/entities/vendor.entity';
import { Project } from '../Modules/projects/entities/project.entity';
import { Country } from '../Modules/countries/entities/country.entity';
import { Service } from '../Modules/services/entities/service.entity';
import { Session } from '../Modules/session/session.entity';

  async function runSeed() {
    const config = new ConfigService();
    const base = databaseConfig(config) as any;
    const ds = new DataSource({
      ...base,
      entities: [User, Session, Client, Vendor, Project, Country, Service],
    });
    await ds.initialize();
    await seedDatabase(ds);
    await ds.destroy();
  }

  runSeed().catch((error) => console.error('Error running seed:', error));
