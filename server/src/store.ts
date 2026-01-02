import type { Project, ProjectMode, Todo } from './domain.js';
import { DEMO_PROJECT_IDS } from './domain.js';
import { mulberry32, pick } from './prng.js';

export type Change =
  | { version: number; op: 'put'; key: string; value: unknown }
  | { version: number; op: 'del'; key: string };

export type ProjectState = {
  project: Project;
  todos: Map<string, Todo>;
  version: number;
  changeLog: Change[];
  lastMutationIDByClient: Map<string, number>;
};

export type Store = {
  projects: Map<string, ProjectState>;
};

function nowDeterministic(baseMs: number, step: number, i: number) {
  return baseMs + step * i;
}

export function createDemoStore(): Store {
  const projects = new Map<string, ProjectState>();

  const makeProject = (id: string, name: string, mode: ProjectMode): ProjectState => ({
    project: { id, name, mode },
    todos: new Map(),
    version: 0,
    changeLog: [],
    lastMutationIDByClient: new Map(),
  });

  // Server stores only the Replicache-backed projects (full-sync and pull-only).
  projects.set(
    DEMO_PROJECT_IDS.fullSync,
    makeProject(DEMO_PROJECT_IDS.fullSync, 'TodoList - full-sync', 'full-sync'),
  );
  projects.set(
    DEMO_PROJECT_IDS.pullOnly,
    makeProject(DEMO_PROJECT_IDS.pullOnly, 'Todo - pull only', 'pull-only'),
  );

  const baseMs = 1700000000000; // fixed timestamp for deterministic demo

  // Deterministic seed for full-sync project.
  {
    const state = projects.get(DEMO_PROJECT_IDS.fullSync)!;
    const rng = mulberry32(42);
    const texts = [
      'Buy milk',
      'Write benchmarks',
      'Read Replicache docs',
      'Refactor sidebar',
      'Fix flaky test',
    ] as const;
    for (let i = 0; i < 5; i++) {
      const id = `t-fs-${i + 1}`;
      const ts = nowDeterministic(baseMs, 60_000, i);
      const todo: Todo = {
        id,
        projectId: state.project.id,
        text: pick(rng, texts),
        completed: rng() < 0.35,
        createdAt: ts,
        updatedAt: ts,
        author: 'bot',
      };
      putTodo(state, todo);
    }
  }

  // Deterministic seed for pull-only project.
  {
    const state = projects.get(DEMO_PROJECT_IDS.pullOnly)!;
    const rng = mulberry32(777);
    const texts = [
      'Server note: hello',
      'Server note: updates every 2s',
      'Server note: pull-only demo',
      'Server note: deterministic seed',
    ] as const;
    for (let i = 0; i < 4; i++) {
      const id = `t-po-${i + 1}`;
      const ts = nowDeterministic(baseMs, 90_000, i);
      const todo: Todo = {
        id,
        projectId: state.project.id,
        text: pick(rng, texts),
        completed: rng() < 0.2,
        createdAt: ts,
        updatedAt: ts,
        author: 'bot',
      };
      putTodo(state, todo);
    }
  }

  // Emit initial project records so first pull can discover them if needed.
  for (const state of projects.values()) {
    recordPut(state, `project/${state.project.id}`, state.project);
  }

  return { projects };
}

function recordPut(state: ProjectState, key: string, value: unknown) {
  state.version += 1;
  state.changeLog.push({ version: state.version, op: 'put', key, value });
}

function recordDel(state: ProjectState, key: string) {
  state.version += 1;
  state.changeLog.push({ version: state.version, op: 'del', key });
}

export function getProjectState(store: Store, projectId: string): ProjectState {
  const state = store.projects.get(projectId);
  if (!state) throw new Error(`Unknown projectId: ${projectId}`);
  return state;
}

export function listDemoProjects(): Project[] {
  return [
    { id: DEMO_PROJECT_IDS.noSync, name: 'TodoList - no sync', mode: 'no-sync' },
    { id: DEMO_PROJECT_IDS.fullSync, name: 'TodoList - full-sync', mode: 'full-sync' },
    { id: DEMO_PROJECT_IDS.pullOnly, name: 'Todo - pull only', mode: 'pull-only' },
  ];
}

export function putTodo(state: ProjectState, todo: Todo) {
  state.todos.set(todo.id, todo);
  recordPut(state, `todo/${todo.id}`, todo);
}

export function delTodo(state: ProjectState, todoId: string) {
  state.todos.delete(todoId);
  recordDel(state, `todo/${todoId}`);
}

export function applyBotTickFullSync(state: ProjectState) {
  const botTodos = Array.from(state.todos.values()).filter((t) => t.author === 'bot');
  const rng = mulberry32(state.version + 1000);
  const action = pick(rng, ['create', 'delete', 'toggle'] as const);

  if (action === 'create' || botTodos.length === 0) {
    const i = state.version + 1;
    const id = `t-fs-bot-${i}`;
    const ts = 1700000000000 + i * 10_000;
    putTodo(state, {
      id,
      projectId: state.project.id,
      text: `Bot created #${i}`,
      completed: false,
      createdAt: ts,
      updatedAt: ts,
      author: 'bot',
    });
    return;
  }

  if (action === 'delete') {
    const victim = pick(rng, botTodos);
    delTodo(state, victim.id);
    return;
  }

  const victim = pick(rng, botTodos);
  const updated: Todo = {
    ...victim,
    completed: !victim.completed,
    updatedAt: victim.updatedAt + 5_000,
  };
  putTodo(state, updated);
}

export function applyBotTickPullOnly(state: ProjectState) {
  const todos = Array.from(state.todos.values());
  const rng = mulberry32(state.version + 5000);
  const action = pick(rng, ['create', 'delete', 'edit', 'toggle'] as const);

  if (action === 'create' || todos.length === 0) {
    const i = state.version + 1;
    const id = `t-po-bot-${i}`;
    const ts = 1700000000000 + i * 7_000;
    putTodo(state, {
      id,
      projectId: state.project.id,
      text: `Server bot update #${i}`,
      completed: rng() < 0.25,
      createdAt: ts,
      updatedAt: ts,
      author: 'bot',
    });
    return;
  }

  const victim = pick(rng, todos);

  if (action === 'delete') {
    delTodo(state, victim.id);
    return;
  }

  if (action === 'toggle') {
    putTodo(state, {
      ...victim,
      completed: !victim.completed,
      updatedAt: victim.updatedAt + 2_000,
    });
    return;
  }

  // edit
  putTodo(state, {
    ...victim,
    text: `${victim.text} (edited)`,
    updatedAt: victim.updatedAt + 2_000,
  });
}
