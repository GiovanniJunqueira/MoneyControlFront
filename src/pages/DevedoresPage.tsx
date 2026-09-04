import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { DebtorSummary } from "../api/types";
import { AddDebtorModal } from "../components/AddDebtorModal";
import { PlusIcon, ChevronRightIcon } from "../components/icons";
import { formatCurrency } from "../utils/format";

export function DevedoresPage() {
  const [debtors, setDebtors] = useState<DebtorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get<DebtorSummary[]>("/debtors");
    setDebtors(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalPendente = debtors.reduce((sum, d) => sum + d.totalDevido, 0);

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

      <div className="card mb-4">
        <p className="text-sm text-ink-soft">Total pendente</p>
        <p className="num mt-1 text-2xl text-danger">{formatCurrency(totalPendente)}</p>
      </div>

      <div className="card">
        {loading ? (
          <p className="py-2 text-sm text-ink-soft">Carregando…</p>
        ) : debtors.length === 0 ? (
          <p className="py-6 text-sm text-ink-soft">Ninguém te deve nada por aqui ainda.</p>
        ) : (
          <ul className="divide-y divide-line/70">
            {debtors.map((d) => (
              <li key={d.id}>
                <Link to={`/devedores/${d.id}`} className="list-row -mx-1 rounded-2xl px-1 transition-colors hover:bg-surface-soft">
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

      {showAdd && <AddDebtorModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}
