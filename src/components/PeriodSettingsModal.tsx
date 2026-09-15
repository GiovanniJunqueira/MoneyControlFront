import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";

interface Props {
  tabId: string;
  module: "gastos" | "devedores";
  currentClosingDay: number;
  onClose: () => void;
  onSaved: () => void;
}

export function PeriodSettingsModal({ tabId, module, currentClosingDay, onClose, onSaved }: Props) {
  const [closingDay, setClosingDay] = useState(currentClosingDay);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.put(`/tabs/${tabId}/module-settings/${module}`, { closingDay });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Dia de fechamento" onClose={onClose}>
      <p className="mb-4 text-sm text-ink-soft">
        Define quando o período do mês fecha neste módulo. Lançamentos depois desse dia entram no próximo período.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="closingDay">Fecha todo dia</label>
          <input
            id="closingDay"
            type="number"
            min={1}
            max={28}
            required
            className="field"
            value={closingDay}
            onChange={(e) => setClosingDay(Number(e.target.value))}
          />
        </div>
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
