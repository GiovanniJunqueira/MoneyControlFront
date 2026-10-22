import { FormEvent, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { FinancingDetail, FinancingMember, FinancingScheduleRow } from "../api/types";
import { PayerSplit, buildPayers, emptyPayerDraft } from "./PayerSplit";
import { formatCurrency } from "../utils/format";

interface Props {
  financingId: string;
  totalInstallments: number;
  /** Primeira parcela ainda não paga - vira o "de" padrão. */
  nextNumber: number;
  members: FinancingMember[];
  schedule: FinancingScheduleRow[];
  onClose: () => void;
  onSaved: (detail: FinancingDetail) => void;
}

/** Marca um intervalo de parcelas como pagas (ex: "da 1 à 12", pra lançar o que já pagou de uma vez). */
export function FinancingPaymentModal({ financingId, totalInstallments, nextNumber, members, schedule, onClose, onSaved }: Props) {
  const [from, setFrom] = useState(String(nextNumber));
  const [to, setTo] = useState(String(nextNumber));
  const [amount, setAmount] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [payerDraft, setPayerDraft] = useState(emptyPayerDraft());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fromN = Number(from);
  const toN = Number(to);
  const single = fromN === toN;
  const singleTotal = amount ? Number(amount) : (schedule.find((r) => r.number === fromN)?.payment ?? null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!(fromN >= 1 && toN >= fromN && toN <= totalInstallments)) {
      setError(`Informe um intervalo entre 1 e ${totalInstallments}.`);
      return;
    }
    const built = buildPayers(payerDraft, members, single ? "AMOUNT" : "PERCENT", single ? singleTotal : null);
    if (built.error) {
      setError(built.error);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await api.post<FinancingDetail>(`/financings/${financingId}/payments`, {
        fromInstallment: fromN,
        toInstallment: toN,
        amount: amount ? Number(amount) : undefined,
        paidDate: paidDate || undefined,
        payers: built.payers,
      });
      onSaved(res.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Marcar parcelas como pagas" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="payFrom">Da parcela</label>
            <input id="payFrom" type="number" min="1" max={totalInstallments} className="field num" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="payTo">Até a parcela</label>
            <input id="payTo" type="number" min="1" max={totalInstallments} className="field num" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="payAmount">Valor pago em cada uma (opcional)</label>
          <input id="payAmount" type="number" step="0.01" min="0" placeholder="Em branco = o valor previsto" className="field num" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="payDate">Data do pagamento (opcional)</label>
          <input id="payDate" type="date" className="field" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
          <p className="mt-1 text-xs text-ink-soft">Em branco: parcelas já vencidas contam na data de vencimento, as futuras contam hoje.</p>
        </div>
        <PayerSplit members={members} draft={payerDraft} onChange={setPayerDraft} mode={single ? "AMOUNT" : "PERCENT"} total={single ? singleTotal : null} />
        {!single && members.length > 1 && (
          <p className="-mt-2 text-xs text-ink-soft">Com várias parcelas de uma vez, a divisão é em porcentagem (cada parcela tem um valor{singleTotal !== null ? `, ex: ${formatCurrency(singleTotal)} a primeira` : ""}).</p>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Salvando…" : "Marcar como pagas"}</button>
        </div>
      </form>
    </Modal>
  );
}
