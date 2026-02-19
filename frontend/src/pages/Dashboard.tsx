import { useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest } from '../api';
import { CalendarEvent, FinanceItem, Goal, ReportPoint, Task } from '../types';
import CalendarView from '../components/CalendarView';
import TodoList from '../components/TodoList';
import Goals from '../components/Goals';
import Finance from '../components/Finance';
import Reports from '../components/Reports';
import Notifications from '../components/Notifications';

interface Props {
  onLogout: () => void;
  dark: boolean;
  onToggleTheme: () => void;
}

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

type SectionKey = 'dashboard' | 'calendar' | 'tasks' | 'goals' | 'finance' | 'productivity';

const sections: Array<{ key: SectionKey; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'calendar', label: 'Calendário' },
  { key: 'tasks', label: 'Tarefas' },
  { key: 'goals', label: 'Metas' },
  { key: 'finance', label: 'Financeiro' },
  { key: 'productivity', label: 'Produtividade' }
];

export default function Dashboard({ onLogout, dark, onToggleTheme }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [finance, setFinance] = useState<FinanceItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const timers = useRef(new Map<number, number>());

  const notify = (message: string, type: Notification['type'] = 'info') => {
    console.log(`[${type}] ${message}`);
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    const timeoutId = window.setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      timers.current.delete(id);
    }, 3000);
    timers.current.set(id, timeoutId);
  };

  const dismiss = (id: number) => {
    const timeoutId = timers.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timers.current.delete(id);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const pause = (id: number) => {
    const timeoutId = timers.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timers.current.delete(id);
    }
  };

  const resume = (id: number) => {
    if (timers.current.has(id)) return;
    const timeoutId = window.setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      timers.current.delete(id);
    }, 3000);
    timers.current.set(id, timeoutId);
  };

  const loadAll = async () => {
    try {
      const [tasksData, goalsData, financeData, eventsData] = await Promise.all([
        apiRequest<Task[]>('/tasks'),
        apiRequest<Goal[]>('/goals'),
        apiRequest<FinanceItem[]>('/finance'),
        apiRequest<CalendarEvent[]>('/calendar')
      ]);
      setTasks(tasksData);
      setGoals(goalsData);
      setFinance(financeData);
      setEvents(eventsData);
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createTask = async (task: Task) => {
    try {
      const created = await apiRequest<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(task)
      });
      setTasks((prev) => [created, ...prev]);
      notify('Tarefa criada!', 'success');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    try {
      const updated = await apiRequest<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
      notify('Tarefa atualizada.', 'success');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await apiRequest<void>(`/tasks/${id}`, {
        method: 'DELETE'
      });
      setTasks((prev) => prev.filter((task) => task.id !== id));
      notify('Tarefa excluída.', 'success');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const createGoal = async (goal: Goal) => {
    try {
      const created = await apiRequest<Goal>('/goals', {
        method: 'POST',
        body: JSON.stringify(goal)
      });
      setGoals((prev) => [created, ...prev]);
      notify('Meta criada!', 'success');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const updateGoal = async (id: number, updates: Partial<Goal>) => {
    try {
      const updated = await apiRequest<Goal>(`/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      setGoals((prev) => prev.map((goal) => (goal.id === id ? updated : goal)));
      notify('Meta atualizada.', 'success');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const createFinance = async (item: FinanceItem) => {
    try {
      const created = await apiRequest<FinanceItem>('/finance', {
        method: 'POST',
        body: JSON.stringify(item)
      });
      setFinance((prev) => [created, ...prev]);
      notify('Gasto registrado!', 'success');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const createEvent = async (event: CalendarEvent) => {
    try {
      const created = await apiRequest<CalendarEvent>('/calendar', {
        method: 'POST',
        body: JSON.stringify(event)
      });
      setEvents((prev) => [created, ...prev]);
      notify('Evento adicionado!', 'success');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  };

  const parseSqliteDate = (value?: string) => {
    if (!value) return null;
    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const productivityWeek: ReportPoint[] = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const counts = Array.from({ length: 7 }).map(() => 0);
    tasks.forEach((task) => {
      if (task.status !== 'done' && task.status !== 'completed') return;
      const date =
        parseSqliteDate(task.due_date) ||
        parseSqliteDate(task.created_at) ||
        new Date();
      counts[date.getDay()] += 1;
    });
    return days.map((label, index) => ({ label, value: counts[index] }));
  }, [tasks]);

  const doneTasks = tasks.filter((task) => task.status === 'done' || task.status === 'completed');
  const doneToday = doneTasks.filter((task) => {
    const date =
      parseSqliteDate(task.due_date) ||
      parseSqliteDate(task.created_at) ||
      new Date();
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).length;

  const handleNavigate = (key: SectionKey) => {
    setActiveSection(key);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-mist dark:bg-[#0b0414]">
      <Notifications items={notifications} onDismiss={dismiss} onPause={pause} onResume={resume} />

      <div className="md:pl-64">
        <header className="px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Flowstate</p>
            <h1 className="text-4xl font-display font-bold text-plum dark:text-lilac">
              {sections.find((s) => s.key === activeSection)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-ghost md:hidden" onClick={() => setMobileOpen(true)}>
              Menu
            </button>
            <button className="btn-ghost" onClick={onToggleTheme}>
              {dark ? 'Modo claro' : 'Modo escuro'}
            </button>
            <button className="btn-ghost" onClick={loadAll}>
              Atualizar
            </button>
            <button className="btn-primary" onClick={onLogout}>
              Sair
            </button>
          </div>
        </header>

        <main className="px-6 pb-10">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <CalendarView events={events} onCreate={createEvent} />
                <TodoList tasks={tasks} onCreate={createTask} onUpdate={updateTask} onDelete={deleteTask} />
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Goals goals={goals} onCreate={createGoal} onUpdate={updateGoal} />
                <Finance items={finance} onCreate={createFinance} />
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Reports
                  title="Produtividade"
                  subtitle="Tarefas concluídas por dia"
                  points={productivityWeek}
                />
                <Reports
                  title="Visão Semanal"
                  subtitle="Distribuição de metas e tarefas"
                  points={[
                    { label: 'Metas', value: goals.length },
                    { label: 'Tarefas', value: tasks.length },
                    { label: 'Concluídas', value: doneTasks.length }
                  ]}
                />
              </section>
              <section className="card p-4 text-sm text-slate-600">
                Concluídas hoje: <span className="font-semibold">{doneToday}</span>
              </section>
            </div>
          )}

          {activeSection === 'calendar' && (
            <section className="max-w-5xl">
              <CalendarView events={events} onCreate={createEvent} />
            </section>
          )}

          {activeSection === 'tasks' && (
            <section className="max-w-5xl">
              <TodoList tasks={tasks} onCreate={createTask} onUpdate={updateTask} onDelete={deleteTask} />
            </section>
          )}

          {activeSection === 'goals' && (
            <section className="max-w-5xl">
              <Goals goals={goals} onCreate={createGoal} onUpdate={updateGoal} />
            </section>
          )}

          {activeSection === 'finance' && (
            <section className="max-w-5xl">
              <Finance items={finance} onCreate={createFinance} />
            </section>
          )}

          {activeSection === 'productivity' && (
            <section className="space-y-6 max-w-5xl">
              <Reports
                title="Produtividade"
                subtitle="Tarefas concluídas por dia"
                points={productivityWeek}
              />
              <Reports
                title="Resumo"
                subtitle="Comparativo geral"
                points={[
                  { label: 'Metas', value: goals.length },
                  { label: 'Tarefas', value: tasks.length },
                  { label: 'Concluídas', value: doneTasks.length }
                ]}
              />
              <section className="card p-4 text-sm text-slate-600">
                Concluídas hoje: <span className="font-semibold">{doneToday}</span>
              </section>
            </section>
          )}
        </main>
      </div>

      <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-64 bg-white/90 dark:bg-[#120a1a] border-r border-lilac/40 dark:border-lilac/20">
        <div className="px-6 py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Flowstate</p>
          <p className="text-xl font-display font-semibold text-plum dark:text-lilac">Flowstate</p>
        </div>
        <nav className="px-4 space-y-2">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => handleNavigate(section.key)}
              className={`w-full text-left rounded-2xl px-4 py-3 text-base transition ${
                activeSection === section.key ? 'bg-gradient-to-r from-violet to-plum text-white shadow-md' : 'hover:bg-violet/10'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-[#120a1a] p-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Flowstate</p>
                <p className="text-xl font-display font-semibold text-plum dark:text-lilac">Flowstate</p>
              </div>
              <button className="btn-ghost" onClick={() => setMobileOpen(false)}>
                Fechar
              </button>
            </div>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => handleNavigate(section.key)}
                  className={`w-full text-left rounded-2xl px-4 py-3 text-base transition ${
                    activeSection === section.key ? 'bg-gradient-to-r from-violet to-plum text-white shadow-md' : 'hover:bg-violet/10'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
