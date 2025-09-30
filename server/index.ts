import { Hono } from 'hono';
import { auth } from './lib/auth';
import { todos } from './routes/todo.routes';
import { serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';

const app = new Hono();

if (process.env.APP_ENV !== 'test') {
  app.use(logger())
}

const router = app
  .use('/*', serveStatic({ root: './client/dist' }))
  .on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw))
  .route('/api/todos', todos);

export type AppType = typeof router;
export default router;
