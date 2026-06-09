import { useState } from "react";
import Modal from "./Modal";
import { XCircle, AlertCircle } from "lucide-react";

const CANCELLATION_REASONS = {
  customer: [
    { value: "changed_my_mind", label: "Mudei de ideia" },
    { value: "found_better_price", label: "Encontrei melhor preço" },
    { value: "ordered_by_mistake", label: "Peça errada/com mais" },
    { value: "delivery_too_slow", label: "Entrega muito lenta" },
    { value: "other", label: "Outro motivo" }
  ],
  driver: [
    { value: "vehicle_issue", label: "Problema no veículo" },
    { value: "emergency", label: "Emergência pessoal" },
    { value: "route_issue", label: "Problema na rota" },
    { value: "customer_unresponsive", label: "Cliente não responde" },
    { value: "other", label: "Outro motivo" }
  ],
  admin: [
    { value: "customer_request", label: "Pedido do cliente" },
    { value: "driver_request", label: "Pedido do motorista" },
    { value: "fraud_suspected", label: "Fraude suspeita" },
    { value: "service_unavailable", label: "Serviço indisponível" },
    { value: "duplicate_order", label: "Pedido duplicado" },
    { value: "other", label: "Outro motivo" }
  ]
};

const CancelOrderDialog = ({ isOpen, onClose, onConfirm, role = "customer", orderStatus }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = CANCELLATION_REASONS[role] || CANCELLATION_REASONS.customer;
  const isCompletedOrCancelled = orderStatus === "completed" || orderStatus === "cancelled";

  const handleSubmit = async () => {
    if (!selectedReason || isCompletedOrCancelled) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm({
        reason: selectedReason,
        comment: comment.trim() || null
      });
      setSelectedReason("");
      setComment("");
      onClose();
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setComment("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cancelar Pedido">
      {isCompletedOrCancelled ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-600">
            Este pedido não pode ser cancelado porque já está {orderStatus === "completed" ? "concluído" : "cancelado"}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-2">
              Selecione o motivo do cancelamento:
            </p>
            <div className="space-y-2">
              {reasons.map((reason) => (
                <label
                  key={reason.value}
                  className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="cancellationReason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Comentário (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Adicione detalhes sobre o cancelamento..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-none"
              rows={3}
              maxLength={500}
            />
            <p className="text-[10px] text-slate-400 mt-1 text-right">
              {comment.length}/500
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedReason || isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <XCircle size={16} />
              {isSubmitting ? "Cancelando..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CancelOrderDialog;