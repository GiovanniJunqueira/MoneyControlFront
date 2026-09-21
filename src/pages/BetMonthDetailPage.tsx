import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { BetMonthDays, BetMonthDayHouse } from "../api/types";
import { ChangeUnitValueModal } from "../components/ChangeUnitValueModal";
import { UpdateBetBalanceModal } from "../components/UpdateBetBalanceModal";
import { TransferModal } from "../components/TransferModal";
import { ArrowLeftIcon, ChevronRightIcon, PencilIcon } from "../components/icons";
import { formatCurrency, formatUnits, formatDate, formatMonthName } from "../utils/format";

/** Data de hoje no fuso do dispositivo - toISOString() converte pra UTC, o que faria a data virar
 * amanhã cedo demais no horário de Brasília (a partir das 21h). */
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Separa uma lista de casas (do dia ou do resumo do mês) entre as que têm grupo e as que não têm,
 * pra renderizar as agrupadas juntas com o subtotal do grupo, e as sem grupo soltas como sempre. */
function splitByGroup<T extends { groupId: string | null }>(items: T[]) {
  const grouped = new Map<string, T[]>();
  const ungrouped: T[] = [];
  for (const item of items) {
    if (item.groupId) {
      const list = grouped.get(item.groupId) ?? [];
      list.push(item);
      grouped.set(item.groupId, list);
    } else {
      ungrouped.push(item);
    }
  }
  return { grouped, ungrouped };
}

interface EditingState {
  house: BetMonthDayHouse;
  date: string;
  startOfDay: number;
}

interface LastUpdate {
  houseId: string;
  date: string;
  at: number;
}

export function BetMonthDetailPage() {
  const { monthId } = useParams<{ monthId: string }>();
  const [data, setData] = useState<BetMonthDays | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [geralOpen, setGeralOpen] = useState(false);
  const [showChangeUnit, setShowChangeUnit] = useState(false);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [transferDate, setTransferDate] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<LastUpdate | null>(null);

  const load = useCallback(async () => {
    if (!monthId) return;
    const res = await api.get<BetMonthDays>(`/bets/months/${monthId}/days`);
    setData(res.data);
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

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const positivo = data.profitLoss >= 0;
  const today = todayIso();
  // data.days vem do backend mais recente primeiro - é também a ordem de exibição (pedido do
  // usuário: dia mais recente no topo), então usa o array direto, sem inverter.
  const currentUnitValue = data.days[0]?.unitValue ?? 0;

  return (
    <div className="pt-2">
      <Link to="/bets" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Bets
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{formatMonthName(data.startDate.slice(0, 7))}</h1>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className={`num text-lg font-semibold ${positivo ? "text-success" : "text-danger"}`}>
            {positivo ? "+" : ""}
            {formatUnits(data.profitLossUnits)} · {positivo ? "+" : ""}
            {formatCurrency(data.profitLoss)}
          </span>
          <span className="num text-sm text-ink-soft">banca: {formatCurrency(data.endingBanca)}</span>
        </p>
        {data.groupSummaries.length > 0 && (
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            {data.groupSummaries.map((g) => (
              <span key={g.groupId} className="num text-xs text-ink-soft">
                {g.name}: {formatCurrency(g.banca)}
              </span>
            ))}
          </p>
        )}
      </div>

      {data.open && (
        <button onClick={() => setShowChangeUnit(true)} className="btn-secondary mb-4 w-full">
          Unidade atual: {formatCurrency(currentUnitValue)} · trocar
        </button>
      )}

      {data.houseSummaries.length > 0 && (
        <div className="card mb-4">
          <button
            onClick={() => setGeralOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 text-left"
            aria-expanded={geralOpen}
          >
            <span className="text-sm font-semibold text-ink">Geral do mês, por casa</span>
            <ChevronRightIcon className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${geralOpen ? "rotate-90" : ""}`} />
          </button>
          {geralOpen && (
            <ul className="mt-2 divide-y divide-line/70">
              {(() => {
                const { grouped, ungrouped } = splitByGroup(data.houseSummaries);
                // "Geral do mês, por casa" (só aqui, não no dia): casa mais lucrativa primeiro.
                ungrouped.sort((a, b) => b.totalResult - a.totalResult);
                for (const members of grouped.values()) {
                  members.sort((a, b) => b.totalResult - a.totalResult);
                }
                const groupSummariesSorted = [...data.groupSummaries].sort((a, b) => b.totalResult - a.totalResult);
                return (
                  <>
                    {groupSummariesSorted.map((g) => {
                      const gPositivo = g.totalResult >= 0;
                      const key = `month:${g.groupId}`;
                      const gOpen = expandedGroups.has(key);
                      return (
                        <li key={g.groupId} className="py-2">
                          <button
                            onClick={() => toggleGroup(key)}
                            className="flex w-full items-center justify-between gap-2 text-left"
                            aria-expanded={gOpen}
                          >
                            <span className="flex min-w-0 items-center gap-1.5">
                              <ChevronRightIcon className={`h-3.5 w-3.5 shrink-0 text-ink-soft transition-transform ${gOpen ? "rotate-90" : ""}`} />
                              <span className="truncate text-[15px] font-semibold text-ink">{g.name}</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              <span className={`num text-[15px] ${gPositivo ? "text-success" : "text-danger"}`}>
                                {gPositivo ? "+" : ""}
                                {formatUnits(g.totalResultUnits)}
                              </span>
                              <span className={`num text-xs ${gPositivo ? "text-success" : "text-danger"}`}>
                                ({gPositivo ? "+" : ""}
                                {formatCurrency(g.totalResult)})
                              </span>
                            </span>
                          </button>
                          {gOpen && (
                            <ul className="mt-1 space-y-1 pl-5">
                              {(grouped.get(g.groupId) ?? []).map((h) => {
                                const hPositivo = h.totalResult >= 0;
                                return (
                                  <li key={h.houseId} className="flex items-center justify-between gap-2">
                                    <span className="flex min-w-0 items-center gap-2">
                                      <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: h.color || "#8E8E93" }} />
                                      <span className="truncate text-sm text-ink-soft">{h.name}</span>
                                    </span>
                                    <span className={`num shrink-0 text-sm ${hPositivo ? "text-success" : "text-danger"}`}>
                                      {hPositivo ? "+" : ""}
                                      {formatUnits(h.totalResultUnits)}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                    {ungrouped.map((h) => {
                      const hPositivo = h.totalResult >= 0;
                      return (
                        <li key={h.houseId} className="flex items-center justify-between gap-2 py-2">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: h.color || "#8E8E93" }} />
                            <span className="truncate text-[15px] font-medium text-ink">{h.name}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className={`num text-[15px] ${hPositivo ? "text-success" : "text-danger"}`}>
                              {hPositivo ? "+" : ""}
                              {formatUnits(h.totalResultUnits)}
                            </span>
                            <span className={`num text-xs ${hPositivo ? "text-success" : "text-danger"}`}>
                              ({hPositivo ? "+" : ""}
                              {formatCurrency(h.totalResult)})
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </>
                );
              })()}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-3">
        {data.days.map((day) => {
          const isOpen = expanded.has(day.date);
          const dayPositivo = day.result >= 0;
          return (
            <div key={day.date} className="card">
              <button onClick={() => toggle(day.date)} className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={isOpen}>
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
                <div className="-mx-1 mt-3 space-y-1 rounded-2xl bg-surface-soft p-3">
                  {day.houses.length === 0 ? (
                    <p className="py-2 text-center text-sm text-ink-soft">Nenhuma casa cadastrada.</p>
                  ) : (
                    (() => {
                      const houseRow = (h: BetMonthDayHouse) => {
                        const hPositivo = h.result >= 0;
                        const opening = h.balance - h.result;
                        const isLastUpdated = lastUpdate?.houseId === h.houseId && lastUpdate?.date === day.date;
                        return (
                          <div
                            key={isLastUpdated ? `${h.houseId}-${lastUpdate!.at}` : h.houseId}
                            className={`-mx-2 flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 ${isLastUpdated ? "flash-highlight" : ""}`}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: h.color || "#8E8E93" }} />
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium text-ink">{h.name}</span>
                                <span className="num block text-xs text-ink-soft">
                                  {formatCurrency(opening)} → {formatCurrency(h.balance)}
                                </span>
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              <span className={`num text-sm ${hPositivo ? "text-success" : "text-danger"}`}>
                                {hPositivo ? "+" : ""}
                                {formatUnits(h.resultUnits)}
                              </span>
                              {day.date <= today && (
                                <button
                                  onClick={() => setEditing({ house: h, date: day.date, startOfDay: opening })}
                                  className="icon-btn h-8 w-8"
                                  aria-label={`Editar ${h.name}`}
                                >
                                  <PencilIcon className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </span>
                          </div>
                        );
                      };
                      const { grouped, ungrouped } = splitByGroup(day.houses);
                      return (
                        <>
                          {day.groups.map((g) => {
                            const gPositivo = g.result >= 0;
                            const key = `day:${day.date}:${g.groupId}`;
                            const gOpen = expandedGroups.has(key);
                            return (
                              <div key={g.groupId} className="rounded-xl bg-surface py-1.5">
                                <button
                                  onClick={() => toggleGroup(key)}
                                  className="flex w-full items-center justify-between gap-2 px-1 text-left"
                                  aria-expanded={gOpen}
                                >
                                  <span className="flex min-w-0 items-center gap-1.5">
                                    <ChevronRightIcon className={`h-3.5 w-3.5 shrink-0 text-ink-soft transition-transform ${gOpen ? "rotate-90" : ""}`} />
                                    <span className="truncate text-sm font-semibold text-ink">{g.name}</span>
                                  </span>
                                  <span className={`num text-sm ${gPositivo ? "text-success" : "text-danger"}`}>
                                    {gPositivo ? "+" : ""}
                                    {formatUnits(g.resultUnits)}
                                  </span>
                                </button>
                                {gOpen && <div className="pl-3">{(grouped.get(g.groupId) ?? []).map(houseRow)}</div>}
                              </div>
                            );
                          })}
                          {ungrouped.map(houseRow)}
                        </>
                      );
                    })()
                  )}
                  {day.date <= today && (
                    <button onClick={() => setTransferDate(day.date)} className="btn-secondary mt-2 w-full text-sm">
                      Saque / Depósito
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showChangeUnit && (
        <ChangeUnitValueModal
          currentValue={currentUnitValue}
          onClose={() => setShowChangeUnit(false)}
          onSaved={() => { setShowChangeUnit(false); load(); }}
        />
      )}
      {editing && monthId && (
        <UpdateBetBalanceModal
          monthId={monthId}
          houseId={editing.house.houseId}
          houseName={editing.house.name}
          date={editing.date}
          isToday={editing.date === today}
          currentBalance={editing.house.balance}
          startOfDayBalance={editing.startOfDay}
          currentOpeningOverride={editing.house.openingOverride}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setLastUpdate({ houseId: editing.house.houseId, date: editing.date, at: Date.now() });
            setEditing(null);
            load();
          }}
        />
      )}
      {transferDate && monthId && (
        <TransferModal
          monthId={monthId}
          date={transferDate}
          houses={(data.days.find((d) => d.date === transferDate)?.houses ?? [])
            .map((h) => ({ houseId: h.houseId, name: h.name }))}
          onClose={() => setTransferDate(null)}
          onSaved={() => { setTransferDate(null); load(); }}
        />
      )}
    </div>
  );
}
