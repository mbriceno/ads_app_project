import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { AdStats } from './src/ads_stats/entities/ad-stats.entity';
import { AdStatsTemp } from './src/ads_stats/entities/ad-stats-temp.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // Add entities to supervise
  entities: [AdStats, AdStatsTemp],
  migrations: ['./src/migrations/*.ts'],
  // IMPORTANT: synchronize must be set to false to use migrations
  synchronize: false, 
});