import { useCallback, useEffect, useState } from "react";
import { api, extractErrorMessage } from "../api/client";
import { Investment, InvestmentProjection, InvestmentsOverview } from "../api/types";
import { InvestmentModal } from "../components/InvestmentModal";
import { InvestmentTransactionModal } from "../components/InvestmentTransactionModal";
import { ArrowsUpDownIcon, PencilIcon, PlusIcon, TrashIcon } from "../components/icons";
import { formatCurrency, formatPercent } from "../utils/format";

export function InvestmentsPage() {
  const [overview, setOverview] = useState<InvestmentsOverview | null>(null);
  const [projection, setProjection] = useState<InvestmentProjection | null>(null);
  const [months, setMonths] = useState("12");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [transacting, setTransacting] = useState<Investment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await api.get<InvestmentsOverview>("/investments");
    setOverview(res.data);
  }, []);

  const loadProjection = useCallback(async (m: string) => {
    const n = Number(m);
    if (!Number.isFinite(n) || n < 0) return;
    const res = await api.get<InvestmentProjection>("/investments/projection", { params: { months: n } });
    setProjection(res.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadProjection(months);
  }, [loadProjection, months]);

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Excluir "${name}"?`)) return;
    setError(null);
    try {
      await api.delete(`/investments/${id}`);
      load();
      loadProjection(months);
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível excluir esse investimento."));
    }
  }

  if (!overview) {
    return <p className="pt-10 text-center text-ink-soft">Carregando…</p>;
  }

  const projectedPositivo = (projection?.projectedYield ?? 0) >= 0;

  return (
    <div className="pt-2">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Investimentos</h1>
        <p className="mt-1 text-ink-soft">Quanto você tem guardado, e quanto isso deve render.</p>
      </div>

      <div className="card mb-4">
        <p className="text-sm text-ink-soft">Total investido</p>
        <p className="num mt-1 text-3xl text-ink">{formatCurrency(overview.totalInvested)}</p>
      </div>

      <div className="card mb-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink">Projeção</p>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              max="1200"
              className="field num w-20 py-1.5 text-center"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
            />
            <span className="text-sm text-ink-soft">meses</span>
          </div>
        </div>
        {projection && (
          <>
            <p className="num mt-3 text-2xl text-ink">{formatCurrency(projection.projectedTotal)}</p>
            <p className={`num text-sm ${projectedPositivo ? "text-success" : "text-danger"}`}>
              {projectedPositivo ? "+" : ""}
              {formatCurrency(projection.projectedYield)} de rendimento
            </p>
          </>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      {overview.investments.length === 0 ? (
        <div className="card text-center text-ink-soft">Você ainda não tem nenhum investimento cadastrado.</div>
      ) : (
        <div className="card">
          <ul className="divide-y divide-line/70">
            {overview.investments.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-ink">{inv.name}</p>
                  <p className="num text-xs text-ink-soft">
                    {formatCurrency(inv.amount)} · {formatPercent(inv.monthlyRatePercent)} ao mês
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => setTransacting(inv)} className="icon-btn h-8 w-8" aria-label={`Saque ou depósito em ${inv.name}`}>
                    <ArrowsUpDownIcon className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setEditing(inv)} className="icon-btn h-8 w-8" aria-label={`Editar ${inv.name}`}>
                    <PencilIcon className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(inv.id, inv.name)} className="icon-btn h-8 w-8 text-danger" aria-label={`Excluir ${inv.name}`}>
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 w-full gap-1.5">
        <PlusIcon className="h-4 w-4" /> Novo investimento
      </button>

      {showAdd && (
        <InvestmentModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); load(); loadProjection(months); }}
        />
      )}
      {editing && (
        <InvestmentModal
          investment={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); loadProjection(months); }}
        />
      )}
      {transacting && (
        <InvestmentTransactionModal
          investmentId={transacting.id}
          investmentName={transacting.name}
          onClose={() => setTransacting(null)}
          onSaved={() => { setTransacting(null); load(); loadProjection(months); }}
        />
      )}
    </div>
  );
}
