import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { Investment } from "../api/types";

interface Props {
  investment?: Investment;
  onClose: () => void;
  onSaved: () => void;
}

export function InvestmentModal({ investment, onClose, onSaved }: Props) {
  const [name, setName] = useState(investment?.name ?? "");
  const [amount, setAmount] = useState(investment ? String(investment.amount) : "");
  const [noYield, setNoYield] = useState(investment ? investment.monthlyRatePercent === 0 : false);
  const [rate, setRate] = useState(investment ? String(investment.monthlyRatePercent) : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body = { name, amount: Number(amount), monthlyRatePercent: noYield ? 0 : Number(rate) };
      if (investment) {
        await api.put(`/investments/${investment.id}`, body);
      } else {
        await api.post("/investments", body);
      }
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={investment ? "Editar investimento" : "Novo investimento"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="invName">Nome</label>
          <input
            id="invName"
            required
            placeholder="Ex: BTG - CDB"
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="invAmount">Valor investido</label>
          <input
            id="invAmount"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0,00"
            className="field num"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            className="h-4 w-4 rounded"
            checked={noYield}
            onChange={(e) => setNoYield(e.target.checked)}
          />
          <span className="text-sm text-ink">Sem rendimento (só guardar o valor)</span>
        </label>
        {!noYield && (
          <div>
            <label className="field-label" htmlFor="invRate">Rendimento mensal (%)</label>
            <input
              id="invRate"
              type="number"
              step="0.01"
              required
              placeholder="Ex: 1,10"
              className="field num"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <p className="mt-1 text-xs text-ink-soft">Taxa que esse investimento rende por mês, em porcentagem.</p>
          </div>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
