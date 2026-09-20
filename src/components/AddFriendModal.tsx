import { FormEvent, useCallback, useEffect, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { FriendCode, SendFriendRequestResult } from "../api/types";

interface Props {
  onClose: () => void;
  onSaved: (result: SendFriendRequestResult) => void;
}

export function AddFriendModal({ onClose, onSaved }: Props) {
  const [myCode, setMyCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadMyCode = useCallback(async () => {
    const res = await api.get<FriendCode>("/bets/friends/me");
    setMyCode(res.data.code);
  }, []);

  useEffect(() => {
    loadMyCode();
  }, [loadMyCode]);

  async function copyCode() {
    if (!myCode) return;
    try {
      await navigator.clipboard.writeText(myCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível - sem tratamento especial, só não mostra o feedback
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await api.post<SendFriendRequestResult>("/bets/friends/requests", { code: code.trim().toUpperCase() });
      onSaved(res.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Adicionar amigo" onClose={onClose}>
      <div className="space-y-4">
        <button type="button" onClick={copyCode} disabled={!myCode} className="card flex w-full items-center justify-between gap-3 text-left">
          <span>
            <span className="block text-xs text-ink-soft">Seu código</span>
            <span className="num block text-lg font-semibold tracking-[0.2em] text-ink">{myCode ?? "…"}</span>
          </span>
          <span className="pill bg-accent-soft text-accent">{copied ? "Copiado!" : "Copiar"}</span>
        </button>
        <p className="text-xs text-ink-soft">Mande seu código pra pessoa, ou digite o código dela abaixo pra adicionar.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="friendCode">Código do amigo</label>
            <input
              id="friendCode"
              required
              placeholder="Ex: 7K3PXQ"
              className="field num text-center text-lg uppercase tracking-[0.3em]"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={12}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Enviando…" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
