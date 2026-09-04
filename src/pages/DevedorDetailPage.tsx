import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { Debt, DebtorDetail, DebtStatus } from "../api/types";
import { AddDebtModal } from "../components/AddDebtModal";
import { RegisterPaymentModal } from "../components/RegisterPaymentModal";
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "../components/icons";
import { formatCurrency, formatDate } from "../utils/format";

const STATUS_LABEL: Record<DebtStatus, string> = {
  pendente: "Pendente",
  parcial: "Parcial",
  quitado: "Quitado",
};

const STATUS_CLASS: Record<DebtStatus, string> = {
  pendente: "bg-danger-soft text-danger",
  parcial: "bg-warning-soft text-warning",
  quitado: "bg-success-soft text-success",
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
      <Link to="/devedores" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Devedores
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">{debtor.name}</h1>
          {debtor.notes && <p className="mt-1 text-ink-soft">{debtor.notes}</p>}
        </div>
        <button onClick={() => setShowAddDebt(true)} className="btn-primary hidden gap-1.5 md:inline-flex">
          <PlusIcon className="h-4 w-4" /> Nova dívida
        </button>
      </div>

      <div className="card mb-4">
        <p className="text-sm text-ink-soft">Saldo devedor</p>
        <p className="num mt-1 text-2xl text-danger">{formatCurrency(totalDevido)}</p>
      </div>

      <div className="card">
        {debtor.debts.length === 0 ? (
          <p className="py-6 text-sm text-ink-soft">Nenhuma dívida lançada ainda.</p>
        ) : (
          <ul className="divide-y divide-line/70">
            {debtor.debts.map((d) => (
              <li key={d.id} className="list-row group items-start">
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-ink">{d.reason}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs text-ink-soft">{formatDate(d.date)}</span>
                    <span className={`pill ${STATUS_CLASS[d.status]}`}>{STATUS_LABEL[d.status]}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="num text-[15px] text-ink">{formatCurrency(d.amount)}</span>
                  {d.status !== "quitado" && (
                    <button onClick={() => setPayingDebt(d)} className="text-xs font-medium text-success hover:underline">
                      Registrar pagamento
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDebt(d.id)}
                    className="text-ink-soft opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                    aria-label="Excluir dívida"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fixed bottom-20 right-4 md:hidden">
        <button
          onClick={() => setShowAddDebt(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30"
          aria-label="Nova dívida"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
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
