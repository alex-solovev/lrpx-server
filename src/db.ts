import { createConnection, Connection } from 'typeorm';

export default async function getDBConnection(): Promise<Connection> {
  return createConnection({
    type: 'mongodb',
    url: process.env.MONGODB_URI,
    keepAlive: 300_000,
    connectTimeoutMS: 30_000,
    synchronize: true,
    logging: false,
    entities: ['src/models/**/*.ts'],
    migrations: ['src/migration/**/*.ts'],
    subscribers: ['src/subscriber/**/*.ts'],
    cli: {
      entitiesDir: 'src/models',
      migrationsDir: 'src/migration',
      subscribersDir: 'src/subscriber',
    },
  });
}
