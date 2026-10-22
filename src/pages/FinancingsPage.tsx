import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { FinancingKind, FinancingsOverview } from "../api/types";
import { FinancingFormModal } from "../components/FinancingFormModal";
import { BankIcon, ChevronRightIcon, PlusIcon } from "../components/icons";
import { formatCurrency, formatDate } from "../utils/format";

const KIND_LABEL: Record<FinancingKind, string> = { IMOVEL: "Imóvel", VEICULO: "Veículo", OUTRO: "Financiamento" };

export function FinancingsPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<FinancingsOverview | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<FinancingsOverview>("/financings");
    setOverview(res.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!overview) {
    return <p className="pt-10 text-center text-ink-soft">Carregando…</p>;
  }

  return (
    <div className="pt-2">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Financiamentos</h1>
        <p className="mt-1 text-ink-soft">Entrada, parcelas, juros e amortizações num lugar só.</p>
      </div>

      <div className="card mb-4">
        <p className="text-sm text-ink-soft">Quanto falta pagar (saldo devedor)</p>
        <p className="num mt-1 text-3xl text-ink">{formatCurrency(overview.totalOutstanding)}</p>
      </div>

      {overview.financings.length === 0 ? (
        <div className="card text-center text-ink-soft">Você ainda não tem nenhum financiamento cadastrado.</div>
      ) : (
        <div className="space-y-3">
          {overview.financings.map((f) => (
            <button
              key={f.id}
              onClick={() => navigate(`/financiamentos/${f.id}`)}
              className="card block w-full text-left transition-colors hover:bg-surface-soft active:bg-surface-soft"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <BankIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold text-ink">{f.name}</span>
                    <span className="block text-xs text-ink-soft">
                      {KIND_LABEL[f.kind]} · {f.memberCount > 1 ? `${f.memberCount} pessoas` : "só você"}
                    </span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className="num text-[15px] text-ink">{formatCurrency(f.outstandingBalance)}</span>
                  <ChevronRightIcon className="h-4 w-4 text-ink-soft" />
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-soft">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.min(100, f.progressPercent)}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-ink-soft">
                <span>{f.paidInstallments} de {f.totalInstallments} parcelas · {f.progressPercent.toLocaleString("pt-BR")}% quitado</span>
                {f.nextPayment !== null && f.nextDueDate && (
                  <span className="num">próxima {formatCurrency(f.nextPayment)} · {formatDate(f.nextDueDate)}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 w-full gap-1.5">
        <PlusIcon className="h-4 w-4" /> Novo financiamento
      </button>

      {showCreate && (
        <FinancingFormModal
          onClose={() => setShowCreate(false)}
          onSaved={(detail) => { setShowCreate(false); navigate(`/financiamentos/${detail.id}`); }}
        />
      )}
    </div>
  );
}
