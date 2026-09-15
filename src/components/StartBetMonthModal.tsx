import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { BetMonthSummary } from "../api/types";

interface Props {
  hasOpenMonth: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function currentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isFullyPast(yearMonth: string) {
  const [y, m] = yearMonth.split("-").map(Number);
  const lastDay = new Date(y, m, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return lastDay < today;
}

export function StartBetMonthModal({ hasOpenMonth, onClose, onSaved }: Props) {
  const [yearMonth, setYearMonth] = useState(currentYearMonth());
  const [unitValue, setUnitValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fullyPast = isFullyPast(yearMonth);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const [year, month] = yearMonth.split("-").map(Number);
      await api.post<BetMonthSummary>("/bets/months", {
        initialUnitValue: Number(unitValue.replace(",", ".")),
        year,
        month,
      });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={hasOpenMonth ? "Iniciar novo mês" : "Iniciar meu primeiro mês"} onClose={onClose}>
      {fullyPast ? (
        <p className="mb-4 text-sm text-ink-soft">
          Esse mês já passou — ele entra como um registro separado, pra você preencher os dias, sem mexer no mês atual.
        </p>
      ) : (
        hasOpenMonth && (
          <p className="mb-4 text-sm text-ink-soft">
            O mês atual será encerrado e a banca continua de onde está — nada é zerado.
          </p>
        )
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="yearMonth">Mês</label>
          <input
            id="yearMonth"
            type="month"
            required
            className="field"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="unitValue">Valor da unidade nesse mês (R$)</label>
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
