import { expect, it, describe, beforeEach, afterEach } from 'bun:test';
import app from '../index';
import * as schema from '../db/schema';
import { db } from '../db/db';
import { User, Todo } from '../types';
import * as queries from '../db/queries';

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
let testTodos: Todo[] = [];

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
    const todo1 = await queries.insertTodo({
      title: 'Todo 1',
      userId: testUser.id,
    });
    const todo2 = await queries.insertTodo({
      title: 'Todo 2',
      userId: testUser.id,
    });
    if (todo1 && todo2) {
      testTodos = [todo1, todo2];
    }
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

  describe('POST /', () => {
    it('should create a new todo', async () => {
      // Arrange
      const newTodo = {
        title: 'A new todo',
        description: 'A new description',
      };

      // Act
      const res = await app.request('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify(newTodo),
      });
      const todo = await res.json();

      // Assert
      expect(res.status).toBe(201);
      expect(todo.title).toBe(newTodo.title);
      expect(todo.description).toBe(newTodo.description);

      const todosInDb = await queries.getTodosByUserId(testUser.id);
      expect(todosInDb.length).toBe(3);
    });

    it('should return 400 for invalid data', async () => {
      // Act
      const res = await app.request('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({}),
      });

      // Assert
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a todo', async () => {
      // Arrange
      const todoToDelete = testTodos[0];

      // Act
      const res = await app.request(`/api/todos/${todoToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Cookie: sessionCookie,
        },
      });

      // Assert
      expect(res.status).toBe(200);
      const deletedTodo = await res.json();
      expect(deletedTodo.id).toBe(todoToDelete.id);

      const todosInDb = await queries.getTodosByUserId(testUser.id);
      expect(todosInDb.length).toBe(1);
    });

    it('should return 404 if todo not found', async () => {
      // Act
      const res = await app.request(
        '/api/todos/3f8b4e7b-8d4a-4d3a-9e6a-7b8c9d0e1f2a',
        {
          method: 'DELETE',
          headers: {
            Cookie: sessionCookie,
          },
        }
      );

      // Assert
      expect(res.status).toBe(404);
      const { error } = await res.json();
      expect(error).toBe('Todo not found');
    });
  });

  describe('PATCH /:id', () => {
    it('should update a todo', async () => {
      // Arrange
      const todoToUpdate = testTodos[0];
      const updates = {
        title: 'Updated Title',
        completed: true,
      };

      // Act
      const res = await app.request(`/api/todos/${todoToUpdate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify(updates),
      });

      // Assert
      expect(res.status).toBe(200);
      const updatedTodo = await res.json();
      expect(updatedTodo.title).toBe(updates.title);
      expect(updatedTodo.completed).toBe(updates.completed);
    });

    it('should return 404 if todo not found', async () => {
      // Act
      const res = await app.request(
        '/api/todos/3f8b4e7b-8d4a-4d3a-9e6a-7b8c9d0e1f2a',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Cookie: sessionCookie,
          },
          body: JSON.stringify({ title: 'wont work' }),
        }
      );

      // Assert
      expect(res.status).toBe(404);
      const { error } = await res.json();
      expect(error).toBe('Todo not found');
    });

    it('should return 400 for invalid data', async () => {
      // Arrange
      const todoToUpdate = testTodos[0];

      // Act
      const res = await app.request(`/api/todos/${todoToUpdate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({ title: 123 }), // Invalid title
      });

      // Assert
      expect(res.status).toBe(400);
    });
  });
});