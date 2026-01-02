import Fastify from 'fastify';
import cors from '@fastify/cors';

import { DEMO_PROJECT_IDS } from './domain.js';
import {
  applyBotTickFullSync,
  applyBotTickPullOnly,
  createDemoStore,
  delTodo,
  getProjectState,
  listDemoProjects,
  putTodo,
} from './store.js';

type PullRequestBody = {
  clientID?: string;
  cookie?: number | null;
};

type PullResponseBody = {
  cookie: number;
  lastMutationIDChanges: Record<string, number>;
  patch: Array<{ op: 'put'; key: string; value: unknown } | { op: 'del'; key: string }>;
};

type PushMutation = {
  id: number;
  name: string;
  args: unknown;
};

type PushRequestBody = {
  clientID?: string;
  mutations?: PushMutation[];
};

type ReplicacheQuery = { projectId: string };

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? '0.0.0.0';
const DEMO_FREEZE_BOTS = process.env.DEMO_FREEZE_BOTS === '1';

const store = createDemoStore();

function requireProjectId(raw: unknown): string {
  if (typeof raw !== 'string' || raw.trim() === '') throw new Error('Missing projectId');
  return raw;
}

function requireClientId(raw: unknown): string {
  if (typeof raw !== 'string' || raw.trim() === '') throw new Error('Missing clientID');
  return raw;
}

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

function asRecord(v: unknown): Record<string, unknown> {
  if (v && typeof v === 'object') return v as Record<string, unknown>;
  return {};
}

function buildInitialPatch(projectId: string) {
  const state = getProjectState(store, projectId);
  const patch: PullResponseBody['patch'] = [];
  patch.push({ op: 'put', key: `project/${state.project.id}`, value: state.project });
  for (const todo of state.todos.values()) {
    patch.push({ op: 'put', key: `todo/${todo.id}`, value: todo });
  }
  return patch;
}

function buildPatchSince(projectId: string, cookie: number) {
  const state = getProjectState(store, projectId);
  const patch: PullResponseBody['patch'] = [];
  for (const ch of state.changeLog) {
    if (ch.version <= cookie) continue;
    if (ch.op === 'put') patch.push({ op: 'put', key: ch.key, value: ch.value });
    else patch.push({ op: 'del', key: ch.key });
  }
  return patch;
}

const server = Fastify({ logger: true });

await server.register(cors, {
  origin: true,
  credentials: false,
});

server.get('/api/health', async () => ({ ok: true }));

server.get('/api/demo/projects', async () => ({
  demo: true,
  projects: listDemoProjects(),
}));

server.post<{ Querystring: ReplicacheQuery; Body: PullRequestBody }>(
  '/api/replicache/pull',
  async (req, reply) => {
    try {
      const projectId = requireProjectId(req.query?.projectId);
      const body = req.body ?? {};

      const clientID = requireClientId(body.clientID);
      const cookie = typeof body.cookie === 'number' ? body.cookie : 0;

      const state = getProjectState(store, projectId);
      const lastMutationID = state.lastMutationIDByClient.get(clientID) ?? 0;

      const patch =
        cookie === 0 ? buildInitialPatch(projectId) : buildPatchSince(projectId, cookie);

      const response: PullResponseBody = {
        cookie: state.version,
        lastMutationIDChanges: { [clientID]: lastMutationID },
        patch,
      };

      return reply.send(response);
    } catch (err: unknown) {
      req.log.error({ err }, 'pull failed');
      return reply.status(400).send({ error: errorMessage(err) });
    }
  },
);

server.post<{ Querystring: ReplicacheQuery; Body: PushRequestBody }>(
  '/api/replicache/push',
  async (req, reply) => {
    try {
      const projectId = requireProjectId(req.query?.projectId);
      const body = req.body ?? {};

      const clientID = requireClientId(body.clientID);
      const mutations = Array.isArray(body.mutations) ? body.mutations : [];

      const state = getProjectState(store, projectId);
      if (state.project.mode === 'pull-only') {
        // Explicitly accept but ignore all client mutations for the pull-only demo project.
        return reply.send({ ok: true, ignored: true });
      }

      let lastMutationID = state.lastMutationIDByClient.get(clientID) ?? 0;

      for (const m of mutations) {
        if (m.id <= lastMutationID) continue; // already processed
        if (m.id !== lastMutationID + 1) {
          throw new Error(`Mutation out of order: got ${m.id}, expected ${lastMutationID + 1}`);
        }

        const now = Date.now();
        const args = asRecord(m.args);

        if (m.name === 'createTodo') {
          const id = typeof args.id === 'string' ? args.id : '';
          const text = typeof args.text === 'string' ? args.text : '';
          if (!id || !text) throw new Error('createTodo requires {id, text}');
          const createdAt = typeof args.createdAt === 'number' ? args.createdAt : now;
          putTodo(state, {
            id,
            projectId,
            text,
            completed: false,
            createdAt,
            updatedAt: createdAt,
            author: 'client',
          });
        } else if (m.name === 'updateTodo') {
          const id = typeof args.id === 'string' ? args.id : '';
          const text = typeof args.text === 'string' ? args.text : '';
          if (!id || !text) throw new Error('updateTodo requires {id, text}');
          const prev = state.todos.get(id);
          if (!prev) continue;
          putTodo(state, { ...prev, text, updatedAt: now });
        } else if (m.name === 'toggleTodo') {
          const id = typeof args.id === 'string' ? args.id : '';
          if (!id) throw new Error('toggleTodo requires {id}');
          const prev = state.todos.get(id);
          if (!prev) continue;
          putTodo(state, { ...prev, completed: !prev.completed, updatedAt: now });
        } else if (m.name === 'deleteTodo') {
          const id = typeof args.id === 'string' ? args.id : '';
          if (!id) throw new Error('deleteTodo requires {id}');
          if (!state.todos.has(id)) continue;
          delTodo(state, id);
        } else {
          throw new Error(`Unknown mutation: ${m.name}`);
        }

        lastMutationID = m.id;
        state.lastMutationIDByClient.set(clientID, lastMutationID);
      }

      return reply.send({ ok: true });
    } catch (err: unknown) {
      req.log.error({ err }, 'push failed');
      return reply.status(400).send({ error: errorMessage(err) });
    }
  },
);

if (!DEMO_FREEZE_BOTS) {
  const fullSync = getProjectState(store, DEMO_PROJECT_IDS.fullSync);
  const pullOnly = getProjectState(store, DEMO_PROJECT_IDS.pullOnly);

  setInterval(() => applyBotTickFullSync(fullSync), 5000).unref?.();
  setInterval(() => applyBotTickPullOnly(pullOnly), 2000).unref?.();
}

await server.listen({ port: PORT, host: HOST });
server.log.info({ port: PORT }, 'server listening');
