import { expect, it, describe, beforeEach, afterEach } from 'bun:test';
import app from '../index';
import * as schema from '../db/schema';
import { db } from '../db/db';
import { User, Todo } from '../types';
import { insertTodo } from '../db/queries';

// Use custom reset bc drizzle-seed reset
// wasn't working on Windows
const tables = Object.values(schema);

const reset = async () => {
  const promises = tables.map(async (table) => {
    return db.delete(table);
  });

  await Promise.all(promises);
};

let testUser: User;
let sessionCookie: string;

beforeEach(async () => {
  const email = 'test@example.com';
  const password = 'password123';

  // Sign up a new user and get the session
  const response = await app.request('/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      name: 'Test User',
    }),
  });

  const userResponse = await response.json();
  testUser = userResponse.user;

  sessionCookie = response.headers.get('Set-Cookie') || '';
});

afterEach(async () => {
  await reset();
});

describe('Todo Routes', () => {
  beforeEach(async () => {
    await insertTodo({ title: 'Todo 1', userId: testUser.id });
    await insertTodo({ title: 'Todo 2', userId: testUser.id });
  });

  describe('GET /', () => {
    it('should return todos for the authenticated user', async () => {
      // Act
      const res = await app.request('/api/todos', {
        headers: {
          Cookie: sessionCookie,
        },
      });
      const todos = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(todos).toBeInstanceOf(Array);
      expect(todos.length).toBe(2);
      expect(todos.map((t: Todo) => t.title)).toEqual(
        expect.arrayContaining(['Todo 1', 'Todo 2'])
      );
    });
  });
});
