import { ReactNode } from "react";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: Props) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 p-0 md:items-center md:p-4">
      <div
        className="w-full max-w-md rounded-t-md bg-paper-raised p-6 shadow-xl md:rounded-sm"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">{title}</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink" aria-label="Fechar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
