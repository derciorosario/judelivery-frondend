import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import { getCustomerOrders } from "../../api/client";
import { toast } from "../../lib/toast";
import OrderDetailModal from "../modals/OrderDetailModal";

const CustomerHistory = ({ onGiveFeedback }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const toShortId = (id) => {
    if (!id) return "---";
    const hex = id.replace(/-/g, "").toUpperCase();
    return `#${hex.slice(-6)}`;
  };

  const backendToStatus = (status) => {
    const statusMap = {
      pending_approval: "Aguardando",
      approved: "Aprovado",
      scheduled: "Agendado",
      assigned: "Atribuído",
      in_transit: "Em entrega",
      completed: "Concluído",
      cancelled: "Cancelado"
    };
    return statusMap[status] || status || "Pendente";
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "Em entrega": "bg-blue-100 text-blue-700",
      "Aprovado": "bg-teal-100 text-teal-700",
      "Aguardando": "bg-amber-100 text-amber-700",
      "Concluído": "bg-green-100 text-green-700",
      "Cancelado": "bg-red-100 text-red-700",
      "Agendado": "bg-purple-100 text-purple-700"
    };
    return statusMap[status] || "bg-slate-100 text-slate-700";
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getCustomerOrders({ limit: 50 });
        setOrders(response.data?.orders || response.data || []);
      } catch (error) {
        const message = error?.response?.data?.message || "Erro ao carregar histórico";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Calculate statistics
  const completedOrders = orders.filter(o => o.status === "completed");
  const totalSpent = completedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalOrders = orders.length;
  const averageRating = completedOrders.length > 0 
    ? (completedOrders.reduce((sum, o) => sum + (o.feedbacks?.[0]?.rating || 0), 0) / completedOrders.length).toFixed(1)
    : 0;

  // Group orders by month
  const groupByMonth = (orders) => {
    const groups = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt || order.orderDate);
      const monthKey = date.toLocaleDateString("pt-MZ", { month: "long", year: "numeric" });
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(order);
    });
    return groups;
  };

  const ordersByMonth = groupByMonth(completedOrders);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Histórico de Pedidos</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{totalOrders} pedidos</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-lg font-bold text-slate-800">{completedOrders.length}</p>
          <p className="text-[10px] text-slate-400">Concluídos</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-lg font-bold text-slate-800">{totalSpent.toFixed(0)} MZN</p>
          <p className="text-[10px] text-slate-400">Total Gasto</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-lg font-bold text-slate-800 flex items-center justify-center gap-0.5">
            {averageRating} <Icon name="star" size={14} className="text-amber-400" />
          </p>
          <p className="text-[10px] text-slate-400">Avaliação Média</p>
        </div>
      </div>

      {/* Orders by Month */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">A carregar histórico...</p>
        </div>
      ) : completedOrders.length > 0 ? (
        <div className="space-y-4">
          {Object.entries(ordersByMonth).map(([month, monthOrders]) => (
            <div key={month}>
              <p className="text-xs font-semibold text-slate-500 mb-2 capitalize">{month}</p>
              <div className="space-y-3">
                {monthOrders.map(order => {
                  const displayStatus = backendToStatus(order.status);
                  const isDelivery = order.serviceType !== "taxi";
                  return (
                    <div key={order.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                            <Icon name="checkCircle" size={16} className="text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{toShortId(order.id)}</p>
                            <p className="text-xs text-slate-500">{order.productName || (isDelivery ? "Entrega" : "Corrida")}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-green-600">{order.total} MZN</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {isDelivery 
                          ? `${order.origin || ""} → ${order.dest || ""}` 
                          : `${order.pickupLocation || ""} → ${order.dropoffLocation || ""}`
                        }
                      </p>
                      {order.driver && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          <Icon name="users" size={10} className="inline mr-1" />
                          {typeof order.driver === 'string' ? order.driver : order.driver?.name || 'Motorista'}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt || order.orderDate).toLocaleDateString("pt-MZ")}
                        </span>
                        {order.feedbacks && order.feedbacks.length > 0 && (
                          <span className="text-xs text-amber-600 font-semibold">
                            ⭐ {order.feedbacks[0].rating}/5
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="w-full mt-3 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Icon name="package" size={48} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhum pedido concluído encontrado</p>
          <p className="text-xs text-slate-400 mt-1">Seus pedidos concluídos aparecerão aqui</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailModal
          isOpen={showOrderDetails}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          orderId={selectedOrder.id}
          onGiveFeedback={onGiveFeedback}
        />
      )}
    </div>
  );
};

export default CustomerHistory;