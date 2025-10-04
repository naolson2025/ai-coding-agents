# AGENTS.md

This document provides guidelines for AI coding agents to effectively contribute to this project.

## About This Project

This is a REST API built with [Hono](https://hono.dev/) and [TypeScript](https://www.typescriptlang.org/). It runs on the [Bun](https://bun.sh/) JavaScript runtime and uses the Bun test runner. The project uses [Drizzle ORM](https://orm.drizzle.team/) to connect to a Postgres database.

## Folder Structure

The basic folder structure is as follows:

- `src/`: Contains the source code for the application.
  - `db/`: Database-related files, such as schema and migrations.
  - `routes/`: API route definitions.
  - `lib/`: Shared libraries and utility functions.
- `test/`: Contains end-to-end (E2E) tests for the application.
- `drizzle/`: Drizzle ORM configuration and generated files.

## Getting Started

To set up the development environment, follow these steps:

1.  Install project dependencies:
    ```bash
    bun install
    ```
2.  Set up the database:
    - Make sure you have a local Postgres instance running.
    - Create a `.env` file and add the `DATABASE_URL` variable with your database connection string.
3.  Run database migrations:
    ```bash
    bun run db:migrate
    ```

## Development Guidelines

### Functional Programming

- Adhere to functional programming principles.
- Functions should be pure, do one thing, and be easily testable.
- Avoid side effects where possible.

### Dependency Management

- Avoid installing additional packages unless absolutely necessary. If you need to install a new package, provide a clear justification.

### Code Quality

- Before creating a pull request, ensure that all code is linted, formatted, and type-checked.
- Run the following commands to check your code:
  ```bash
  bun run lint
  bun run format
  bun run typecheck
  ```

### File Size

- Keep files under 125 lines of code. If a file grows larger than this, refactor it into smaller, more manageable modules after ensuring all tests are passing.

## Testing

- Use the [Bun test runner](https.bun.sh/docs/cli/test) for all tests.
- Run the test suite with the following command:
  ```bash
  bun run test
  ```

### Test Coverage

- Write tests for all application code changes.
- Both unit tests and end-to-end (E2E) tests are required.

### Database Testing

- **Do not mock the database.** A test database is automatically created when running the tests.
- Write tests that run against the test database to ensure that the application interacts with the database correctly.

### Test Organization

- Unit tests should be co-located with the application code they are testing. For example, the tests for `src/routes/users.ts` should be in `src/routes/users.test.ts`.
- Place E2E tests in the `test/` directory.