import { Link, NavLink, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Tab } from "../api/types";
import { WalletIcon, UsersIcon, SunIcon, MoonIcon, HomeIcon } from "./icons";

interface Props {
  tab: Tab | null;
}

export function Sidebar({ tab }: Props) {
  const { tabId } = useParams<{ tabId: string }>();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { to: `/tabs/${tabId}/gastos`, label: "Gastos", icon: WalletIcon },
    { to: `/tabs/${tabId}/devedores`, label: "Devedores", icon: UsersIcon },
  ];

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-3xl bg-surface p-5 shadow-sm shadow-black/5 ring-1 ring-line/70 md:flex">
        <div className="mb-8 flex items-center justify-between gap-2 px-1">
          <Link to="/" className="flex min-w-0 items-center gap-2 text-ink-soft hover:text-ink" aria-label="Voltar pro início">
            <HomeIcon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate text-[15px] font-bold tracking-tight text-ink">{tab?.name ?? "Financeiro"}</span>
          </Link>
          <button onClick={toggleTheme} className="icon-btn shrink-0" aria-label="Alternar tema">
            {theme === "dark" ? <SunIcon className="h-[18px] w-[18px]" /> : <MoonIcon className="h-[18px] w-[18px]" />}
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[15px] font-medium transition-colors ${
                  isActive ? "bg-accent text-white" : "text-ink-soft hover:bg-surface-soft hover:text-ink"
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-line pt-4">
          <p className="truncate px-1 text-sm font-medium text-ink">{user?.name}</p>
          <button onClick={logout} className="mt-1 px-1 text-sm text-danger hover:underline">
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile: barra de topo */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-2 bg-bg/80 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-lg md:hidden">
        <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="Voltar pro início">
          <HomeIcon className="h-[18px] w-[18px] shrink-0 text-ink-soft" />
          <span className="truncate text-lg font-bold tracking-tight text-ink">{tab?.name ?? "Financeiro"}</span>
        </Link>
        <button onClick={toggleTheme} className="icon-btn shrink-0 bg-surface shadow-sm" aria-label="Alternar tema">
          {theme === "dark" ? <SunIcon className="h-[18px] w-[18px]" /> : <MoonIcon className="h-[18px] w-[18px]" />}
        </button>
      </div>

      {/* Mobile: barra de navegação inferior */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-line bg-surface/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium">
            {({ isActive }) => (
              <>
                <item.icon className={`h-6 w-6 ${isActive ? "text-accent" : "text-ink-soft"}`} />
                <span className={isActive ? "text-accent" : "text-ink-soft"}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <NavLink to="/" end className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium">
          <HomeIcon className="h-6 w-6 text-ink-soft" />
          <span className="text-ink-soft">Início</span>
        </NavLink>
      </nav>
    </>
  );
}
