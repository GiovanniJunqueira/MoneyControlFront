import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/gastos");
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível criar sua conta."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-display-md text-ink">Financeiro</h1>
        <p className="mb-8 text-ink-soft">Crie sua conta pra começar a lançar.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="name">Nome</label>
            <input id="name" required className="field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="email">E-mail</label>
            <input id="email" type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Senha</label>
            <input id="password" type="password" required minLength={6} className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="mt-1 text-xs text-ink-soft">Mínimo de 6 caracteres.</p>
          </div>

          {error && <p className="text-sm text-ledger-brick">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Criando conta…" : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-soft">
          Já tem conta?{" "}
          <Link to="/login" className="text-ink underline decoration-rule underline-offset-4">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
