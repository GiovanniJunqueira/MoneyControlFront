import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, extractErrorMessage } from "../api/client";
import { BetMonthSummary, BetOverview } from "../api/types";
import { CreateBetHouseModal } from "../components/CreateBetHouseModal";
import { ManageBetHousesModal } from "../components/ManageBetHousesModal";
import { StartBetMonthModal } from "../components/StartBetMonthModal";
import { PlusIcon, SettingsIcon, ChevronRightIcon, TrashIcon, UsersIcon } from "../components/icons";
import { formatCurrency, formatUnits, formatMonthName } from "../utils/format";

export function BetsHomePage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<BetOverview | null>(null);
  const [months, setMonths] = useState<BetMonthSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateHouse, setShowCreateHouse] = useState(false);
  const [showManageHouses, setShowManageHouses] = useState(false);
  const [showStartMonth, setShowStartMonth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

  function toggleYear(year: string) {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }

  const load = useCallback(async () => {
    setLoading(true);
    const [overviewRes, monthsRes] = await Promise.all([
      api.get<BetOverview>("/bets/overview"),
      api.get<BetMonthSummary[]>("/bets/months"),
    ]);
    setOverview(overviewRes.data);
    setMonths(monthsRes.data);
    setLoading(false);
  }, []);

  async function handleDeleteMonth(id: string, label: string) {
    if (!window.confirm(`Excluir ${label}? Isso apaga todos os dias e saldos registrados nesse mês, sem volta.`)) {
      return;
    }
    setError(null);
    try {
      await api.delete(`/bets/months/${id}`);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível excluir esse mês."));
    }
  }

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !overview) {
    return <p className="pt-10 text-center text-ink-soft">Carregando…</p>;
  }

  const hasOpenMonth = months.some((m) => m.open);
  const lucroPositivo = (overview?.totalProfitLoss ?? 0) >= 0;
  const currentUnitValue = overview?.currentUnitValue ?? 0;

  // months já vem mais-recente-primeiro da API - agrupar preservando essa ordem deixa os anos
  // também do mais recente pro mais antigo, sem precisar ordenar de novo.
  const yearGroups = (() => {
    const map = new Map<string, BetMonthSummary[]>();
    for (const m of months) {
      const year = m.startDate.slice(0, 4);
      const list = map.get(year) ?? [];
      list.push(m);
      map.set(year, list);
    }
    return Array.from(map.entries()).map(([year, list]) => {
      const yearProfit = list.reduce((sum, m) => sum + m.profitLoss, 0);
      return {
        year,
        months: list,
        yearProfit,
        yearProfitUnits: currentUnitValue ? yearProfit / currentUnitValue : 0,
      };
    });
  })();

  return (
    <div className="pt-2">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Bets</h1>
        <p className="mt-1 text-ink-soft">Sua banca, em unidades.</p>
      </div>

      <div className="card mb-4">
        <p className="text-sm text-ink-soft">Lucro total</p>
        <p className={`num mt-1 text-3xl ${lucroPositivo ? "text-success" : "text-danger"}`}>
          {lucroPositivo ? "+" : ""}
          {formatUnits(overview?.totalProfitLossUnits ?? 0)}
        </p>
        <p className={`num text-sm ${lucroPositivo ? "text-success" : "text-danger"}`}>
          {lucroPositivo ? "+" : ""}
          {formatCurrency(overview?.totalProfitLoss ?? 0)}
        </p>
        <p className="num mt-3 text-sm text-ink-soft">
          banca: {formatCurrency(overview?.totalBanca ?? 0)} · {formatUnits(overview?.totalBancaUnits ?? 0)}
        </p>
        {overview && overview.groupBanca.length > 0 && (
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            {overview.groupBanca.map((g) => (
              <span key={g.groupId} className="num text-xs text-ink-soft">
                {g.name}: {formatCurrency(g.banca)}
              </span>
            ))}
          </p>
        )}
      </div>

      {months.length === 0 ? (
        <div className="card text-center">
          <p className="text-ink-soft">Você ainda não iniciou nenhum mês.</p>
          <button onClick={() => setShowStartMonth(true)} className="btn-primary mt-4 w-full">
            Iniciar meu primeiro mês
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {yearGroups.map((yg) => {
              const yearPositivo = yg.yearProfit >= 0;
              const isOpen = expandedYears.has(yg.year);
              return (
                <div key={yg.year} className="card">
                  <button
                    onClick={() => toggleYear(yg.year)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[15px] font-medium text-ink">{yg.year}</span>
                    <span className="flex items-center gap-1.5">
                      <span className={`num text-[15px] ${yearPositivo ? "text-success" : "text-danger"}`}>
                        {yearPositivo ? "+" : ""}
                        {formatUnits(yg.yearProfitUnits)}
                      </span>
                      <ChevronRightIcon className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="-mx-1 mt-3 space-y-3 rounded-2xl bg-surface-soft p-3">
                      {yg.months.map((m) => {
                        const positivo = m.profitLoss >= 0;
                        const label = formatMonthName(m.startDate.slice(0, 7));
                        return (
                          <div key={m.id} className="card flex items-center gap-1">
                            <button
                              onClick={() => navigate(`/bets/months/${m.id}`)}
                              className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <span className="truncate text-[15px] font-medium text-ink">{label}</span>
                                {m.open && <span className="pill shrink-0 bg-accent-soft text-accent">Atual</span>}
                              </span>
                              <span className="flex shrink-0 items-center gap-1.5">
                                <span className={`num text-[15px] ${positivo ? "text-success" : "text-danger"}`}>
                                  {positivo ? "+" : ""}
                                  {formatUnits(m.profitLossUnits)}
                                </span>
                                <ChevronRightIcon className="h-4 w-4 text-ink-soft" />
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteMonth(m.id, label)}
                              className="icon-btn h-8 w-8 shrink-0 text-danger"
                              aria-label={`Excluir ${label}`}
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}

          <button onClick={() => setShowStartMonth(true)} className="btn-secondary mt-4 w-full">
            Iniciar novo mês
          </button>
        </>
      )}

      <button onClick={() => navigate("/bets/competitions")} className="btn-secondary mt-4 w-full gap-1.5">
        <UsersIcon className="h-4 w-4" /> Competições
      </button>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <button onClick={() => setShowManageHouses(true)} className="btn-secondary flex-1 gap-1.5">
          <SettingsIcon className="h-4 w-4" /> Gerenciar casas
        </button>
        <button onClick={() => setShowCreateHouse(true)} className="btn-primary flex-1 gap-1.5">
          <PlusIcon className="h-4 w-4" /> Nova casa
        </button>
      </div>

      {showCreateHouse && (
        <CreateBetHouseModal onClose={() => setShowCreateHouse(false)} onSaved={() => { setShowCreateHouse(false); load(); }} />
      )}
      {showManageHouses && <ManageBetHousesModal onClose={() => setShowManageHouses(false)} onChanged={load} />}
      {showStartMonth && (
        <StartBetMonthModal hasOpenMonth={hasOpenMonth} onClose={() => setShowStartMonth(false)} onSaved={() => { setShowStartMonth(false); load(); }} />
      )}
    </div>
  );
}
