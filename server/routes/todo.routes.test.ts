import { expect, it, describe, beforeEach, afterEach } from 'bun:test';
import app from '../index';
import { reset } from 'drizzle-seed';
import * as schema from '../db/schema';
import { db } from '../db/db';
import { User } from '../types';
import { insertTodo } from '../db/queries';

let testUser: User;
let sessionCookie: string;

beforeEach(async () => {
    await reset(db, schema);

    const email = 'test@example.com';
    const password = 'password123';

    // Sign up a new user and get the session
    const response = await app.request('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            name: 'Test User'
        }),
    });

    const userResponse = await response.json();
    testUser = userResponse.user;

    sessionCookie = response.headers.get('Set-Cookie') || '';
});

afterEach(async () => {
  await reset(db, schema);
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
            expect(todos.map(t => t.title)).toEqual(expect.arrayContaining(['Todo 1', 'Todo 2']));
        });
    });

    describe('POST /', () => {
        it('should create a new todo', async () => {
            // Arrange
            const newTodo = { title: 'A brand new todo' };

            // Act
            const res = await app.request('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: sessionCookie,
                },
                body: JSON.stringify(newTodo),
            });
            const createdTodo = await res.json();

            // Assert
            expect(res.status).toBe(201);
            expect(createdTodo.title).toBe(newTodo.title);
            expect(createdTodo.userId).toBe(testUser.id);
            expect(createdTodo.completed).toBe(false);
        });

        it('should return a validation error for invalid data', async () => {
            // Arrange
            const newTodo = { title: '' };

            // Act
            const res = await app.request('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: sessionCookie,
                },
                body: JSON.stringify(newTodo),
            });
            const error = await res.json();

            // Assert
            expect(res.status).toBe(400);
            expect(error.errors).toContain('Title is required');
        });
    });

    describe('DELETE /:id', () => {
        it('should delete a todo', async () => {
            // Arrange
            const todosRes = await app.request('/api/todos', { headers: { Cookie: sessionCookie } });
            const todos = await todosRes.json();
            const todoToDelete = todos[0];

            // Act
            const res = await app.request(`/api/todos/${todoToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    Cookie: sessionCookie,
                },
            });
            const deletedTodo = await res.json();

            // Assert
            expect(res.status).toBe(200);
            expect(deletedTodo.id).toBe(todoToDelete.id);

            const remainingTodosRes = await app.request('/api/todos', { headers: { Cookie: sessionCookie } });
            const remainingTodos = await remainingTodosRes.json();
            expect(remainingTodos.length).toBe(1);
        });

        it('should return 404 if todo not found', async () => {
            // Act
            const res = await app.request(`/api/todos/4d26e47d-7b71-4659-8085-e51329244225`, {
                method: 'DELETE',
                headers: {
                    Cookie: sessionCookie,
                },
            });

            // Assert
            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /:id', () => {
        it('should update a todo', async () => {
            // Arrange
            const todosRes = await app.request('/api/todos', { headers: { Cookie: sessionCookie } });
            const todos = await todosRes.json();
            const todoToUpdate = todos[0];
            const updatedData = { title: 'Updated Title', completed: true };

            // Act
            const res = await app.request(`/api/todos/${todoToUpdate.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: sessionCookie,
                },
                body: JSON.stringify(updatedData),
            });
            const updatedTodo = await res.json();

            // Assert
            expect(res.status).toBe(200);
            expect(updatedTodo.title).toBe(updatedData.title);
            expect(updatedTodo.completed).toBe(updatedData.completed);
        });

        it('should return a validation error for invalid data', async () => {
            // Arrange
            const todosRes = await app.request('/api/todos', { headers: { Cookie: sessionCookie } });
            const todos = await todosRes.json();
            const todoToUpdate = todos[0];
            const invalidData = { invalidProperty: 'some value' };

            // Act
            const res = await app.request(`/api/todos/${todoToUpdate.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: sessionCookie,
                },
                body: JSON.stringify(invalidData),
            });

            // Assert
            expect(res.status).toBe(400);
        });

        it('should return 404 if todo not found', async () => {
            // Arrange
            const updatedData = { title: 'Updated Title' };

            // Act
            const res = await app.request(`/api/todos/4d26e47d-7b71-4659-8085-e51329244225`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: sessionCookie,
                },
                body: JSON.stringify(updatedData),
            });

            // Assert
            expect(res.status).toBe(404);
        });
    });
});
