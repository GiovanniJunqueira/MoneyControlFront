import { formatCurrency } from "../utils/format";

interface BarItem {
  nome: string;
  cor: string | null;
  total: number;
  percentual: number;
  orcamento?: number | null;
  percentualOrcamento?: number | null;
}

/** Cor do progresso de orçamento é por severidade (verde/amarelo/vermelho), não a cor da categoria -
 * estourar o orçamento precisa chamar atenção independente de qual categoria seja. */
function budgetColor(percentualOrcamento: number): string {
  if (percentualOrcamento >= 100) return "rgb(var(--color-danger))";
  if (percentualOrcamento >= 80) return "rgb(var(--color-warning))";
  return "rgb(var(--color-success))";
}

export function CategoryBar({ item }: { item: BarItem }) {
  const cor = item.cor || "#8E8E93";
  const temOrcamento = item.orcamento != null && item.percentualOrcamento != null;
  return (
    <div className="py-2.5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cor }} />
          {item.nome}
        </span>
        <span className="num text-sm text-ink-soft">
          {formatCurrency(item.total)} · {item.percentual}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${item.percentual}%`, backgroundColor: cor }}
        />
      </div>
      {temOrcamento && (
        <div className="mt-2">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-xs text-ink-soft">Orçamento</span>
            <span className="num text-xs text-ink-soft">
              {formatCurrency(item.total)} de {formatCurrency(item.orcamento!)} · {item.percentualOrcamento}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(item.percentualOrcamento!, 100)}%`, backgroundColor: budgetColor(item.percentualOrcamento!) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
