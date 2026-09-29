import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { Category } from "../api/types";
import { SUGGESTED_COLORS } from "../utils/colors";

interface Props {
  tabId: string;
  categories: Category[];
  onClose: () => void;
  onChanged: () => void;
}

export function ManageCategoriesModal({ tabId, categories, onClose, onChanged }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUGGESTED_COLORS[0]);
  const [budget, setBudget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [budgetDrafts, setBudgetDrafts] = useState<Record<string, string>>({});
  const [savingBudgetId, setSavingBudgetId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post(`/tabs/${tabId}/categories`, {
        name,
        color,
        monthlyBudget: budget ? Number(budget.replace(",", ".")) : undefined,
      });
      setName("");
      setBudget("");
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/tabs/${tabId}/categories/${id}`);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível excluir essa categoria."));
    }
  }

  function budgetDraft(c: Category) {
    return budgetDrafts[c.id] ?? (c.monthlyBudget != null ? String(c.monthlyBudget) : "");
  }

  async function handleSaveBudget(c: Category) {
    setError(null);
    setSavingBudgetId(c.id);
    try {
      const raw = budgetDraft(c);
      await api.put(`/tabs/${tabId}/categories/${c.id}`, {
        name: c.name,
        color: c.color,
        icon: c.icon,
        monthlyBudget: raw ? Number(raw.replace(",", ".")) : undefined,
      });
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível salvar o orçamento."));
    } finally {
      setSavingBudgetId(null);
    }
  }

  return (
    <Modal title="Categorias" onClose={onClose}>
      <ul className="mb-5 max-h-64 divide-y divide-line/70 overflow-y-auto">
        {categories.length === 0 && <li className="py-2 text-sm text-ink-soft">Nenhuma categoria ainda.</li>}
        {categories.map((c) => (
          <li key={c.id} className="py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink">
                <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.color || "#8E8E93" }} />
                <span className="truncate">{c.name}</span>
              </span>
              <button onClick={() => handleDelete(c.id)} className="shrink-0 text-xs font-medium text-danger hover:underline">
                Excluir
              </button>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 pl-4">
              <span className="text-xs text-ink-soft">Orçamento mensal</span>
              <input
                inputMode="decimal"
                placeholder="Sem limite"
                className="field num h-8 flex-1 py-0 text-xs"
                value={budgetDraft(c)}
                onChange={(e) => setBudgetDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                onBlur={() => handleSaveBudget(c)}
              />
              {savingBudgetId === c.id && <span className="shrink-0 text-xs text-ink-soft">Salvando…</span>}
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleCreate} className="space-y-3 border-t border-line/70 pt-4">
        <div>
          <label className="field-label" htmlFor="catName">Nova categoria</label>
          <input id="catName" required className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Mercado" />
        </div>
        <div>
          <label className="field-label" htmlFor="catBudget">Orçamento mensal (opcional)</label>
          <input
            id="catBudget"
            inputMode="decimal"
            placeholder="Ex: 500,00"
            className="field num"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>
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
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Adicionando…" : "Adicionar categoria"}
        </button>
      </form>
    </Modal>
  );
}
