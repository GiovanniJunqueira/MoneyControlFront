import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { DevedorGeral } from "../api/types";
import { ArrowLeftIcon } from "../components/icons";
import { formatCurrency } from "../utils/format";

export function DevedoresGeralPage() {
  const navigate = useNavigate();
  const [devedores, setDevedores] = useState<DevedorGeral[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get<DevedorGeral[]>("/dashboard/devedores-geral");
    setDevedores(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = devedores.reduce((sum, d) => sum + d.totalDevido, 0);

  return (
    <div>
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Início
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Devedores</h1>
        <p className="mt-1 text-ink-soft">Quem te deve, em todas as abas.</p>
      </div>

      <div className="card mb-4">
        <p className="text-sm text-ink-soft">Total pendente</p>
        <p className="num mt-1 text-2xl text-danger">{formatCurrency(total)}</p>
      </div>

      <div className="card">
        {loading ? (
          <p className="py-2 text-sm text-ink-soft">Carregando…</p>
        ) : devedores.length === 0 ? (
          <p className="py-6 text-sm text-ink-soft">Ninguém te deve nada em nenhuma aba, por enquanto.</p>
        ) : (
          <ul className="divide-y divide-line/70">
            {devedores.map((d) => (
              <li key={`${d.tabId}-${d.debtorId}`}>
                <button
                  onClick={() => navigate(`/tabs/${d.tabId}/devedores/${d.debtorId}`)}
                  className="list-row -mx-1 w-[calc(100%+0.5rem)] rounded-2xl px-1 text-left transition-colors hover:bg-surface-soft active:bg-surface-soft"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-ink">{d.nome}</p>
                    <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.tabColor || "#8E8E93" }} />
                      {d.tabName} · {d.quantidadeDividas} {d.quantidadeDividas === 1 ? "dívida" : "dívidas"}
                    </p>
                  </div>
                  <span className="num shrink-0 text-[15px] text-danger">{formatCurrency(d.totalDevido)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
