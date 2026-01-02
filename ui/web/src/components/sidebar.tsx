import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import type { Project } from '@/lib/domain';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/theme-toggle';

export function Sidebar(props: {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
}) {
  const { projects, selectedProjectId, onSelectProject, onCreateProject } = props;
  const [name, setName] = useState('');

  const canCreate = useMemo(() => name.trim().length > 0, [name]);

  return (
    <div className="flex h-full w-full flex-col gap-3 p-4">
      <ThemeToggle />
      <Separator />

      <div className="flex-1 overflow-auto">
        <div className="mb-2 text-xs font-semibold text-muted-foreground">Projects</div>
        <div className="flex flex-col gap-1" data-testid="project-list">
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              className={cn(
                'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selectedProjectId === p.id && 'bg-accent text-accent-foreground',
              )}
              onClick={() => onSelectProject(p.id)}
              data-testid={`project-${p.id}`}
            >
              <span className="truncate">{p.name}</span>
              <span className="ml-3 shrink-0 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {p.mode}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            className="w-full justify-start gap-2"
            data-testid="create-project"
          >
            <Plus className="h-4 w-4" />
            Create project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>Creates a local (no-sync) project for demos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              disabled={!canCreate}
              onClick={() => {
                if (!canCreate) return;
                onCreateProject(name.trim());
                setName('');
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
