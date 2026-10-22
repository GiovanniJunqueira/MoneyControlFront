import { FinancingMember, FinancingPayer, FinancingPayerInput } from "../api/types";
import { formatCurrency } from "../utils/format";

/** AMOUNT = cada pessoa em R$ (soma o total do pagamento); PERCENT = em % (soma 100) - usado quando são várias parcelas de uma vez. */
export type PayerMode = "AMOUNT" | "PERCENT";

export interface PayerDraft {
  enabled: boolean;
  values: Record<string, string>;
}

export function emptyPayerDraft(): PayerDraft {
  return { enabled: false, values: {} };
}

/** Rascunho pré-preenchido a partir de uma divisão que já existe (pra editar quem pagou). */
export function draftFromPayers(payers: FinancingPayer[]): PayerDraft {
  if (payers.length === 0) return emptyPayerDraft();
  const values: Record<string, string> = {};
  for (const p of payers) values[p.userId] = String(p.amount);
  return { enabled: true, values };
}

function sumOf(draft: PayerDraft, members: FinancingMember[]): number {
  return members.reduce((sum, m) => sum + (Number(draft.values[m.userId]) || 0), 0);
}

/** Desligado = undefined ("tudo junto"). Ligado = a lista pronta pra API, ou o erro a mostrar. */
export function buildPayers(
  draft: PayerDraft,
  members: FinancingMember[],
  mode: PayerMode,
  total: number | null
): { payers?: FinancingPayerInput[]; error?: string } {
  if (!draft.enabled || members.length < 2) return {};
  const filled = members.filter((m) => (Number(draft.values[m.userId]) || 0) > 0);
  if (filled.length === 0) return { error: "Informe quanto cada pessoa pagou, ou desligue a divisão." };
  const sum = sumOf(draft, members);
  if (mode === "PERCENT" && Math.abs(sum - 100) > 0.01) return { error: `As porcentagens somam ${sum.toLocaleString("pt-BR")}% - precisam somar 100%.` };
  if (mode === "AMOUNT" && total !== null && Math.abs(sum - total) > 0.01) {
    return { error: `Os valores somam ${formatCurrency(sum)} - precisam somar ${formatCurrency(total)}.` };
  }
  return {
    payers: filled.map((m) =>
      mode === "PERCENT"
        ? { userId: m.userId, percent: Number(draft.values[m.userId]) }
        : { userId: m.userId, amount: Number(draft.values[m.userId]) }
    ),
  };
}

interface Props {
  members: FinancingMember[];
  draft: PayerDraft;
  onChange: (draft: PayerDraft) => void;
  mode: PayerMode;
  /** Total do pagamento (só no modo AMOUNT). */
  total: number | null;
}

/**
 * "Quem pagou?" - totalmente opcional. Desligado (padrão) = lançado tudo junto, sem atribuir a ninguém.
 * Só aparece quando o financiamento tem 2+ pessoas.
 */
export function PayerSplit({ members, draft, onChange, mode, total }: Props) {
  if (members.length < 2) return null;

  const sum = sumOf(draft, members);
  const target = mode === "PERCENT" ? 100 : total;
  const ok = target !== null && Math.abs(sum - target) <= 0.01;
  const unit = mode === "PERCENT" ? "%" : "R$";

  function splitEqually() {
    const n = members.length;
    const base = target !== null ? target : 0;
    const each = Math.floor((base / n) * 100) / 100;
    const values: Record<string, string> = {};
    let assigned = 0;
    members.forEach((m, i) => {
      const v = i === n - 1 ? Math.round((base - assigned) * 100) / 100 : each;
      assigned += v;
      values[m.userId] = String(v);
    });
    onChange({ enabled: true, values });
  }

  return (
    <div className="rounded-2xl bg-surface-soft p-3">
      <label className="flex items-start gap-2.5">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded"
          checked={draft.enabled}
          onChange={(e) => onChange({ ...draft, enabled: e.target.checked })}
        />
        <span>
          <span className="block text-sm font-medium text-ink">Dividir quem pagou</span>
          <span className="block text-xs text-ink-soft">Opcional. Desligado, fica lançado tudo junto, sem atribuir a ninguém.</span>
        </span>
      </label>

      {draft.enabled && (
        <div className="mt-3 space-y-2.5">
          {members.map((m) => (
            <div key={m.userId} className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-sm text-ink">{m.name}{m.isYou ? " (você)" : ""}</span>
              <div className="flex w-32 shrink-0 items-center gap-1.5">
                <span className="text-xs text-ink-soft">{unit}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  aria-label={`${m.name} pagou`}
                  className="field num py-1.5"
                  value={draft.values[m.userId] ?? ""}
                  onChange={(e) => onChange({ ...draft, values: { ...draft.values, [m.userId]: e.target.value } })}
                />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className={`num text-xs ${ok ? "text-success" : "text-ink-soft"}`}>
              {mode === "PERCENT"
                ? `${sum.toLocaleString("pt-BR")}% de 100%`
                : `${formatCurrency(sum)}${total !== null ? ` de ${formatCurrency(total)}` : ""}`}
            </span>
            {target !== null && target > 0 && (
              <button type="button" onClick={splitEqually} className="pill bg-accent-soft text-accent">Dividir igualmente</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
