import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';

import type { Todo } from '@/lib/domain';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

export function TodoList(props: {
  projectId: string;
  todos: Todo[];
  loading?: boolean;
  error?: string | null;
  onAdd?: (text: string) => void;
  onToggle?: (id: string) => void;
  onUpdateText?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
  addPlaceholder?: string;
}) {
  const {
    projectId,
    todos,
    loading,
    error,
    onAdd,
    onToggle,
    onUpdateText,
    onDelete,
    addPlaceholder = 'Add a todo…',
  } = props;

  const [draft, setDraft] = useState('');

  const canAdd = useMemo(() => !!onAdd && draft.trim().length > 0, [draft, onAdd]);

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-4 text-sm text-destructive">
        <div className="font-semibold">Error</div>
        <div className="mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-card p-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canAdd) return;
            onAdd?.(draft.trim());
            setDraft('');
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={addPlaceholder}
            data-testid="add-todo-input"
          />
          <Button type="submit" disabled={!canAdd}>
            Add
          </Button>
        </form>
      </div>

      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : todos.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No todos yet.</div>
        ) : (
          <ul className="divide-y">
            {todos.map((t) => (
              <TodoRow
                key={t.id}
                projectId={projectId}
                todo={t}
                onToggle={onToggle}
                onUpdateText={onUpdateText}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TodoRow(props: {
  projectId: string;
  todo: Todo;
  onToggle?: (id: string) => void;
  onUpdateText?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
}) {
  const { todo, onToggle, onUpdateText, onDelete } = props;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);

  const canEdit = !!onUpdateText;

  return (
    <li
      className="flex items-start gap-3 p-3 transition-colors duration-200 animate-in fade-in-0 slide-in-from-top-1 hover:bg-muted/40"
      data-testid={`todo-item-${todo.id}`}
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle?.(todo.id)}
        className="mt-1"
        disabled={!onToggle}
        data-testid={`todo-checkbox-${todo.id}`}
      />

      <div className="min-w-0 flex-1">
        {editing && canEdit ? (
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => {
              const next = text.trim();
              setEditing(false);
              if (next && next !== todo.text) onUpdateText(todo.id, next);
              setText(next || todo.text);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') {
                setEditing(false);
                setText(todo.text);
              }
            }}
            autoFocus
            data-testid={`todo-text-${todo.id}`}
          />
        ) : (
          <button
            type="button"
            className={cn(
              'w-full text-left text-sm leading-6',
              todo.completed && 'text-muted-foreground line-through',
            )}
            onClick={() => {
              if (!canEdit) return;
              setEditing(true);
            }}
            data-testid={`todo-text-${todo.id}`}
          >
            <span className="truncate">{todo.text}</span>
            <span className="ml-2 text-[11px] text-muted-foreground">
              {todo.author ? `(${todo.author})` : ''}
            </span>
          </button>
        )}

        <div className="mt-1 text-[11px] text-muted-foreground">
          Updated: {new Date(todo.updatedAt).toLocaleTimeString()}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete?.(todo.id)}
        disabled={!onDelete}
        className="mt-0.5"
        data-testid={`todo-delete-${todo.id}`}
        aria-label="Delete todo"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}
