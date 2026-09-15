import { useRef } from "react";
import { formatDateLong, formatMonthName } from "../utils/format";
import { ChevronLeftIcon, ChevronRightIcon, SettingsIcon } from "./icons";

interface LightPeriod {
  key: string;
  start?: string;
  end?: string;
  closingDay?: number;
}

interface Props {
  period: LightPeriod;
  onNavigate: (periodKey: string) => void;
  onOpenSettings?: () => void;
}

function shiftPeriodKey(key: string, delta: number): string {
  const [year, month] = key.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function PeriodNavigator({ period, onNavigate, onOpenSettings }: Props) {
  const monthInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-6 flex items-center justify-between gap-2">
      <button
        onClick={() => onNavigate(shiftPeriodKey(period.key, -1))}
        className="icon-btn"
        aria-label="Período anterior"
      >
        <ChevronLeftIcon className="h-[18px] w-[18px]" />
      </button>

      <button
        type="button"
        onClick={() => {
          const input = monthInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
          if (!input) return;
          if (typeof input.showPicker === "function") {
            input.showPicker();
          } else {
            input.focus();
          }
        }}
        className="relative flex flex-1 flex-col items-center rounded-2xl py-1.5 text-center transition-colors hover:bg-surface-soft"
        aria-label="Escolher período"
      >
        <span className="text-[15px] font-semibold text-ink">
          {period.start && period.end
            ? `${formatDateLong(period.start)} – ${formatDateLong(period.end)}`
            : formatMonthName(period.key)}
        </span>
        {period.closingDay !== undefined && (
          <span className="text-xs text-ink-soft">Fecha todo dia {period.closingDay}</span>
        )}
        <input
          ref={monthInputRef}
          type="month"
          value={period.key}
          onChange={(e) => e.target.value && onNavigate(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          tabIndex={-1}
          aria-hidden="true"
        />
      </button>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onNavigate(shiftPeriodKey(period.key, 1))}
          className="icon-btn"
          aria-label="Próximo período"
        >
          <ChevronRightIcon className="h-[18px] w-[18px]" />
        </button>
        {onOpenSettings && (
          <button onClick={onOpenSettings} className="icon-btn" aria-label="Configurações do período">
            <SettingsIcon className="h-[17px] w-[17px]" />
          </button>
        )}
      </div>
    </div>
  );
}
