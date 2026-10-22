import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { FinancingDetail } from "../api/types";

interface Props {
  onClose: () => void;
  onJoined: (detail: FinancingDetail) => void;
}

export function JoinFinancingModal({ onClose, onJoined }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await api.post<FinancingDetail>("/financings/join", { code: code.trim().toUpperCase() });
      onJoined(res.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Entrar com código" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="finJoinCode">Código do financiamento</label>
          <input
            id="finJoinCode"
            required
            autoCapitalize="characters"
            maxLength={8}
            placeholder="Ex: K7P3QW"
            className="field num uppercase tracking-widest"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <p className="mt-1 text-xs text-ink-soft">Peça pra pessoa que criou o financiamento o código que aparece no card "Compartilhar".</p>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Entrando…" : "Entrar"}</button>
        </div>
      </form>
    </Modal>
  );
}
