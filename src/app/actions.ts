'use server';

import { revalidatePath } from 'next/cache';

let todos: { id: string; text: string }[] = [];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTodos() {
  return todos;
}

export async function createTodo() {
  await sleep(5000);
  revalidatePath('/');

  const newTodo = { id: `${todos.length + 1}`, text: '' };
  todos.push(newTodo);
  return newTodo;
}

export async function updateTodo(todo: { id: string; text: string }) {
  await sleep(5000);
  revalidatePath('/');

  todos = todos.map((t) => (t.id === todo.id ? todo : t));
  return todo;
}
