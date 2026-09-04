import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { Debt, DebtorDetail, DebtStatus } from "../api/types";
import { AddDebtModal } from "../components/AddDebtModal";
import { RegisterPaymentModal } from "../components/RegisterPaymentModal";
import { formatCurrency, formatDate } from "../utils/format";

const STATUS_LABEL: Record<DebtStatus, string> = {
  pendente: "Pendente",
  parcial: "Parcial",
  quitado: "Quitado",
};

const STATUS_CLASS: Record<DebtStatus, string> = {
  pendente: "bg-ledger-brick-soft text-ledger-brick",
  parcial: "bg-ledger-amber-soft text-ledger-amber",
  quitado: "bg-ledger-green-soft text-ledger-green",
};

export function DevedorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [debtor, setDebtor] = useState<DebtorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const res = await api.get<DebtorDetail>(`/debtors/${id}`);
    setDebtor(res.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDeleteDebt(debtId: string) {
    await api.delete(`/debts/${debtId}`);
    load();
  }

  if (loading && !debtor) return <p className="text-ink-soft">Carregando…</p>;
  if (!debtor) return null;

  const totalDevido = debtor.debts.reduce((sum, d) => sum + (d.status === "quitado" ? 0 : d.amount - d.paidAmount), 0);

  return (
    <div>
      <Link to="/devedores" className="mb-6 inline-block text-sm text-ink-soft hover:text-ink">← Devedores</Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-ink">{debtor.name}</h1>
          {debtor.notes && <p className="mt-1 text-ink-soft">{debtor.notes}</p>}
        </div>
        <button onClick={() => setShowAddDebt(true)} className="btn-primary hidden md:inline-flex">+ Nova dívida</button>
      </div>

      <div className="border-b border-rule py-6">
        <p className="text-sm text-ink-soft">Saldo devedor</p>
        <p className="num mt-1 text-2xl text-ledger-brick">{formatCurrency(totalDevido)}</p>
      </div>

      <div className="py-6">
        {debtor.debts.length === 0 ? (
          <p className="py-6 text-sm text-ink-soft">Nenhuma dívida lançada ainda.</p>
        ) : (
          <ul>
            {debtor.debts.map((d) => (
              <li key={d.id} className="ledger-row group items-start">
                <div className="min-w-0">
                  <p className="text-sm text-ink">{d.reason}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-ink-soft">{formatDate(d.date)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASS[d.status]}`}>{STATUS_LABEL[d.status]}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="num text-sm text-ink">{formatCurrency(d.amount)}</span>
                  {d.status !== "quitado" && (
                    <button onClick={() => setPayingDebt(d)} className="text-xs text-ledger-green hover:underline">
                      Registrar pagamento
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDebt(d.id)}
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

      <div className="fixed bottom-16 right-4 md:hidden">
        <button onClick={() => setShowAddDebt(true)} className="btn-primary shadow-md">+ Dívida</button>
      </div>

      {showAddDebt && debtor && (
        <AddDebtModal debtorId={debtor.id} onClose={() => setShowAddDebt(false)} onSaved={() => { setShowAddDebt(false); load(); }} />
      )}
      {payingDebt && (
        <RegisterPaymentModal debt={payingDebt} onClose={() => setPayingDebt(null)} onSaved={() => { setPayingDebt(null); load(); }} />
      )}
    </div>
  );
}
