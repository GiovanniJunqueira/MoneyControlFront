import { FormEvent, useState } from "react";
import { FinancingCostInput, FinancingCostKind, FinancingMember } from "../api/types";
import { PayerSplit, buildPayers, emptyPayerDraft } from "./PayerSplit";
import { formatCurrency, todayIso } from "../utils/format";

interface Props {
  /** Se informado, trava o tipo (Entrada/Taxa) e esconde o seletor. */
  fixedKind?: FinancingCostKind;
  submitLabel: string;
  /** Membros do financiamento - com 2+ pessoas, aparece a divisão opcional de quem pagou (nos itens já pagos). */
  members?: FinancingMember[];
  onSubmit: (input: FinancingCostInput) => void | Promise<void>;
  onCancel?: () => void;
}

/** Formulário de um item de entrada ou taxa - usado dentro do assistente (monta uma lista local) e no detalhe (manda pra API). */
export function FinancingCostForm({ fixedKind, submitLabel, members = [], onSubmit, onCancel }: Props) {
  const [kind, setKind] = useState<FinancingCostKind>(fixedKind ?? "ENTRADA");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paid, setPaid] = useState(false);
  const [parcelar, setParcelar] = useState(false);
  const [installments, setInstallments] = useState("2");
  const [paidInstallments, setPaidInstallments] = useState("0");
  const [payerDraft, setPayerDraft] = useState(emptyPayerDraft());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const amountValue = Number(amount);
  const installmentsValue = Number(installments);
  const preview = parcelar && amountValue > 0 && installmentsValue > 1 ? amountValue / installmentsValue : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!description.trim()) return setError("Dê um nome pra esse item.");
    if (!(amountValue > 0)) return setError("Informe um valor maior que zero.");
    if (parcelar && !(installmentsValue >= 2 && installmentsValue <= 120)) return setError("Parcelas: de 2 a 120.");
    const alreadyPaid = Math.max(0, Math.min(Number(paidInstallments) || 0, installmentsValue));
    const hasPaidItems = parcelar ? alreadyPaid > 0 : paid;
    const built = hasPaidItems ? buildPayers(payerDraft, members, parcelar ? "PERCENT" : "AMOUNT", amountValue) : {};
    if (built.error) return setError(built.error);
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        kind,
        description: description.trim(),
        amount: amountValue,
        dueDate: dueDate || undefined,
        paid: !parcelar && paid,
        paidDate: !parcelar && paid ? (dueDate && dueDate <= todayIso() ? dueDate : todayIso()) : undefined,
        installments: parcelar ? installmentsValue : undefined,
        paidInstallments: parcelar ? alreadyPaid : undefined,
        payers: built.payers,
      });
      setDescription("");
      setAmount("");
      setDueDate("");
      setPaid(false);
      setParcelar(false);
      setInstallments("2");
      setPaidInstallments("0");
      setPayerDraft(emptyPayerDraft());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar esse item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!fixedKind && (
        <div className="grid grid-cols-2 gap-2">
          {([
            ["ENTRADA", "Entrada"],
            ["TAXA", "Taxa extra"],
          ] as [FinancingCostKind, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setKind(value)}
              className={`rounded-2xl border-2 px-2 py-2 text-[13px] font-medium transition-colors ${
                kind === value ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div>
        <label className="field-label" htmlFor="costDescription">Descrição</label>
        <input
          id="costDescription"
          className="field"
          placeholder={kind === "ENTRADA" ? "Ex: Sinal, entrada em dinheiro" : "Ex: ITBI, cartório, avaliação"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="costAmount">{parcelar ? "Valor total" : "Valor"}</label>
        <input
          id="costAmount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0,00"
          className="field num"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="costDue">{parcelar ? "Vencimento da 1ª parcela" : "Vencimento (opcional)"}</label>
        <input id="costDue" type="date" className="field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>

      <label className="flex items-center gap-2.5">
        <input type="checkbox" className="h-4 w-4 rounded" checked={parcelar} onChange={(e) => setParcelar(e.target.checked)} />
        <span className="text-sm text-ink">Parcelado</span>
      </label>
      {parcelar ? (
        <div className="space-y-3 rounded-2xl bg-surface-soft p-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="costInstallments">Quantas vezes</label>
              <input id="costInstallments" type="number" min="2" max="120" className="field num" value={installments} onChange={(e) => setInstallments(e.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="costPaidInstallments">Já pagas</label>
              <input id="costPaidInstallments" type="number" min="0" className="field num" value={paidInstallments} onChange={(e) => setPaidInstallments(e.target.value)} />
            </div>
          </div>
          {preview !== null && (
            <p className="text-xs text-ink-soft">{installmentsValue}x de {formatCurrency(preview)}, uma por mês a partir do vencimento.</p>
          )}
        </div>
      ) : (
        <label className="flex items-center gap-2.5">
          <input type="checkbox" className="h-4 w-4 rounded" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
          <span className="text-sm text-ink">Já paguei</span>
        </label>
      )}

      {(parcelar ? Number(paidInstallments) > 0 : paid) && (
        <PayerSplit members={members} draft={payerDraft} onChange={setPayerDraft} mode={parcelar ? "PERCENT" : "AMOUNT"} total={amountValue > 0 ? amountValue : null} />
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancelar</button>}
        <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Salvando…" : submitLabel}</button>
      </div>
    </form>
  );
}
