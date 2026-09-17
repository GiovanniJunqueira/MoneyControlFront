import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, extractErrorMessage } from "../api/client";
import { WalletIcon, EyeIcon, EyeOffIcon } from "../components/icons";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("As senhas não são iguais.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setDone(true);
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível redefinir a senha. O link pode ter expirado."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="card">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white">
              <WalletIcon className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">Nova senha</h1>
            <p className="mt-1 text-ink-soft">Escolha uma nova senha para sua conta.</p>
          </div>

          {!token ? (
            <p className="text-center text-sm text-danger">
              Link inválido. Peça um novo link em "Esqueceu a senha?" na tela de entrar.
            </p>
          ) : done ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-ink-soft">Senha redefinida com sucesso.</p>
              <button onClick={() => navigate("/login")} className="btn-primary w-full">
                Ir para o login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="field-label" htmlFor="newPassword">Nova senha</label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="field pr-11"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="icon-btn absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-ink-soft">Mínimo de 6 caracteres.</p>
              </div>

              <div>
                <label className="field-label" htmlFor="confirmPassword">Confirmar senha</label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Salvando…" : "Redefinir senha"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Lembrou a senha?{" "}
          <Link to="/login" className="font-semibold text-accent">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
