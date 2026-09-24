import { Modal } from "./Modal";
import { ArrowsUpDownIcon, PencilIcon } from "./icons";

interface Props {
  houseName: string;
  onClose: () => void;
  onWithdraw: () => void;
  onDeposit: () => void;
  onEdit: () => void;
}

/** Ao apertar numa casa (dentro de um dia), pergunta o que a pessoa quer fazer - saque/depósito são
 * as ações principais, editar saldo final fica como alternativa pra quem apertou querendo corrigir
 * o valor diretamente. Pedido explícito do usuário: trocar o antigo botão único "Saque/Depósito" do
 * dia por essa escolha por casa. */
export function HouseActionModal({ houseName, onClose, onWithdraw, onDeposit, onEdit }: Props) {
  return (
    <Modal title={houseName} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-ink-soft">O que você quer fazer?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onWithdraw}
            className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-line px-4 py-4 text-[15px] font-medium text-ink transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
          >
            <ArrowsUpDownIcon className="h-5 w-5" />
            Sacar
          </button>
          <button
            type="button"
            onClick={onDeposit}
            className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-line px-4 py-4 text-[15px] font-medium text-ink transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
          >
            <ArrowsUpDownIcon className="h-5 w-5" />
            Depositar
          </button>
        </div>
        <button type="button" onClick={onEdit} className="btn-secondary flex w-full items-center justify-center gap-1.5">
          <PencilIcon className="h-3.5 w-3.5" />
          Editar saldo final
        </button>
      </div>
    </Modal>
  );
}
