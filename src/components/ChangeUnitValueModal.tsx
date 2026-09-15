import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { BetMonth } from "../api/types";

interface Props {
  currentValue: number;
  onClose: () => void;
  onSaved: () => void;
}

export function ChangeUnitValueModal({ currentValue, onClose, onSaved }: Props) {
  const [value, setValue] = useState(currentValue.toFixed(2).replace(".", ","));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.put<BetMonth>("/bets/unit-value", { value: Number(value.replace(",", ".")) });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Trocar valor da unidade" onClose={onClose}>
      <p className="mb-4 text-sm text-ink-soft">
        Vale a partir de hoje — dias anteriores continuam com o valor antigo.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="unitValue">Novo valor da unidade (R$)</label>
          <input id="unitValue" required inputMode="decimal" className="field num" value={value} onChange={(e) => setValue(e.target.value)} />
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
