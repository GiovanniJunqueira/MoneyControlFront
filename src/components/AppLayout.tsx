import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { api } from "../api/client";
import { Tab } from "../api/types";

export function AppLayout() {
  const { tabId } = useParams<{ tabId: string }>();
  const [tab, setTab] = useState<Tab | null>(null);

  useEffect(() => {
    if (!tabId) return;
    api.get<Tab[]>("/tabs").then((res) => {
      setTab(res.data.find((t) => t.id === tabId) ?? null);
    });
  }, [tabId]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-6xl md:gap-6 md:p-6">
        <Sidebar tab={tab} />
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 pb-28 pt-20 md:px-0 md:pb-10 md:pt-0">
          <div className="mx-auto max-w-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
