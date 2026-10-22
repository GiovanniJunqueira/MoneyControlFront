import { useState } from "react";
import { Modal } from "./Modal";
import { FinancingCostForm } from "./FinancingCostForm";
import { api, extractErrorMessage } from "../api/client";
import { FinancingCostInput, FinancingDetail, FinancingKind, FinancingSystem, RatePeriod } from "../api/types";
import { formatCurrency, formatDate } from "../utils/format";
import { TrashIcon } from "./icons";

interface Props {
  /** Se informado, edita só o contrato (sem passos, sem entrada/taxas - essas se editam no detalhe). */
  financing?: FinancingDetail;
  onClose: () => void;
  onSaved: (detail: FinancingDetail) => void;
}

const KIND_LABEL: Record<FinancingKind, string> = { IMOVEL: "Imóvel", VEICULO: "Veículo", OUTRO: "Outro" };
const STEP_TITLE = ["O bem", "Entrada e taxas", "O financiamento"];

function Toggle<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`rounded-2xl border-2 px-2 py-2 text-[13px] font-medium transition-colors ${
            value === v ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function FinancingFormModal({ financing, onClose, onSaved }: Props) {
  const editing = !!financing;
  const [step, setStep] = useState(0);

  const [name, setName] = useState(financing?.name ?? "");
  const [kind, setKind] = useState<FinancingKind>(financing?.kind ?? "IMOVEL");
  const [assetValue, setAssetValue] = useState(financing ? String(financing.assetValue) : "");

  const [costs, setCosts] = useState<FinancingCostInput[]>([]);

  const [financedAmount, setFinancedAmount] = useState(financing ? String(financing.financedAmount) : "");
  const [rate, setRate] = useState(financing ? String(financing.interestRatePercent) : "");
  const [ratePeriod, setRatePeriod] = useState<RatePeriod>(financing?.ratePeriod ?? "ANNUAL");
  const [termMonths, setTermMonths] = useState(financing ? String(financing.termMonths) : "360");
  const [system, setSystem] = useState<FinancingSystem>(financing?.system ?? "SAC");
  const [firstDueDate, setFirstDueDate] = useState(financing?.firstDueDate ?? "");
  const [fees, setFees] = useState(financing ? String(financing.monthlyFees) : "");
  const [correction, setCorrection] = useState(financing ? String(financing.correctionMonthlyPercent) : "");
  const [showAdvanced, setShowAdvanced] = useState(!!financing && financing.correctionMonthlyPercent > 0);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const entradaTotal = costs.filter((c) => c.kind === "ENTRADA").reduce((sum, c) => sum + c.amount, 0);
  const expectedEntrada = Number(assetValue) - Number(financedAmount);

  function validateBem(): string | null {
    if (!name.trim()) return "Dê um nome pro financiamento.";
    if (!(Number(assetValue) >= 0) || assetValue === "") return "Informe o valor do bem.";
    return null;
  }

  function validateContrato(): string | null {
    if (!(Number(financedAmount) > 0)) return "Informe o valor financiado.";
    if (rate === "" || Number(rate) < 0) return "Informe a taxa de juros.";
    const term = Number(termMonths);
    if (!(term >= 1 && term <= 600)) return "Prazo: de 1 a 600 meses.";
    if (!firstDueDate) return "Informe o vencimento da 1ª parcela.";
    return null;
  }

  function next() {
    const problem = step === 0 ? validateBem() : null;
    if (problem) return setError(problem);
    setError(null);
    setStep(step + 1);
  }

  async function save() {
    const problem = validateBem() ?? validateContrato();
    if (problem) return setError(problem);
    setError(null);
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        kind,
        assetValue: Number(assetValue),
        financedAmount: Number(financedAmount),
        interestRatePercent: Number(rate),
        ratePeriod,
        correctionMonthlyPercent: Number(correction) || 0,
        termMonths: Number(termMonths),
        system,
        firstDueDate,
        monthlyFees: Number(fees) || 0,
        costs: editing ? undefined : costs,
      };
      const res = financing
        ? await api.put<FinancingDetail>(`/financings/${financing.id}`, body)
        : await api.post<FinancingDetail>("/financings", body);
      onSaved(res.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const bemFields = (
    <div className="space-y-4">
      <div>
        <label className="field-label" htmlFor="finName">Nome</label>
        <input id="finName" className="field" placeholder="Ex: Apartamento, Carro" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <span className="field-label">Tipo</span>
        <Toggle value={kind} onChange={setKind} options={(Object.keys(KIND_LABEL) as FinancingKind[]).map((k) => [k, KIND_LABEL[k]])} />
      </div>
      <div>
        <label className="field-label" htmlFor="finAsset">Valor total do bem</label>
        <input id="finAsset" type="number" step="0.01" min="0" placeholder="0,00" className="field num" value={assetValue} onChange={(e) => setAssetValue(e.target.value)} />
      </div>
    </div>
  );

  const contratoFields = (
    <div className="space-y-4">
      <div>
        <label className="field-label" htmlFor="finFinanced">Valor financiado</label>
        <input id="finFinanced" type="number" step="0.01" min="0" placeholder="0,00" className="field num" value={financedAmount} onChange={(e) => setFinancedAmount(e.target.value)} />
      </div>
      <div>
        <label className="field-label" htmlFor="finRate">Taxa de juros (%)</label>
        <div className="flex gap-2">
          <input id="finRate" type="number" step="0.0001" min="0" placeholder="Ex: 9,5" className="field num flex-1" value={rate} onChange={(e) => setRate(e.target.value)} />
          <div className="w-40 shrink-0">
            <Toggle value={ratePeriod} onChange={setRatePeriod} options={[["ANNUAL", "ao ano"], ["MONTHLY", "ao mês"]]} />
          </div>
        </div>
        <p className="mt-1 text-xs text-ink-soft">Taxa efetiva. Se informar ao ano, o app converte pra taxa mensal equivalente.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="finTerm">Prazo (meses)</label>
          <input id="finTerm" type="number" min="1" max="600" className="field num" value={termMonths} onChange={(e) => setTermMonths(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="finFirst">1ª parcela vence em</label>
          <input id="finFirst" type="date" className="field" value={firstDueDate} onChange={(e) => setFirstDueDate(e.target.value)} />
        </div>
      </div>
      <div>
        <span className="field-label">Sistema de amortização</span>
        <Toggle value={system} onChange={setSystem} options={[["SAC", "SAC · parcela cai"], ["PRICE", "Price · parcela fixa"]]} />
      </div>
      <div>
        <label className="field-label" htmlFor="finFees">Seguros e taxas por mês (R$)</label>
        <input id="finFees" type="number" step="0.01" min="0" placeholder="0,00" className="field num" value={fees} onChange={(e) => setFees(e.target.value)} />
        <p className="mt-1 text-xs text-ink-soft">Seguro, taxa de administração etc. - somam em cada parcela, mas não entram no saldo devedor.</p>
      </div>
      <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-medium text-accent">
        {showAdvanced ? "Esconder opções avançadas" : "Opções avançadas (correção/TR)"}
      </button>
      {showAdvanced && (
        <div>
          <label className="field-label" htmlFor="finCorrection">Correção mensal do saldo (%)</label>
          <input id="finCorrection" type="number" step="0.0001" min="0" placeholder="0" className="field num" value={correction} onChange={(e) => setCorrection(e.target.value)} />
          <p className="mt-1 text-xs text-ink-soft">TR ou índice parecido, aplicada ao saldo todo mês antes dos juros. É uma média estimada - a TR real varia mês a mês.</p>
        </div>
      )}
    </div>
  );

  const costsStep = (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">
        Lance o que você já pagou ou ainda vai pagar de entrada e taxas (ITBI, cartório, avaliação...). Dá pra pular e adicionar depois.
      </p>
      {costs.length > 0 && (
        <ul className="divide-y divide-line/70 rounded-2xl bg-surface-soft px-3">
          {costs.map((c, i) => (
            <li key={i} className="flex items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{c.description}</p>
                <p className="text-xs text-ink-soft">
                  {c.kind === "ENTRADA" ? "Entrada" : "Taxa"}
                  {c.installments && c.installments > 1
                    ? ` · ${c.installments}x${c.paidInstallments ? ` (${c.paidInstallments} pagas)` : ""}`
                    : c.paid ? " · paga" : ""}
                  {c.dueDate ? ` · ${formatDate(c.dueDate)}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="num text-sm text-ink">{formatCurrency(c.amount)}</span>
                <button type="button" onClick={() => setCosts(costs.filter((_, j) => j !== i))} className="icon-btn h-8 w-8 text-danger" aria-label={`Remover ${c.description}`}>
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="rounded-2xl border border-line p-3">
        <FinancingCostForm submitLabel="Adicionar à lista" onSubmit={(input) => setCosts([...costs, input])} />
      </div>
    </div>
  );

  return (
    <Modal title={editing ? "Editar financiamento" : `Novo financiamento · ${step + 1}/3`} onClose={onClose}>
      {!editing && <p className="mb-4 text-sm font-semibold text-ink">{STEP_TITLE[step]}</p>}

      {editing ? (
        <div className="space-y-6">
          {bemFields}
          {contratoFields}
        </div>
      ) : step === 0 ? (
        bemFields
      ) : step === 1 ? (
        costsStep
      ) : (
        <>
          {contratoFields}
          {entradaTotal > 0 && Number(financedAmount) > 0 && Number(assetValue) > 0 && (
            <p className="mt-4 rounded-2xl bg-surface-soft p-3 text-xs text-ink-soft">
              Bem {formatCurrency(Number(assetValue))} − financiado {formatCurrency(Number(financedAmount))} = {formatCurrency(expectedEntrada)} de entrada esperada.
              Você lançou {formatCurrency(entradaTotal)}.
            </p>
          )}
        </>
      )}

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <div className="mt-5 flex gap-3">
        {editing ? (
          <>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="button" onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? "Salvando…" : "Salvar"}</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => (step === 0 ? onClose() : setStep(step - 1))} className="btn-secondary flex-1">
              {step === 0 ? "Cancelar" : "Voltar"}
            </button>
            {step < 2 ? (
              <button type="button" onClick={next} className="btn-primary flex-1">{step === 1 && costs.length === 0 ? "Pular" : "Continuar"}</button>
            ) : (
              <button type="button" onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? "Criando…" : "Criar financiamento"}</button>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
