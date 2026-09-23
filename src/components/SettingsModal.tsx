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
  const { user, updateSettings, updateWhatsAppPhone } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState(user?.whatsappPhone ?? "");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSaved, setPhoneSaved] = useState(false);

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

  async function handleSavePhone() {
    setPhoneError(null);
    setPhoneSaved(false);
    setSavingPhone(true);
    try {
      await updateWhatsAppPhone(phone);
      setPhoneSaved(true);
      setTimeout(() => setPhoneSaved(false), 2000);
    } catch (err) {
      setPhoneError(extractErrorMessage(err));
    } finally {
      setSavingPhone(false);
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

        <div className="border-t border-line/70 pt-5">
          <p className="text-[15px] font-medium text-ink">Bot do WhatsApp</p>
          <p className="mt-0.5 text-xs text-ink-soft">
            Cadastre seu número (com DDI e DDD) pra lançar gastos mandando mensagem, ex: "50 mercado".
          </p>
          <div className="mt-3 flex gap-2">
            <input
              className="field"
              placeholder="Ex: 5511987654321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button onClick={handleSavePhone} disabled={savingPhone} className="btn-secondary shrink-0 px-4">
              {savingPhone ? "Salvando…" : phoneSaved ? "Salvo!" : "Salvar"}
            </button>
          </div>
          {phoneError && <p className="mt-2 text-sm text-danger">{phoneError}</p>}
        </div>
      </div>
    </Modal>
  );
}
