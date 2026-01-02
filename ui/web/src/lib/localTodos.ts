import { useEffect, useMemo, useState } from 'react';

import type { Todo } from './domain';
import { mulberry32, pick } from './prng';

function storageKey(projectId: string) {
  return `localTodos:${projectId}`;
}

function readTodos(projectId: string): Todo[] | null {
  const raw = localStorage.getItem(storageKey(projectId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Todo[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeTodos(projectId: string, todos: Todo[]) {
  localStorage.setItem(storageKey(projectId), JSON.stringify(todos));
}

export function makeDeterministicLocalSeed(projectId: string): Todo[] {
  const baseMs = 1700000000000;
  const rng = mulberry32(123);
  const texts = [
    'Local only: welcome',
    'Local only: no server calls',
    'Local only: fast edits',
    'Local only: demo seed',
  ] as const;
  return Array.from({ length: 6 }).map((_, i) => {
    const ts = baseMs + i * 45_000;
    return {
      id: `local-seed-${projectId}-${i + 1}`,
      projectId,
      text: pick(rng, texts),
      completed: rng() < 0.25,
      createdAt: ts,
      updatedAt: ts,
      author: 'client',
    } satisfies Todo;
  });
}

export function useLocalTodos(projectId: string, seed?: () => Todo[]) {
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return [] as Todo[];
    const existing = readTodos(projectId);
    if (existing) return existing;
    const seeded = seed ? seed() : [];
    writeTodos(projectId, seeded);
    return seeded;
  }, [projectId, seed]);

  const [todos, setTodos] = useState<Todo[]>(initial);

  useEffect(() => {
    writeTodos(projectId, todos);
  }, [projectId, todos]);

  const api = useMemo(() => {
    return {
      todos: [...todos].sort((a, b) => b.createdAt - a.createdAt),
      add(text: string) {
        const now = Date.now();
        const todo: Todo = {
          id: `local-${crypto.randomUUID()}`,
          projectId,
          text,
          completed: false,
          createdAt: now,
          updatedAt: now,
          author: 'client',
        };
        setTodos((prev) => [todo, ...prev]);
        return todo;
      },
      toggle(id: string) {
        setTodos((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t,
          ),
        );
      },
      updateText(id: string, text: string) {
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, text, updatedAt: Date.now() } : t)),
        );
      },
      remove(id: string) {
        setTodos((prev) => prev.filter((t) => t.id !== id));
      },
      clearPersistence() {
        localStorage.removeItem(storageKey(projectId));
        setTodos(seed ? seed() : []);
      },
    };
  }, [projectId, seed, todos]);

  return api;
}
