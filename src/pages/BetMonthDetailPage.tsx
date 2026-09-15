import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { BetMonthDays, BetMonthDayHouse } from "../api/types";
import { ChangeUnitValueModal } from "../components/ChangeUnitValueModal";
import { UpdateBetBalanceModal } from "../components/UpdateBetBalanceModal";
import { ArrowLeftIcon, ChevronRightIcon, PencilIcon } from "../components/icons";
import { formatCurrency, formatUnits, formatDate, formatMonthName } from "../utils/format";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

interface EditingState {
  house: BetMonthDayHouse;
  date: string;
  startOfDay: number;
}

export function BetMonthDetailPage() {
  const { monthId } = useParams<{ monthId: string }>();
  const [data, setData] = useState<BetMonthDays | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showChangeUnit, setShowChangeUnit] = useState(false);
  const [editing, setEditing] = useState<EditingState | null>(null);

  const load = useCallback(async () => {
    if (!monthId) return;
    const res = await api.get<BetMonthDays>(`/bets/months/${monthId}/days`);
    setData(res.data);
    setExpanded((prev) => {
      if (prev.size > 0) return prev;
      const today = todayIso();
      return res.data.open && res.data.days.some((d) => d.date === today) ? new Set([today]) : prev;
    });
  }, [monthId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) {
    return <p className="pt-10 text-center text-ink-soft">Carregando…</p>;
  }

  function toggle(date: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  const positivo = data.profitLoss >= 0;
  const today = todayIso();
  const currentUnitValue = data.days[0]?.unitValue ?? 0;

  return (
    <div className="pt-2">
      <Link to="/bets" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Bets
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{formatMonthName(data.startDate.slice(0, 7))}</h1>
        <p className={`num mt-1 text-lg font-semibold ${positivo ? "text-success" : "text-danger"}`}>
          {positivo ? "+" : ""}
          {formatUnits(data.profitLossUnits)} · {positivo ? "+" : ""}
          {formatCurrency(data.profitLoss)}
        </p>
      </div>

      {data.open && (
        <button onClick={() => setShowChangeUnit(true)} className="btn-secondary mb-4 w-full">
          Unidade atual: {formatCurrency(currentUnitValue)} · trocar
        </button>
      )}

      <div className="card">
        <ul className="divide-y divide-line/70">
          {data.days.map((day) => {
            const isOpen = expanded.has(day.date);
            const dayPositivo = day.result >= 0;
            return (
              <li key={day.date}>
                <button
                  onClick={() => toggle(day.date)}
                  className="list-row w-full text-left"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-2 text-[15px] font-medium text-ink">
                    {formatDate(day.date)}
                    {day.date === today && <span className="pill bg-accent-soft text-accent">Hoje</span>}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className={`num text-[15px] ${dayPositivo ? "text-success" : "text-danger"}`}>
                      {dayPositivo ? "+" : ""}
                      {formatUnits(day.resultUnits)}
                    </span>
                    <ChevronRightIcon className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </span>
                </button>
                {isOpen && (
                  <div className="-mt-1 mb-3 space-y-1 rounded-2xl bg-surface-soft p-3">
                    {day.houses.length === 0 ? (
                      <p className="py-2 text-center text-sm text-ink-soft">Nenhuma casa cadastrada.</p>
                    ) : (
                      day.houses.map((h) => {
                        const hPositivo = h.result >= 0;
                        return (
                          <div key={h.houseId} className="flex items-center justify-between gap-2 py-1.5">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: h.color || "#8E8E93" }} />
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium text-ink">{h.name}</span>
                                <span className="num block text-xs text-ink-soft">{formatCurrency(h.balance)}</span>
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              <span className={`num text-sm ${hPositivo ? "text-success" : "text-danger"}`}>
                                {hPositivo ? "+" : ""}
                                {formatUnits(h.resultUnits)}
                              </span>
                              {data.open && (
                                <button
                                  onClick={() => setEditing({ house: h, date: day.date, startOfDay: h.balance - h.result })}
                                  className="icon-btn h-8 w-8"
                                  aria-label={`Editar ${h.name}`}
                                >
                                  <PencilIcon className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {showChangeUnit && (
        <ChangeUnitValueModal
          currentValue={currentUnitValue}
          onClose={() => setShowChangeUnit(false)}
          onSaved={() => { setShowChangeUnit(false); load(); }}
        />
      )}
      {editing && (
        <UpdateBetBalanceModal
          houseId={editing.house.houseId}
          houseName={editing.house.name}
          date={editing.date}
          isToday={editing.date === today}
          currentBalance={editing.house.balance}
          startOfDayBalance={editing.startOfDay}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
