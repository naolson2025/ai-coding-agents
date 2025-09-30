import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '../server/db/schema';

// @ts-expect-error import.meta is fine
const __dirname = dirname(fileURLToPath(import.meta.url));

const adminDbUrl = `postgres://user:password@localhost:5432/postgres`;

const createTestDb = async () => {
  const testDbUrl = 'postgres://user:password@localhost:5432/test';

  // 1. Create DB
  const adminPool = new Pool({ connectionString: adminDbUrl });
  const dbExists = await adminPool.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    ['test']
  );
  if (dbExists.rowCount === 0) {
    await adminPool.query('CREATE DATABASE "test"');
  }
  await adminPool.end();

  // 2. Connect and migrate
  const pool = new Pool({ connectionString: testDbUrl });
  const db = drizzle(pool, { schema, casing: 'snake_case' });
  const migrationsFolder = join(__dirname, '../server/db/migrations');
  await migrate(db, {
    migrationsFolder,
  });

  await pool.end();
};

createTestDb()
  .then(() => {
    console.log('Test database created and migrated successfully.');
  })
  .catch((error) => {
    console.error('Error creating or migrating test database:', error);
  });
