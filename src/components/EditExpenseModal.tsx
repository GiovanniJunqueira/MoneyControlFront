import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { Category, Expense } from "../api/types";

interface Props {
  tabId: string;
  expense: Expense;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export function EditExpenseModal({ tabId, expense, categories, onClose, onSaved }: Props) {
  const [categoryId, setCategoryId] = useState(expense.category.id);
  const [amount, setAmount] = useState(expense.amount.toFixed(2).replace(".", ","));
  const [description, setDescription] = useState(expense.description ?? "");
  const [date, setDate] = useState(expense.date);
  const [applyToFuture, setApplyToFuture] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isRecurring = expense.recurringGroupId !== null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.put(`/tabs/${tabId}/expenses/${expense.id}`, {
        categoryId,
        amount: Number(amount.replace(",", ".")),
        description: description || undefined,
        date,
        applyToFuture,
      });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Editar gasto" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="editCategory">Categoria</label>
          <select id="editCategory" required className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="editAmount">Valor</label>
          <input id="editAmount" required inputMode="decimal" className="field num" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="editDescription">Descrição (opcional)</label>
          <input id="editDescription" className="field" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="editDate">Data</label>
          <input
            id="editDate"
            type="date"
            required
            disabled={applyToFuture}
            className="field disabled:opacity-50"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        {isRecurring && (
          <label className="flex items-start gap-2.5 rounded-2xl bg-surface-soft p-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={applyToFuture}
              onChange={(e) => setApplyToFuture(e.target.checked)}
            />
            <span>
              <span className="block font-medium text-ink">Aplicar às próximas ocorrências também</span>
              <span className="block text-xs text-ink-soft">Categoria, valor e descrição mudam em todos os meses futuros dessa recorrência (a data de cada um continua a mesma).</span>
            </span>
          </label>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
