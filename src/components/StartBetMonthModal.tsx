import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { BetMonthSummary } from "../api/types";

interface Props {
  hasOpenMonth: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function StartBetMonthModal({ hasOpenMonth, onClose, onSaved }: Props) {
  const [unitValue, setUnitValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post<BetMonthSummary>("/bets/months", { initialUnitValue: Number(unitValue.replace(",", ".")) });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={hasOpenMonth ? "Iniciar novo mês" : "Iniciar meu primeiro mês"} onClose={onClose}>
      {hasOpenMonth && (
        <p className="mb-4 text-sm text-ink-soft">
          O mês atual será encerrado e a banca continua de onde está — nada é zerado.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="unitValue">Valor da unidade neste mês (R$)</label>
          <input id="unitValue" required inputMode="decimal" className="field num" placeholder="Ex: 10,00" value={unitValue} onChange={(e) => setUnitValue(e.target.value)} />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Iniciando…" : "Iniciar mês"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
