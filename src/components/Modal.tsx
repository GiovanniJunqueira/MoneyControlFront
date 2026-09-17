import { ReactNode, useEffect, useRef } from "react";
import { XIcon } from "./icons";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: Props) {
  const pointerDownOnBackdrop = useRef(false);

  // Trava o scroll do body enquanto o modal está aberto (impede o fundo de "andar" quando o
  // teclado do celular abre/fecha) e restaura a posição exata de onde a pessoa estava ao fechar.
  useEffect(() => {
    const scrollY = window.scrollY;
    const { body } = document;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => {
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center md:p-4"
      onMouseDown={(e) => {
        pointerDownOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        // Só fecha se o gesto INTEIRO (mousedown e click) começou e terminou no fundo escuro -
        // evita que selecionar texto (ex: arrastar pra selecionar o valor todo de um campo) e
        // soltar o clique fora do input feche o modal sem querer.
        if (e.target === e.currentTarget && pointerDownOnBackdrop.current) {
          onClose();
        }
      }}
    >
      <div
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-2xl md:max-h-[90vh] md:rounded-3xl md:pb-6"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button onClick={onClose} className="icon-btn" aria-label="Fechar">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
