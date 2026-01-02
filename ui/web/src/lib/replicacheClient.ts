import {
  Replicache,
  TEST_LICENSE_KEY,
  type ReadTransaction,
  type WriteTransaction,
} from 'replicache';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { Todo } from './domain';

export type Mutators = {
  createTodo: (
    tx: WriteTransaction,
    args: { id: string; projectId: string; text: string; createdAt: number },
  ) => Promise<void>;
  updateTodo: (tx: WriteTransaction, args: { id: string; text: string }) => Promise<void>;
  toggleTodo: (tx: WriteTransaction, args: { id: string }) => Promise<void>;
  deleteTodo: (tx: WriteTransaction, args: { id: string }) => Promise<void>;
};

export const mutators: Mutators = {
  async createTodo(tx, args) {
    const todo: Todo = {
      id: args.id,
      projectId: args.projectId,
      text: args.text,
      completed: false,
      createdAt: args.createdAt,
      updatedAt: args.createdAt,
      author: 'client',
    };
    await tx.put(`todo/${todo.id}`, todo);
  },
  async updateTodo(tx, args) {
    const prev = (await tx.get(`todo/${args.id}`)) as Todo | undefined;
    if (!prev) return;
    await tx.put(`todo/${args.id}`, { ...prev, text: args.text, updatedAt: Date.now() });
  },
  async toggleTodo(tx, args) {
    const prev = (await tx.get(`todo/${args.id}`)) as Todo | undefined;
    if (!prev) return;
    await tx.put(`todo/${args.id}`, { ...prev, completed: !prev.completed, updatedAt: Date.now() });
  },
  async deleteTodo(tx, args) {
    await tx.del(`todo/${args.id}`);
  },
};

export async function readTodosByPrefix(tx: ReadTransaction, prefix = 'todo/') {
  const todos = (await tx.scan({ prefix }).toArray()) as Todo[];
  return todos.sort((a, b) => b.createdAt - a.createdAt);
}

export function useReplicache(projectId: string, opts: { enabled: boolean }) {
  const { enabled } = opts;
  const [rep, setRep] = useState<Replicache<Mutators> | null>(null);
  const repRef = useRef<Replicache<Mutators> | null>(null);

  const base = useMemo(() => {
    const serverURL = import.meta.env.VITE_SERVER_URL;
    // Use Vite proxy by default.
    return serverURL && serverURL.length > 0 ? serverURL : '';
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const r = new Replicache<Mutators>({
      name: `demo-${projectId}`,
      licenseKey: TEST_LICENSE_KEY,
      schemaVersion: '1',
      pushURL: `${base}/api/replicache/push?projectId=${encodeURIComponent(projectId)}`,
      pullURL: `${base}/api/replicache/pull?projectId=${encodeURIComponent(projectId)}`,
      mutators,
    });

    r.pullInterval = 1000;
    r.pushDelay = 300;

    repRef.current = r;
    setRep(r);

    return () => {
      repRef.current = null;
      setRep(null);
      void r.close();
    };
  }, [base, enabled, projectId]);

  return rep;
}
