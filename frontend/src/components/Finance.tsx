import { useEffect, useMemo, useState } from 'react';
import { FinanceItem } from '../types';

const expenseCategories = [
  'Cartão de crédito',
  'Gastos fixos',
  'Gastos variados',
  'Pix',
  'Débito'
] as const;

type ExpenseCategory = (typeof expenseCategories)[number];

type Receivable = {
  id: string;
  description: string;
  amount: number;
  date: string;
};

interface Props {
  items: FinanceItem[];
  onCreate: (item: FinanceItem) => void;
  onUpdate: (id: number, updates: Partial<FinanceItem>) => void;
  onDelete: (id: number) => void;
  onClearAll: () => void;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const toNumber = (value: string) => {
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const readString = (key: string, fallback: string) => {
  const value = localStorage.getItem(key);
  return value ?? fallback;
};

const today = () => new Date().toISOString().slice(0, 10);

const buildSummary = (items: FinanceItem[], income: number, receivables: Receivable[]) => {
  const totalExpenses = items.reduce((sum, item) => sum + item.amount, 0);
  const totalsByCategory: Record<ExpenseCategory, number> = {
    'Cartão de crédito': 0,
    'Gastos fixos': 0,
    'Gastos variados': 0,
    Pix: 0,
    Débito: 0
  };
  let otherExpenses = 0;

  items.forEach((item) => {
    if (expenseCategories.includes(item.category as ExpenseCategory)) {
      totalsByCategory[item.category as ExpenseCategory] += item.amount;
    } else {
      otherExpenses += item.amount;
    }
  });

  const totalReceivables = receivables.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = income + totalReceivables;
  const balance = totalIncome - totalExpenses;

  return {
    totalExpenses,
    totalsByCategory,
    otherExpenses,
    totalReceivables,
    totalIncome,
    balance
  };
};

export default function Finance({ items, onCreate, onUpdate, onDelete, onClearAll }: Props) {
  const [monthlyIncome, setMonthlyIncome] = useState(() => readString('finance:monthlyIncome', ''));
  const [receivables, setReceivables] = useState<Receivable[]>(() => readStorage('finance:receivables', []));

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: expenseCategories[0],
    date: today()
  });

  const [receivableForm, setReceivableForm] = useState({
    description: '',
    amount: '',
    date: today()
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category: expenseCategories[0],
    date: today()
  });

  useEffect(() => {
    localStorage.setItem('finance:monthlyIncome', monthlyIncome);
  }, [monthlyIncome]);

  useEffect(() => {
    localStorage.setItem('finance:receivables', JSON.stringify(receivables));
  }, [receivables]);

  const summary = useMemo(() => {
    return buildSummary(items, toNumber(monthlyIncome), receivables);
  }, [items, monthlyIncome, receivables]);

  const submitExpense = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = toNumber(form.amount);
    if (amount <= 0) return;

    onCreate({
      amount,
      category: form.category,
      description: form.description.trim() || undefined,
      date: form.date
    });

    setForm({
      description: '',
      amount: '',
      category: expenseCategories[0],
      date: today()
    });
  };

  const submitReceivable = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = toNumber(receivableForm.amount);
    if (!receivableForm.description.trim() || amount <= 0) return;

    const next: Receivable = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      description: receivableForm.description.trim(),
      amount,
      date: receivableForm.date
    };

    setReceivables((prev) => [next, ...prev]);
    setReceivableForm({ description: '', amount: '', date: today() });
  };

  const startEdit = (item: FinanceItem) => {
    if (!item.id) return;
    setEditingId(item.id);
    setEditForm({
      description: item.description || '',
      amount: String(item.amount),
      category: expenseCategories.includes(item.category as ExpenseCategory)
        ? (item.category as ExpenseCategory)
        : expenseCategories[0],
      date: item.date
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const submitEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingId) return;
    const amount = toNumber(editForm.amount);
    if (amount <= 0) return;

    onUpdate(editingId, {
      amount,
      category: editForm.category,
      description: editForm.description.trim() || undefined,
      date: editForm.date
    });

    setEditingId(null);
  };

  const removeExpense = (id?: number) => {
    if (!id) return;
    onDelete(id);
  };

  const removeReceivable = (id: string) => {
    setReceivables((prev) => prev.filter((item) => item.id !== id));
  };

  const restoreAll = () => {
    if (editingId) setEditingId(null);
    setMonthlyIncome('');
    setReceivables([]);
    setForm({
      description: '',
      amount: '',
      category: expenseCategories[0],
      date: today()
    });
    setReceivableForm({ description: '', amount: '', date: today() });
    onClearAll();
  };

  return (
    <div className="card p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-plum dark:text-lilac">Financeiro</h2>
          <p className="text-base text-slate-500 dark:text-slate-300">Controle de renda, recebíveis e gastos do mês.</p>
        </div>
        <button className="btn-ghost" onClick={restoreAll}>
          Restaurar tudo
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="card p-5 border border-lilac/40 dark:border-lilac/20">
            <h3 className="text-xl font-display font-semibold text-plum dark:text-lilac">Renda e valores a receber</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Informe a renda mensal e registre valores pendentes.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white/70 dark:bg-[#120a1a]">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">Renda mensal</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="Ex: 3500"
                  className="mt-2 w-full rounded-2xl border border-lilac/60 px-4 py-3"
                />
              </div>

              <form
                onSubmit={submitReceivable}
                className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white/70 dark:bg-[#120a1a]"
              >
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">Adicionar recebível</label>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <input
                    value={receivableForm.description}
                    onChange={(e) => setReceivableForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição"
                    className="rounded-2xl border border-lilac/60 px-4 py-2"
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={receivableForm.amount}
                    onChange={(e) => setReceivableForm((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="Valor"
                    className="rounded-2xl border border-lilac/60 px-4 py-2"
                  />
                  <input
                    type="date"
                    value={receivableForm.date}
                    onChange={(e) => setReceivableForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="rounded-2xl border border-lilac/60 px-4 py-2"
                  />
                </div>
                <button className="btn-primary mt-3" type="submit">
                  Adicionar
                </button>
              </form>
            </div>

            <div className="mt-4 space-y-2">
              {receivables.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-3 bg-white dark:bg-[#120a1a] flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{item.description}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.amount)}</p>
                    <button className="btn-ghost mt-1" onClick={() => removeReceivable(item.id)}>
                      Remover
                    </button>
                  </div>
                </div>
              ))}
              {receivables.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-300">Nenhum valor a receber registrado.</p>
              )}
            </div>
          </div>

          <div className="card p-5 border border-lilac/40 dark:border-lilac/20">
            <h3 className="text-xl font-display font-semibold text-plum dark:text-lilac">Registrar gasto</h3>
            <form onSubmit={submitExpense} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição"
                className="rounded-2xl border border-lilac/60 px-4 py-3"
              />
              <input
                type="text"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="Valor"
                className="rounded-2xl border border-lilac/60 px-4 py-3"
              />
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as ExpenseCategory }))}
                className="rounded-2xl border border-lilac/60 px-4 py-3"
              >
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                type="date"
                className="rounded-2xl border border-lilac/60 px-4 py-3"
              />
              <button className="btn-primary md:col-span-4" type="submit">
                Registrar gasto
              </button>
            </form>
          </div>

          <div className="card p-5 border border-lilac/40 dark:border-lilac/20">
            <h3 className="text-xl font-display font-semibold text-plum dark:text-lilac">Gastos registrados</h3>
            <div className="mt-4 space-y-2">
              {items.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white dark:bg-[#120a1a]"
                  >
                    {isEditing ? (
                      <form onSubmit={submitEdit} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <input
                          value={editForm.description}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                          className="rounded-2xl border border-lilac/60 px-3 py-2"
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editForm.amount}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                          className="rounded-2xl border border-lilac/60 px-3 py-2"
                        />
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value as ExpenseCategory }))}
                          className="rounded-2xl border border-lilac/60 px-3 py-2"
                        >
                          {expenseCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                          className="rounded-2xl border border-lilac/60 px-3 py-2"
                        />
                        <div className="md:col-span-4 flex items-center gap-2">
                          <button className="btn-primary" type="submit">
                            Salvar
                          </button>
                          <button className="btn-ghost" type="button" onClick={cancelEdit}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="font-semibold">{item.description || 'Sem descrição'}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-300">
                            {item.category} · {item.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(item.amount)}</p>
                          <div className="mt-2 flex items-center justify-end gap-2">
                            <button className="btn-ghost" onClick={() => startEdit(item)}>
                              Editar
                            </button>
                            <button className="btn-ghost" onClick={() => removeExpense(item.id)}>
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {items.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-300">Nenhum gasto registrado.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5 border border-lilac/40 dark:border-lilac/20">
            <h3 className="text-xl font-display font-semibold text-plum dark:text-lilac">Resumo financeiro</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Total gasto</span>
                <span className="font-semibold">{formatCurrency(summary.totalExpenses)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total a receber</span>
                <span className="font-semibold">{formatCurrency(summary.totalReceivables)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Renda + Recebíveis</span>
                <span className="font-semibold">{formatCurrency(summary.totalIncome)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Saldo final</span>
                <span
                  className={`font-semibold ${summary.balance >= 0 ? 'text-mint' : 'text-rose'}`}
                >
                  {formatCurrency(summary.balance)}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-5 border border-lilac/40 dark:border-lilac/20">
            <h3 className="text-xl font-display font-semibold text-plum dark:text-lilac">Gastos por categoria</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {expenseCategories.map((category) => (
                <div key={category} className="flex items-center justify-between">
                  <span>{category}</span>
                  <span className="font-semibold">{formatCurrency(summary.totalsByCategory[category])}</span>
                </div>
              ))}
              {summary.otherExpenses > 0 && (
                <div className="flex items-center justify-between">
                  <span>Outros</span>
                  <span className="font-semibold">{formatCurrency(summary.otherExpenses)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card p-5 border border-lilac/40 dark:border-lilac/20">
            <h3 className="text-xl font-display font-semibold text-plum dark:text-lilac">Fórmula aplicada</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Saldo = (Renda mensal + Valores a receber) - Total de gastos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
