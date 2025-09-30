import { Pool } from 'pg';

const adminDbUrl = `postgres://user:password@localhost:5432/postgres`;

const destroyTestDb = async () => {
  const adminPool = new Pool({ connectionString: adminDbUrl });
  // terminate all active connections to a PostgreSQL database except the current one running this query
  await adminPool.query(
    `
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = $1 AND pid <> pg_backend_pid()
  `,
    ['test']
  );
  await adminPool.query('DROP DATABASE IF EXISTS "test"');
  await adminPool.end();
};

destroyTestDb()
  .then(() => {
    console.log('Test database destroyed successfully.');
  })
  .catch((error) => {
    console.error('Error destroying test database:', error);
  });