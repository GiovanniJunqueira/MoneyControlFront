import { useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { Tab } from "../api/types";
import { SUGGESTED_COLORS } from "../utils/colors";
import { PencilIcon, XIcon } from "./icons";

interface Props {
  tabs: Tab[];
  onClose: () => void;
  onChanged: () => void;
}

export function ManageTabsModal({ tabs, onClose, onChanged }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUGGESTED_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(tab: Tab) {
    setEditingId(tab.id);
    setName(tab.name);
    setColor(tab.color || SUGGESTED_COLORS[0]);
    setError(null);
  }

  async function handleSave(id: string) {
    setError(null);
    setSaving(true);
    try {
      await api.put(`/tabs/${id}`, { name, color });
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
      await api.delete(`/tabs/${id}`);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível excluir essa aba."));
    }
  }

  return (
    <Modal title="Gerenciar abas" onClose={onClose}>
      <ul className="max-h-[60vh] divide-y divide-line/70 overflow-y-auto">
        {tabs.map((tab) => (
          <li key={tab.id} className="py-3">
            {editingId === tab.id ? (
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
                  <button onClick={() => handleSave(tab.id)} disabled={saving} className="btn-primary flex-1">
                    {saving ? "Salvando…" : "Salvar"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink">
                  <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tab.color || "#8E8E93" }} />
                  <span className="truncate">{tab.name}</span>
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => startEdit(tab)} className="icon-btn" aria-label={`Editar ${tab.name}`}>
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tab.id)}
                    className="icon-btn text-danger"
                    aria-label={`Excluir ${tab.name}`}
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Modal>
  );
}
