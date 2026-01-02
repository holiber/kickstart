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

export const DEMO_PROJECT_IDS = {
  noSync: 'p-nosync',
  fullSync: 'p-fullsync',
  pullOnly: 'p-pullonly',
} as const;
