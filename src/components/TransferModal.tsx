import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";

interface CounterpartOption {
  houseId: string;
  name: string;
}

interface Props {
  monthId: string;
  date: string;
  houseId: string;
  houseName: string;
  houseBalance: number;
  initialType: "SAQUE" | "DEPOSITO";
  counterparts: CounterpartOption[];
  onClose: () => void;
  onSaved: () => void;
}

/** Casa cujo nome é literalmente "Banco" vira o padrão da conta - continua rápido pra quem só tem
 * uma, mas agora dá pra trocar (tem gente com mais de uma conta/banco). */
function defaultCounterpart(counterparts: CounterpartOption[]): string {
  const banco = counterparts.find((h) => h.name.toLowerCase() === "banco");
  return banco?.houseId ?? counterparts[0]?.houseId ?? "";
}

export function TransferModal({ monthId, date, houseId, houseName, houseBalance, initialType, counterparts, onClose, onSaved }: Props) {
  const [type, setType] = useState<"SAQUE" | "DEPOSITO">(initialType);
  const [counterpartHouseId, setCounterpartHouseId] = useState(() => defaultCounterpart(counterparts));
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const counterpartName = counterparts.find((h) => h.houseId === counterpartHouseId)?.name ?? "conta";

  function handleWithdrawAll() {
    setAmount(houseBalance.toFixed(2).replace(".", ","));
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

  if (counterparts.length === 0) {
    return (
      <Modal title={houseName} onClose={onClose}>
        <p className="text-sm text-ink-soft">Você precisa de pelo menos mais uma casa cadastrada pra fazer saque ou depósito.</p>
        <button type="button" onClick={onClose} className="btn-secondary mt-4 w-full">Fechar</button>
      </Modal>
    );
  }

  return (
    <Modal title={houseName} onClose={onClose}>
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
          <label className="field-label" htmlFor="transferCounterpart">
            {type === "SAQUE" ? "Pra qual conta" : "De qual conta"}
          </label>
          <select
            id="transferCounterpart"
            required
            className="field"
            value={counterpartHouseId}
            onChange={(e) => setCounterpartHouseId(e.target.value)}
          >
            {counterparts.map((h) => (
              <option key={h.houseId} value={h.houseId}>{h.name}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[13px] font-medium text-ink-soft" htmlFor="transferAmount">Valor</label>
            {type === "SAQUE" && (
              <button type="button" onClick={handleWithdrawAll} className="pill bg-accent-soft text-accent">
                Sacar tudo
              </button>
            )}
          </div>
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
            ? `Tira o valor de "${houseName}" e coloca em "${counterpartName}", sem contar como resultado da aposta.`
            : `Tira o valor de "${counterpartName}" e coloca em "${houseName}", sem contar como resultado da aposta.`}
        </p>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving || !counterpartHouseId} className="btn-primary flex-1">
            {saving ? "Salvando…" : "Confirmar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
