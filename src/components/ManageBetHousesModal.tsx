import { useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { BetHouse } from "../api/types";
import { SUGGESTED_COLORS } from "../utils/colors";
import { PencilIcon, XIcon } from "./icons";

interface Props {
  houses: BetHouse[];
  onClose: () => void;
  onChanged: () => void;
}

export function ManageBetHousesModal({ houses, onClose, onChanged }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUGGESTED_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(house: BetHouse) {
    setEditingId(house.id);
    setName(house.name);
    setColor(house.color || SUGGESTED_COLORS[0]);
    setError(null);
  }

  async function handleSave(id: string) {
    setError(null);
    setSaving(true);
    try {
      await api.put(`/bets/houses/${id}`, { name, color });
      setEditingId(null);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await api.delete(`/bets/houses/${id}`);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível excluir essa casa."));
    }
  }

  return (
    <Modal title="Gerenciar casas" onClose={onClose}>
      {houses.length === 0 ? (
        <p className="py-6 text-sm text-ink-soft">Nenhuma casa cadastrada ainda.</p>
      ) : (
        <ul className="max-h-[60vh] divide-y divide-line/70 overflow-y-auto">
          {houses.map((house) => (
            <li key={house.id} className="py-3">
              {editingId === house.id ? (
                <div className="space-y-3">
                  <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
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
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="btn-secondary flex-1">Cancelar</button>
                    <button onClick={() => handleSave(house.id)} disabled={saving} className="btn-primary flex-1">
                      {saving ? "Salvando…" : "Salvar"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink">
                    <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: house.color || "#8E8E93" }} />
                    <span className="truncate">{house.name}</span>
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => startEdit(house)} className="icon-btn" aria-label={`Editar ${house.name}`}>
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(house.id)}
                      className="icon-btn text-danger"
                      aria-label={`Excluir ${house.name}`}
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Modal>
  );
}
