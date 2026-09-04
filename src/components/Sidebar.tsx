import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/gastos", label: "Gastos" },
  { to: "/devedores", label: "Devedores" },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Desktop: coluna fixa à esquerda */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-rule bg-paper-raised px-5 py-6 md:flex">
        <div className="mb-10">
          <span className="font-display text-xl font-medium text-ink">Financeiro</span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-sm px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-rule-soft pt-4">
          <p className="truncate text-sm text-ink-soft">{user?.name}</p>
          <button onClick={logout} className="mt-1 text-sm text-ledger-brick hover:underline">
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile: barra fixa no rodapé */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-rule bg-paper-raised md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-3 text-xs ${
                isActive ? "text-ink font-medium" : "text-ink-soft"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
