import { useState } from "react";
import { Modal } from "./Modal";
import { PayerMode, PayerSplit, buildPayers, draftFromPayers } from "./PayerSplit";
import { extractErrorMessage } from "../api/client";
import { FinancingMember, FinancingPayer, FinancingPayerInput } from "../api/types";

interface Props {
  title: string;
  subtitle?: string;
  members: FinancingMember[];
  /** Valor do pagamento (modo AMOUNT) - as partes precisam somar isso. */
  total: number | null;
  mode: PayerMode;
  /** Divisão que já existe (editar quem pagou) - vazio/ausente = ainda "tudo junto". */
  initial?: FinancingPayer[];
  confirmLabel: string;
  /** payers undefined = "tudo junto". */
  onConfirm: (payers: FinancingPayerInput[] | undefined) => Promise<void>;
  onClose: () => void;
}

/** Pergunta "quem pagou?" (opcional) ao marcar algo como pago ou ao ajustar depois. */
export function PayersModal({ title, subtitle, members, total, mode, initial, confirmLabel, onConfirm, onClose }: Props) {
  const [draft, setDraft] = useState(draftFromPayers(initial ?? []));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    const built = buildPayers(draft, members, mode, total);
    if (built.error) return setError(built.error);
    setError(null);
    setSaving(true);
    try {
      await onConfirm(built.payers);
    } catch (err) {
      setError(extractErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4">
        {subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}
        <PayerSplit members={members} draft={draft} onChange={setDraft} mode={mode} total={total} />
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="button" onClick={handleConfirm} disabled={saving} className="btn-primary flex-1">
            {saving ? "Salvando…" : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
