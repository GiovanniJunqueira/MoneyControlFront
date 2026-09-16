import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { BetCompetition } from "../api/types";

interface Props {
  onClose: () => void;
  onSaved: (competition: BetCompetition) => void;
}

export function JoinCompetitionModal({ onClose, onSaved }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await api.post<BetCompetition>("/bets/competitions/join", { code: code.trim().toUpperCase() });
      onSaved(res.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Entrar em competição" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="joinCode">Código</label>
          <input
            id="joinCode"
            required
            placeholder="Ex: 7K3PXQ"
            className="field num text-center text-lg uppercase tracking-[0.3em]"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={12}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Entrando…" : "Entrar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
