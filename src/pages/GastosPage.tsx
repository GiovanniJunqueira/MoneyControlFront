import { useEffect, useState, useCallback } from "react";
import { api } from "../api/client";
import { Category, GastosDashboard } from "../api/types";
import { PeriodNavigator } from "../components/PeriodNavigator";
import { CategoryBar } from "../components/CategoryBar";
import { AddExpenseModal } from "../components/AddExpenseModal";
import { ManageCategoriesModal } from "../components/ManageCategoriesModal";
import { PeriodSettingsModal } from "../components/PeriodSettingsModal";
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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-ink">Gastos</h1>
          <p className="mt-1 text-ink-soft">Seu livro-caixa do período.</p>
        </div>
        <div className="hidden gap-2 md:flex">
          <button onClick={() => setShowCategories(true)} className="btn-secondary">Categorias</button>
          <button onClick={() => setShowAddExpense(true)} className="btn-primary">+ Novo gasto</button>
        </div>
      </div>

      <PeriodNavigator period={dashboard.period} onNavigate={setPeriodKey} onOpenSettings={() => setShowSettings(true)} />

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-6 border-b border-rule py-6">
        <div>
          <p className="text-sm text-ink-soft">Total do período</p>
          <p className="num mt-1 text-2xl text-ink">{formatCurrency(dashboard.resumo.total)}</p>
        </div>
        <div>
          <p className="text-sm text-ink-soft">Média por lançamento</p>
          <p className="num mt-1 text-2xl text-ink">{formatCurrency(dashboard.resumo.mediaPorLancamento)}</p>
        </div>
      </div>

      {/* Por categoria */}
      {dashboard.porCategoria.length > 0 && (
        <div className="border-b border-rule py-2">
          <h2 className="mb-1 mt-4 font-display text-lg text-ink">Por categoria</h2>
          {dashboard.porCategoria.map((c) => (
            <CategoryBar key={c.categoryId} categoria={c} />
          ))}
        </div>
      )}

      {/* Lançamentos */}
      <div className="py-6">
        <h2 className="mb-2 font-display text-lg text-ink">Lançamentos</h2>
        {dashboard.lancamentos.length === 0 ? (
          <p className="py-6 text-sm text-ink-soft">Nenhum gasto lançado nesse período ainda.</p>
        ) : (
          <ul>
            {dashboard.lancamentos.map((e) => (
              <li key={e.id} className="ledger-row group">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: e.category.color || "#1C2B33" }} />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">{e.description || e.category.name}</p>
                    <p className="text-xs text-ink-soft">{formatDate(e.date)} · {e.category.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="num text-sm text-ink">{formatCurrency(e.amount)}</span>
                  <button
                    onClick={() => handleDeleteExpense(e.id)}
                    className="text-xs text-ink-soft opacity-0 transition-opacity hover:text-ledger-brick group-hover:opacity-100"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Ações mobile */}
      <div className="fixed bottom-16 right-4 flex gap-2 md:hidden">
        <button onClick={() => setShowCategories(true)} className="btn-secondary bg-paper shadow-md">Categorias</button>
        <button onClick={() => setShowAddExpense(true)} className="btn-primary shadow-md">+ Gasto</button>
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
