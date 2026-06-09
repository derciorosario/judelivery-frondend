import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Icon from "../common/Icon";
import { getCustomerOrders, cancelOrder } from "../../api/client";
import { toast } from "../../lib/toast";
import TrackOrderModal from "./modals/TrackOrderModal";
import CreateOrderModal from "./modals/CreateOrderModal";
import CancelOrderDialog from "../common/CancelOrderDialog";

const CustomerOrders = ({ user, onViewDetails, onRepeatOrder, onGiveFeedback, onOpenCreateOrder, refreshOrders, statusFilter }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [fullEditOrder, setFullEditOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [trackOrder, setTrackOrder] = useState(null);
  const [filter, setFilterState] = useState("Todos");
  const [page, setPage] = useState(1);
  const sentinelRef = useRef(null);
  
  const isTracking = statusFilter === "in_transit";

  const filterMap = useMemo(() => ({
    "Todos": null,
    "Em andamento": "in_transit,assigned,scheduled",
    "Aguardando": "pending_approval,approved",
    "Concluídos": "completed",
    "Cancelados": "cancelled"
  }), []);

  const baseFilters = useMemo(() => ["Todos", "Em andamento", "Aguardando", "Concluídos", "Cancelados"], []);

  const getFilterStatus = useCallback((label) => {
    return filterMap[label] || null;
  }, [filterMap]);

  const setFilter = (label) => {
    setFilterState(label);
    setPage(1);
    setHasMore(true);
    setOrders([]);
  };

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

  const getStatusBadge = (order) => {
    const status = backendToStatus(order);
    switch (status) {
      case "Em entrega":
        return "bg-blue-100 text-blue-700";
      case "Aprovado":
        return "bg-teal-100 text-teal-700";
      case "Aguardando":
        return "bg-amber-100 text-amber-700";
      case "Concluído":
        return "bg-green-100 text-green-700";
      case "Cancelado":
        return "bg-red-100 text-red-700";
      case "Agendado":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const fetchOrders = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      let statusParam = getFilterStatus(filter);
      if (isTracking) {
        statusParam = "in_transit";
      }
      const params = { page: pageNum, limit: 20 };
      if (statusParam) {
        params.status = statusParam;
      }
      const { data } = await getCustomerOrders(params);
      if (append) {
        setOrders(prev => [...prev, ...(data.orders || [])]);
      } else {
        setOrders(data.orders || []);
      }
      setHasMore(data.pagination && data.pagination.currentPage < data.pagination.pages);
    } catch (error) {
      const message = error?.response?.data?.message || "Erro ao carregar pedidos";
      toast.error(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, isTracking, getFilterStatus]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setOrders([]);
    fetchOrders(1, false);
  }, [user, filter, isTracking, fetchOrders]);

  useEffect(() => {
    if (refreshOrders > 0) {
      setPage(1);
      setHasMore(true);
      setOrders([]);
      fetchOrders(1, false);
    }
  }, [refreshOrders, fetchOrders]);

  const handleRefresh = async () => {
    setPage(1);
    setHasMore(true);
    setOrders([]);
    fetchOrders(1, false);
  };

  const fetchNextPage = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOrders(nextPage, true);
  }, [hasMore, loadingMore, loading, page, fetchOrders]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, fetchNextPage]);

  const handleRepeatOrder = (order) => {
    if (!onRepeatOrder) return;
    onRepeatOrder({
      ...order,
      type: order.serviceType || "delivery",
      statusCode: getStatusCode(order),
      status: backendToStatus(order),
    });
  };

  const handleViewDetails = (order) => {
    const displayStatus = backendToStatus(order);
    onViewDetails({
      ...order,
      statusCode: getStatusCode(order),
      status: displayStatus,
      total: order.total,
    });
  };

  const handleGiveFeedbackWrapper = (order) => {
    if (!onGiveFeedback) return;
    onGiveFeedback({
      ...order,
      statusCode: getStatusCode(order),
      status: backendToStatus(order),
    });
  };

  const handleDeleteOrder = (order) => {
    setDeleteTarget(order);
  };

  const confirmCancelOrder = async (cancelData) => {
    if (!deleteTarget) return;
    try {
      const { data } = await cancelOrder(deleteTarget.id, cancelData);
      setOrders((prev) => prev.map((o) => (o.id === data.id ? data : o)));
      toast.success("Pedido cancelado com sucesso");
    } catch (error) {
      const message = error?.response?.data?.message || "Erro ao cancelar pedido";
      toast.error(message);
      throw error;
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleOrderUpdated = (updatedOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
  };

  const visibleOrders = orders;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">{isTracking ? "Rastrear Pedido" : "Meus Pedidos"}</p>
        {(!isTracking || orders.length === 0) && (
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
        )}
      </div>

      {!isTracking && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {baseFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                filter === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">A carregar pedidos...</p>
        </div>
      ) : visibleOrders.length > 0 ? (
        visibleOrders.map((order) => {
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
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isDelivery ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {isDelivery ? (
                      <span className="inline-flex items-center gap-1">
                        <Icon name="package" size={10} /> Entrega
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Icon name="car" size={10} /> Táxi
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-sm font-bold text-orange-500"> {order.total} MZN</span>
              </div>
              <p className="text-sm font-medium text-slate-700">{order.productName || order.product?.name || (isDelivery ? "Entrega" : "Corrida")}</p>
              <p className="text-xs text-slate-400 mt-1">
                {isDelivery
                  ? `${order.origin || ""} → ${order.dest || ""}`
                  : `${order.pickupLocation || ""} → ${order.dropoffLocation || ""}`}
              </p>
              {order.driver && (
                <p className="text-xs text-slate-500 mt-0.5">
                  <Icon name="users" size={10} className="inline mr-1" />
                  {typeof order.driver === "string" ? order.driver : order.driver?.name || "Motorista atribuído"}
                </p>
              )}
              <p className="text-xs text-slate-400">
                {order.time || new Date(order.createdAt).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleViewDetails(order)}
                  className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg"
                >
                  Detalhes
                </button>
                {(displayStatus === "Concluído" || order.status === "completed") && (
                  <>
                    <button
                      onClick={() => handleGiveFeedbackWrapper(order)}
                      className="flex-1 text-xs bg-amber-100 text-amber-600 font-semibold py-2 rounded-lg"
                    >
                      Avaliar
                    </button>
                    <button
                      onClick={() => handleRepeatOrder(order)}
                      className="flex-1 text-xs bg-orange-50 text-orange-600 font-semibold py-2 rounded-lg"
                    >
                      Repetir
                    </button>
                  </>
                )}
                {(displayStatus === "Em entrega" || order.status === "in_transit") && (
                  <button
                    onClick={() => setTrackOrder(order)}
                    className="flex-1 text-xs bg-blue-100 text-blue-600 font-semibold py-2 rounded-lg"
                  >
                    Acompanhar
                  </button>
                )}
                {displayStatus !== "Concluído" && displayStatus !== "Cancelado" && (
                  <button
                    onClick={() => handleDeleteOrder(order)}
                    className="flex-1 text-xs bg-red-50 text-red-600 font-semibold py-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                )}
                {displayStatus !== "Concluído" && displayStatus !== "Em entrega" && (
                  <button
                    onClick={() => setFullEditOrder(order)}
                    className="flex-1 text-xs bg-green-100 text-green-600 font-semibold py-2 rounded-lg hover:bg-green-200"
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-10">
          <Icon name="package" size={48} className="text-slate-300 mx-auto mb-2" />
          {isTracking ? (
            <>
              <p className="text-sm font-semibold text-slate-700 mb-1">Nenhum pedido em trânsito</p>
              <p className="text-xs text-slate-400 mb-4">Você ainda não tem pedidos em andamento</p>
              <button
                onClick={onOpenCreateOrder}
                className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm shadow-orange-300"
              >
                <Icon name="plus" size={14} /> Fazer um pedido
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500">Nenhum pedido encontrado</p>
          )}
        </div>
      )}

      {loadingMore && (
        <div className="text-center py-4">
          <Icon name="refreshCw" size={20} className="text-slate-400 mx-auto animate-spin" />
        </div>
      )}
      <div ref={sentinelRef} className="h-1" />

      {fullEditOrder && (
        <CreateOrderModal
          isOpen={!!fullEditOrder}
          onClose={() => setFullEditOrder(null)}
          editOrder={fullEditOrder}
          serviceType={fullEditOrder.serviceType || "delivery"}
          customerData={user}
          onOrderUpdated={(updatedOrder) => {
            handleOrderUpdated(updatedOrder);
            setFullEditOrder(null);
          }}
        />
      )}

      {deleteTarget && (
        <CancelOrderDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmCancelOrder}
          role="customer"
          orderStatus={deleteTarget?.status}
        />
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