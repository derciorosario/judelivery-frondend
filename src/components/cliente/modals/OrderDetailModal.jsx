import Icon from "../../common/Icon";

const OrderDetailModal = ({ isOpen, onClose, order, onGiveFeedback }) => {
  if (!isOpen || !order) return null;

  const displayStatus = order.status
    ? (() => {
        const s = order.status;
        if (s === "in_transit") return "Em entrega";
        if (s === "pending_approval") return "Aguardando";
        if (s === "completed") return "Concluído";
        if (s === "cancelled") return "Cancelado";
        if (s === "approved") return "Aprovado";
        if (s === "scheduled") return "Agendado";
        return s;
      })()
    : order.statusCode;

  const isCompleted = displayStatus === "Concluído" || order.statusCode === "completed";
  const isActive = displayStatus === "Em entrega" || order.statusCode === "in_progress";
  const isDelivery = order.serviceType !== "taxi";

  const statusClass =
    displayStatus === "Em entrega" ? "bg-blue-50" :
    displayStatus === "Concluído" ? "bg-green-50" :
    displayStatus === "Cancelado" ? "bg-red-50" :
    displayStatus === "Aprovado" ? "bg-teal-50" :
    displayStatus === "Agendado" ? "bg-purple-50" :
    "bg-amber-50";

  const badgeClass =
    displayStatus === "Em entrega" ? "bg-blue-100 text-blue-700" :
    displayStatus === "Concluído" ? "bg-green-100 text-green-700" :
    displayStatus === "Cancelado" ? "bg-red-100 text-red-700" :
    displayStatus === "Aprovado" ? "bg-teal-100 text-teal-700" :
    displayStatus === "Agendado" ? "bg-purple-100 text-purple-700" :
    "bg-amber-100 text-amber-700";

  return (
    <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">Pedido #{order.id ? order.id.slice(-6).toUpperCase() : order.id}</h2>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
              {displayStatus}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isDelivery ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
            }`}>
              {isDelivery ? (
                <span className="inline-flex items-center gap-1"><Icon name="package" size={10} /> Entrega</span>
              ) : (
                <span className="inline-flex items-center gap-1"><Icon name="car" size={10} /> Táxi</span>
              )}
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Status */}
          <div className={`rounded-xl p-3 ${statusClass}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Status</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeClass}`}>{displayStatus}</span>
            </div>
          </div>

          {/* Order Info */}
          <div className="space-y-3">
            {order.productName && (
              <div>
                <p className="text-xs text-slate-400">Produto</p>
                <p className="text-sm font-semibold text-slate-800">{order.productName}</p>
                {order.quantity > 1 && <p className="text-xs text-slate-500">Quantidade: {order.quantity}</p>}
              </div>
            )}

            {isDelivery && order.urgencyLevel && (
              <div>
                <p className="text-xs text-slate-400">Urgência</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  order.urgencyLevel === "urgent" ? "bg-amber-100 text-amber-700" :
                  order.urgencyLevel === "very_urgent" ? "bg-red-100 text-red-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {order.urgencyLevel === "urgent" ? "Urgente" : order.urgencyLevel === "very_urgent" ? "Muito Urgente" : "Normal"}
                </span>
              </div>
            )}

            {isDelivery && order.passengerCount && order.serviceType === "taxi" && (
              <div>
                <p className="text-xs text-slate-400">Passageiros</p>
                <p className="text-sm font-semibold text-slate-800">{order.passengerCount}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-400">Valor</p>
              <p className="text-lg font-bold text-orange-500"> {order.total} MZN</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Data do Pedido</p>
              <p className="text-sm text-slate-700">{order.orderDate || new Date(order.createdAt).toLocaleDateString()} às {order.time || new Date(order.createdAt).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>

            {isDelivery ? (
              <>
                <div>
                  <p className="text-xs text-slate-400">Origem</p>
                  <p className="text-sm text-slate-700">{order.origin}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Destino</p>
                  <p className="text-sm text-slate-700">{order.dest}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs text-slate-400">Embarque</p>
                  <p className="text-sm text-slate-700">{order.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Desembarque</p>
                  <p className="text-sm text-slate-700">{order.dropoffLocation}</p>
                </div>
              </>
            )}

            {order.pickupCoords && (
              <div>
                <p className="text-xs text-slate-400">Coordenadas</p>
                <p className="text-xs text-slate-500">{order.pickupCoords.lat.toFixed(5)}, {order.pickupCoords.lng.toFixed(5)} → {order.dropoffCoords?.lat.toFixed(5)}, {order.dropoffCoords?.lng.toFixed(5)}</p>
              </div>
            )}

            {order.client && (
              <div>
                <p className="text-xs text-slate-400">Cliente</p>
                <p className="text-sm text-slate-700">{typeof order.client === 'string' ? order.client : order.client?.name}</p>
                {order.client?.phone && <p className="text-xs text-slate-500">{order.client.phone}</p>}
              </div>
            )}

            {order.contactOrigin && (
              <div>
                <p className="text-xs text-slate-400">Contato (Origem)</p>
                <p className="text-sm text-slate-700">{order.contactOrigin}</p>
              </div>
            )}
            {order.contactDest && (
              <div>
                <p className="text-xs text-slate-400">Contato (Destino)</p>
                <p className="text-sm text-slate-700">{order.contactDest}</p>
              </div>
            )}

            {order.driver && (
              <div>
                <p className="text-xs text-slate-400">Motorista</p>
                <p className="text-sm text-slate-700">{typeof order.driver === 'string' ? order.driver : order.driver?.name}</p>
              </div>
            )}

            {order.instructions && (
              <div>
                <p className="text-xs text-slate-400">Instruções</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg">{order.instructions}</p>
              </div>
            )}

            {order.observations && (
              <div>
                <p className="text-xs text-slate-400">Observações</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg">{order.observations}</p>
              </div>
            )}

            {order.scheduledTime && (
              <div>
                <p className="text-xs text-slate-400">Agendado para</p>
                <p className="text-sm text-slate-700">{new Date(order.scheduledTime).toLocaleString()}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-400">Distância / Tempo</p>
              <p className="text-sm text-slate-700">{order.dist || "—"} {order.time ? ` • ${order.time}` : ""}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Método de Pagamento</p>
              <p className="text-sm text-slate-700">{order.paymentMethod || "—"}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Status do Pagamento</p>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                order.paymentStatus === "paid" || order.paymentStatus === "Pago" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}>
                {order.paymentStatus === "paid" ? "Pago" : order.paymentStatus === "pending" ? "Pendente" : order.paymentStatus === "cancelled" ? "Cancelado" : order.paymentStatus}
              </span>
            </div>

            {order.company && (
              <div>
                <p className="text-xs text-slate-400">Empresa</p>
                <p className="text-sm text-slate-700">{typeof order.company === 'string' ? order.company : order.company?.name}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {isCompleted && onGiveFeedback && (
              <button onClick={() => onGiveFeedback(order)} className="flex-1 py-2.5 rounded-xl bg-amber-100 text-amber-700 font-semibold text-sm">
                Avaliar
              </button>
            )}
            {isActive && (
              <button className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm">
                Acompanhar
              </button>
            )}
            {!isCompleted && !isActive && (
              <button className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm">
                Contactar Suporte
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
