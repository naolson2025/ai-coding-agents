FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS build
COPY package.json bun.lockb ./
COPY client/package.json client/bun.lockb ./client/
RUN bun install
WORKDIR /app/client
RUN bun install
WORKDIR /app
COPY . .
RUN bun run build

FROM oven/bun:1 AS release
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist
COPY package.json bun.lockb ./
RUN bun install --production

EXPOSE 3000
CMD ["bun", "run", "start"]