import { TabSummary } from "../api/types";
import { formatCurrency } from "../utils/format";

interface Props {
  abas: TabSummary[];
  onSelect: (tabId: string) => void;
  onCenterClick: () => void;
  totalGeral: number;
}

const SIZE = 280;
const CENTER = SIZE / 2;
const R_OUTER = 130;
const R_INNER = 82;
const MIN_ANGLE = 8;
const GAP = 2;

function polarToCartesian(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

function describeSlice(startAngle: number, endAngle: number): string {
  const a0 = startAngle + GAP / 2;
  const a1 = endAngle - GAP / 2;
  const startOuter = polarToCartesian(a1, R_OUTER);
  const endOuter = polarToCartesian(a0, R_OUTER);
  const startInner = polarToCartesian(a1, R_INNER);
  const endInner = polarToCartesian(a0, R_INNER);
  const largeArc = a1 - a0 <= 180 ? 0 : 1;

  return [
    "M", startOuter.x, startOuter.y,
    "A", R_OUTER, R_OUTER, 0, largeArc, 0, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", R_INNER, R_INNER, 0, largeArc, 1, startInner.x, startInner.y,
    "Z",
  ].join(" ");
}

export function DonutTabChart({ abas, onSelect, onCenterClick, totalGeral }: Props) {
  const n = abas.length;
  const rawTotal = abas.reduce((sum, a) => sum + a.totalGastoPeriodo, 0);
  const reserved = MIN_ANGLE * n;
  const remaining = Math.max(360 - reserved, 0);

  let cursor = 0;
  const slices = abas.map((aba) => {
    const share = rawTotal > 0 ? aba.totalGastoPeriodo / rawTotal : 1 / n;
    const angle = MIN_ANGLE + remaining * share;
    const slice = { aba, startAngle: cursor, endAngle: cursor + angle };
    cursor += angle;
    return slice;
  });

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full">
        {slices.map(({ aba, startAngle, endAngle }) => (
          <path
            key={aba.id}
            d={describeSlice(startAngle, endAngle)}
            fill={aba.color || "#8E8E93"}
            className="cursor-pointer transition-opacity hover:opacity-80"
            onClick={() => onSelect(aba.id)}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={onCenterClick}
          style={{ width: "58%", height: "58%" }}
          className="flex flex-col items-center justify-center rounded-full bg-surface text-center shadow-sm shadow-black/5 ring-1 ring-line/70 transition-transform active:scale-95"
        >
          <span className="text-[13px] font-semibold text-ink-soft">Visão Geral</span>
          <span className="num mt-0.5 px-2 text-lg text-ink">{formatCurrency(totalGeral)}</span>
        </button>
      </div>
    </div>
  );
}
