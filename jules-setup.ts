// @ts-nocheck

import { $ } from 'bun';

console.log('🚀 Starting project setup...');

console.log('\n[1/4] Installing root dependencies...');
await $`bun install`;

console.log('\n[2/4] Creating .env file from example...');
await $`cp .env.example .env`;

// Install PostgreSQL package if not installed
console.log('\n[3/4] Installing PostgreSQL and setting up database...');
await $`sudo apt update`;
await $`sudo apt install -y postgresql`;

// Start PostgreSQL service
await $`sudo service postgresql start`;

// Create PostgreSQL user and database
await $`sudo -u postgres psql -c "CREATE ROLE \"user\" WITH LOGIN PASSWORD 'password';"`;
await $`sudo -u postgres psql -c "CREATE DATABASE todos OWNER \"user\";"`;
await $`sudo -u postgres psql -c "ALTER ROLE \"user\" WITH CREATEDB;"`

await $`bun run db:migrate`;
await $`bun run db:seed`;

console.log('\n[4/4] Running tests...');
await $`bun run test`;


console.log('\n✅ Setup complete! The project is ready to go.');
