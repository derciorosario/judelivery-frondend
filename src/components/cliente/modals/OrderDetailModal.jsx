import Icon from "../../common/Icon";

const OrderDetailModal = ({ isOpen, onClose, order, onGiveFeedback }) => {
  if (!isOpen || !order) return null;
  
  const isCompleted = order.status === "Concluído" || order.statusCode === "completed";
  const isActive = order.status === "Em entrega" || order.statusCode === "in_progress";
  
  return (
    <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Detalhes do Pedido {order.id}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Icon name="x" size={18} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Status */}
          <div className={`rounded-xl p-3 ${order.status === "Em entrega" ? "bg-blue-50" : order.status === "Concluído" ? "bg-green-50" : "bg-amber-50"}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Status</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                order.status === "Em entrega" ? "bg-blue-100 text-blue-700" :
                order.status === "Concluído" ? "bg-green-100 text-green-700" :
                "bg-amber-100 text-amber-700"
              }`}>
                {order.status}
              </span>
            </div>
          </div>
          
          {/* Order Info */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400">Produto</p>
              <p className="text-sm font-semibold text-slate-800">{order.productName}</p>
              {order.quantity > 1 && <p className="text-xs text-slate-500">Quantidade: {order.quantity}</p>}
            </div>
            
            <div>
              <p className="text-xs text-slate-400">Valor</p>
              <p className="text-lg font-bold text-orange-500">{order.total}</p>
            </div>
            
            <div>
              <p className="text-xs text-slate-400">Data do Pedido</p>
              <p className="text-sm text-slate-700">{order.orderDate} às {order.orderTime}</p>
            </div>
            
            {order.deliveryDate && (
              <div>
                <p className="text-xs text-slate-400">Data de Entrega</p>
                <p className="text-sm text-slate-700">{order.deliveryDate} às {order.deliveryTime}</p>
              </div>
            )}
            
            <div>
              <p className="text-xs text-slate-400">Origem</p>
              <p className="text-sm text-slate-700">{order.origin}</p>
            </div>
            
            <div>
              <p className="text-xs text-slate-400">Destino</p>
              <p className="text-sm text-slate-700">{order.dest}</p>
            </div>
            
            {order.driver && (
              <div>
                <p className="text-xs text-slate-400">Motorista</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-700">{order.driver}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Icon name="star" size={12} className="text-amber-400" />
                      <span className="text-xs text-slate-500">{order.driverRating}</span>
                    </div>
                  </div>
                  {order.driverPhone && (
                    <div className="flex gap-2">
                      <button className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs">
                        Ligar
                      </button>
                      <button className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs">
                        Mensagem
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {order.instructions && (
              <div>
                <p className="text-xs text-slate-400">Instruções</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg">{order.instructions}</p>
              </div>
            )}
            
            <div>
              <p className="text-xs text-slate-400">Método de Pagamento</p>
              <p className="text-sm text-slate-700">{order.paymentMethod}</p>
            </div>
            
            <div>
              <p className="text-xs text-slate-400">Status do Pagamento</p>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                order.paymentStatus === "Pago" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
          
          {/* Timeline */}
          {order.timeline && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-3">Linha do Tempo</p>
              <div className="space-y-2">
                {order.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.completed ? "bg-green-100" : "bg-slate-100"}`}>
                      {step.completed ? (
                        <Icon name="check" size={14} className="text-green-500" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm ${step.completed ? "text-slate-700" : "text-slate-400"}`}>{step.status}</p>
                      <p className="text-xs text-slate-400">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {isCompleted && (
              <button onClick={() => onGiveFeedback(order)} className="flex-1 py-2.5 rounded-xl bg-amber-100 text-amber-700 font-semibold text-sm">
                Avaliar Entrega
              </button>
            )}
            {isActive && (
              <button className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm">
                Acompanhar no Mapa
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