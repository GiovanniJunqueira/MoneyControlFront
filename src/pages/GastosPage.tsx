import { useEffect, useState, useCallback } from "react";
import { api } from "../api/client";
import { Category, GastosDashboard } from "../api/types";
import { PeriodNavigator } from "../components/PeriodNavigator";
import { CategoryBar } from "../components/CategoryBar";
import { AddExpenseModal } from "../components/AddExpenseModal";
import { ManageCategoriesModal } from "../components/ManageCategoriesModal";
import { PeriodSettingsModal } from "../components/PeriodSettingsModal";
import { PlusIcon, TrashIcon } from "../components/icons";
import { formatCurrency, formatDate } from "../utils/format";

export function GastosPage() {
  const [periodKey, setPeriodKey] = useState<string | undefined>(undefined);
  const [dashboard, setDashboard] = useState<GastosDashboard | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [dashRes, catRes] = await Promise.all([
      api.get<GastosDashboard>("/dashboard/gastos", { params: periodKey ? { period: periodKey } : {} }),
      api.get<Category[]>("/categories"),
    ]);
    setDashboard(dashRes.data);
    setCategories(catRes.data);
    setLoading(false);
  }, [periodKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDeleteExpense(id: string) {
    await api.delete(`/expenses/${id}`);
    load();
  }

  if (loading && !dashboard) {
    return <p className="text-ink-soft">Carregando…</p>;
  }

  if (!dashboard) return null;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Gastos</h1>
          <p className="mt-1 text-ink-soft">Seu resumo do período.</p>
        </div>
        <div className="hidden gap-2 md:flex">
          <button onClick={() => setShowCategories(true)} className="btn-secondary">Categorias</button>
          <button onClick={() => setShowAddExpense(true)} className="btn-primary gap-1.5">
            <PlusIcon className="h-4 w-4" /> Novo gasto
          </button>
        </div>
      </div>

      <PeriodNavigator period={dashboard.period} onNavigate={setPeriodKey} onOpenSettings={() => setShowSettings(true)} />

      {/* Resumo */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-sm text-ink-soft">Total do período</p>
          <p className="num mt-1 text-2xl text-ink">{formatCurrency(dashboard.resumo.total)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink-soft">Média por lançamento</p>
          <p className="num mt-1 text-2xl text-ink">{formatCurrency(dashboard.resumo.mediaPorLancamento)}</p>
        </div>
      </div>

      {/* Por categoria */}
      {dashboard.porCategoria.length > 0 && (
        <div className="card mb-4">
          <h2 className="mb-1 text-base font-bold text-ink">Por categoria</h2>
          <div className="divide-y divide-line/70">
            {dashboard.porCategoria.map((c) => (
              <CategoryBar key={c.categoryId} categoria={c} />
            ))}
          </div>
        </div>
      )}

      {/* Lançamentos */}
      <div className="card">
        <h2 className="mb-1 text-base font-bold text-ink">Lançamentos</h2>
        {dashboard.lancamentos.length === 0 ? (
          <p className="py-6 text-sm text-ink-soft">Nenhum gasto lançado nesse período ainda.</p>
        ) : (
          <ul className="divide-y divide-line/70">
            {dashboard.lancamentos.map((e) => (
              <li key={e.id} className="list-row group">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: e.category.color || "#8E8E93" }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-ink">{e.description || e.category.name}</p>
                    <p className="text-xs text-ink-soft">{formatDate(e.date)} · {e.category.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="num text-[15px] text-ink">{formatCurrency(e.amount)}</span>
                  <button
                    onClick={() => handleDeleteExpense(e.id)}
                    className="text-ink-soft opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                    aria-label="Excluir gasto"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Ações mobile */}
      <div className="fixed bottom-20 right-4 flex flex-col items-end gap-2 md:hidden">
        <button onClick={() => setShowCategories(true)} className="btn-secondary bg-surface shadow-lg shadow-black/10">
          Categorias
        </button>
        <button
          onClick={() => setShowAddExpense(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30"
          aria-label="Novo gasto"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>

      {showAddExpense && (
        <AddExpenseModal categories={categories} onClose={() => setShowAddExpense(false)} onSaved={() => { setShowAddExpense(false); load(); }} />
      )}
      {showCategories && (
        <ManageCategoriesModal categories={categories} onClose={() => setShowCategories(false)} onChanged={load} />
      )}
      {showSettings && (
        <PeriodSettingsModal
          module="gastos"
          currentClosingDay={dashboard.period.closingDay}
          onClose={() => setShowSettings(false)}
          onSaved={() => { setShowSettings(false); load(); }}
        />
      )}
    </div>
  );
}
