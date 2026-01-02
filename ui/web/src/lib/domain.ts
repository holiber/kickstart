export type ProjectMode = 'no-sync' | 'full-sync' | 'pull-only';

export type Project = {
  id: string;
  name: string;
  mode: ProjectMode;
};

export type TodoAuthor = 'client' | 'bot';

export type Todo = {
  id: string;
  projectId: string;
  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  author?: TodoAuthor;
};

export const DEMO_PROJECTS: Project[] = [
  { id: 'p-nosync', name: 'TodoList - no sync', mode: 'no-sync' },
  { id: 'p-fullsync', name: 'TodoList - full-sync', mode: 'full-sync' },
  { id: 'p-pullonly', name: 'Todo - pull only', mode: 'pull-only' },
];
