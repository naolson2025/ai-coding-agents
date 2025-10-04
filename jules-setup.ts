// @ts-nocheck

import { $ } from 'bun'

await $`bun install`
await $`cp .env.example .env`
await $`sudo apt update`;
await $`sudo apt install -y postgresql`
await $`sudo service postgresql start`
await $`sudo -u postgres psql -c "CREATE ROLE \"user\" WITH LOGIN PASSWORD 'password';"`
await $`sudo -u postgres psql -c "CREATE DATABASE todos OWNER \"user\";"`
await $`sudo -u postgres psql -c "ALTER ROLE \"user\" WITH CREATEDB;"`
await $`bun run db:migrate`
await $`bun run db:seed`
await $`bun run test`