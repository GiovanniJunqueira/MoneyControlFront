import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { Debt } from "../api/types";

interface Props {
  tabId: string;
  debt: Debt;
  onClose: () => void;
  onSaved: () => void;
}

export function EditDebtModal({ tabId, debt, onClose, onSaved }: Props) {
  const [amount, setAmount] = useState(debt.amount.toFixed(2).replace(".", ","));
  const [reason, setReason] = useState(debt.reason);
  const [date, setDate] = useState(debt.date);
  const [applyToFuture, setApplyToFuture] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isInstallment = debt.installmentGroupId !== null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.put(`/tabs/${tabId}/debts/${debt.id}`, {
        amount: Number(amount.replace(",", ".")),
        reason,
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
    <Modal title={isInstallment ? `Editar parcela ${debt.installmentNumber}/${debt.installmentTotal}` : "Editar dívida"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="editAmount">Valor</label>
          <input id="editAmount" required inputMode="decimal" className="field num" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="editReason">Motivo</label>
          <input id="editReason" required className="field" value={reason} onChange={(e) => setReason(e.target.value)} />
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
        {isInstallment && (
          <label className="flex items-start gap-2.5 rounded-2xl bg-surface-soft p-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={applyToFuture}
              onChange={(e) => setApplyToFuture(e.target.checked)}
            />
            <span>
              <span className="block font-medium text-ink">Aplicar às parcelas futuras também</span>
              <span className="block text-xs text-ink-soft">Valor e motivo mudam em todas as parcelas futuras dessa dívida (a data de cada uma continua a mesma).</span>
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
