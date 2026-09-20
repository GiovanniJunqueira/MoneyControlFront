import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { BetFriendMonthDetail, BetHouseMonthSummary, Friend } from "../api/types";
import { ArrowLeftIcon, ChevronRightIcon } from "../components/icons";
import { formatCurrency, formatUnits, formatMonthName } from "../utils/format";

/** Igual ao splitByGroup de BetMonthDetailPage - separa casas com grupo (renderizadas com o
 * subtotal do grupo) das sem grupo (soltas). */
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

export function BetFriendDetailPage() {
  const { friendUserId } = useParams<{ friendUserId: string }>();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [data, setData] = useState<BetFriendMonthDetail | null>(null);
  const [noCurrentMonth, setNoCurrentMonth] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!friendUserId) return;
    const friendsRes = await api.get<Friend[]>("/bets/friends");
    setFriend(friendsRes.data.find((f) => f.userId === friendUserId) ?? null);
    try {
      const res = await api.get<BetFriendMonthDetail>(`/bets/friends/${friendUserId}/current-month`);
      setData(res.data);
      setNoCurrentMonth(false);
    } catch {
      setData(null);
      setNoCurrentMonth(true);
    } finally {
      setLoaded(true);
    }
  }, [friendUserId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!loaded) {
    return <p className="pt-10 text-center text-ink-soft">Carregando…</p>;
  }

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const { grouped, ungrouped } = data
    ? splitByGroup(data.houseSummaries)
    : { grouped: new Map<string, BetHouseMonthSummary[]>(), ungrouped: [] as BetHouseMonthSummary[] };
  ungrouped.sort((a, b) => b.totalResult - a.totalResult);
  for (const members of grouped.values()) {
    members.sort((a, b) => b.totalResult - a.totalResult);
  }
  const groupSummariesSorted = data ? [...data.groupSummaries].sort((a, b) => b.totalResult - a.totalResult) : [];
  const positivo = (data?.profitLoss ?? 0) >= 0;

  return (
    <div className="pt-2">
      <Link to="/bets/friends" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Amigos
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{friend?.name ?? "Amigo"}</h1>
        <p className="mt-1 text-ink-soft">
          {data ? `Mês atual: ${formatMonthName(data.startDate.slice(0, 7))}` : "Resultado do mês atual, por casa."}
        </p>
      </div>

      {noCurrentMonth || !data ? (
        <div className="card text-center text-ink-soft">Essa pessoa não tem nenhum mês em andamento agora.</div>
      ) : (
        <>
          <p className="mb-4">
            <span className={`num text-lg font-semibold ${positivo ? "text-success" : "text-danger"}`}>
              {positivo ? "+" : ""}
              {formatUnits(data.profitLossUnits)} · {positivo ? "+" : ""}
              {formatCurrency(data.profitLoss)}
            </span>
          </p>

          {data.houseSummaries.length === 0 ? (
            <div className="card text-center text-ink-soft">Sem casas registradas nesse mês ainda.</div>
          ) : (
            <div className="card">
              <h2 className="mb-1 text-sm font-semibold text-ink">Por casa</h2>
              <ul className="mt-2 divide-y divide-line/70">
                {groupSummariesSorted.map((g) => {
                  const gPositivo = g.totalResult >= 0;
                  const gOpen = expandedGroups.has(g.groupId);
                  return (
                    <li key={g.groupId} className="py-2">
                      <button
                        onClick={() => toggleGroup(g.groupId)}
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
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
