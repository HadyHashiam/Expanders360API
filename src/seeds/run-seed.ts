import 'dotenv/config';
import { AppDataSource } from '../data-source';
import { seedDatabase } from './postgresql-seed';

  async function runSeed() {
    await AppDataSource.initialize();
    await seedDatabase(AppDataSource);
    await AppDataSource.destroy();
  }

  runSeed().catch((error) => console.error('Error running seed:', error));
