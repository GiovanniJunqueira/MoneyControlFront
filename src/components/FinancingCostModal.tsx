import { Modal } from "./Modal";
import { FinancingCostForm } from "./FinancingCostForm";
import { api, extractErrorMessage } from "../api/client";
import { FinancingCostInput, FinancingCostKind, FinancingDetail, FinancingMember } from "../api/types";

interface Props {
  financingId: string;
  kind: FinancingCostKind;
  members: FinancingMember[];
  onClose: () => void;
  onSaved: (detail: FinancingDetail) => void;
}

export function FinancingCostModal({ financingId, kind, members, onClose, onSaved }: Props) {
  async function handleSubmit(input: FinancingCostInput) {
    try {
      const res = await api.post<FinancingDetail>(`/financings/${financingId}/costs`, input);
      onSaved(res.data);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }

  return (
    <Modal title={kind === "ENTRADA" ? "Novo pagamento de entrada" : "Nova taxa"} onClose={onClose}>
      <FinancingCostForm fixedKind={kind} members={members} submitLabel="Adicionar" onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
}
