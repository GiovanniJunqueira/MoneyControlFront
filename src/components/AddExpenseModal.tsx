import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { Category } from "../api/types";

interface Props {
  tabId: string;
  categories: Category[];
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

export function AddExpenseModal({ tabId, categories, onClose, onSaved }: Props) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIso());
  const [recurrence, setRecurrence] = useState<Recurrence>("NONE");
  const [recurrenceMonths, setRecurrenceMonths] = useState("12");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    setError(null);
    setSaving(true);
    try {
      await api.post(`/tabs/${tabId}/expenses`, {
        categoryId,
        amount: Number(amount.replace(",", ".")),
        description: description || undefined,
        date,
        recurrence: recurrence === "NONE" ? undefined : recurrence,
        recurrenceMonths: recurrence === "FIXED" ? Number(recurrenceMonths) : undefined,
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
          <label className="field-label" htmlFor="amount">{recurrence === "NONE" ? "Valor" : "Valor mensal"}</label>
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
          <label className="field-label" htmlFor="date">{recurrence === "NONE" ? "Data" : "1ª data"}</label>
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
                onClick={() => setRecurrence(value)}
                className={`rounded-2xl border-2 px-2 py-2.5 text-[13px] font-medium transition-colors ${
                  recurrence === value ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {recurrence === "FIXED" && (
            <input
              className="field num mt-2"
              inputMode="numeric"
              placeholder="Quantos meses"
              value={recurrenceMonths}
              onChange={(e) => setRecurrenceMonths(e.target.value)}
            />
          )}
          {recurrence !== "NONE" && (
            <p className="mt-1 text-xs text-ink-soft">
              {recurrence === "FIXED"
                ? "Lança esse gasto todo mês, a partir da data acima, pelo número de meses informado."
                : "Lança esse gasto todo mês, a partir da data acima, por um bom tempo à frente (sem precisar escolher quando acaba)."}
            </p>
          )}
        </div>

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
