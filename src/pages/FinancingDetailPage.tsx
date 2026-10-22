import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, extractErrorMessage } from "../api/client";
import {
  FinancingCost,
  FinancingCostKind,
  FinancingDetail,
  FinancingScheduleRow,
  InstallmentStatus,
} from "../api/types";
import { AmortizationModal } from "../components/AmortizationModal";
import { EditFinancingCostModal } from "../components/EditFinancingCostModal";
import { FinancingCostModal } from "../components/FinancingCostModal";
import { FinancingFormModal } from "../components/FinancingFormModal";
import { FinancingPaymentModal } from "../components/FinancingPaymentModal";
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon, PencilIcon, PlusIcon, TrashIcon } from "../components/icons";
import { formatCurrency, formatDate, formatDateLong, formatMonthYear, formatPercent } from "../utils/format";

const STATUS_PILL: Record<InstallmentStatus, { label: string; className: string } | null> = {
  PAID: { label: "Paga", className: "bg-success-soft text-success" },
  OVERDUE: { label: "Atrasada", className: "bg-danger-soft text-danger" },
  OPEN: null,
};

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
  return (
    <div>
      <p className="text-xs text-ink-soft">{label}</p>
      <p className={`num mt-0.5 text-[15px] ${tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-ink"}`}>{value}</p>
    </div>
  );
}

export function FinancingDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [f, setF] = useState<FinancingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [costModal, setCostModal] = useState<FinancingCostKind | null>(null);
  const [editingCost, setEditingCost] = useState<FinancingCost | null>(null);
  const [showPayments, setShowPayments] = useState(false);
  const [showAmort, setShowAmort] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const initialized = useRef(false);

  const apply = useCallback((detail: FinancingDetail) => {
    setF(detail);
    if (!initialized.current) {
      initialized.current = true;
      const focus = detail.schedule.find((r) => r.status !== "PAID") ?? detail.schedule[detail.schedule.length - 1];
      if (focus) setExpandedYears(new Set([focus.dueDate.slice(0, 4)]));
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await api.get<FinancingDetail>(`/financings/${id}`);
      apply(res.data);
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível abrir esse financiamento."));
    }
  }, [id, apply]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(request: () => Promise<{ data: FinancingDetail }>) {
    setError(null);
    try {
      apply((await request()).data);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  function handleDeleteCost(c: FinancingCost) {
    if (!f) return;
    const remove = (wholeGroup: boolean) =>
      run(() => api.delete(`/financings/${f.id}/costs/${c.id}`, { params: { wholeGroup } }));
    if (c.groupId) {
      if (window.confirm(`Excluir só a parcela ${c.itemNumber}/${c.itemTotal} da entrada?\n\nOK = só essa · Cancelar = ver outra opção`)) {
        remove(false);
      } else if (window.confirm("Excluir TODAS as parcelas dessa entrada parcelada?")) {
        remove(true);
      }
      return;
    }
    if (window.confirm(`Excluir "${c.description}"?`)) remove(false);
  }

  async function handleDelete() {
    if (!f || !window.confirm(`Excluir "${f.name}"? Isso apaga tudo (entrada, pagamentos, amortizações) para todos que participam.`)) return;
    try {
      await api.delete(`/financings/${f.id}`);
      navigate("/financiamentos", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível excluir."));
    }
  }

  const years = useMemo(() => {
    const map = new Map<string, FinancingScheduleRow[]>();
    for (const row of f?.schedule ?? []) {
      const year = row.dueDate.slice(0, 4);
      map.set(year, [...(map.get(year) ?? []), row]);
    }
    return Array.from(map.entries());
  }, [f]);

  function toggle<T>(setter: (fn: (prev: Set<T>) => Set<T>) => void, key: T) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (!f) {
    return error ? (
      <div className="pt-2">
        <Link to="/financiamentos" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
          <ArrowLeftIcon className="h-4 w-4" /> Financiamentos
        </Link>
        <p className="text-sm text-danger">{error}</p>
      </div>
    ) : (
      <p className="pt-10 text-center text-ink-soft">Carregando…</p>
    );
  }

  const t = f.totals;
  const nextRow = f.schedule.find((r) => r.status !== "PAID");
  const entradas = f.costs.filter((c) => c.kind === "ENTRADA");
  const taxas = f.costs.filter((c) => c.kind === "TAXA");
  const quitado = t.outstandingBalance <= 0;

  function costList(items: FinancingCost[], kind: FinancingCostKind, title: string, total: number, paid: number) {
    return (
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          <span className="num text-xs text-ink-soft">{formatCurrency(paid)} de {formatCurrency(total)}</span>
        </div>
        {items.length === 0 ? (
          <p className="py-2 text-sm text-ink-soft">Nada lançado.</p>
        ) : (
          <ul className="divide-y divide-line/70">
            {items.map((c) => {
              const isPaid = c.paidDate !== null;
              return (
                <li key={c.id} className="flex items-center gap-2.5 py-2.5">
                  <button
                    onClick={() => run(() => api.put(`/financings/${f!.id}/costs/${c.id}/pay`, { paid: !isPaid }))}
                    aria-label={isPaid ? "Desmarcar como pago" : "Marcar como pago"}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isPaid ? "border-success bg-success text-white" : "border-line text-transparent"
                    }`}
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-ink">
                      {c.description}
                      {c.itemTotal && <span className="pill ml-1.5 bg-accent-soft text-accent">{c.itemNumber}/{c.itemTotal}</span>}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {isPaid ? `Pago em ${formatDate(c.paidDate!)}${c.paidByName ? ` por ${c.paidByName}` : ""}` : c.dueDate ? `Vence ${formatDate(c.dueDate)}` : "Sem vencimento"}
                    </p>
                  </div>
                  <span className="num shrink-0 text-[15px] text-ink">{formatCurrency(c.amount)}</span>
                  <button onClick={() => setEditingCost(c)} className="icon-btn h-8 w-8" aria-label={`Editar ${c.description}`}>
                    <PencilIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCost(c)}
                    className="icon-btn h-8 w-8 text-danger"
                    aria-label={`Excluir ${c.description}`}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <button onClick={() => setCostModal(kind)} className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-accent">
          <PlusIcon className="h-3.5 w-3.5" /> {kind === "ENTRADA" ? "Adicionar pagamento de entrada" : "Adicionar taxa"}
        </button>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <Link to="/financiamentos" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Financiamentos
      </Link>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-extrabold tracking-tight text-ink">{f.name}</h1>
          <p className="mt-1 text-ink-soft">Bem de {formatCurrency(f.assetValue)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button onClick={() => setShowEdit(true)} className="icon-btn" aria-label="Editar financiamento"><PencilIcon className="h-4 w-4" /></button>
          <button onClick={handleDelete} className="icon-btn text-danger" aria-label="Excluir financiamento"><TrashIcon className="h-4 w-4" /></button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      {/* Saldo e progresso */}
      <div className="card mb-4">
        <p className="text-sm text-ink-soft">{quitado ? "Financiamento quitado" : "Saldo devedor"}</p>
        <p className="num mt-1 text-3xl text-ink">{formatCurrency(t.outstandingBalance)}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-soft">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.min(100, t.progressPercent)}%` }} />
        </div>
        <p className="mt-2 text-xs text-ink-soft">
          {t.paidInstallments} de {t.totalInstallments} parcelas pagas · {t.progressPercent.toLocaleString("pt-BR")}% quitado
        </p>
        {nextRow && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line/70 pt-4">
            <Stat label={`Próxima parcela (#${nextRow.number})`} value={formatCurrency(nextRow.payment)} />
            <Stat label="Vence em" value={formatDateLong(nextRow.dueDate)} />
          </div>
        )}
      </div>

      {/* Resumo */}
      <div className="card mb-4">
        <h2 className="mb-3 text-base font-bold text-ink">Resumo</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Stat label="Custo total" value={formatCurrency(t.totalCost)} />
          <Stat label="Juros previstos" value={formatCurrency(t.projectedInterest)} tone="danger" />
          <Stat label="Entrada paga" value={`${formatCurrency(t.entradaPaid)} de ${formatCurrency(t.entradaTotal)}`} />
          <Stat label="Taxas pagas" value={`${formatCurrency(t.taxasPaid)} de ${formatCurrency(t.taxasTotal)}`} />
          <Stat label="Parcelas pagas" value={formatCurrency(t.paidInstallmentsAmount)} />
          <Stat label="Falta pagar (parcelas)" value={formatCurrency(t.remainingPayments)} />
          {t.endDate && <Stat label="Termina em" value={formatMonthYear(t.endDate)} />}
          {t.interestSaved > 0 && <Stat label="Juros economizados" value={formatCurrency(t.interestSaved)} tone="success" />}
        </div>
      </div>

      {/* Entrada e taxas */}
      <div className="card mb-4 space-y-5">
        <h2 className="text-base font-bold text-ink">Entrada e taxas</h2>
        {costList(entradas, "ENTRADA", "Entrada", t.entradaTotal, t.entradaPaid)}
        {costList(taxas, "TAXA", "Taxas extras", t.taxasTotal, t.taxasPaid)}
      </div>

      {/* Parcelas */}
      <div className="card mb-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-ink">Parcelas</h2>
          {nextRow && (
            <button onClick={() => setShowPayments(true)} className="text-sm font-medium text-accent">Marcar várias como pagas</button>
          )}
        </div>
        {years.length === 0 && <p className="py-4 text-sm text-ink-soft">Sem parcelas restantes.</p>}
        <div className="divide-y divide-line/70">
          {years.map(([year, rows]) => {
            const open = expandedYears.has(year);
            const paidInYear = rows.filter((r) => r.status === "PAID").length;
            return (
              <div key={year}>
                <button
                  onClick={() => toggle(setExpandedYears, year)}
                  aria-expanded={open}
                  className="list-row -mx-1 w-[calc(100%+0.5rem)] rounded-2xl px-1 text-left transition-colors hover:bg-surface-soft"
                >
                  <span className="text-[15px] font-semibold text-ink">{year}</span>
                  <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                    {paidInYear}/{rows.length} pagas
                    <ChevronRightIcon className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
                  </span>
                </button>
                {open && (
                  <ul className="mb-2 space-y-1 rounded-2xl bg-surface-soft p-2">
                    {rows.map((r) => {
                      const pill = STATUS_PILL[r.status];
                      const expanded = expandedRows.has(r.number);
                      const isNext = nextRow?.number === r.number;
                      return (
                        <li key={r.number} className="rounded-xl">
                          <button
                            onClick={() => toggle(setExpandedRows, r.number)}
                            className="list-row w-full rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface"
                          >
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-ink">
                                #{r.number} · {formatDate(r.dueDate)}
                                {isNext && <span className="pill ml-1.5 bg-accent-soft text-accent">Próxima</span>}
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              {pill && <span className={`pill ${pill.className}`}>{pill.label}</span>}
                              <span className="num text-sm text-ink">{formatCurrency(r.paidAmount ?? r.payment)}</span>
                            </span>
                          </button>
                          {expanded && (
                            <div className="space-y-2 px-2 pb-2">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-surface p-2.5">
                                <Stat label="Juros" value={formatCurrency(r.interest)} />
                                <Stat label="Amortização" value={formatCurrency(r.amortization)} />
                                {r.fees > 0 && <Stat label="Seguros e taxas" value={formatCurrency(r.fees)} />}
                                {r.correction > 0 && <Stat label="Correção do saldo" value={formatCurrency(r.correction)} />}
                                <Stat label="Saldo depois" value={formatCurrency(r.closingBalance)} />
                                {r.status === "PAID" && r.paidDate && (
                                  <Stat label="Paga em" value={`${formatDate(r.paidDate)}${r.paidByName ? ` · ${r.paidByName}` : ""}`} />
                                )}
                              </div>
                              {r.status === "PAID" ? (
                                <button
                                  onClick={() => run(() => api.delete(`/financings/${f.id}/payments/${r.number}`))}
                                  className="text-sm font-medium text-danger"
                                >
                                  Desfazer pagamento
                                </button>
                              ) : (
                                <button
                                  onClick={() => run(() => api.post(`/financings/${f.id}/payments`, { fromInstallment: r.number, toInstallment: r.number }))}
                                  className="btn-primary w-full py-2 text-sm"
                                >
                                  Marcar como paga
                                </button>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Amortização antecipada */}
      <div className="card mb-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-ink">Amortização antecipada</h2>
          {!quitado && <button onClick={() => setShowAmort(true)} className="text-sm font-medium text-accent">Simular / amortizar</button>}
        </div>
        {f.amortizations.length === 0 ? (
          <p className="py-2 text-sm text-ink-soft">
            Pagar um valor a mais reduz o prazo ou a parcela e corta juros. Simule antes de decidir.
          </p>
        ) : (
          <ul className="divide-y divide-line/70">
            {f.amortizations.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="num text-[15px] font-medium text-ink">{formatCurrency(a.amount)}</p>
                  <p className="text-xs text-ink-soft">
                    {a.mode === "TERM" ? "Reduziu o prazo" : "Reduziu a parcela"} · após a parcela {a.afterInstallment} · {formatDate(a.paidDate)}
                    {a.paidByName ? ` · ${a.paidByName}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => window.confirm("Remover essa amortização? O cronograma volta a como era antes dela.") && run(() => api.delete(`/financings/${f.id}/amortizations/${a.id}`))}
                  className="icon-btn h-8 w-8 shrink-0 text-danger"
                  aria-label="Remover amortização"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {t.interestSaved > 0 && (
          <p className="mt-2 text-xs text-ink-soft">
            Com as amortizações: {t.originalInstallments - t.totalInstallments} parcelas a menos e {formatCurrency(t.interestSaved)} de juros economizados.
          </p>
        )}
      </div>

      {/* Contrato */}
      <div className="card mb-4">
        <h2 className="mb-3 text-base font-bold text-ink">Contrato</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Stat label="Valor financiado" value={formatCurrency(f.financedAmount)} />
          <Stat label="Sistema" value={f.system === "SAC" ? "SAC (parcela cai)" : "Price (parcela fixa)"} />
          <Stat label="Taxa informada" value={`${formatPercent(f.interestRatePercent)} ${f.ratePeriod === "ANNUAL" ? "ao ano" : "ao mês"}`} />
          <Stat label="Taxa mensal usada" value={`${formatPercent(f.monthlyRatePercent)} ao mês`} />
          <Stat label="Prazo" value={`${f.termMonths} meses`} />
          <Stat label="1ª parcela" value={formatDateLong(f.firstDueDate)} />
          {f.monthlyFees > 0 && <Stat label="Seguros e taxas" value={`${formatCurrency(f.monthlyFees)} por mês`} />}
          {f.correctionMonthlyPercent > 0 && <Stat label="Correção (TR est.)" value={`${formatPercent(f.correctionMonthlyPercent)} ao mês`} />}
        </div>
      </div>

      {costModal && (
        <FinancingCostModal
          financingId={f.id}
          kind={costModal}
          onClose={() => setCostModal(null)}
          onSaved={(d) => { setCostModal(null); apply(d); }}
        />
      )}
      {editingCost && (
        <EditFinancingCostModal
          financingId={f.id}
          cost={editingCost}
          onClose={() => setEditingCost(null)}
          onSaved={(d) => { setEditingCost(null); apply(d); }}
        />
      )}
      {showPayments && nextRow && (
        <FinancingPaymentModal
          financingId={f.id}
          totalInstallments={t.totalInstallments}
          nextNumber={nextRow.number}
          onClose={() => setShowPayments(false)}
          onSaved={(d) => { setShowPayments(false); apply(d); }}
        />
      )}
      {showAmort && (
        <AmortizationModal
          financingId={f.id}
          balance={t.outstandingBalance}
          onClose={() => setShowAmort(false)}
          onSaved={(d) => { setShowAmort(false); apply(d); }}
        />
      )}
      {showEdit && (
        <FinancingFormModal
          financing={f}
          onClose={() => setShowEdit(false)}
          onSaved={(d) => { setShowEdit(false); apply(d); }}
        />
      )}
    </div>
  );
}
