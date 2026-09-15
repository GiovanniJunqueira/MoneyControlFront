import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { formatDateLong } from "../utils/format";

interface Props {
  houseId: string;
  houseName: string;
  date: string;
  isToday: boolean;
  currentBalance: number;
  startOfDayBalance: number;
  onClose: () => void;
  onSaved: () => void;
}

export function UpdateBetBalanceModal({
  houseId,
  houseName,
  date,
  isToday,
  currentBalance,
  startOfDayBalance,
  onClose,
  onSaved,
}: Props) {
  const [opening, setOpening] = useState(startOfDayBalance.toFixed(2).replace(".", ","));
  const [openingTouched, setOpeningTouched] = useState(false);
  const [balance, setBalance] = useState(currentBalance.toFixed(2).replace(".", ","));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post(`/bets/houses/${houseId}/balance`, {
        balance: Number(balance.replace(",", ".")),
        date,
        openingBalance: openingTouched ? Number(opening.replace(",", ".")) : null,
      });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Atualizar ${houseName}`} onClose={onClose}>
      <p className="mb-4 text-sm text-ink-soft">{isToday ? "Hoje" : formatDateLong(date)}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="opening">Saldo inicial do dia</label>
          <input
            id="opening"
            required
            inputMode="decimal"
            className="field num"
            value={opening}
            onChange={(e) => {
              setOpening(e.target.value);
              setOpeningTouched(true);
            }}
          />
          <p className="mt-1 text-xs text-ink-soft">
            Só muda isso se fez um depósito/saque na casa — assim a diferença não conta como resultado da aposta.
          </p>
        </div>
        <div>
          <label className="field-label" htmlFor="balance">Saldo final do dia</label>
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
