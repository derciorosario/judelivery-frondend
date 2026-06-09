import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import { getOrders, deleteOrder } from "../../api/client";
import { toast } from "../../lib/toast";
import AdminOrderDetailModal from "./AdminOrderDetailModal";
import CreateOrderModal from "../cliente/modals/CreateOrderModal";
import AdminClientSelectModal from "./AdminClientSelectModal";

const AdminOrders = ({ onOpenCreateDelivery, refreshKey, initialOrderId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showClientSelect, setShowClientSelect] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState(null);

  useEffect(() => {
    if (initialOrderId && !loading && orders.length > 0) {
      const order = orders.find(o => o.id === initialOrderId);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [initialOrderId, orders, loading]);

  const statuses = ["Todos", "Pendente", "Aprovado", "Atribuído", "Em entrega", "Concluído", "Cancelado"];

  const backendStatusLabels = {
    pending_approval: "Pendente",
    approved: "Aprovado",
    assigned: "Atribuído",
    in_transit: "Em entrega",
    completed: "Concluído",
    cancelled: "Cancelado",
    scheduled: "Agendado"
  };

  const toShortId = (id) => {
    if (!id) return "---";
    const hex = id.replace(/-/g, "").toUpperCase();
    return `#${hex.slice(-6)}`;
  };

  const backendToFrontend = (status) => backendStatusLabels[status] || status || "Pendente";

  const filteredOrders = filter === "Todos"
    ? orders
    : orders.filter(o => backendToFrontend(o.status) === filter);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await getOrders();
        setOrders(response.data);
      } catch (error) {
        let errorMessage = "Erro ao carregar pedidos";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        toast.error(errorMessage);
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refreshKey]);

  const handleDeleteOrder = async (order) => {
    setDeleteTarget(order);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteOrder(deleteTarget.id);
      setOrders(prev => prev.filter(o => o.id !== deleteTarget.id));
      toast.success("Pedido removido com sucesso");
    } catch (error) {
      let errorMessage = "Erro ao remover pedido";
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
    setSelectedClientForEdit(null);
  };

  const handleClientSelectedForEdit = (client) => {
    setSelectedClientForEdit(client);
    setShowClientSelect(false);
  };

  const handleOpenClientSelect = () => {
    setShowClientSelect(true);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Gestão de Pedidos</p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center w-8 h-8 bg-white text-orange-500 rounded-xl border border-orange-200 hover:bg-orange-50 disabled:opacity-50"
          >
            <Icon name="refreshCw" size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => onOpenCreateDelivery && onOpenCreateDelivery()}
            className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-orange-300"
          >
            <Icon name="plus" size={14} /> Nova Entrega
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === s ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">A carregar pedidos...</p>
        </div>
        ) : deleteTarget ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="alertTriangle" size={24} className="text-red-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Remover Pedido</h3>
                <p className="text-sm text-slate-500 mt-1">Tem certeza que deseja remover <strong>{toShortId(deleteTarget.id)}</strong>? Esta ação não pode ser revertida.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600">Remover</button>
              </div>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
        <div className="text-center py-10">
          <Icon name="package" size={48} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const displayStatus = backendToFrontend(order.status);
            const isDelivery = order.serviceType !== "taxi";

            const statusBadge =
              displayStatus === "Em entrega" ? "bg-blue-100 text-blue-700" :
              displayStatus === "Concluído" ? "bg-green-100 text-green-700" :
              displayStatus === "Cancelado" ? "bg-red-100 text-red-700" :
              displayStatus === "Aprovado" ? "bg-teal-100 text-teal-700" :
              displayStatus === "Agendado" ? "bg-purple-100 text-purple-700" :
              "bg-amber-100 text-amber-700";

            return (
              <div key={order.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-800">{toShortId(order.id)}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge}`}>{displayStatus}</span>
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

                <p className="text-sm font-medium text-slate-700">
                  {order.client?.name || order.client || "Cliente"}
                </p>
                <p className="text-xs text-slate-500">
                  {isDelivery ? `${order.origin || ""} → ${order.dest || ""}` : `${order.pickupLocation || ""} → ${order.dropoffLocation || ""}`}
                </p>
                <p className="text-xs text-slate-400">
                  {order.time || new Date(order.createdAt).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg hover:bg-blue-100 hover:text-blue-700"
                  >
                    Detalhes / ações
                  </button>
                  <button
                    onClick={() => {
                      setEditOrder(order);
                      setSelectedClientForEdit(null);
                    }}
                    className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg hover:bg-green-100 hover:text-green-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order)}
                    className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg hover:bg-red-100 hover:text-red-700"
                  >
                    Remover
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <AdminOrderDetailModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          onUpdate={handleOrderUpdated}
        />
      )}

      {editOrder && (
        <CreateOrderModal
          isOpen={!!editOrder}
          onClose={() => {
            setEditOrder(null);
            setSelectedClientForEdit(null);
          }}
          editOrder={editOrder}
          serviceType={editOrder.serviceType || "delivery"}
          clientId={selectedClientForEdit?.userId || selectedClientForEdit?.id || editOrder.clientId}
          selectedClient={selectedClientForEdit || (editOrder.client && {
            id: editOrder.clientId,
            userId: editOrder.clientId,
            name: typeof editOrder.client === 'string' ? editOrder.client : editOrder.client?.name,
            phone: editOrder.client?.phone
          })}
          onClientSelectClick={handleOpenClientSelect}
          onOrderUpdated={(updatedOrder) => {
            handleOrderUpdated(updatedOrder);
            setEditOrder(null);
          }}
        />
      )}

      {showClientSelect && (
        <AdminClientSelectModal
          isOpen={showClientSelect}
          onClose={() => setShowClientSelect(false)}
          onSelect={handleClientSelectedForEdit}
          selectedClient={selectedClientForEdit}
        />
      )}
    </div>
  );
};

export default AdminOrders;