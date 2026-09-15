import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { Debt, DebtorDetail, DebtStatus } from "../api/types";
import { AddDebtModal } from "../components/AddDebtModal";
import { RegisterPaymentModal } from "../components/RegisterPaymentModal";
import { ArrowLeftIcon, CheckIcon, PlusIcon, TrashIcon } from "../components/icons";
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
  const { tabId = "", id } = useParams<{ tabId: string; id: string }>();
  const [debtor, setDebtor] = useState<DebtorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [settling, setSettling] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const res = await api.get<DebtorDetail>(`/tabs/${tabId}/debtors/${id}`);
    setDebtor(res.data);
    setLoading(false);
  }, [tabId, id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDeleteDebt(debtId: string) {
    await api.delete(`/tabs/${tabId}/debts/${debtId}`);
    load();
  }

  function toggleSelect(debtId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(debtId)) next.delete(debtId);
      else next.add(debtId);
      return next;
    });
  }

  function cancelSelecting() {
    setSelecting(false);
    setSelectedIds(new Set());
  }

  const selectedTotal = useMemo(() => {
    if (!debtor) return 0;
    return debtor.debts
      .filter((d) => selectedIds.has(d.id))
      .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  }, [debtor, selectedIds]);

  async function handleQuitarSelecionadas() {
    if (!debtor || selectedIds.size === 0) return;
    setSettling(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((debtId) => {
          const debt = debtor.debts.find((d) => d.id === debtId);
          if (!debt) return Promise.resolve();
          const restante = debt.amount - debt.paidAmount;
          return api.post(`/tabs/${tabId}/debts/${debtId}/payments`, { amount: restante });
        })
      );
      cancelSelecting();
      load();
    } finally {
      setSettling(false);
    }
  }

  if (loading && !debtor) return <p className="text-ink-soft">Carregando…</p>;
  if (!debtor) return null;

  const totalDevido = debtor.debts.reduce((sum, d) => sum + (d.status === "quitado" ? 0 : d.amount - d.paidAmount), 0);
  const temSelecionaveis = debtor.debts.some((d) => d.status !== "quitado");

  return (
    <div>
      <Link to={`/tabs/${tabId}/devedores`} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
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
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Dívidas</h2>
          {temSelecionaveis && (
            <button
              onClick={() => (selecting ? cancelSelecting() : setSelecting(true))}
              className="text-sm font-medium text-accent"
            >
              {selecting ? "Cancelar" : "Selecionar"}
            </button>
          )}
        </div>
        {debtor.debts.length === 0 ? (
          <p className="py-6 text-sm text-ink-soft">Nenhuma dívida lançada ainda.</p>
        ) : (
          <ul className="divide-y divide-line/70">
            {debtor.debts.map((d) => {
              const selectable = d.status !== "quitado";
              const checked = selectedIds.has(d.id);
              return (
                <li key={d.id} className="list-row group items-start">
                  {selecting && selectable && (
                    <button
                      onClick={() => toggleSelect(d.id)}
                      aria-label={checked ? "Desmarcar dívida" : "Marcar dívida"}
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        checked ? "border-accent bg-accent text-white" : "border-line text-transparent"
                      }`}
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {selecting && !selectable && <span className="h-6 w-6 shrink-0" />}
                  <button
                    disabled={!selecting || !selectable}
                    onClick={() => selectable && toggleSelect(d.id)}
                    className="min-w-0 flex-1 text-left disabled:cursor-default"
                  >
                    <p className="text-[15px] font-medium text-ink">{d.reason}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-xs text-ink-soft">{formatDate(d.date)}</span>
                      <span className={`pill ${STATUS_CLASS[d.status]}`}>{STATUS_LABEL[d.status]}</span>
                    </div>
                  </button>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="num text-[15px] text-ink">{formatCurrency(d.amount)}</span>
                    {!selecting && d.status !== "quitado" && (
                      <button onClick={() => setPayingDebt(d)} className="text-xs font-medium text-success hover:underline">
                        Registrar pagamento
                      </button>
                    )}
                    {!selecting && (
                      <button
                        onClick={() => handleDeleteDebt(d.id)}
                        className="text-ink-soft opacity-60 transition-opacity hover:text-danger active:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        aria-label="Excluir dívida"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {selecting && selectedIds.size > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line/70 pt-4">
            <span className="text-sm text-ink-soft">
              {selectedIds.size} {selectedIds.size === 1 ? "selecionada" : "selecionadas"} · <span className="num">{formatCurrency(selectedTotal)}</span>
            </span>
            <button onClick={handleQuitarSelecionadas} disabled={settling} className="btn-primary">
              {settling ? "Quitando…" : "Quitar selecionadas"}
            </button>
          </div>
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
        <AddDebtModal tabId={tabId} debtorId={debtor.id} onClose={() => setShowAddDebt(false)} onSaved={() => { setShowAddDebt(false); load(); }} />
      )}
      {payingDebt && (
        <RegisterPaymentModal tabId={tabId} debt={payingDebt} onClose={() => setPayingDebt(null)} onSaved={() => { setPayingDebt(null); load(); }} />
      )}
    </div>
  );
}
