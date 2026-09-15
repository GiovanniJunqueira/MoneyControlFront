import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { formatDateLong } from "../utils/format";

interface Props {
  monthId: string;
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
  monthId,
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
  const [balance, setBalance] = useState(currentBalance.toFixed(2).replace(".", ","));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const openingValue = Number(opening.replace(",", "."));
      // Só manda o ajuste se o valor realmente mudou do que já estava calculado — assim, se a pessoa
      // não mexer nesse campo, o saldo inicial continua automático (carry-forward do dia anterior),
      // mesmo que um dia anterior seja editado depois.
      const unchanged = Math.abs(openingValue - startOfDayBalance) < 0.005;
      await api.post(`/bets/months/${monthId}/houses/${houseId}/balance`, {
        balance: Number(balance.replace(",", ".")),
        date,
        openingBalance: unchanged ? null : openingValue,
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
            onChange={(e) => setOpening(e.target.value)}
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
