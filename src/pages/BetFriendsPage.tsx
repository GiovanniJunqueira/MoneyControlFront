import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, extractErrorMessage } from "../api/client";
import { Friend, FriendRequest } from "../api/types";
import { AddFriendModal } from "../components/AddFriendModal";
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon, PlusIcon, UsersIcon, XIcon } from "../components/icons";

export function BetFriendsPage() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [friendsRes, requestsRes] = await Promise.all([
      api.get<Friend[]>("/bets/friends"),
      api.get<FriendRequest[]>("/bets/friends/requests"),
    ]);
    setFriends(friendsRes.data);
    setRequests(requestsRes.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function accept(id: string) {
    setError(null);
    try {
      await api.post(`/bets/friends/requests/${id}/accept`);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function decline(id: string) {
    setError(null);
    try {
      await api.post(`/bets/friends/requests/${id}/decline`);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (!friends) {
    return <p className="pt-10 text-center text-ink-soft">Carregando…</p>;
  }

  return (
    <div className="pt-2">
      <Link to="/bets" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Bets
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Amigos</h1>
        <p className="mt-1 text-ink-soft">Veja o resultado mensal por casa de quem te aceitou.</p>
      </div>

      {feedback && <p className="mb-4 text-sm text-success">{feedback}</p>}
      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      {requests.length > 0 && (
        <div className="card mb-4">
          <h2 className="mb-1 text-base font-bold text-ink">Convites recebidos</h2>
          <ul className="divide-y divide-line/70">
            {requests.map((r) => (
              <li key={r.id} className="list-row">
                <span className="min-w-0 truncate text-[15px] font-medium text-ink">{r.fromUserName}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <button onClick={() => decline(r.id)} className="icon-btn" aria-label="Recusar">
                    <XIcon className="h-4 w-4 text-danger" />
                  </button>
                  <button onClick={() => accept(r.id)} className="icon-btn" aria-label="Aceitar">
                    <CheckIcon className="h-4 w-4 text-success" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {friends.length === 0 ? (
        <div className="card text-center">
          <UsersIcon className="mx-auto h-8 w-8 text-ink-soft" />
          <p className="mt-2 text-ink-soft">Você ainda não tem amigos adicionados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {friends.map((f) => (
            <button
              key={f.userId}
              onClick={() => navigate(`/bets/friends/${f.userId}`)}
              className="card flex w-full items-center justify-between gap-3 text-left"
            >
              <span className="min-w-0 truncate text-[15px] font-medium text-ink">{f.name}</span>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-soft" />
            </button>
          ))}
        </div>
      )}

      <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 w-full gap-1.5">
        <PlusIcon className="h-4 w-4" /> Adicionar amigo
      </button>

      {showAdd && (
        <AddFriendModal
          onClose={() => setShowAdd(false)}
          onSaved={(result) => {
            setShowAdd(false);
            setFeedback(result.friended
              ? `Vocês agora são amigos com ${result.otherUserName}!`
              : `Convite enviado pra ${result.otherUserName} - aguarde ela aceitar.`);
            load();
          }}
        />
      )}
    </div>
  );
}
