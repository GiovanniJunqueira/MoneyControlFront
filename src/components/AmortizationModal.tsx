import { ReactNode, useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { AmortizationMode, FinancingDetail, FinancingMember, FinancingScenario, FinancingSimulation } from "../api/types";
import { PayerSplit, buildPayers, emptyPayerDraft } from "./PayerSplit";
import { formatCurrency, formatMonthYear } from "../utils/format";

interface Props {
  financingId: string;
  /** Saldo devedor de hoje - teto do valor e atalho do "Quitar tudo". */
  balance: number;
  members: FinancingMember[];
  onClose: () => void;
  onSaved: (detail: FinancingDetail) => void;
}

function Line({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ink">{children}</p>;
}

function ScenarioCard({ title, selected, onSelect, children }: { title: string; selected: boolean; onSelect: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border-2 p-3 text-left transition-colors ${selected ? "border-accent bg-accent-soft" : "border-line"}`}
    >
      <p className={`mb-1.5 text-[13px] font-semibold ${selected ? "text-accent" : "text-ink-soft"}`}>{title}</p>
      <div className="space-y-0.5">{children}</div>
    </button>
  );
}

function savedLine(s: FinancingScenario) {
  return <Line>Economiza <span className="num font-semibold text-success">{formatCurrency(s.interestSaved)}</span> de juros</Line>;
}

/** Simula (sem gravar) as duas formas de amortizar - reduzir prazo ou reduzir parcela - e só grava quando confirmar. */
export function AmortizationModal({ financingId, balance, members, onClose, onSaved }: Props) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<AmortizationMode>("TERM");
  const [simulation, setSimulation] = useState<FinancingSimulation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [payerDraft, setPayerDraft] = useState(emptyPayerDraft());
  const requestId = useRef(0);

  const amountValue = Number(amount);

  useEffect(() => {
    if (!(amountValue > 0)) {
      setSimulation(null);
      setError(null);
      return;
    }
    const current = ++requestId.current;
    const timer = setTimeout(async () => {
      try {
        const res = await api.post<FinancingSimulation>(`/financings/${financingId}/amortizations/simulate`, { amount: amountValue, mode });
        if (current === requestId.current) {
          setSimulation(res.data);
          setError(null);
        }
      } catch (err) {
        if (current === requestId.current) {
          setSimulation(null);
          setError(extractErrorMessage(err));
        }
      }
    }, 400);
    return () => clearTimeout(timer);
    // mode não entra: a simulação traz os dois modos de uma vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountValue, financingId]);

  async function confirm() {
    const built = buildPayers(payerDraft, members, "AMOUNT", amountValue);
    if (built.error) {
      setError(built.error);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await api.post<FinancingDetail>(`/financings/${financingId}/amortizations`, { amount: amountValue, mode, payers: built.payers });
      onSaved(res.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const sim = simulation;

  return (
    <Modal title="Amortização antecipada" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[13px] font-medium text-ink-soft" htmlFor="amortAmount">Quanto você vai pagar a mais</label>
            <button type="button" onClick={() => setAmount(String(balance))} className="pill bg-accent-soft text-accent">Quitar tudo</button>
          </div>
          <input
            id="amortAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            className="field num"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <p className="mt-1 text-xs text-ink-soft">Saldo devedor hoje: {formatCurrency(balance)}</p>
        </div>

        {sim && sim.fullPayoff && (
          <div className="rounded-2xl border-2 border-accent bg-accent-soft p-3">
            <p className="mb-1.5 text-[13px] font-semibold text-accent">Quitação total</p>
            <Line>Encerra o financiamento: {sim.term.installmentsRemoved} {sim.term.installmentsRemoved === 1 ? "parcela a menos" : "parcelas a menos"}</Line>
            {savedLine(sim.term)}
          </div>
        )}

        {sim && !sim.fullPayoff && (
          <div className="space-y-2.5">
            <ScenarioCard title="Reduzir o prazo (mantém a parcela)" selected={mode === "TERM"} onSelect={() => setMode("TERM")}>
              <Line><span className="num font-semibold">−{sim.term.installmentsRemoved}</span> {sim.term.installmentsRemoved === 1 ? "parcela" : "parcelas"} · faltam {sim.term.remainingInstallments}</Line>
              <Line>Parcela segue em <span className="num">{formatCurrency(sim.term.nextPayment)}</span></Line>
              {sim.term.lastDueDate && <Line>Termina em {formatMonthYear(sim.term.lastDueDate)}</Line>}
              {savedLine(sim.term)}
            </ScenarioCard>
            <ScenarioCard title="Reduzir a parcela (mantém o prazo)" selected={mode === "INSTALLMENT"} onSelect={() => setMode("INSTALLMENT")}>
              <Line>
                Parcela de <span className="num">{formatCurrency(sim.before.nextPayment)}</span> para{" "}
                <span className="num font-semibold">{formatCurrency(sim.installment.nextPayment)}</span>
              </Line>
              <Line>Faltam {sim.installment.remainingInstallments} parcelas (prazo mantido)</Line>
              {savedLine(sim.installment)}
            </ScenarioCard>
          </div>
        )}

        {sim && <PayerSplit members={members} draft={payerDraft} onChange={setPayerDraft} mode="AMOUNT" total={amountValue} />}

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="button" onClick={confirm} disabled={saving || !sim} className="btn-primary flex-1">
            {saving ? "Salvando…" : sim?.fullPayoff ? "Quitar" : "Amortizar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
