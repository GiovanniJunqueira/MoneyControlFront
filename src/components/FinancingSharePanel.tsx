import { useState } from "react";
import { FinancingDetail, FinancingHistoryEntry } from "../api/types";
import { ChevronRightIcon } from "./icons";
import { formatCurrency, formatDate } from "../utils/format";

interface Props {
  financing: FinancingDetail;
  onLeave: () => void;
}

const TYPE_LABEL: Record<FinancingHistoryEntry["type"], string> = {
  COST: "Entrada/taxa",
  PAYMENT: "Parcela",
  AMORTIZATION: "Amortização",
};

/** Código de convite + quem participa + quanto cada um já pagou (só do que foi dividido) + histórico de pagamentos. */
export function FinancingSharePanel({ financing, onLeave }: Props) {
  const [copied, setCopied] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const shared = financing.members.length > 1;
  const attributed = financing.members.reduce((sum, m) => sum + m.contributed, 0);
  const totalPaid = attributed + financing.jointPaid;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(financing.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard pode não estar disponível - o código continua visível pra copiar na mão
    }
  }

  return (
    <div className="card mb-4">
      <h2 className="mb-1 text-base font-bold text-ink">{shared ? "Compartilhado" : "Compartilhar"}</h2>
      <p className="mb-3 text-sm text-ink-soft">
        {shared
          ? "Todos veem e editam o mesmo financiamento. Ao lançar um pagamento, vocês podem dividir quem pagou quanto - ou lançar tudo junto."
          : "Passe o código pra outra pessoa entrar com ele em Financiamentos › Entrar com código."}
      </p>

      <button
        onClick={copyCode}
        className="mb-4 flex w-full items-center justify-between gap-3 rounded-2xl bg-surface-soft px-4 py-3 text-left"
        aria-label="Copiar código do financiamento"
      >
        <span>
          <span className="block text-xs text-ink-soft">Código</span>
          <span className="num block text-2xl tracking-[0.25em] text-ink">{financing.code}</span>
        </span>
        <span className="text-sm font-medium text-accent">{copied ? "Copiado!" : "Copiar"}</span>
      </button>

      {shared && (
        <div className="mb-4">
          <p className="mb-1 text-sm font-semibold text-ink">Quanto cada um pagou</p>
          <ul className="divide-y divide-line/70">
            {financing.members.map((m) => {
              const pct = totalPaid > 0 ? Math.round((m.contributed / totalPaid) * 100) : 0;
              return (
                <li key={m.userId} className="py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[15px] text-ink">{m.name}{m.isYou ? " (você)" : ""}</span>
                    <span className="num text-[15px] text-ink">{formatCurrency(m.contributed)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-soft">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
            {financing.jointPaid > 0 && (
              <li className="flex items-center justify-between gap-2 py-2.5">
                <span className="text-[15px] text-ink-soft">Lançado tudo junto</span>
                <span className="num text-[15px] text-ink-soft">{formatCurrency(financing.jointPaid)}</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {financing.history.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            aria-expanded={historyOpen}
            className="flex w-full items-center justify-between gap-2 text-left"
          >
            <span className="text-sm font-semibold text-ink">Histórico de pagamentos ({financing.history.length})</span>
            <ChevronRightIcon className={`h-4 w-4 text-ink-soft transition-transform ${historyOpen ? "rotate-90" : ""}`} />
          </button>
          {historyOpen && (
            <ul className="mt-2 divide-y divide-line/70 rounded-2xl bg-surface-soft px-3">
              {financing.history.map((h, i) => (
                <li key={i} className="py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-sm font-medium text-ink">{h.label}</span>
                    <span className="num shrink-0 text-sm text-ink">{formatCurrency(h.amount)}</span>
                  </div>
                  <p className="text-xs text-ink-soft">
                    {TYPE_LABEL[h.type]} · {formatDate(h.date)} ·{" "}
                    {h.payers.length > 0
                      ? h.payers.map((p) => `${p.name} ${formatCurrency(p.amount)}`).join(" · ")
                      : "tudo junto"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button onClick={onLeave} className="text-sm font-medium text-danger">
        {shared ? "Sair desse financiamento" : "Excluir esse financiamento"}
      </button>
    </div>
  );
}
