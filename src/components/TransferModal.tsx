import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";

interface HouseOption {
  houseId: string;
  name: string;
}

interface Props {
  monthId: string;
  date: string;
  houses: HouseOption[];
  onClose: () => void;
  onSaved: () => void;
}

/** Casa cujo nome é literalmente "Banco" vira o padrão da conta - continua rápido pra quem só tem
 * uma, mas agora dá pra trocar (tem gente com mais de uma conta/banco). */
function defaultCounterpart(houses: HouseOption[], exceptId: string): string {
  const banco = houses.find((h) => h.name.toLowerCase() === "banco" && h.houseId !== exceptId);
  if (banco) return banco.houseId;
  const fallback = houses.find((h) => h.houseId !== exceptId);
  return fallback?.houseId ?? "";
}

export function TransferModal({ monthId, date, houses, onClose, onSaved }: Props) {
  const [type, setType] = useState<"SAQUE" | "DEPOSITO">("SAQUE");
  const [houseId, setHouseId] = useState(houses[0]?.houseId ?? "");
  const [counterpartHouseId, setCounterpartHouseId] = useState(() => defaultCounterpart(houses, houses[0]?.houseId ?? ""));
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const counterpartName = houses.find((h) => h.houseId === counterpartHouseId)?.name ?? "conta";

  function handleHouseChange(id: string) {
    setHouseId(id);
    if (id === counterpartHouseId) {
      setCounterpartHouseId(defaultCounterpart(houses, id));
    }
  }

  function handleCounterpartChange(id: string) {
    setCounterpartHouseId(id);
    if (id === houseId) {
      const fallback = houses.find((h) => h.houseId !== id);
      setHouseId(fallback?.houseId ?? "");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post(`/bets/months/${monthId}/houses/${houseId}/transfer`, {
        amount: Number(amount.replace(",", ".")),
        type,
        counterpartHouseId,
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
          <select id="transferHouse" required className="field" value={houseId} onChange={(e) => handleHouseChange(e.target.value)}>
            {houses.map((h) => (
              <option key={h.houseId} value={h.houseId}>{h.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="transferCounterpart">
            {type === "SAQUE" ? "Pra qual conta" : "De qual conta"}
          </label>
          <select
            id="transferCounterpart"
            required
            className="field"
            value={counterpartHouseId}
            onChange={(e) => handleCounterpartChange(e.target.value)}
          >
            {houses.map((h) => (
              <option key={h.houseId} value={h.houseId}>{h.name}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-ink-soft">A conta também é uma casa cadastrada - pode ser um banco, corretora, etc. Se tiver mais de uma, escolhe qual.</p>
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
            ? `Tira o valor da casa e coloca em "${counterpartName}", sem contar como resultado da aposta.`
            : `Tira o valor de "${counterpartName}" e coloca na casa, sem contar como resultado da aposta.`}
        </p>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving || !houseId || !counterpartHouseId} className="btn-primary flex-1">
            {saving ? "Salvando…" : "Confirmar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
