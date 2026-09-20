import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { BetMonthSummary, Friend } from "../api/types";
import { ArrowLeftIcon, ChevronRightIcon } from "../components/icons";
import { formatCurrency, formatUnits, formatMonthName } from "../utils/format";

export function BetFriendDetailPage() {
  const { friendUserId } = useParams<{ friendUserId: string }>();
  const navigate = useNavigate();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [months, setMonths] = useState<BetMonthSummary[] | null>(null);

  const load = useCallback(async () => {
    if (!friendUserId) return;
    const [friendsRes, monthsRes] = await Promise.all([
      api.get<Friend[]>("/bets/friends"),
      api.get<BetMonthSummary[]>(`/bets/friends/${friendUserId}/months`),
    ]);
    setFriend(friendsRes.data.find((f) => f.userId === friendUserId) ?? null);
    setMonths(monthsRes.data);
  }, [friendUserId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!months) {
    return <p className="pt-10 text-center text-ink-soft">Carregando…</p>;
  }

  return (
    <div className="pt-2">
      <Link to="/bets/friends" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Amigos
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{friend?.name ?? "Amigo"}</h1>
        <p className="mt-1 text-ink-soft">Resultado mensal por casa.</p>
      </div>

      {months.length === 0 ? (
        <div className="card text-center text-ink-soft">Nenhum mês registrado ainda.</div>
      ) : (
        <div className="space-y-3">
          {months.map((m) => {
            const positivo = m.profitLoss >= 0;
            return (
              <button
                key={m.id}
                onClick={() => navigate(`/bets/friends/${friendUserId}/months/${m.id}`)}
                className="card flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-medium text-ink">{formatMonthName(m.startDate.slice(0, 7))}</span>
                  {m.open && <span className="pill mt-1 inline-block bg-accent-soft text-accent">Atual</span>}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className={`num text-[15px] ${positivo ? "text-success" : "text-danger"}`}>
                    {positivo ? "+" : ""}
                    {formatUnits(m.profitLossUnits)}
                  </span>
                  <span className={`num text-xs ${positivo ? "text-success" : "text-danger"}`}>
                    ({positivo ? "+" : ""}
                    {formatCurrency(m.profitLoss)})
                  </span>
                  <ChevronRightIcon className="h-4 w-4 text-ink-soft" />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
