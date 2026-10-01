import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { Category, DebtorSummary } from "../api/types";
import { formatCurrency } from "../utils/format";

interface Props {
  tabId: string;
  categories: Category[];
  debtors: DebtorSummary[];
  onClose: () => void;
  onSaved: () => void;
}

/** Data de hoje no fuso do dispositivo - toISOString() converte pra UTC, o que faria a data virar
 * amanhã cedo demais no horário de Brasília (a partir das 21h). */
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Recurrence = "NONE" | "FIXED" | "INDEFINITE";

export function AddExpenseModal({ tabId, categories, debtors, onClose, onSaved }: Props) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIso());
  const [recurrence, setRecurrence] = useState<Recurrence>("NONE");
  const [recurrenceMonths, setRecurrenceMonths] = useState("12");
  const [parcelar, setParcelar] = useState(false);
  const [installments, setInstallments] = useState("2");
  const [splitting, setSplitting] = useState(false);
  const [splitDebtorId, setSplitDebtorId] = useState(debtors[0]?.id ?? "");
  const [splitAmount, setSplitAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleFillHalf() {
    const total = Number(amount.replace(",", "."));
    if (Number.isFinite(total) && total > 0) {
      setSplitAmount((total / 2).toFixed(2).replace(".", ","));
    }
  }

  const totalValue = Number(amount.replace(",", "."));
  const installmentsValue = Number(installments);
  const previewPerInstallment =
    parcelar && !Number.isNaN(totalValue) && installmentsValue > 0 ? totalValue / installmentsValue : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      setError("Crie uma categoria antes de lançar um gasto.");
      return;
    }
    if (recurrence === "FIXED" && (!recurrenceMonths || Number(recurrenceMonths) < 1)) {
      setError("Informe por quantos meses o gasto se repete.");
      return;
    }
    if (parcelar && (!installments || installmentsValue < 2)) {
      setError("Informe em quantas vezes (mínimo 2).");
      return;
    }
    if (splitting && (!splitDebtorId || !splitAmount)) {
      setError("Escolha a pessoa e o valor dela pra dividir o gasto.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await api.post(`/tabs/${tabId}/expenses`, {
        categoryId,
        amount: totalValue,
        description: description || undefined,
        date,
        recurrence: !parcelar && recurrence !== "NONE" ? recurrence : undefined,
        recurrenceMonths: !parcelar && recurrence === "FIXED" ? Number(recurrenceMonths) : undefined,
        installments: parcelar ? installmentsValue : undefined,
        splitDebtorId: splitting ? splitDebtorId : undefined,
        splitAmount: splitting ? Number(splitAmount.replace(",", ".")) : undefined,
      });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Novo gasto" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="category">Categoria</label>
          <select id="category" required className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.length === 0 && <option value="">Nenhuma categoria ainda</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="amount">
            {parcelar ? "Valor total" : recurrence === "NONE" ? "Valor" : "Valor mensal"}
          </label>
          <input
            id="amount"
            required
            inputMode="decimal"
            placeholder="0,00"
            className="field num"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="description">Descrição (opcional)</label>
          <input id="description" className="field" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="field-label" htmlFor="date">
            {parcelar ? "Data da 1ª parcela" : recurrence === "NONE" ? "Data" : "1ª data"}
          </label>
          <input id="date" type="date" required className="field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div>
          <span className="field-label">Recorrência</span>
          <div className="grid grid-cols-3 gap-2">
            {([
              ["NONE", "Só esse"],
              ["FIXED", "Por X meses"],
              ["INDEFINITE", "Indefinida"],
            ] as [Recurrence, string][]).map(([value, label]) => (
              <button
                key={value}
                type="button"
                disabled={parcelar}
                onClick={() => setRecurrence(value)}
                className={`rounded-2xl border-2 px-2 py-2.5 text-[13px] font-medium transition-colors disabled:opacity-40 ${
                  recurrence === value ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {recurrence === "FIXED" && !parcelar && (
            <input
              className="field num mt-2"
              inputMode="numeric"
              placeholder="Quantos meses"
              value={recurrenceMonths}
              onChange={(e) => setRecurrenceMonths(e.target.value)}
            />
          )}
          {recurrence !== "NONE" && !parcelar && (
            <p className="mt-1 text-xs text-ink-soft">
              {recurrence === "FIXED"
                ? "Lança esse gasto todo mês, a partir da data acima, pelo número de meses informado."
                : "Lança esse gasto todo mês, a partir da data acima, por um bom tempo à frente (sem precisar escolher quando acaba)."}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              className="h-4 w-4 rounded"
              checked={parcelar}
              disabled={recurrence !== "NONE"}
              onChange={(e) => setParcelar(e.target.checked)}
            />
            <span className="text-sm text-ink">Parcelar</span>
          </label>
          {parcelar && (
            <div className="mt-3 space-y-2 rounded-2xl bg-surface-soft p-3">
              <label className="field-label" htmlFor="installments">Quantas vezes</label>
              <input
                id="installments"
                required
                inputMode="numeric"
                className="field num"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
              />
              {previewPerInstallment !== null && (
                <p className="text-xs text-ink-soft">
                  {installmentsValue}x de {formatCurrency(previewPerInstallment)}, uma por mês a partir da data acima.
                </p>
              )}
            </div>
          )}
        </div>

        {debtors.length > 0 && (
          <div>
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={splitting}
                onChange={(e) => setSplitting(e.target.checked)}
              />
              <span className="text-sm text-ink">Dividir com alguém</span>
            </label>
            {splitting && (
              <div className="mt-3 space-y-3 rounded-2xl bg-surface-soft p-3">
                <div>
                  <label className="field-label" htmlFor="splitDebtor">Com quem</label>
                  <select
                    id="splitDebtor"
                    required
                    className="field"
                    value={splitDebtorId}
                    onChange={(e) => setSplitDebtorId(e.target.value)}
                  >
                    {debtors.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[13px] font-medium text-ink-soft" htmlFor="splitAmount">Valor da pessoa</label>
                    <button type="button" onClick={handleFillHalf} className="pill bg-accent-soft text-accent">
                      Metade
                    </button>
                  </div>
                  <input
                    id="splitAmount"
                    required
                    inputMode="decimal"
                    placeholder="0,00"
                    className="field num"
                    value={splitAmount}
                    onChange={(e) => setSplitAmount(e.target.value)}
                  />
                </div>
                <p className="text-xs text-ink-soft">
                  O gasto fica lançado no valor total. Esse valor da pessoa vira uma dívida pra ela em Devedores.
                </p>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Salvando…" : "Lançar gasto"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
