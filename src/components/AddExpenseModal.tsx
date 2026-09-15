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

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AddExpenseModal({ tabId, categories, onClose, onSaved }: Props) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIso());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      setError("Crie uma categoria antes de lançar um gasto.");
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
          <label className="field-label" htmlFor="amount">Valor</label>
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
          <label className="field-label" htmlFor="date">Data</label>
          <input id="date" type="date" required className="field" value={date} onChange={(e) => setDate(e.target.value)} />
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
