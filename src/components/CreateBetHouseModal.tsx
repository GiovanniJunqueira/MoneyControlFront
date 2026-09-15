import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { SUGGESTED_COLORS } from "../utils/colors";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export function CreateBetHouseModal({ onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUGGESTED_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post("/bets/houses", { name, color });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Nova casa" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="houseName">Nome</label>
          <input id="houseName" required className="field" placeholder="Ex: Bet365" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <span className="field-label">Cor</span>
          <div className="flex flex-wrap gap-2.5">
            {SUGGESTED_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full transition-transform"
                style={{
                  backgroundColor: c,
                  boxShadow: color === c ? `0 0 0 2px rgb(var(--color-surface)), 0 0 0 4px ${c}` : undefined,
                  transform: color === c ? "scale(1.08)" : undefined,
                }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Criando…" : "Criar casa"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
