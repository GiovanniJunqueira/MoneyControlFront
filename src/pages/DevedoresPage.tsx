import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { DebtorSummary } from "../api/types";
import { AddDebtorModal } from "../components/AddDebtorModal";
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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-ink">Devedores</h1>
          <p className="mt-1 text-ink-soft">Quem te deve e quanto.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary hidden md:inline-flex">+ Nova pessoa</button>
      </div>

      <div className="border-b border-rule py-6">
        <p className="text-sm text-ink-soft">Total pendente</p>
        <p className="num mt-1 text-2xl text-ledger-brick">{formatCurrency(totalPendente)}</p>
      </div>

      <div className="py-6">
        {loading ? (
          <p className="text-ink-soft">Carregando…</p>
        ) : debtors.length === 0 ? (
          <p className="py-6 text-sm text-ink-soft">Ninguém te deve nada por aqui ainda.</p>
        ) : (
          <ul>
            {debtors.map((d) => (
              <li key={d.id}>
                <Link to={`/devedores/${d.id}`} className="ledger-row hover:bg-paper-raised">
                  <div>
                    <p className="text-sm text-ink">{d.name}</p>
                    <p className="text-xs text-ink-soft">
                      {d.quantidadeDividas} {d.quantidadeDividas === 1 ? "dívida em aberto" : "dívidas em aberto"}
                    </p>
                  </div>
                  <span className={`num text-sm ${d.totalDevido > 0 ? "text-ledger-brick" : "text-ledger-green"}`}>
                    {formatCurrency(d.totalDevido)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fixed bottom-16 right-4 md:hidden">
        <button onClick={() => setShowAdd(true)} className="btn-primary shadow-md">+ Pessoa</button>
      </div>

      {showAdd && <AddDebtorModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}
