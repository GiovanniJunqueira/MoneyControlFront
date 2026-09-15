import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { DebtorSummary, DevedoresDashboard } from "../api/types";
import { AddDebtorModal } from "../components/AddDebtorModal";
import { PeriodNavigator } from "../components/PeriodNavigator";
import { PeriodSettingsModal } from "../components/PeriodSettingsModal";
import { PlusIcon, ChevronRightIcon } from "../components/icons";
import { formatCurrency } from "../utils/format";

export function DevedoresPage() {
  const { tabId = "" } = useParams<{ tabId: string }>();
  const [periodKey, setPeriodKey] = useState<string | undefined>(undefined);
  const [dashboard, setDashboard] = useState<DevedoresDashboard | null>(null);
  const [debtors, setDebtors] = useState<DebtorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [dashRes, debtorsRes] = await Promise.all([
      api.get<DevedoresDashboard>(`/tabs/${tabId}/dashboard/devedores`, { params: periodKey ? { period: periodKey } : {} }),
      api.get<DebtorSummary[]>(`/tabs/${tabId}/debtors`),
    ]);
    setDashboard(dashRes.data);
    setDebtors(debtorsRes.data);
    setLoading(false);
  }, [tabId, periodKey]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPendente = debtors.reduce((sum, d) => sum + d.totalDevido, 0);

  if (loading && !dashboard) {
    return <p className="text-ink-soft">Carregando…</p>;
  }
  if (!dashboard) return null;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Devedores</h1>
          <p className="mt-1 text-ink-soft">Quem te deve e quanto.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary hidden gap-1.5 md:inline-flex">
          <PlusIcon className="h-4 w-4" /> Nova pessoa
        </button>
      </div>

      <PeriodNavigator period={dashboard.period} onNavigate={setPeriodKey} onOpenSettings={() => setShowSettings(true)} />

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-sm text-ink-soft">Emprestado no período</p>
          <p className="num mt-1 text-2xl text-ink">{formatCurrency(dashboard.resumo.totalEmprestado)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink-soft">Recebido no período</p>
          <p className="num mt-1 text-2xl text-success">{formatCurrency(dashboard.resumo.totalRecebido)}</p>
        </div>
      </div>

      <div className="card mb-4">
        <p className="text-sm text-ink-soft">Total pendente (todas as dívidas em aberto)</p>
        <p className="num mt-1 text-2xl text-danger">{formatCurrency(totalPendente)}</p>
      </div>

      <div className="card">
        <h2 className="mb-1 text-base font-bold text-ink">Pessoas</h2>
        {debtors.length === 0 ? (
          <p className="py-6 text-sm text-ink-soft">Ninguém te deve nada por aqui ainda.</p>
        ) : (
          <ul className="divide-y divide-line/70">
            {debtors.map((d) => (
              <li key={d.id}>
                <Link to={`/tabs/${tabId}/devedores/${d.id}`} className="list-row -mx-1 rounded-2xl px-1 transition-colors hover:bg-surface-soft active:bg-surface-soft">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-ink">{d.name}</p>
                    <p className="text-xs text-ink-soft">
                      {d.quantidadeDividas} {d.quantidadeDividas === 1 ? "dívida em aberto" : "dívidas em aberto"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className={`num text-[15px] ${d.totalDevido > 0 ? "text-danger" : "text-success"}`}>
                      {formatCurrency(d.totalDevido)}
                    </span>
                    <ChevronRightIcon className="h-4 w-4 text-ink-soft" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fixed bottom-20 right-4 md:hidden">
        <button
          onClick={() => setShowAdd(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30"
          aria-label="Nova pessoa"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>

      {showAdd && <AddDebtorModal tabId={tabId} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} />}
      {showSettings && (
        <PeriodSettingsModal
          tabId={tabId}
          module="devedores"
          currentClosingDay={dashboard.period.closingDay}
          onClose={() => setShowSettings(false)}
          onSaved={() => { setShowSettings(false); load(); }}
        />
      )}
    </div>
  );
}
