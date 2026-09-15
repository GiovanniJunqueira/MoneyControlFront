import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Tab, VisaoGeralResponse } from "../api/types";
import { DonutTabChart } from "../components/DonutTabChart";
import { CreateTabModal } from "../components/CreateTabModal";
import { ManageTabsModal } from "../components/ManageTabsModal";
import { PlusIcon, SettingsIcon, ChevronRightIcon } from "../components/icons";
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
    <div className="pt-4">
      <h1 className="mb-1 text-center text-2xl font-extrabold tracking-tight text-ink">Financeiro</h1>
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
                className="list-row w-full text-left transition-colors hover:bg-surface-soft"
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
