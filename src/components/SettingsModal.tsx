import { useState } from "react";
import { Modal } from "./Modal";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { SunIcon, MoonIcon } from "./icons";
import { extractErrorMessage } from "../api/client";

interface Props {
  onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { user, updateSettings } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggleBets() {
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      await updateSettings({ betsEnabled: !user.betsEnabled });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Configurações" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <span className="field-label">Aparência</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => theme === "dark" && toggleTheme()}
              className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-[15px] font-medium transition-colors ${
                theme === "light" ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft"
              }`}
            >
              <SunIcon className="h-4 w-4" /> Claro
            </button>
            <button
              onClick={() => theme === "light" && toggleTheme()}
              className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-[15px] font-medium transition-colors ${
                theme === "dark" ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft"
              }`}
            >
              <MoonIcon className="h-4 w-4" /> Escuro
            </button>
          </div>
        </div>

        <div className="border-t border-line/70 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-ink">Bets</p>
              <p className="text-xs text-ink-soft">Ativa o controle de banca de apostas, separado do Financeiro.</p>
            </div>
            <button
              onClick={handleToggleBets}
              disabled={saving}
              role="switch"
              aria-checked={user?.betsEnabled ?? false}
              aria-label="Ativar Bets"
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                user?.betsEnabled ? "bg-accent" : "bg-surface-soft"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  user?.betsEnabled ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>
      </div>
    </Modal>
  );
}
