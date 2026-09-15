import { useState } from "react";
import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SettingsIcon, WalletIcon } from "./icons";
import { SettingsModal } from "./SettingsModal";

export function BetsLayout() {
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  if (!user?.betsEnabled) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 pb-3 pt-[calc(env(safe-area-inset-top)+1.25rem)] md:pt-8">
        <Link to="/bets" className="text-lg font-bold tracking-tight text-ink">Bets</Link>
        <div className="flex items-center gap-2">
          <Link to="/" className="icon-btn" aria-label="Ir para o Financeiro">
            <WalletIcon className="h-[18px] w-[18px]" />
          </Link>
          <button onClick={() => setShowSettings(true)} className="icon-btn" aria-label="Configurações">
            <SettingsIcon className="h-[18px] w-[18px]" />
          </button>
          <button onClick={logout} className="text-sm font-medium text-danger">
            Sair
          </button>
        </div>
      </div>
      <main className="mx-auto max-w-2xl px-4 pb-16">
        <Outlet />
      </main>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
