import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";

interface Props {
  debtorId: string;
  onClose: () => void;
  onSaved: () => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AddDebtModal({ debtorId, onClose, onSaved }: Props) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(todayIso());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post("/debts", {
        debtorId,
        amount: Number(amount.replace(",", ".")),
        reason,
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
    <Modal title="Nova dívida" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="amount">Valor</label>
          <input id="amount" required inputMode="decimal" placeholder="0,00" className="field num" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="reason">Motivo</label>
          <input id="reason" required placeholder="Ex: Jantar de sexta" className="field" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="date">Data</label>
          <input id="date" type="date" required className="field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {error && <p className="text-sm text-ledger-brick">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Salvando…" : "Lançar dívida"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
