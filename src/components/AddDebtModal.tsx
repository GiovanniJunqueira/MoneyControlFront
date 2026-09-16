import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { formatCurrency } from "../utils/format";

interface Props {
  tabId: string;
  debtorId: string;
  onClose: () => void;
  onSaved: () => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AddDebtModal({ tabId, debtorId, onClose, onSaved }: Props) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(todayIso());
  const [parcelar, setParcelar] = useState(false);
  const [installments, setInstallments] = useState("2");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const totalValue = Number(amount.replace(",", "."));
  const installmentsValue = Number(installments);
  const previewPerInstallment =
    parcelar && !Number.isNaN(totalValue) && installmentsValue > 0 ? totalValue / installmentsValue : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (parcelar && (!installments || installmentsValue < 2)) {
      setError("Informe em quantas vezes (mínimo 2).");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await api.post(`/tabs/${tabId}/debts`, {
        debtorId,
        amount: totalValue,
        reason,
        date,
        installments: parcelar ? installmentsValue : undefined,
      });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Nova dívida" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="amount">{parcelar ? "Valor total" : "Valor"}</label>
          <input id="amount" required inputMode="decimal" placeholder="0,00" className="field num" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="reason">Motivo</label>
          <input id="reason" required placeholder="Ex: Jantar de sexta" className="field" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="date">{parcelar ? "Data da 1ª parcela" : "Data"}</label>
          <input id="date" type="date" required className="field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <label className="flex items-center gap-2.5 text-sm font-medium text-ink">
          <input type="checkbox" checked={parcelar} onChange={(e) => setParcelar(e.target.checked)} />
          Parcelar
        </label>
        {parcelar && (
          <div>
            <label className="field-label" htmlFor="installments">Quantas vezes</label>
            <input
              id="installments"
              required
              inputMode="numeric"
              className="field num"
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
            />
            {previewPerInstallment !== null && (
              <p className="mt-1 text-xs text-ink-soft">
                {installmentsValue}x de {formatCurrency(previewPerInstallment)}, uma por mês a partir da data acima.
              </p>
            )}
          </div>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "Salvando…" : "Lançar dívida"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
