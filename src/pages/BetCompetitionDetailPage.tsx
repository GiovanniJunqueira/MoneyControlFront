import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { BetCompetitionRanking } from "../api/types";
import { ArrowLeftIcon, ChevronRightIcon } from "../components/icons";
import { formatDate, formatMonthName, formatUnits } from "../utils/format";

function monthLabel(year: number, month: number) {
  return formatMonthName(`${year}-${String(month).padStart(2, "0")}`);
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function BetCompetitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ranking, setRanking] = useState<BetCompetitionRanking | null>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(userId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  const load = useCallback(async () => {
    if (!id) return;
    const res = await api.get<BetCompetitionRanking>(`/bets/competitions/${id}/ranking`);
    setRanking(res.data);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function copyCode() {
    if (!ranking) return;
    try {
      await navigator.clipboard.writeText(ranking.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível - sem tratamento especial, só não mostra o feedback
    }
  }

  if (!ranking) {
    return <p className="pt-10 text-center text-ink-soft">Carregando…</p>;
  }

  return (
    <div className="pt-2">
      <Link to="/bets/competitions" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Competições
      </Link>

      <div className="mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{ranking.name}</h1>
        <p className="mt-1 text-ink-soft">{monthLabel(ranking.year, ranking.month)}</p>
      </div>

      <button onClick={copyCode} className="card mb-4 flex w-full items-center justify-between gap-3 text-left">
        <span>
          <span className="block text-xs text-ink-soft">Código pra convidar</span>
          <span className="num block text-lg font-semibold tracking-[0.2em] text-ink">{ranking.code}</span>
        </span>
        <span className="pill bg-accent-soft text-accent">{copied ? "Copiado!" : "Copiar"}</span>
      </button>

      <div className="card">
        <h2 className="mb-1 text-base font-bold text-ink">Ranking</h2>
        <ul className="divide-y divide-line/70">
          {ranking.ranking.map((entry) => {
            const positivo = entry.profitLossUnits >= 0;
            const medal = MEDALS[entry.position - 1];
            const canExpand = entry.recentDays.length > 0;
            const isOpen = expanded.has(entry.userId);
            return (
              <li key={entry.userId} className={`${entry.isYou ? "rounded-2xl bg-accent-soft/40" : ""}`}>
                <button
                  onClick={() => canExpand && toggle(entry.userId)}
                  className="list-row w-full text-left"
                  aria-expanded={canExpand ? isOpen : undefined}
                  disabled={!canExpand}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="w-6 shrink-0 text-center text-sm font-semibold text-ink-soft">
                      {medal ?? entry.position}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium text-ink">
                        {entry.userName}
                        {entry.isYou && <span className="pill ml-1.5 bg-accent-soft text-accent">Você</span>}
                      </span>
                      {!entry.hasData && <span className="block text-xs text-ink-soft">Sem mês registrado nesse período</span>}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className={`num text-[15px] ${positivo ? "text-success" : "text-danger"}`}>
                      {positivo ? "+" : ""}
                      {formatUnits(entry.profitLossUnits)}
                    </span>
                    {canExpand && (
                      <ChevronRightIcon className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    )}
                  </span>
                </button>
                {isOpen && canExpand && (
                  <div className="-mt-1 mb-3 space-y-1 rounded-2xl bg-surface-soft p-3">
                    {entry.recentDays.map((day) => {
                      const dayPositivo = day.resultUnits >= 0;
                      return (
                        <div key={day.date} className="flex items-center justify-between gap-2 py-1">
                          <span className="text-sm text-ink-soft">{formatDate(day.date)}</span>
                          <span className={`num text-sm ${dayPositivo ? "text-success" : "text-danger"}`}>
                            {dayPositivo ? "+" : ""}
                            {formatUnits(day.resultUnits)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
