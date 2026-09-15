import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { BetHouse, BetHouseBalance, BetMonth } from "../api/types";
import { CreateBetHouseModal } from "../components/CreateBetHouseModal";
import { ManageBetHousesModal } from "../components/ManageBetHousesModal";
import { StartBetMonthModal } from "../components/StartBetMonthModal";
import { ChangeUnitValueModal } from "../components/ChangeUnitValueModal";
import { UpdateBetBalanceModal } from "../components/UpdateBetBalanceModal";
import { CategoryBar } from "../components/CategoryBar";
import { PlusIcon, SettingsIcon } from "../components/icons";
import { formatCurrency, formatUnits, formatDateLong } from "../utils/format";

export function BetsHomePage() {
  const [month, setMonth] = useState<BetMonth | null | undefined>(undefined);
  const [houses, setHouses] = useState<BetHouse[]>([]);
  const [showCreateHouse, setShowCreateHouse] = useState(false);
  const [showManageHouses, setShowManageHouses] = useState(false);
  const [showStartMonth, setShowStartMonth] = useState(false);
  const [showChangeUnit, setShowChangeUnit] = useState(false);
  const [balanceHouse, setBalanceHouse] = useState<BetHouseBalance | null>(null);

  const load = useCallback(async () => {
    const [monthRes, housesRes] = await Promise.all([
      api.get<BetMonth>("/bets/months/current"),
      api.get<BetHouse[]>("/bets/houses"),
    ]);
    setMonth(monthRes.status === 204 ? null : monthRes.data);
    setHouses(housesRes.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (month === undefined) {
    return <p className="pt-10 text-center text-ink-soft">Carregando…</p>;
  }

  const lucroPositivo = !!month && month.profitLoss >= 0;

  return (
    <div className="pt-2">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Bets</h1>
        <p className="mt-1 text-ink-soft">Sua banca, em unidades.</p>
      </div>

      {!month ? (
        <div className="card text-center">
          <p className="text-ink-soft">Você ainda não iniciou nenhum mês.</p>
          <button onClick={() => setShowStartMonth(true)} className="btn-primary mt-4 w-full">
            Iniciar meu primeiro mês
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="card">
              <p className="text-sm text-ink-soft">Banca total</p>
              <p className="num mt-1 text-2xl text-ink">{formatUnits(month.totalBancaUnits)}</p>
              <p className="num text-xs text-ink-soft">{formatCurrency(month.totalBanca)}</p>
            </div>
            <div className="card">
              <p className="text-sm text-ink-soft">Lucro do mês</p>
              <p className={`num mt-1 text-2xl ${lucroPositivo ? "text-success" : "text-danger"}`}>
                {lucroPositivo ? "+" : ""}
                {formatUnits(month.profitLossUnits)}
              </p>
              <p className={`num text-xs ${lucroPositivo ? "text-success" : "text-danger"}`}>
                {lucroPositivo ? "+" : ""}
                {formatCurrency(month.profitLoss)}
              </p>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-ink-soft">
            Unidade atual: <span className="num">{formatCurrency(month.unitValue)}</span> · desde {formatDateLong(month.startDate)}
          </p>

          {month.houses.length > 0 && (
            <div className="card mt-4">
              <p className="mb-1 text-sm font-semibold text-ink">Por casa</p>
              {month.houses.map((h) => (
                <CategoryBar
                  key={h.id}
                  item={{
                    nome: h.name,
                    cor: h.color,
                    total: h.currentBalance,
                    percentual: month.totalBanca === 0 ? 0 : Math.round((h.currentBalance / month.totalBanca) * 1000) / 10,
                  }}
                />
              ))}
            </div>
          )}

          <div className="card mt-4">
            {month.houses.length === 0 ? (
              <p className="py-4 text-sm text-ink-soft">Cadastre uma casa pra começar a acompanhar o saldo.</p>
            ) : (
              <ul className="divide-y divide-line/70">
                {month.houses.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: h.color || "#8E8E93" }} />
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-medium text-ink">{h.name}</span>
                        <span className="num block text-xs text-ink-soft">
                          {formatUnits(h.currentBalanceUnits)} · {formatCurrency(h.currentBalance)}
                        </span>
                      </span>
                    </span>
                    <button
                      onClick={() => setBalanceHouse(h)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        h.updatedToday ? "bg-surface-soft text-ink-soft" : "bg-accent-soft text-accent"
                      }`}
                    >
                      {h.updatedToday ? "Atualizado" : "Atualizar hoje"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={() => setShowChangeUnit(true)} className="btn-secondary mt-4 w-full">
            Trocar valor da unidade
          </button>
          <button onClick={() => setShowStartMonth(true)} className="btn-secondary mt-2 w-full">
            Iniciar novo mês
          </button>
        </>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
      {showManageHouses && (
        <ManageBetHousesModal houses={houses} onClose={() => setShowManageHouses(false)} onChanged={load} />
      )}
      {showStartMonth && (
        <StartBetMonthModal hasOpenMonth={!!month} onClose={() => setShowStartMonth(false)} onSaved={() => { setShowStartMonth(false); load(); }} />
      )}
      {showChangeUnit && month && (
        <ChangeUnitValueModal currentValue={month.unitValue} onClose={() => setShowChangeUnit(false)} onSaved={() => { setShowChangeUnit(false); load(); }} />
      )}
      {balanceHouse && (
        <UpdateBetBalanceModal house={balanceHouse} onClose={() => setBalanceHouse(null)} onSaved={() => { setBalanceHouse(null); load(); }} />
      )}
    </div>
  );
}
