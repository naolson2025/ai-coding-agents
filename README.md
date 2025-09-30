# Full-Stack Todo Application

This is a full-stack todo application built with React, Hono, and PostgreSQL.

## Features

-   Create, read, update, and delete todos
-   User authentication
-   RPCs with Hono

## Tech Stack

-   **Frontend:** React, TanStack Router
--   **Backend:** Hono, Drizzle ORM, PostgreSQL
-   **Build & Runtime:** Bun

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

-   [Bun](https://bun.sh/)
-   [Docker](https://www.docker.com/)

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Set up environment variables:**

    Copy the `.env.example` file to a new file named `.env`:

    ```bash
    cp .env.example .env
    ```

    The `.env` file comes with default values for local development. You will need to generate a secret for `BETTER_AUTH_SECRET`:

    ```bash
    bunx @better-auth/cli@latest secret
    ```

    Copy the generated secret and paste it as the value for `BETTER_AUTH_SECRET` in your `.env` file.

4.  **Start the database:**

    This will start a PostgreSQL container using Docker.

    ```bash
    bun db:up
    ```

5.  **Run database migrations:**

    This will create the necessary tables in the database.

    ```bash
    bun db:migrate
    ```

6.  **Seed the database:**

    This will populate the database with some initial data.

    ```bash
    bun db:seed
    ```

7.  **Run the development server:**

    This will start both the frontend and backend services concurrently.

    ```bash
    bun run dev
    ```

    -   The frontend will be available at `http://localhost:5000`.
    -   The backend server will be running at `http://localhost:3000`.
