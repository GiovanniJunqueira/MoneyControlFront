import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export function AddDebtorModal({ onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post("/debtors", { name, notes: notes || undefined });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Nova pessoa" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="name">Nome</label>
          <input id="name" required className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="notes">Observações (opcional)</label>
          <input id="notes" className="field" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        {error && <p className="text-sm text-ledger-brick">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Salvando…" : "Adicionar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
