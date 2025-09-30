import { Hono } from 'hono';
import { auth } from './lib/auth';
import { todos } from './routes/todo.routes';
import { serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';

const app = new Hono();

const router = app
  .use(logger())
  .use('/*', serveStatic({ root: './client/dist' }))
  .on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw))
  .route('/api/todos', todos);

export type AppType = typeof router;
export default router;
