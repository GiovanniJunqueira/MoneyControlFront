import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { SunIcon, MoonIcon } from "./icons";

export function HomeLayout() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 pb-3 pt-[calc(env(safe-area-inset-top)+1.25rem)] md:pt-8">
        <span className="text-lg font-bold tracking-tight text-ink">Financeiro</span>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="icon-btn" aria-label="Alternar tema">
            {theme === "dark" ? <SunIcon className="h-[18px] w-[18px]" /> : <MoonIcon className="h-[18px] w-[18px]" />}
          </button>
          <button onClick={logout} className="text-sm font-medium text-danger">
            Sair
          </button>
        </div>
      </div>
      <main className="mx-auto max-w-2xl px-4 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
