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
  currentOpeningOverride: number | null;
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
  currentOpeningOverride,
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
      // Só manda um ajuste NOVO se o valor do campo realmente mudou do que estava mostrado. Se não
      // mudou, mantém exatamente o que já estava salvo pra esse dia — automático (null) se já era
      // automático, ou o mesmo ajuste explícito (ex: de um saque/depósito) se já existia um. Antes
      // mandava sempre `null` quando o campo não mudava, o que apagava um ajuste explícito já salvo
      // (ex: editar só o saldo final de um dia que tinha saldo inicial ajustado por um saque/depósito
      // zerava esse ajuste, porque a comparação usava só o valor mostrado, sem saber se ele vinha de
      // um ajuste ou do carry-forward automático).
      const unchanged = Math.abs(openingValue - startOfDayBalance) < 0.005;
      await api.post(`/bets/months/${monthId}/houses/${houseId}/balance`, {
        balance: Number(balance.replace(",", ".")),
        date,
        openingBalance: unchanged ? currentOpeningOverride : openingValue,
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
