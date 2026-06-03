import { useState } from "react";
import Icon from "../common/Icon";

const CustomerOrders = ({ orders, onViewDetails, onRepeatOrder, onGiveFeedback }) => {
  const [filter, setFilter] = useState("Todos");
  const filters = ["Todos", "Em andamento", "Aguardando", "Concluídos", "Cancelados"];
  
  const filteredOrders = filter === "Todos" 
    ? orders 
    : filter === "Em andamento" 
      ? orders.filter(o => o.statusCode === "in_progress" || o.status === "Em entrega" || o.status === "Atribuído")
      : filter === "Aguardando"
        ? orders.filter(o => o.statusCode === "pending_approval" || o.status === "Pendente" || o.status === "Aprovado")
        : filter === "Concluídos"
          ? orders.filter(o => o.statusCode === "completed" || o.status === "Concluído")
          : orders.filter(o => o.status === "Cancelado");

  const getStatusBadge = (order) => {
    const status = order.status || order.statusCode;
    switch(status) {
      case "Em entrega": case "in_progress": return "bg-blue-100 text-blue-700";
      case "Aprovado": return "bg-teal-100 text-teal-700";
      case "Pendente": case "pending_approval": return "bg-amber-100 text-amber-700";
      case "Concluído": case "completed": return "bg-green-100 text-green-700";
      case "Cancelado": case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {f}
          </button>
        ))}
      </div>
      
      {filteredOrders.length > 0 ? (
        filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">{order.id}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getStatusBadge(order)}`}>
                  {order.status || order.statusCode === "in_progress" ? "Em entrega" : 
                   order.statusCode === "completed" ? "Concluído" :
                   order.statusCode === "pending_approval" ? "Aguardando" :
                   order.status === "Aprovado" ? "Aprovado" : order.status}
                </span>
              </div>
              <span className="text-sm font-bold text-orange-500">{order.total}</span>
            </div>
            <p className="text-sm font-medium text-slate-700">{order.productName}</p>
            <p className="text-xs text-slate-400 mt-1">{order.dest}</p>
            <p className="text-xs text-slate-400">{order.orderDate}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => onViewDetails(order)} className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg">
                Detalhes
              </button>
              {(order.status === "Concluído" || order.statusCode === "completed") && (
                <>
                  <button onClick={() => onGiveFeedback(order)} className="flex-1 text-xs bg-amber-100 text-amber-600 font-semibold py-2 rounded-lg">
                    Avaliar
                  </button>
                  <button onClick={() => onRepeatOrder(order)} className="flex-1 text-xs bg-orange-50 text-orange-600 font-semibold py-2 rounded-lg">
                    Repetir
                  </button>
                </>
              )}
              {(order.status === "Em entrega" || order.statusCode === "in_progress") && (
                <button onClick={() => onViewDetails(order)} className="flex-1 text-xs bg-blue-100 text-blue-600 font-semibold py-2 rounded-lg">
                  Acompanhar
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
          <Icon name="package" size={48} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhum pedido encontrado</p>
          <button className="mt-4 text-sm bg-orange-500 text-white px-4 py-2 rounded-xl">
            Fazer primeiro pedido
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;