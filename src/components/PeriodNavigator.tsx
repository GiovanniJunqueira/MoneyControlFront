import { FiscalPeriod } from "../api/types";
import { formatDateLong } from "../utils/format";

interface Props {
  period: FiscalPeriod;
  onNavigate: (periodKey: string) => void;
  onOpenSettings: () => void;
}

function shiftPeriodKey(key: string, delta: number): string {
  const [year, month] = key.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function PeriodNavigator({ period, onNavigate, onOpenSettings }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate(shiftPeriodKey(period.key, -1))}
          className="rounded-sm border border-rule px-2.5 py-1.5 text-sm text-ink-soft hover:bg-paper-raised"
          aria-label="Período anterior"
        >
          ←
        </button>
        <div>
          <p className="font-display text-lg leading-tight text-ink">
            {formatDateLong(period.start)} – {formatDateLong(period.end)}
          </p>
        </div>
        <button
          onClick={() => onNavigate(shiftPeriodKey(period.key, 1))}
          className="rounded-sm border border-rule px-2.5 py-1.5 text-sm text-ink-soft hover:bg-paper-raised"
          aria-label="Próximo período"
        >
          →
        </button>
      </div>
      <button onClick={onOpenSettings} className="text-sm text-ink-soft underline decoration-rule underline-offset-4 hover:text-ink">
        Fecha todo dia {period.closingDay}
      </button>
    </div>
  );
}
