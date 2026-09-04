import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { Category } from "../api/types";

const SUGGESTED_COLORS = ["#2F5233", "#8B3A2B", "#C98A2C", "#4A5A61", "#5B4636", "#3B6E8F"];

interface Props {
  categories: Category[];
  onClose: () => void;
  onChanged: () => void;
}

export function ManageCategoriesModal({ categories, onClose, onChanged }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUGGESTED_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post("/categories", { name, color });
      setName("");
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/categories/${id}`);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível excluir essa categoria."));
    }
  }

  return (
    <Modal title="Categorias" onClose={onClose}>
      <ul className="mb-5 max-h-48 divide-y divide-rule-soft overflow-y-auto">
        {categories.length === 0 && <li className="py-2 text-sm text-ink-soft">Nenhuma categoria ainda.</li>}
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-sm text-ink">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color || "#1C2B33" }} />
              {c.name}
            </span>
            <button onClick={() => handleDelete(c.id)} className="text-xs text-ledger-brick hover:underline">
              Excluir
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleCreate} className="space-y-3 border-t border-rule-soft pt-4">
        <div>
          <label className="field-label" htmlFor="catName">Nova categoria</label>
          <input id="catName" required className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Mercado" />
        </div>
        <div className="flex gap-2">
          {SUGGESTED_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-6 w-6 rounded-full ring-offset-2"
              style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
              aria-label={`Cor ${c}`}
            />
          ))}
        </div>
        {error && <p className="text-sm text-ledger-brick">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Adicionando…" : "Adicionar categoria"}
        </button>
      </form>
    </Modal>
  );
}
