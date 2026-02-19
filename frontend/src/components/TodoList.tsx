import { useState } from 'react';
import { Task } from '../types';

interface Props {
  tasks: Task[];
  onCreate: (task: Task) => void;
  onUpdate: (id: number, updates: Partial<Task>) => void;
  onDelete: (id: number) => void;
}

export default function TodoList({ tasks, onCreate, onUpdate, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [subtask, setSubtask] = useState('');
  const [subtasks, setSubtasks] = useState<{ title: string }[]>([]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onCreate({ title, category, priority, due_date: dueDate || undefined, subtasks });
    setTitle('');
    setCategory('');
    setPriority('medium');
    setDueDate('');
    setSubtasks([]);
    setSubtask('');
  };

  return (
    <div className="card p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-display font-semibold text-plum dark:text-lilac">To-Do Prioritário</h2>
        <p className="text-base text-slate-500 dark:text-slate-300">Organize com categorias e sub-tarefas.</p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nova tarefa"
          className="w-full rounded-2xl border border-lilac/60 px-4 py-3"
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Categoria"
            className="rounded-2xl border border-lilac/60 px-4 py-3"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-2xl border border-lilac/60 px-4 py-3"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task['priority'])}
            className="rounded-2xl border border-lilac/60 px-4 py-3"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
          <button className="btn-primary" type="submit">
            Adicionar
          </button>
        </div>
        <div className="flex gap-2">
          <input
            value={subtask}
            onChange={(e) => setSubtask(e.target.value)}
            placeholder="Sub-tarefa"
            className="flex-1 rounded-2xl border border-lilac/60 px-4 py-3"
          />
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              if (!subtask.trim()) return;
              setSubtasks([...subtasks, { title: subtask }]);
              setSubtask('');
            }}
          >
            Add sub
          </button>
        </div>
        {subtasks.length > 0 && (
          <div className="text-sm text-slate-500">Sub-tarefas: {subtasks.map((s) => s.title).join(', ')}</div>
        )}
      </form>

      <div className="mt-6 space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white dark:bg-[#120a1a]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={(e) =>
                      onUpdate(task.id!, { status: e.target.checked ? 'done' : 'open' })
                    }
                  />
                  <p className="font-semibold">{task.title}</p>
                </div>
                <p className="text-sm text-slate-500">
                  {task.category || 'Sem categoria'} • {task.priority || 'medium'}
                  {task.due_date ? ` • ${task.due_date}` : ''}
                </p>
              </div>
              <span
                className={`text-xs px-3 py-1.5 rounded-full ${
                  task.priority === 'high'
                    ? 'bg-rose/20 text-rose'
                    : task.priority === 'low'
                      ? 'bg-mint/20 text-mint'
                      : 'bg-violet/10 text-violet dark:bg-violet/30 dark:text-lilac'
                }`}
              >
                {task.priority}
              </span>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="text-sm text-rose hover:underline" onClick={() => onDelete(task.id!)}>
                Excluir
              </button>
            </div>
            {task.subtasks?.length ? (
              <div className="mt-2 space-y-1 text-sm text-slate-500">
                {task.subtasks.map((sub, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!sub.completed}
                      onChange={(e) => {
                        const updated = task.subtasks?.map((s) =>
                          s.title === sub.title ? { ...s, completed: e.target.checked } : s
                        );
                        onUpdate(task.id!, { subtasks: updated });
                      }}
                    />
                    <span>{sub.title}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {tasks.length === 0 && <p className="text-sm text-slate-500">Nenhuma tarefa ainda.</p>}
      </div>
    </div>
  );
}
