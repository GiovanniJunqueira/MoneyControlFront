import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Tab, VisaoGeralResponse } from "../api/types";
import { DonutTabChart } from "../components/DonutTabChart";
import { CreateTabModal } from "../components/CreateTabModal";
import { ManageTabsModal } from "../components/ManageTabsModal";
import { PlusIcon, SettingsIcon, ChevronRightIcon, UsersIcon } from "../components/icons";
import { formatCurrency } from "../utils/format";

export function HomePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<VisaoGeralResponse | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [visaoRes, tabsRes] = await Promise.all([
      api.get<VisaoGeralResponse>("/dashboard/visao-geral"),
      api.get<Tab[]>("/tabs"),
    ]);
    setData(visaoRes.data);
    setTabs(tabsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return <p className="pt-10 text-center text-ink-soft">Carregando…</p>;
  }
  if (!data) return null;

  return (
    <div className="pt-2">
      <p className="mb-8 text-center text-ink-soft">Escolha uma aba ou veja a visão geral.</p>

      <DonutTabChart
        abas={data.abas}
        totalGeral={data.resumoGastos.total}
        onSelect={(tabId) => navigate(`/tabs/${tabId}/gastos`)}
        onCenterClick={() => navigate("/visao-geral")}
      />

      <div className="card mt-8">
        <ul className="divide-y divide-line/70">
          {data.abas.map((aba) => (
            <li key={aba.id}>
              <button
                onClick={() => navigate(`/tabs/${aba.id}/gastos`)}
                className="list-row -mx-1 w-[calc(100%+0.5rem)] rounded-2xl px-1 text-left transition-colors hover:bg-surface-soft active:bg-surface-soft"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: aba.color || "#8E8E93" }} />
                  <span className="truncate text-[15px] font-medium text-ink">{aba.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className="num text-[15px] text-ink">{formatCurrency(aba.totalGastoPeriodo)}</span>
                  <ChevronRightIcon className="h-4 w-4 text-ink-soft" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => navigate("/devedores")}
        className="card mt-4 flex w-full items-center justify-between gap-3 text-left transition-colors hover:bg-surface-soft active:bg-surface-soft"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
            <UsersIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[15px] font-semibold text-ink">Devedores</span>
            <span className="block text-xs text-ink-soft">Quem te deve, no total</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="num text-[15px] text-danger">{formatCurrency(data.resumoDevedores.totalPendente)}</span>
          <ChevronRightIcon className="h-4 w-4 text-ink-soft" />
        </span>
      </button>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button onClick={() => setShowManage(true)} className="btn-secondary flex-1 gap-1.5">
          <SettingsIcon className="h-4 w-4" /> Gerenciar abas
        </button>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex-1 gap-1.5">
          <PlusIcon className="h-4 w-4" /> Nova aba
        </button>
      </div>

      {showCreate && (
        <CreateTabModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); load(); }} />
      )}
      {showManage && (
        <ManageTabsModal tabs={tabs} onClose={() => setShowManage(false)} onChanged={load} />
      )}
    </div>
  );
}
