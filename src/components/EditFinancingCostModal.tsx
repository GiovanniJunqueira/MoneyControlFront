import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { FinancingCost, FinancingDetail } from "../api/types";

interface Props {
  financingId: string;
  cost: FinancingCost;
  onClose: () => void;
  onSaved: (detail: FinancingDetail) => void;
}

export function EditFinancingCostModal({ financingId, cost, onClose, onSaved }: Props) {
  const [description, setDescription] = useState(cost.description);
  const [amount, setAmount] = useState(String(cost.amount));
  const [dueDate, setDueDate] = useState(cost.dueDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description.trim() || !(Number(amount) > 0)) {
      setError("Preencha a descrição e um valor maior que zero.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await api.put<FinancingDetail>(`/financings/${financingId}/costs/${cost.id}`, {
        description: description.trim(),
        amount: Number(amount),
        dueDate: dueDate || null,
      });
      onSaved(res.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Editar item" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="editCostDesc">Descrição</label>
          <input id="editCostDesc" className="field" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="editCostAmount">Valor</label>
          <input id="editCostAmount" type="number" step="0.01" min="0" className="field num" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="editCostDue">Vencimento (opcional)</label>
          <input id="editCostDue" type="date" className="field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Salvando…" : "Salvar"}</button>
        </div>
      </form>
    </Modal>
  );
}
