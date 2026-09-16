import { Modal } from "./Modal";

interface Props {
  title: string;
  itemLabel: string;
  onDeleteOne: () => void;
  onDeleteFuture: () => void;
  onClose: () => void;
  deleting: boolean;
}

/** Escolha de escopo ao excluir uma ocorrência que faz parte de uma recorrência (gasto recorrente ou
 * dívida parcelada) - reaproveitado pelas duas telas. */
export function ConfirmDeleteRecurringModal({ title, itemLabel, onDeleteOne, onDeleteFuture, onClose, deleting }: Props) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-3">
        <button onClick={onDeleteOne} disabled={deleting} className="btn-secondary w-full">
          Excluir só {itemLabel}
        </button>
        <button onClick={onDeleteFuture} disabled={deleting} className="btn-primary w-full !bg-danger">
          Excluir {itemLabel} e as futuras
        </button>
        <button onClick={onClose} disabled={deleting} className="btn-secondary w-full">
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
