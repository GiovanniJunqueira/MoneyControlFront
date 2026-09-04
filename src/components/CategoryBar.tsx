import { CategoriaResumo } from "../api/types";
import { formatCurrency } from "../utils/format";

export function CategoryBar({ categoria }: { categoria: CategoriaResumo }) {
  const cor = categoria.cor || "#8E8E93";
  return (
    <div className="py-2.5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cor }} />
          {categoria.nome}
        </span>
        <span className="num text-sm text-ink-soft">
          {formatCurrency(categoria.total)} · {categoria.percentual}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${categoria.percentual}%`, backgroundColor: cor }}
        />
      </div>
    </div>
  );
}
