import { expect, it, describe, beforeEach, afterEach } from 'bun:test';
import {
  insertTodo,
  getTodosByUserId,
  deleteTodoById,
  updateTodoById,
} from './queries';
import { NewTodo } from '../types';
import { reset, seed } from 'drizzle-seed';
import * as schema from '@/db/schema';
import { db } from '@/db/db';

beforeEach(async () => {
  await seed(db, schema);
});

afterEach(async () => {
  await reset(db, schema);
});

const getUser = async () => {
  const [users] = await db.select().from(schema.user).limit(1);
  return users;
};

describe('insertTodo', () => {
  it('should insert a new todo', async () => {
    const firstUserId = (await getUser()).id;

    const todo: NewTodo = {
      title: 'Test Todo',
      userId: firstUserId,
    };

    const result = await insertTodo(todo);

    expect(result).toMatchObject(todo);
  });

  it('should throw an error if userId does not exist', async () => {
    const todo: NewTodo = {
      title: 'Test Todo',
      userId: 'non-existent-user-id',
    };

    expect(insertTodo(todo)).rejects.toThrow();
  });
});

describe('getTodosByUserId', () => {
  it('should return todos for a given userId', async () => {
    const firstUserId = (await getUser()).id;

    const todoList = await getTodosByUserId(firstUserId);

    expect(Array.isArray(todoList)).toBe(true);
    expect(todoList.length).toBeGreaterThanOrEqual(0);
    todoList.forEach((todo) => {
      expect(todo.userId).toBe(firstUserId);
    });
  });

  it('should return an empty array if no todos exist for the user', async () => {
    const todoList = await getTodosByUserId('non-existent-user-id');
    expect(todoList).toEqual([]);
  });
});

describe('deleteTodoById', () => {
  it('should delete a todo by id', async () => {
    const firstUserId = (await getUser()).id;

    const todo: NewTodo = {
      title: 'Test Todo',
      userId: firstUserId,
    };

    const insertedTodo = await insertTodo(todo);
    const deleteResult = await deleteTodoById(insertedTodo.id, firstUserId);

    expect(deleteResult).toBeDefined();
    expect(deleteResult.id).toBe(insertedTodo.id);

    const todoList = await getTodosByUserId(firstUserId);
    expect(todoList.some((t) => t.id === insertedTodo.id)).toBe(false);
  });

  it('should return false if no todo was found with the given id', async () => {
    const firstUserId = (await getUser()).id;

    const result = await deleteTodoById(
      'db08af7a-2664-4bd8-820a-bebc22a90f2d',
      firstUserId
    );
    expect(result).toBeUndefined();
  });
});

describe('updateTodoById', () => {
  it('should update a todo by id', async () => {
    const firstUserId = (await getUser()).id;

    const todo: NewTodo = {
      title: 'Test Todo',
      userId: firstUserId,
      completed: false,
    };

    const insertedTodo = await insertTodo(todo);
    const updatedTodo = { ...insertedTodo, title: 'Updated Todo' };
    const updateResult = await updateTodoById(
      updatedTodo.id,
      firstUserId,
      updatedTodo
    );

    expect(updateResult?.title).toBe(updatedTodo.title);
    expect(updateResult?.completed).toBe(updatedTodo.completed);

    const todoList = await getTodosByUserId(firstUserId);
    expect(
      todoList.some(
        (t) =>
          t.id === updatedTodo.id &&
          t.title === updatedTodo.title &&
          t.completed === updatedTodo.completed
      )
    ).toBe(true);
  });

  it('should return false if no todo was found with the given id', async () => {
    const firstUserId = (await getUser()).id;

    const result = await updateTodoById(
      'db08af7a-2664-4bd8-820a-bebc22a90f2d',
      firstUserId,
      {
        title: 'Updated Todo',
        userId: firstUserId,
      }
    );
    expect(result).toBeUndefined();
  });

  it('should not update todo if userId does not match', async () => {
    const firstUserId = (await getUser()).id;

    const todo: NewTodo = {
      title: 'Test Todo',
      userId: firstUserId,
    };

    const insertedTodo = await insertTodo(todo);
    const updateResult = await updateTodoById(
      insertedTodo.id,
      'db08af7a-2664-4bd8-820a-bebc22a90f2d',
      {
        ...insertedTodo,
        title: 'Updated Todo',
      }
    );

    expect(updateResult).toBeUndefined();

    const todoList = await getTodosByUserId(firstUserId);
    expect(
      todoList.some((t) => t.id === insertedTodo.id && t.title === 'Test Todo')
    ).toBe(true);
  });
});
