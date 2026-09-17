import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";
import { WalletIcon, EyeIcon, EyeOffIcon } from "../components/icons";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/gastos");
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível entrar. Confira seus dados."));
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
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">Financeiro</h1>
            <p className="mt-1 text-ink-soft">Entre para ver seu resumo.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="email">E-mail</label>
              <input id="email" type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <label className="field-label" htmlFor="password">Senha</label>
                <Link to="/forgot-password" className="mb-1.5 text-[13px] font-medium text-accent">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="field pr-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Ainda não tem conta?{" "}
          <Link to="/register" className="font-semibold text-accent">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
