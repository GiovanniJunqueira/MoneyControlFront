import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { api, extractErrorMessage } from "../api/client";
import { WalletIcon } from "../components/icons";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível enviar o e-mail. Tente novamente."));
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
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">Esqueceu a senha?</h1>
            <p className="mt-1 text-ink-soft">Informe seu e-mail para receber um link de redefinição.</p>
          </div>

          {sent ? (
            <p className="text-center text-sm text-ink-soft">
              Se esse e-mail tiver uma conta, você vai receber um link de redefinição em instantes. Confira também a
              caixa de spam.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="field-label" htmlFor="email">E-mail</label>
                <input id="email" type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Enviando…" : "Enviar link"}
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
