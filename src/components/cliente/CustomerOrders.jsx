import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import { getCustomerOrders, deleteOrder } from "../../api/client";
import { toast } from "../../lib/toast";
import CustomerOrderEditModal from "./modals/CustomerOrderEditModal";
import TrackOrderModal from "./modals/TrackOrderModal";

const CustomerOrders = ({ user, onViewDetails, onRepeatOrder, onGiveFeedback, onOpenCreateOrder }) => {
  const [filter, setFilter] = useState("Todos");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOrder, setEditOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [trackOrder, setTrackOrder] = useState(null);

  const filters = ["Todos", "Em andamento", "Aguardando", "Concluídos", "Cancelados"];

  const toShortId = (id) => {
    if (!id) return "---";
    const hex = id.replace(/-/g, "").toUpperCase();
    return `#${hex.slice(-6)}`;
  };

  const backendToStatus = (order) => {
    const s = order.status;
    if (s === "in_transit") return "Em entrega";
    if (s === "pending_approval") return "Aguardando";
    if (s === "completed") return "Concluído";
    if (s === "cancelled") return "Cancelado";
    if (s === "approved") return "Aprovado";
    if (s === "scheduled") return "Agendado";
    return s || "Pendente";
  };

  const getStatusCode = (order) => {
    const s = order.status;
    if (s === "in_transit") return "in_progress";
    if (s === "completed") return "completed";
    if (s === "pending_approval") return "pending_approval";
    if (s === "cancelled") return "cancelled";
    return s;
  };

  const filteredOrders = filter === "Todos"
    ? orders
    : filter === "Em andamento"
      ? orders.filter(o => ["in_transit", "assigned", "scheduled"].includes(o.status))
      : filter === "Aguardando"
        ? orders.filter(o => o.status === "pending_approval" || o.status === "approved")
        : filter === "Concluídos"
          ? orders.filter(o => o.status === "completed")
          : orders.filter(o => o.status === "cancelled");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getCustomerOrders();
        setOrders(response.data);
      } catch (error) {
        let errorMessage = "Erro ao carregar pedidos";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        toast.error(errorMessage);
        console.error("Error fetching customer orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await getCustomerOrders();
      setOrders(response.data);
    } catch (error) {
      let errorMessage = "Erro ao atualizar pedidos";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatOrder = (order) => {
    if (onRepeatOrder) {
      onRepeatOrder({
        ...order,
        type: order.serviceType || "delivery",
        statusCode: getStatusCode(order),
        status: backendToStatus(order)
      });
    }
  };

  const handleViewDetails = (order) => {
    const displayStatus = backendToStatus(order);
    onViewDetails({
      ...order,
      statusCode: getStatusCode(order),
      status: displayStatus,
      total: order.total
    });
  };

  const handleGiveFeedbackWrapper = (order) => {
    onGiveFeedback({
      ...order,
      statusCode: getStatusCode(order),
      status: backendToStatus(order)
    });
  };

  const handleDeleteOrder = (order) => {
    setDeleteTarget(order);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteOrder(deleteTarget.id);
      setOrders(prev => prev.filter(o => o.id !== deleteTarget.id));
      toast.success("Pedido cancelado com sucesso");
    } catch (error) {
      let errorMessage = "Erro ao cancelar pedido";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleOrderUpdated = (updatedOrder) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const getStatusBadge = (order) => {
    const status = backendToStatus(order);
    switch (status) {
      case "Em entrega": return "bg-blue-100 text-blue-700";
      case "Aprovado": return "bg-teal-100 text-teal-700";
      case "Aguardando": return "bg-amber-100 text-amber-700";
      case "Concluído": return "bg-green-100 text-green-700";
      case "Cancelado": return "bg-red-100 text-red-700";
      case "Agendado": return "bg-purple-100 text-purple-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Meus Pedidos</p>
        <div className="flex items-center gap-2">
           <button
            onClick={handleRefresh}
            className="flex items-center justify-center w-8 h-8 bg-white text-orange-500 rounded-xl border border-orange-200 hover:bg-orange-50"
          >
            <Icon name="refreshCw" size={14} />
          </button>
          <button
            onClick={onOpenCreateOrder}
            className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-orange-300"
          >
            <Icon name="plus" size={14} /> Novo Pedido
          </button>
         
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">A carregar pedidos...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        filteredOrders.map(order => {
          const displayStatus = backendToStatus(order);
          const isDelivery = order.serviceType !== "taxi";
          return (
            <div key={order.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-800">{toShortId(order.id)}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getStatusBadge(order)}`}>
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
                <span className="text-sm font-bold text-orange-500"> {order.total} MZN</span>
              </div>
              <p className="text-sm font-medium text-slate-700">{order.productName || order.product?.name || (isDelivery ? "Entrega" : "Corrida")}</p>
              <p className="text-xs text-slate-400 mt-1">
                {isDelivery ? `${order.origin || ""} → ${order.dest || ""}` : `${order.pickupLocation || ""} → ${order.dropoffLocation || ""}`}
              </p>
              {order.driver && (
                <p className="text-xs text-slate-500 mt-0.5">
                  <Icon name="users" size={10} className="inline mr-1" />
                  {typeof order.driver === 'string' ? order.driver : (order.driver?.name || 'Motorista atribuído')}
                </p>
              )}
              <p className="text-xs text-slate-400">{order.time || new Date(order.createdAt).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleViewDetails(order)} className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg">
                  Detalhes
                </button>
                {(displayStatus === "Concluído" || order.status === "completed") && (
                  <>
                    <button onClick={() => handleGiveFeedbackWrapper(order)} className="flex-1 text-xs bg-amber-100 text-amber-600 font-semibold py-2 rounded-lg">
                      Avaliar
                    </button>
                    <button onClick={() => handleRepeatOrder(order)} className="flex-1 text-xs bg-orange-50 text-orange-600 font-semibold py-2 rounded-lg">
                      Repetir
                    </button>
                  </>
                )}
{(displayStatus === "Em entrega" || order.status === "in_transit") && (
                   <button onClick={() => setTrackOrder(order)} className="flex-1 text-xs bg-blue-100 text-blue-600 font-semibold py-2 rounded-lg">
                     Acompanhar
                   </button>
                 )}
                {displayStatus !== "Concluído" && displayStatus !== "Cancelado" && (
                  <button onClick={() => handleDeleteOrder(order)} className="flex-1 text-xs bg-red-50 text-red-600 font-semibold py-2 rounded-lg">
                    Cancelar
                  </button>
                )}
                {displayStatus === "Aguardando" && (
                  <button onClick={() => setEditOrder(order)} className="flex-1 text-xs bg-blue-50 text-blue-600 font-semibold py-2 rounded-lg">
                    Alterar local
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-10">
          <Icon name="package" size={48} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhum pedido encontrado</p>
        </div>
      )}
      
      {editOrder && (
        <CustomerOrderEditModal
          isOpen={!!editOrder}
          onClose={() => setEditOrder(null)}
          order={editOrder}
          onUpdated={handleOrderUpdated}
        />
      )}

{deleteTarget && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
           <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
             <div className="text-center mb-4">
               <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                 <Icon name="alertTriangle" size={24} className="text-red-600" />
               </div>
               <h3 className="text-base font-bold text-slate-800">Cancelar Pedido</h3>
               <p className="text-sm text-slate-500 mt-1">Tem certeza que deseja cancelar <strong>{toShortId(deleteTarget.id)}</strong>? Esta ação não pode ser revertida.</p>
             </div>
             <div className="flex gap-2">
               <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                 Voltar
               </button>
               <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600">
                 Confirmar Cancelamento
               </button>
             </div>
           </div>
         </div>
       )}

       {trackOrder && (
         <TrackOrderModal
           isOpen={!!trackOrder}
           onClose={() => setTrackOrder(null)}
           order={trackOrder}
         />
       )}
     </div>
   );
 };

export default CustomerOrders;
