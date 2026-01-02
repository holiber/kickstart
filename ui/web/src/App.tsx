import { useEffect, useMemo, useState } from 'react';
import { Menu } from 'lucide-react';
import { useSubscribe } from 'replicache-react';
import { toast } from 'sonner';

import type { Project, Todo } from '@/lib/domain';
import { DEMO_PROJECTS } from '@/lib/domain';
import { makeDeterministicLocalSeed, useLocalTodos } from '@/lib/localTodos';
import { readTodosByPrefix, useReplicache } from '@/lib/replicacheClient';
import { cn } from '@/lib/utils';

import { Sidebar } from '@/components/sidebar';
import { TodoList } from '@/components/todo-list';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

function modeLabel(mode: Project['mode']) {
  if (mode === 'no-sync') return 'No sync';
  if (mode === 'full-sync') return 'Full sync';
  return 'Pull only';
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState(DEMO_PROJECTS[0]!.id);

  const selected = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? projects[0]!,
    [projects, selectedProjectId],
  );

  const repEnabled = selected.mode === 'full-sync' || selected.mode === 'pull-only';
  const rep = useReplicache(selected.id, { enabled: repEnabled });

  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (!rep) return;
    rep.onSync = setSyncing;
    rep.onOnlineChange = (isOnline) => {
      setOnline(isOnline);
      if (!isOnline) toast.error('Sync is currently failing (offline)');
    };
  }, [rep]);

  const serverTodos = useSubscribe(
    rep,
    async (tx) => {
      return await readTodosByPrefix(tx, 'todo/');
    },
    { default: [] as Todo[] },
  );

  const localNoSync = useLocalTodos('p-nosync', () => makeDeterministicLocalSeed('p-nosync'));
  const localPullOnly = useLocalTodos('p-pullonly', () => []);

  const todosForProject = useMemo(() => {
    if (selected.mode === 'no-sync') return localNoSync.todos;
    if (selected.mode === 'full-sync') return serverTodos;
    // pull-only: combine local + server; local never syncs
    const merged = [...localPullOnly.todos, ...serverTodos];
    return merged.sort((a, b) => b.createdAt - a.createdAt);
  }, [localNoSync.todos, localPullOnly.todos, selected.mode, serverTodos]);

  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <Sidebar
      projects={projects}
      selectedProjectId={selectedProjectId}
      onSelectProject={(id) => {
        setSelectedProjectId(id);
        setMobileOpen(false);
      }}
      onCreateProject={(name) => {
        const id = `p-local-${crypto.randomUUID()}`;
        const p: Project = { id, name, mode: 'no-sync' };
        setProjects((prev) => [...prev, p]);
        setSelectedProjectId(id);
        setMobileOpen(false);
        toast.success('Project created');
      }}
    />
  );

  const canAdd =
    selected.mode === 'no-sync' || selected.mode === 'full-sync' || selected.mode === 'pull-only';

  const handlers = useMemo(() => {
    if (!canAdd) return {};

    if (selected.mode === 'no-sync') {
      return {
        onAdd: (text: string) => localNoSync.add(text),
        onToggle: (id: string) => localNoSync.toggle(id),
        onUpdateText: (id: string, text: string) => localNoSync.updateText(id, text),
        onDelete: (id: string) => localNoSync.remove(id),
      };
    }

    if (selected.mode === 'full-sync') {
      return {
        onAdd: (text: string) => {
          if (!rep) return;
          void rep.mutate.createTodo({
            id: crypto.randomUUID(),
            projectId: selected.id,
            text,
            createdAt: Date.now(),
          });
        },
        onToggle: (id: string) => {
          if (!rep) return;
          void rep.mutate.toggleTodo({ id });
        },
        onUpdateText: (id: string, text: string) => {
          if (!rep) return;
          void rep.mutate.updateTodo({ id, text });
        },
        onDelete: (id: string) => {
          if (!rep) return;
          void rep.mutate.deleteTodo({ id });
        },
      };
    }

    // pull-only: local edits only
    return {
      onAdd: (text: string) => localPullOnly.add(text),
      onToggle: (id: string) => localPullOnly.toggle(id),
      onUpdateText: (id: string, text: string) => localPullOnly.updateText(id, text),
      onDelete: (id: string) => localPullOnly.remove(id),
    };
  }, [canAdd, localNoSync, localPullOnly, rep, selected.id, selected.mode]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        {/* Desktop sidebar */}
        <aside className="hidden w-80 border-r bg-card md:block">{sidebar}</aside>

        {/* Mobile drawer sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed left-4 top-4 z-40 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            {sidebar}
          </SheetContent>
        </Sheet>

        <main className="flex-1 p-4 pt-16 md:p-8 md:pt-8">
          <header className="mb-6 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{selected.name}</h1>
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium',
                  selected.mode === 'full-sync' &&
                    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200',
                  selected.mode === 'pull-only' &&
                    'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200',
                  selected.mode === 'no-sync' &&
                    'border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-900/50 dark:bg-zinc-950/40 dark:text-zinc-200',
                )}
              >
                {modeLabel(selected.mode)}
              </span>
            </div>

            {selected.mode !== 'no-sync' && (
              <div className="text-xs text-muted-foreground">
                {syncing ? 'Syncing…' : online ? 'Up to date' : 'Offline'} (pull every ~1s)
              </div>
            )}
          </header>

          <TodoList
            projectId={selected.id}
            todos={todosForProject}
            loading={repEnabled && !rep}
            error={null}
            {...handlers}
            addPlaceholder={
              selected.mode === 'pull-only' ? 'Add a local todo (not pushed)…' : 'Add a todo…'
            }
          />
        </main>
      </div>
    </div>
  );
}
