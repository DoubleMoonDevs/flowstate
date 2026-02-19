import { useState } from 'react';
import { FinanceItem } from '../types';

interface Props {
  items: FinanceItem[];
  onCreate: (item: FinanceItem) => void;
}

export default function Finance({ items, onCreate }: Props) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [budget, setBudget] = useState('');
  const [allocations, setAllocations] = useState({
    orcamento: '',
    despesas: '',
    assinaturas: '',
    fixos: ''
  });
  const [reserve, setReserve] = useState('');
  const [budgetError, setBudgetError] = useState('');

  const [details, setDetails] = useState({
    orcamento: { categoria: '', duracao: '' },
    despesas: { categoria: '', duracao: '' },
    assinaturas: { categoria: '', duracao: '' },
    fixos: { categoria: '', duracao: '' },
    reserva: { categoria: '', duracao: '' }
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!category.trim() || Number.isNaN(numericAmount)) return;
    onCreate({ amount: numericAmount, category, description, date });
    setAmount('');
    setCategory('');
    setDescription('');
  };

  const toNumber = (value: string) => Number(value) || 0;
  const numericBudget = toNumber(budget);
  const numericAllocations = {
    orcamento: toNumber(allocations.orcamento),
    despesas: toNumber(allocations.despesas),
    assinaturas: toNumber(allocations.assinaturas),
    fixos: toNumber(allocations.fixos),
    reserva: toNumber(reserve)
  };

  const totalAllocated =
    numericAllocations.orcamento +
    numericAllocations.despesas +
    numericAllocations.assinaturas +
    numericAllocations.fixos +
    numericAllocations.reserva;

  const remaining = Math.max(numericBudget - totalAllocated, 0);
  const maxValue = Math.max(numericBudget, totalAllocated, 1);
  const overBudget = totalAllocated > numericBudget && numericBudget > 0;
  const percent = (value: number) => (numericBudget > 0 ? Math.round((value / numericBudget) * 100) : 0);
  const canAllocate = numericBudget > 0;

  const updateAllocation = (key: keyof typeof allocations, value: string) => {
    const next = { ...allocations, [key]: value };
    const nextTotal =
      toNumber(next.orcamento) +
      toNumber(next.despesas) +
      toNumber(next.assinaturas) +
      toNumber(next.fixos) +
      toNumber(reserve);
    if (numericBudget > 0 && nextTotal > numericBudget) {
      setBudgetError('A soma dos valores não pode ultrapassar o orçamento total.');
      return;
    }
    setBudgetError('');
    setAllocations(next);
  };

  const updateReserve = (value: string) => {
    const nextTotal =
      toNumber(allocations.orcamento) +
      toNumber(allocations.despesas) +
      toNumber(allocations.assinaturas) +
      toNumber(allocations.fixos) +
      toNumber(value);
    if (numericBudget > 0 && nextTotal > numericBudget) {
      setBudgetError('A soma dos valores não pode ultrapassar o orçamento total.');
      return;
    }
    setBudgetError('');
    setReserve(value);
  };

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="card p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-display font-semibold text-plum dark:text-lilac">Financeiro</h2>
        <p className="text-base text-slate-500 dark:text-slate-300">Controle de gastos mensal.</p>
      </div>

      <div className="card p-5 mb-6 border border-lilac/40 dark:border-lilac/20">
        <h3 className="text-xl font-display font-semibold text-plum dark:text-lilac">Orçamento</h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Preencha o orçamento total e distribua entre os tópicos.
        </p>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white/70 dark:bg-[#120a1a]">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">Orçamento total</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={budget}
              onChange={(e) => {
                setBudget(e.target.value);
                setBudgetError('');
              }}
              placeholder="Ex: 3000"
              className="mt-2 w-full rounded-2xl border border-lilac/60 px-4 py-3"
            />
          </div>

          <div className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white/70 dark:bg-[#120a1a]">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">Reserva financeira (poupança)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={reserve}
              onChange={(e) => updateReserve(e.target.value)}
              placeholder="Ex: 500"
              className="mt-2 w-full rounded-2xl border border-lilac/60 px-4 py-3"
              disabled={!canAllocate}
            />
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                value={details.reserva.categoria}
                onChange={(e) => setDetails((prev) => ({ ...prev, reserva: { ...prev.reserva, categoria: e.target.value } }))}
                placeholder="Categoria"
                className="rounded-2xl border border-lilac/60 px-4 py-2"
                disabled={!canAllocate}
              />
              <input
                value={details.reserva.duracao}
                onChange={(e) => setDetails((prev) => ({ ...prev, reserva: { ...prev.reserva, duracao: e.target.value } }))}
                placeholder="Duração (ex: mensal)"
                className="rounded-2xl border border-lilac/60 px-4 py-2"
                disabled={!canAllocate}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white/70 dark:bg-[#120a1a]">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">Gastos fixos</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={allocations.fixos}
              onChange={(e) => updateAllocation('fixos', e.target.value)}
              placeholder="Ex: 700"
              className="mt-2 w-full rounded-2xl border border-lilac/60 px-4 py-3"
              disabled={!canAllocate}
            />
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                value={details.fixos.categoria}
                onChange={(e) => setDetails((prev) => ({ ...prev, fixos: { ...prev.fixos, categoria: e.target.value } }))}
                placeholder="Categoria"
                className="rounded-2xl border border-lilac/60 px-4 py-2"
                disabled={!canAllocate}
              />
              <input
                value={details.fixos.duracao}
                onChange={(e) => setDetails((prev) => ({ ...prev, fixos: { ...prev.fixos, duracao: e.target.value } }))}
                placeholder="Duração (ex: mensal)"
                className="rounded-2xl border border-lilac/60 px-4 py-2"
                disabled={!canAllocate}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white/70 dark:bg-[#120a1a]">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">Gastos variáveis</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={allocations.despesas}
              onChange={(e) => updateAllocation('despesas', e.target.value)}
              placeholder="Ex: 1200"
              className="mt-2 w-full rounded-2xl border border-lilac/60 px-4 py-3"
              disabled={!canAllocate}
            />
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                value={details.despesas.categoria}
                onChange={(e) => setDetails((prev) => ({ ...prev, despesas: { ...prev.despesas, categoria: e.target.value } }))}
                placeholder="Categoria"
                className="rounded-2xl border border-lilac/60 px-4 py-2"
                disabled={!canAllocate}
              />
              <input
                value={details.despesas.duracao}
                onChange={(e) => setDetails((prev) => ({ ...prev, despesas: { ...prev.despesas, duracao: e.target.value } }))}
                placeholder="Duração (ex: mensal)"
                className="rounded-2xl border border-lilac/60 px-4 py-2"
                disabled={!canAllocate}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white/70 dark:bg-[#120a1a]">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">Assinaturas</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={allocations.assinaturas}
              onChange={(e) => updateAllocation('assinaturas', e.target.value)}
              placeholder="Ex: 150"
              className="mt-2 w-full rounded-2xl border border-lilac/60 px-4 py-3"
              disabled={!canAllocate}
            />
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                value={details.assinaturas.categoria}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev,
                    assinaturas: { ...prev.assinaturas, categoria: e.target.value }
                  }))
                }
                placeholder="Categoria"
                className="rounded-2xl border border-lilac/60 px-4 py-2"
                disabled={!canAllocate}
              />
              <input
                value={details.assinaturas.duracao}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev,
                    assinaturas: { ...prev.assinaturas, duracao: e.target.value }
                  }))
                }
                placeholder="Duração (ex: mensal)"
                className="rounded-2xl border border-lilac/60 px-4 py-2"
                disabled={!canAllocate}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white/70 dark:bg-[#120a1a]">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">Orçamento (livre)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={allocations.orcamento}
              onChange={(e) => updateAllocation('orcamento', e.target.value)}
              placeholder="Ex: 800"
              className="mt-2 w-full rounded-2xl border border-lilac/60 px-4 py-3"
              disabled={!canAllocate}
            />
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                value={details.orcamento.categoria}
                onChange={(e) => setDetails((prev) => ({ ...prev, orcamento: { ...prev.orcamento, categoria: e.target.value } }))}
                placeholder="Categoria"
                className="rounded-2xl border border-lilac/60 px-4 py-2"
                disabled={!canAllocate}
              />
              <input
                value={details.orcamento.duracao}
                onChange={(e) => setDetails((prev) => ({ ...prev, orcamento: { ...prev.orcamento, duracao: e.target.value } }))}
                placeholder="Duração (ex: mensal)"
                className="rounded-2xl border border-lilac/60 px-4 py-2"
                disabled={!canAllocate}
              />
            </div>
          </div>
        </div>

        {budgetError && (
          <div className="mt-4 rounded-2xl border border-rose/40 bg-rose/10 p-3 text-rose text-sm">
            {budgetError}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-3 bg-white/70 dark:bg-[#120a1a]">
            Total orçado: <span className="font-semibold">R$ {numericBudget.toFixed(2)}</span>
          </div>
          <div className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-3 bg-white/70 dark:bg-[#120a1a]">
            Total dividido: <span className="font-semibold">R$ {totalAllocated.toFixed(2)}</span>
          </div>
          <div className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-3 bg-white/70 dark:bg-[#120a1a]">
            Restante: <span className="font-semibold">R$ {remaining.toFixed(2)}</span>
          </div>
          {overBudget && (
            <div className="rounded-2xl border border-rose/40 p-3 bg-rose/10 text-rose font-semibold">
              Ultrapassou o orçamento
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white/70 dark:bg-[#120a1a]">
            <p className="text-sm text-slate-500 dark:text-slate-300">Gráfico do orçamento</p>
            <div className="mt-4 h-4 rounded-full bg-violet/10 dark:bg-[#1d1328] overflow-hidden flex">
              {[
                { key: 'fixos', value: numericAllocations.fixos, color: 'bg-rose' },
                { key: 'despesas', value: numericAllocations.despesas, color: 'bg-plum' },
                { key: 'assinaturas', value: numericAllocations.assinaturas, color: 'bg-lilac' },
                { key: 'orcamento', value: numericAllocations.orcamento, color: 'bg-violet-500' },
                { key: 'reserva', value: numericAllocations.reserva, color: 'bg-mint' }
              ].map((item) => (
                <div
                  key={item.key}
                  className={`h-4 ${item.color}`}
                  style={{ width: `${Math.min((item.value / maxValue) * 100, 100)}%` }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
              As cores representam como o orçamento foi dividido.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'Gastos fixos', value: numericAllocations.fixos },
              { label: 'Gastos variáveis', value: numericAllocations.despesas },
              { label: 'Assinaturas', value: numericAllocations.assinaturas },
              { label: 'Reserva', value: numericAllocations.reserva },
              { label: 'Orçamento livre', value: numericAllocations.orcamento }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white/70 dark:bg-[#120a1a]">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
                  <span>{item.label}</span>
                  <span className="font-semibold">R$ {item.value.toFixed(2)}</span>
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                  {percent(item.value)}% do orçamento
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-2xl border border-lilac/60 px-4 py-3"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Categoria"
          className="rounded-2xl border border-lilac/60 px-4 py-3"
        />
        <input
          value={date}
          onChange={(e) => setDate(e.target.value)}
          type="date"
          className="rounded-2xl border border-lilac/60 px-4 py-3"
        />
        <button className="btn-primary" type="submit">
          Registrar
        </button>
      </form>

      <div className="mt-4 text-base text-slate-600 dark:text-slate-300">Total do mês: R$ {total.toFixed(2)}</div>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-lilac/40 dark:border-lilac/20 p-4 bg-white dark:bg-[#120a1a] flex justify-between">
            <div>
              <p className="font-semibold">{item.category}</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">{item.description || 'Sem descrição'}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">R$ {item.amount.toFixed(2)}</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">{item.date}</p>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-300">Nenhum gasto registrado.</p>}
      </div>
    </div>
  );
}
