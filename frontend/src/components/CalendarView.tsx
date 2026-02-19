import { useMemo, useRef, useState } from 'react';
import { CalendarEvent } from '../types';

interface Props {
  events: CalendarEvent[];
  onCreate?: (event: CalendarEvent) => void;
}

const viewOptions: Array<'month' | 'week' | 'day'> = ['month', 'week', 'day'];

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function CalendarView({ events, onCreate }: Props) {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const today = new Date();

  const eventMap = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((event) => {
      const key = event.start_date.slice(0, 10);
      map[key] = map[key] || [];
      map[key].push(event);
    });
    return map;
  }, [events]);

  const monthDays = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const days: Date[] = [];
    for (let d = 1; d <= last.getDate(); d += 1) {
      days.push(new Date(year, month, d));
    }
    return { firstDay: first.getDay(), days };
  }, [today]);

  const weekDays = useMemo(() => {
    const dayIndex = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayIndex);
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [today]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !onCreate) return;
    onCreate({ title, start_date: startDate });
    setTitle('');
  };

  const handleDateClick = (date: Date) => {
    if (!onCreate) return;
    setStartDate(formatDate(date));
    titleInputRef.current?.focus();
  };

  return (
    <div className="card p-6">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-display font-semibold text-plum dark:text-lilac">Calendário</h2>
            <p className="text-slate-500 text-lg dark:text-slate-300">
              Visão {view === 'month' ? 'mensal' : view === 'week' ? 'semanal' : 'diária'}
            </p>
          </div>
          <div className="flex gap-2">
            {viewOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setView(opt)}
                className={`rounded-full px-5 py-2.5 text-base ${view === opt ? 'bg-gradient-to-r from-violet to-plum text-white' : 'bg-violet/10'}`}
              >
                {opt === 'month' ? 'Mês' : opt === 'week' ? 'Semana' : 'Dia'}
              </button>
            ))}
          </div>
        </div>

        {onCreate && (
          <form onSubmit={submit} className="flex flex-col md:flex-row gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Novo evento"
              className="flex-1 rounded-2xl border border-lilac/60 px-5 py-3.5 text-lg"
              ref={titleInputRef}
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-2xl border border-lilac/60 px-5 py-3.5 text-lg"
            />
            <button className="btn-primary" type="submit">
              Adicionar
            </button>
          </form>
        )}
      </div>

      {view === 'month' && (
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: monthDays.firstDay }).map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}
          {monthDays.days.map((day) => {
            const key = formatDate(day);
            const hasEvents = eventMap[key]?.length || 0;
            return (
              <div
                key={key}
                className={`rounded-3xl border p-5 text-base cursor-pointer transition hover:border-violet/50 ${
                  hasEvents > 0
                    ? 'border-violet/50 bg-violet/10 dark:bg-[#2a163d]'
                    : 'border-lilac/40 dark:border-lilac/20 bg-white dark:bg-[#120a1a]'
                } ${key === formatDate(today) ? 'ring-2 ring-violet/40' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <div className="flex justify-between">
                  <span className="font-semibold text-lg">{day.getDate()}</span>
                  {hasEvents > 0 && <span className="text-violet font-semibold">{hasEvents}</span>}
                </div>
                <div className="mt-2 space-y-1">
                  {(eventMap[key] || []).slice(0, 2).map((evt) => (
                    <p key={evt.id} className="truncate text-sm text-slate-500 dark:text-slate-300">
                      {evt.title}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const key = formatDate(day);
            return (
              <div
                key={key}
                className={`rounded-3xl border p-5 bg-white dark:bg-[#120a1a] cursor-pointer transition hover:border-violet/50 ${
                  eventMap[key]?.length ? 'border-violet/50 bg-violet/10 dark:bg-[#2a163d]' : 'border-lilac/40 dark:border-lilac/20'
                }`}
                onClick={() => handleDateClick(day)}
              >
                <p className="text-base font-semibold">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}
                </p>
                <div className="mt-2 space-y-1">
                  {(eventMap[key] || []).map((evt) => (
                    <p key={evt.id} className="text-sm text-slate-500 dark:text-slate-300">
                      {evt.title}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'day' && (
        <div className="space-y-2">
          {(eventMap[formatDate(today)] || []).map((evt) => (
            <div key={evt.id} className="rounded-3xl border border-lilac/40 dark:border-lilac/20 p-5 bg-white dark:bg-[#120a1a]">
              <p className="font-semibold text-lg">{evt.title}</p>
              <p className="text-base text-slate-500 dark:text-slate-300">{evt.description || 'Sem descrição'}</p>
            </div>
          ))}
          {!(eventMap[formatDate(today)] || []).length && (
            <p className="text-base text-slate-500 dark:text-slate-300">Nenhum evento para hoje.</p>
          )}
          <button className="btn-ghost" onClick={() => handleDateClick(today)}>
            Adicionar evento hoje
          </button>
        </div>
      )}
    </div>
  );
}
