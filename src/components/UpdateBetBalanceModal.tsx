import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { BetHouseBalance } from "../api/types";
import { formatCurrency } from "../utils/format";

interface Props {
  house: BetHouseBalance;
  onClose: () => void;
  onSaved: () => void;
}

export function UpdateBetBalanceModal({ house, onClose, onSaved }: Props) {
  const [balance, setBalance] = useState(house.currentBalance.toFixed(2).replace(".", ","));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post(`/bets/houses/${house.id}/balance`, { balance: Number(balance.replace(",", ".")) });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Atualizar ${house.name}`} onClose={onClose}>
      <p className="mb-4 text-sm text-ink-soft">
        Início do dia <span className="num">{formatCurrency(house.startOfDayBalance)}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="balance">Saldo atual na casa</label>
          <input id="balance" required inputMode="decimal" className="field num" value={balance} onChange={(e) => setBalance(e.target.value)} />
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
