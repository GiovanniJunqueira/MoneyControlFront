import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";

interface Props {
  investmentId: string;
  investmentName: string;
  onClose: () => void;
  onSaved: () => void;
}

export function InvestmentTransactionModal({ investmentId, investmentName, onClose, onSaved }: Props) {
  const [type, setType] = useState<"SAQUE" | "DEPOSITO">("DEPOSITO");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post(`/investments/${investmentId}/transaction`, {
        type,
        amount: Number(amount.replace(",", ".")),
      });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Saque ou depósito - ${investmentName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="field-label">Tipo</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("DEPOSITO")}
              className={`rounded-2xl border-2 px-4 py-3 text-[15px] font-medium transition-colors ${
                type === "DEPOSITO" ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft"
              }`}
            >
              Depósito
            </button>
            <button
              type="button"
              onClick={() => setType("SAQUE")}
              className={`rounded-2xl border-2 px-4 py-3 text-[15px] font-medium transition-colors ${
                type === "SAQUE" ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft"
              }`}
            >
              Saque
            </button>
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="invTxAmount">Valor</label>
          <input
            id="invTxAmount"
            required
            inputMode="decimal"
            className="field num"
            placeholder="Ex: 100,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <p className="text-xs text-ink-soft">
          {type === "DEPOSITO"
            ? "Soma esse valor ao que já está investido."
            : "Tira esse valor do que está investido."}
        </p>
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
