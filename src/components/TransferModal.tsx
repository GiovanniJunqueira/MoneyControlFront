import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";

interface Props {
  monthId: string;
  date: string;
  houses: { houseId: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}

export function TransferModal({ monthId, date, houses, onClose, onSaved }: Props) {
  const [type, setType] = useState<"SAQUE" | "DEPOSITO">("SAQUE");
  const [houseId, setHouseId] = useState(houses[0]?.houseId ?? "");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post(`/bets/months/${monthId}/houses/${houseId}/transfer`, {
        amount: Number(amount.replace(",", ".")),
        type,
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
    <Modal title="Saque ou depósito" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="field-label">Tipo</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("SAQUE")}
              className={`rounded-2xl border-2 px-4 py-3 text-[15px] font-medium transition-colors ${
                type === "SAQUE" ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft"
              }`}
            >
              Saque
            </button>
            <button
              type="button"
              onClick={() => setType("DEPOSITO")}
              className={`rounded-2xl border-2 px-4 py-3 text-[15px] font-medium transition-colors ${
                type === "DEPOSITO" ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft"
              }`}
            >
              Depósito
            </button>
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="transferHouse">
            {type === "SAQUE" ? "De qual casa" : "Pra qual casa"}
          </label>
          <select id="transferHouse" required className="field" value={houseId} onChange={(e) => setHouseId(e.target.value)}>
            {houses.map((h) => (
              <option key={h.houseId} value={h.houseId}>{h.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="transferAmount">Valor</label>
          <input
            id="transferAmount"
            required
            inputMode="decimal"
            className="field num"
            placeholder="Ex: 100,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <p className="text-xs text-ink-soft">
          {type === "SAQUE"
            ? "Tira o valor da casa e coloca no Banco, sem contar como resultado da aposta."
            : "Tira o valor do Banco e coloca na casa, sem contar como resultado da aposta."}
        </p>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving || !houseId} className="btn-primary flex-1">
            {saving ? "Salvando…" : "Confirmar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
