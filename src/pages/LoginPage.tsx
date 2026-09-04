import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-display-md text-ink">Financeiro</h1>
        <p className="mb-8 text-ink-soft">Entre para ver seu livro-caixa.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="email">E-mail</label>
            <input id="email" type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Senha</label>
            <input id="password" type="password" required className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <p className="text-sm text-ledger-brick">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-soft">
          Ainda não tem conta?{" "}
          <Link to="/register" className="text-ink underline decoration-rule underline-offset-4">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
