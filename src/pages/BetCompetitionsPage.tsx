import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { BetCompetition } from "../api/types";
import { CreateCompetitionModal } from "../components/CreateCompetitionModal";
import { JoinCompetitionModal } from "../components/JoinCompetitionModal";
import { ArrowLeftIcon, ChevronRightIcon, PlusIcon, UsersIcon } from "../components/icons";
import { formatMonthName } from "../utils/format";

function monthLabel(year: number, month: number) {
  return formatMonthName(`${year}-${String(month).padStart(2, "0")}`);
}

export function BetCompetitionsPage() {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState<BetCompetition[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<BetCompetition[]>("/bets/competitions");
    setCompetitions(res.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!competitions) {
    return <p className="pt-10 text-center text-ink-soft">Carregando…</p>;
  }

  return (
    <div className="pt-2">
      <Link to="/bets" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Bets
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Competições</h1>
        <p className="mt-1 text-ink-soft">Compare seu resultado do mês com outras pessoas.</p>
      </div>

      {competitions.length === 0 ? (
        <div className="card text-center">
          <UsersIcon className="mx-auto h-8 w-8 text-ink-soft" />
          <p className="mt-2 text-ink-soft">Você ainda não participa de nenhuma competição.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {competitions.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/bets/competitions/${c.id}`)}
              className="card flex w-full items-center justify-between gap-3 text-left"
            >
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium text-ink">{c.name}</span>
                <span className="block text-xs text-ink-soft">{monthLabel(c.year, c.month)}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {c.isCreator && <span className="pill bg-accent-soft text-accent">Sua</span>}
                <ChevronRightIcon className="h-4 w-4 text-ink-soft" />
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button onClick={() => setShowJoin(true)} className="btn-secondary flex-1">
          Entrar com código
        </button>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex-1 gap-1.5">
          <PlusIcon className="h-4 w-4" /> Criar competição
        </button>
      </div>

      {showCreate && (
        <CreateCompetitionModal
          onClose={() => setShowCreate(false)}
          onSaved={(c) => { setShowCreate(false); navigate(`/bets/competitions/${c.id}`); }}
        />
      )}
      {showJoin && (
        <JoinCompetitionModal
          onClose={() => setShowJoin(false)}
          onSaved={(c) => { setShowJoin(false); navigate(`/bets/competitions/${c.id}`); }}
        />
      )}
    </div>
  );
}
