import { useState } from 'react';
import { Goal } from '../types';
import ProgressBar from './ProgressBar';

interface Props {
  goals: Goal[];
  onCreate: (goal: Goal) => void;
  onUpdate: (id: number, updates: Partial<Goal>) => void;
}

export default function Goals({ goals, onCreate, onUpdate }: Props) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState(10);
  const [unit, setUnit] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onCreate({ title, target_value: target, unit, current_value: 0 });
    setTitle('');
    setTarget(10);
    setUnit('');
  };

  return (
    <div className="card p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-display font-semibold text-plum dark:text-lilac">Metas & Progresso</h2>
        <p className="text-base text-slate-500 dark:text-slate-300">Acompanhe resultados em tempo real.</p>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meta"
          className="rounded-2xl border border-lilac/60 px-4 py-3"
        />
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          className="rounded-2xl border border-lilac/60 px-4 py-3"
        />
        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Unidade"
          className="rounded-2xl border border-lilac/60 px-4 py-3"
        />
        <button className="btn-primary" type="submit">
          Criar meta
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {goals.map((goal) => {
          const percent = Math.round(((goal.current_value || 0) / goal.target_value) * 100);
          return (
            <div key={goal.id} className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white dark:bg-[#120a1a]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{goal.title}</p>
                  <p className="text-sm text-slate-500">
                    {goal.current_value} / {goal.target_value} {goal.unit}
                  </p>
                </div>
                <button
                  className="btn-ghost"
                  onClick={() => onUpdate(goal.id!, { current_value: (goal.current_value || 0) + 1 })}
                >
                  +1
                </button>
              </div>
              <div className="mt-2">
                <ProgressBar value={percent} />
                <p className="text-sm text-slate-500 mt-1">{percent}% concluído</p>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && <p className="text-sm text-slate-500">Nenhuma meta ainda.</p>}
      </div>
    </div>
  );
}
