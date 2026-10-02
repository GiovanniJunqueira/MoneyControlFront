import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { VisaoGeralResponse } from "../api/types";
import { PeriodNavigator } from "../components/PeriodNavigator";
import { CategoryBar } from "../components/CategoryBar";
import { ArrowLeftIcon } from "../components/icons";
import { formatCurrency } from "../utils/format";

export function OverviewPage() {
  const [periodKey, setPeriodKey] = useState<string | undefined>(undefined);
  const [total, setTotal] = useState(false);
  const [data, setData] = useState<VisaoGeralResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get<VisaoGeralResponse>("/dashboard/visao-geral", {
      params: { ...(periodKey ? { period: periodKey } : {}), total: total || undefined },
    });
    setData(res.data);
    setLoading(false);
  }, [periodKey, total]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return <p className="text-ink-soft">Carregando…</p>;
  }
  if (!data) return null;

  return (
    <div>
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Início
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Visão Geral</h1>
        <p className="mt-1 text-ink-soft">A soma de todas as suas abas.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setTotal(false)}
          className={`rounded-2xl border-2 px-3 py-2 text-[13px] font-medium transition-colors ${
            !total ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft"
          }`}
        >
          Por período
        </button>
        <button
          onClick={() => setTotal(true)}
          className={`rounded-2xl border-2 px-3 py-2 text-[13px] font-medium transition-colors ${
            total ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft"
          }`}
        >
          Ver total
        </button>
      </div>

      {total ? (
        <p className="mb-6 text-sm text-ink-soft">Soma de tudo, todos os meses.</p>
      ) : (
        <PeriodNavigator period={{ key: data.periodKey ?? "" }} onNavigate={setPeriodKey} />
      )}

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-sm text-ink-soft">Total gasto</p>
          <p className="num mt-1 text-2xl text-ink">{formatCurrency(data.resumoGastos.total)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink-soft">Total pendente</p>
          <p className="num mt-1 text-2xl text-danger">{formatCurrency(data.resumoDevedores.totalPendente)}</p>
        </div>
      </div>

      {data.abas.length > 0 && (
        <div className="card mb-4">
          <h2 className="mb-1 text-base font-bold text-ink">Por aba</h2>
          <div className="divide-y divide-line/70">
            {data.abas.map((aba) => {
              const percentual = data.resumoGastos.total > 0
                ? Math.round((aba.totalGastoPeriodo / data.resumoGastos.total) * 1000) / 10
                : 0;
              return (
                <CategoryBar
                  key={aba.id}
                  item={{ nome: aba.name, cor: aba.color, total: aba.totalGastoPeriodo, percentual }}
                />
              );
            })}
          </div>
        </div>
      )}

      {data.porCategoria.length > 0 && (
        <div className="card mb-4">
          <h2 className="mb-1 text-base font-bold text-ink">Por categoria</h2>
          <div className="divide-y divide-line/70">
            {data.porCategoria.map((c) => (
              <CategoryBar key={c.categoryId} item={{ nome: c.nome, cor: c.cor, total: c.total, percentual: c.percentual }} />
            ))}
          </div>
        </div>
      )}

      {data.porPessoa.length > 0 && (
        <div className="card">
          <h2 className="mb-1 text-base font-bold text-ink">Por pessoa</h2>
          <ul className="divide-y divide-line/70">
            {data.porPessoa.map((p) => (
              <li key={p.debtorId} className="list-row">
                <span className="text-[15px] font-medium text-ink">{p.nome}</span>
                <span className={`num text-[15px] ${p.totalDevido > 0 ? "text-danger" : "text-success"}`}>
                  {formatCurrency(p.totalDevido)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
