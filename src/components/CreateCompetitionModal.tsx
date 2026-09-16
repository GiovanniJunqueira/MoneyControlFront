import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { BetCompetition } from "../api/types";

interface Props {
  onClose: () => void;
  onSaved: (competition: BetCompetition) => void;
}

function currentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function CreateCompetitionModal({ onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [yearMonth, setYearMonth] = useState(currentYearMonth());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const [year, month] = yearMonth.split("-").map(Number);
      const res = await api.post<BetCompetition>("/bets/competitions", { name, year, month });
      onSaved(res.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Criar competição" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="compName">Nome</label>
          <input id="compName" required placeholder="Ex: Bolão de setembro" className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="compMonth">Mês comparado</label>
          <input id="compMonth" type="month" required className="field" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)} />
          <p className="mt-1 text-xs text-ink-soft">O ranking compara o resultado de cada pessoa nesse mês do Bets dela.</p>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Criando…" : "Criar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
