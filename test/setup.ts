import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { afterAll } from 'bun:test';
import * as schema from '../server/db/schema';

// import.meta is fine
const __dirname = dirname(fileURLToPath(import.meta.url));

const adminDbUrl = 'postgres://user:password@localhost:5432/postgres';

// Generate unique DB name for isolation
const testDbName = `test_${crypto.randomUUID().replace(/-/g, '_')}`;
const testDbUrl = `postgres://user:password@localhost:5432/${testDbName}`;

// Setup: Create DB and Migrate
// This runs before the test file is loaded/executed
try {
  const adminPool = new Pool({ connectionString: adminDbUrl });
  await adminPool.query(`CREATE DATABASE "${testDbName}"`);
  await adminPool.end();

  // Set the environment variable so the app connects to this DB
  process.env.DATABASE_URL = testDbUrl;

  const pool = new Pool({ connectionString: testDbUrl });
  const db = drizzle(pool, { schema, casing: 'snake_case' });
  const migrationsFolder = join(__dirname, '../server/db/migrations');
  
  await migrate(db, { migrationsFolder });
  await pool.end();
  console.log('test db created & migrated successfully ✅')
} catch (e) {
  console.error('Failed to set up test database:', e);
  process.exit(1);
}

// Teardown: Drop DB
afterAll(async () => {
  try {
    const adminPool = new Pool({ connectionString: adminDbUrl });
    // Terminate any active connections to the test DB
    await adminPool.query(
      `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1 AND pid <> pg_backend_pid()
    `,
      [testDbName]
    );
    await adminPool.query(`DROP DATABASE IF EXISTS "${testDbName}"`);
    await adminPool.end();
    console.log('Test db torn down successfully 🪓')
  } catch (e) {
    console.error('Failed to tear down test database:', e);
  }
});
