import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { Debt } from "../api/types";
import { formatCurrency } from "../utils/format";

interface Props {
  tabId: string;
  debt: Debt;
  onClose: () => void;
  onSaved: () => void;
}

export function RegisterPaymentModal({ tabId, debt, onClose, onSaved }: Props) {
  const restante = debt.amount - debt.paidAmount;
  const [amount, setAmount] = useState(restante.toFixed(2).replace(".", ","));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post(`/tabs/${tabId}/debts/${debt.id}/payments`, { amount: Number(amount.replace(",", ".")) });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Registrar pagamento" onClose={onClose}>
      <p className="mb-4 text-sm text-ink-soft">
        {debt.reason} · restam <span className="num">{formatCurrency(restante)}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="amount">Valor recebido</label>
          <input id="amount" required inputMode="decimal" className="field num" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Salvando…" : "Confirmar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
