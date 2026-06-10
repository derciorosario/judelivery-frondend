// src/components/common/OrdersList.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { MoreHorizontal } from "lucide-react";
import Icon from "./Icon";
import { getOrders, getCustomerOrders, getDriverOrders, getOrder, updateOrder, cancelOrder, deleteOrder } from "../../api/client";
import { toast } from "../../lib/toast";
import TrackOrderModal from "../cliente/modals/TrackOrderModal";
import CreateOrderModal from "../cliente/modals/CreateOrderModal";
import CancelOrderDialog from "./CancelOrderDialog";
import { useAuth } from "../../contexts/AuthContext";
import AdminClientSelectModal from "../admin/AdminClientSelectModal";
import { AdminOrderDetailModal } from "../admin/AdminOrderDetailModal";
import { MotoristaOrderDetailModal } from "../motorista/MotoristaOrders";
import OrderDetailModal from "../cliente/modals/OrderDetailModal";
import NavigationModal from "../motorista/modals/NavigationModal";

const STATUS_LABELS = {
  pending_approval: "Pendente",
  approved: "Aprovado",
  assigned: "Atribuído",
  in_transit: "Em entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
  scheduled: "Agendado"
};

const STATUS_BADGE = {
  "Em entrega": "bg-blue-100 text-blue-700",
  "Concluído": "bg-green-100 text-green-700",
  "Cancelado": "bg-red-100 text-red-700",
  "Aprovado": "bg-teal-100 text-teal-700",
  "Agendado": "bg-purple-100 text-purple-700",
  "Atribuído": "bg-indigo-100 text-indigo-700",
  "Pendente": "bg-amber-100 text-amber-700"
};

const toShortId = (id) => {
  if (!id) return "---";
  const hex = id.replace(/-/g, "").toUpperCase();
  return `#${hex.slice(-6)}`;
};

const OrdersList = ({
  refreshKey,
  onOrderUpdate,
  statusFilter,
  showHeader = true,
  title = "Pedidos",
  showNewOrderButton = true,
  onNewOrderClick,
  initialOrderId,
  onGiveFeedback
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilterState] = useState("Todos");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditOrder, setShowEditOrder] = useState(false);
  const [showClientSelect, setShowClientSelect] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const sentinelRef = useRef(null);
  const initialProcessed = useRef(false);
  const orderRefs = useRef({});
  const menuRef = useRef(null);

  const role = user?.role;
  const isAdmin = role === "admin" || role === "superadmin";
  const isManager = role === "manager";
  const isDriver = role === "driver";
  const isCustomer = role === "customer";
  const isStaff = isAdmin || isManager;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      let clickedOutside = true;
      Object.values(orderRefs.current).forEach(ref => {
        if (ref && ref.contains(e.target)) {
          clickedOutside = false;
        }
      });
      if (clickedOutside && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const backendToFrontend = (status) => STATUS_LABELS[status] || status || "Pendente";

  const getStatusBadge = (order) => {
    const displayStatus = backendToFrontend(order.status);
    return STATUS_BADGE[displayStatus] || "bg-slate-100 text-slate-700";
  };

  const fetchOrders = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      let statusParam = getFilterStatus(filter);
      if (statusFilter === "in_transit") {
        statusParam = "in_transit";
      }
      const params = { page: pageNum, limit: 20 };
      if (statusParam) {
        params.status = statusParam;
      }

      let response;
      if (isCustomer) {
        response = await getCustomerOrders(params);
      } else if (isDriver) {
        response = await getDriverOrders(params);
      } else {
        response = await getOrders(params);
      }

      const newOrders = response.data?.orders || response.data || [];
      if (append) {
        setOrders(prev => [...prev, ...newOrders]);
      } else {
        setOrders(newOrders);
      }
      setHasMore(response.data?.pagination?.currentPage < response.data?.pagination?.pages);
    } catch (error) {
      const message = error?.response?.data?.message || "Erro ao carregar pedidos";
      toast.error(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, statusFilter, isCustomer, isDriver, getFilterStatus]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setOrders([]);
    fetchOrders(1, false);
  }, [user, filter, statusFilter, fetchOrders]);

  useEffect(() => {
    if (refreshKey) {
      setPage(1);
      setHasMore(true);
      setOrders([]);
      fetchOrders(1, false);
    }
  }, [refreshKey, fetchOrders]);

  useEffect(() => {
    if (initialOrderId && orders.length > 0 && !initialProcessed.current && !loading) {
      const order = orders.find(o => o.id === initialOrderId);
      if (order) {
        setSelectedOrder(order);
        setShowOrderDetails(true);
        initialProcessed.current = true;
      }
    }
  }, [initialOrderId, orders, loading]);

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

  const handleViewDetails = async (order) => {
    try {
      const response = await getOrder(order.id);
      setSelectedOrder(response.data);
      setShowOrderDetails(true);
    } catch (err) {
      console.error(err);
      setSelectedOrder(order);
      setShowOrderDetails(true);
    }
    setMenuOpenId(null);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const payload = { status: newStatus };
      const response = await updateOrder(selectedOrder.id, payload);
      const updatedOrder = response.data;
      setSelectedOrder(updatedOrder);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      if (onOrderUpdate) onOrderUpdate(updatedOrder);
      toast.success("Pedido atualizado com sucesso");
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao atualizar pedido";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async (cancelData) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const response = await cancelOrder(selectedOrder.id, cancelData);
      const updatedOrder = response.data;
      setSelectedOrder(updatedOrder);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      if (onOrderUpdate) onOrderUpdate(updatedOrder);
      toast.success("Pedido cancelado com sucesso");
      setShowCancelDialog(false);
      setShowOrderDetails(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao cancelar pedido";
      toast.error(msg);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await deleteOrder(selectedOrder.id);
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      toast.success("Pedido removido com sucesso");
      setShowDeleteDialog(false);
      setShowOrderDetails(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao remover pedido";
      toast.error(msg);
    }
  };

  const handleGiveFeedback = (order) => {
    if (onGiveFeedback) {
      onGiveFeedback(order);
    }
    setShowOrderDetails(false);
    setMenuOpenId(null);
  };

  const handleRepeatOrder = () => {
    setShowEditOrder(true);
    setShowOrderDetails(false);
    setMenuOpenId(null);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setShowEditOrder(true);
    setMenuOpenId(null);
  };

  const handleTrackOrder = () => {
    setShowTrackOrder(true);
    setShowOrderDetails(false);
    setMenuOpenId(null);
  };

  const handleNavigateOrder = (order) => {
    setSelectedOrder(order);
    setShowNavigation(true);
    setShowOrderDetails(false);
    setMenuOpenId(null);
  };

  const handleCancelClick = (order) => {
    setSelectedOrder(order);
    setShowCancelDialog(true);
    setMenuOpenId(null);
  };

  const visibleOrders = orders;
  const isTrackingView = statusFilter === "in_transit";

  // Render the appropriate detail modal based on user role
  const renderDetailModal = () => {
    if (!showOrderDetails || !selectedOrder) return null;

    if (isStaff) {
      return (
        <AdminOrderDetailModal
          isOpen={showOrderDetails}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onUpdate={(updatedOrder) => {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            if (onOrderUpdate) onOrderUpdate(updatedOrder);
            setSelectedOrder(updatedOrder);
          }}
        />
      );
    } else if (isDriver) {
      return (
        <MotoristaOrderDetailModal
          isOpen={showOrderDetails}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onUpdate={(updatedOrder) => {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            if (onOrderUpdate) onOrderUpdate(updatedOrder);
            setSelectedOrder(updatedOrder);
          }}
          onStatusChange={handleUpdateStatus}
          updating={updating}
        />
      );
    } else if (isCustomer) {
      return (
        <OrderDetailModal
          isOpen={showOrderDetails}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          orderId={selectedOrder.id}
          onGiveFeedback={() => handleGiveFeedback(selectedOrder)}
        />
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-700">{title}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(1, false)}
              disabled={loading}
              className="flex items-center justify-center w-8 h-8 bg-white text-orange-500 rounded-xl border border-orange-200 hover:bg-orange-50 disabled:opacity-50"
            >
              <Icon name="refreshCw" size={14} className={loading ? "animate-spin" : ""} />
            </button>
            {showNewOrderButton && (isStaff || isCustomer) && (
              <button
                onClick={onNewOrderClick}
                className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-orange-300"
              >
                <Icon name="plus" size={14} /> Novo Pedido
              </button>
            )}
          </div>
        </div>
      )}

      {!isTrackingView && (isStaff || isCustomer || isDriver) && (
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
        <>
          <div className="space-y-3">
            {visibleOrders.map((order) => {
              const displayStatus = backendToFrontend(order.status);
              const isDelivery = order.serviceType !== "taxi";
              const statusBadge = getStatusBadge(order);
              const isPending = displayStatus === "Pendente";
              const canEdit = (isStaff || (isCustomer && isPending)) && displayStatus !== "Concluído" && displayStatus !== "Cancelado" && displayStatus !== "Em entrega";
              const canCancel = displayStatus !== "Concluído" && displayStatus !== "Cancelado";
              const canTrack = displayStatus === "Em entrega";
              const canGiveFeedback = displayStatus === "Concluído" && isCustomer;
              const canRepeat = displayStatus === "Concluído" && isCustomer;
              const canDelete = isStaff;
              const isMenuOpen = menuOpenId === order.id;

               // Determine which buttons to show as primary (always visible)
               const primaryButtons = [];
               if (canTrack && isDriver) {
                 primaryButtons.push({ action: "navigate", label: "Navegar", color: "bg-green-100 text-green-600 hover:bg-green-200" });
               } else if (canTrack) {
                 primaryButtons.push({ action: "track", label: "Acompanhar", color: "bg-blue-100 text-blue-600 hover:bg-blue-200" });
               }
               if (canGiveFeedback) primaryButtons.push({ action: "feedback", label: "Avaliar", color: "bg-amber-100 text-amber-600 hover:bg-amber-200" });
               if (canRepeat) primaryButtons.push({ action: "repeat", label: "Repetir", color: "bg-orange-50 text-orange-600 hover:bg-orange-100" });
              
              // Limit to 2 primary buttons
              const visibleButtons = primaryButtons.slice(0, 2);
              const hasMoreButtons = primaryButtons.length > 2 || canCancel || canEdit || canDelete;

              return (
                <div 
                  key={order.id} 
                  ref={el => orderRefs.current[order.id] = el}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-800">{toShortId(order.id)}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge}`}>
                        {displayStatus}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isDelivery ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Icon name={isDelivery ? "package" : "car"} size={10} />
                          {isDelivery ? "Entrega" : "Táxi"}
                        </span>
                      </span>
                    </div>
                    <span className="text-sm font-bold text-orange-500">{order.total} MZN</span>
                  </div>

                  <p className="text-sm font-medium text-slate-700">
                    {order.client?.name || order.client || "Cliente"}
                  </p>
                  {order.productName && (
                    <p className="text-xs text-slate-500">
                      <Icon name="package" size={10} className="inline mr-1" />
                      {order.productName}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
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
                    {/* Details button - always visible */}
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg hover:bg-blue-100 hover:text-blue-700"
                    >
                      Detalhes
                    </button>

                    {/* Primary action buttons (max 2) */}
                    {visibleButtons.map((btn) => (
                      <button
                        key={btn.action}
                        onClick={() => {
                          if (btn.action === "navigate") {
                            handleNavigateOrder(order);
                          } else if (btn.action === "track") {
                            setSelectedOrder(order);
                            handleTrackOrder();
                          } else if (btn.action === "feedback") {
                            handleGiveFeedback(order);
                          } else if (btn.action === "repeat") {
                            setSelectedOrder(order);
                            handleRepeatOrder();
                          }
                        }}
                        className={`flex-1 text-xs font-semibold py-2 rounded-lg ${btn.color}`}
                      >
                        {btn.label}
                      </button>
                    ))}

                    {/* 3-dots menu for additional actions */}
                    {(hasMoreButtons || canCancel || canEdit || canDelete) && (
                      <div className="relative">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setMenuOpenId(isMenuOpen ? null : order.id);
                          }}
                          className="flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        
                        {isMenuOpen && (
                          <div 
                            ref={menuRef}
                            className="absolute bottom-full right-0 mb-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 min-w-[140px]"
                          >
                            {/* Additional primary buttons that didn't fit */}
                            {primaryButtons.slice(2).map((btn) => (
                              <button
                                key={btn.action}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (btn.action === "navigate") {
                                    handleNavigateOrder(order);
                                  } else if (btn.action === "track") {
                                    setSelectedOrder(order);
                                    handleTrackOrder();
                                  } else if (btn.action === "feedback") {
                                    handleGiveFeedback(order);
                                  } else if (btn.action === "repeat") {
                                    setSelectedOrder(order);
                                    handleRepeatOrder();
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Icon name={btn.action === "navigate" || btn.action === "track" ? "map" : btn.action === "feedback" ? "star" : "repeat"} size={12} />
                                {btn.label}
                              </button>
                            ))}
                            
                            {canEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditOrder(order);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <Icon name="edit" size={12} />
                                Editar
                              </button>
                            )}
                            
                            {canCancel && (isStaff || isCustomer || isDriver) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelClick(order);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Icon name="xCircle" size={12} />
                                Cancelar
                              </button>
                            )}
                            
                            {canDelete && isStaff && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setShowDeleteDialog(true);
                                  setMenuOpenId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Icon name="trash" size={12} />
                                Remover
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {loadingMore && (
            <div className="text-center py-4">
              <Icon name="refreshCw" size={20} className="text-slate-400 mx-auto animate-spin" />
            </div>
          )}
          <div ref={sentinelRef} className="h-1" />
        </>
      ) : (
        <div className="text-center py-10">
          <Icon name="package" size={48} className="text-slate-300 mx-auto mb-2" />
          {isTrackingView ? (
            <>
              <p className="text-sm font-semibold text-slate-700 mb-1">Nenhum pedido em trânsito</p>
              <p className="text-xs text-slate-400 mb-4">Você ainda não tem pedidos em andamento</p>
              {showNewOrderButton && (isStaff || isCustomer) && (
                <button
                  onClick={onNewOrderClick}
                  className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm shadow-orange-300"
                >
                  <Icon name="plus" size={14} /> Fazer um pedido
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">Nenhum pedido encontrado</p>
          )}
        </div>
      )}

      {/* Render the appropriate detail modal based on role */}
      {renderDetailModal()}

      {/* Track Order Modal */}
      {showTrackOrder && selectedOrder && (
        <TrackOrderModal
          isOpen={showTrackOrder}
          onClose={() => {
            setShowTrackOrder(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}

      {/* Cancel Order Dialog */}
      {showCancelDialog && selectedOrder && (
        <CancelOrderDialog
          isOpen={showCancelDialog}
          onClose={() => {
            setShowCancelDialog(false);
            setSelectedOrder(null);
          }}
          onConfirm={handleCancelOrder}
          role={role}
          orderStatus={selectedOrder?.status}
        />
      )}

      {/* Delete Order Dialog */}
      {showDeleteDialog && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="alertTriangle" size={24} className="text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Remover Pedido</h3>
              <p className="text-sm text-slate-500 mt-1">
                Tem certeza que deseja remover <strong>{toShortId(selectedOrder.id)}</strong>? Esta ação não pode ser revertida.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteDialog(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={handleDeleteOrder} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditOrder && selectedOrder && (
        <CreateOrderModal
          isOpen={showEditOrder}
          onClose={() => {
            setShowEditOrder(false);
            setSelectedOrder(null);
            setSelectedClientForEdit(null);
          }}
          editOrder={selectedOrder}
          serviceType={selectedOrder.serviceType || "delivery"}
          clientId={selectedClientForEdit?.userId || selectedClientForEdit?.id || selectedOrder.clientId}
          selectedClient={selectedClientForEdit || (selectedOrder.client && {
            id: selectedOrder.clientId,
            userId: selectedOrder.clientId,
            name: typeof selectedOrder.client === 'string' ? selectedOrder.client : selectedOrder.client?.name,
            phone: selectedOrder.client?.phone
          })}
          onClientSelectClick={() => {
            setShowEditOrder(false);
            setShowClientSelect(true);
          }}
          onOrderUpdated={(updatedOrder) => {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            if (onOrderUpdate) onOrderUpdate(updatedOrder);
            setShowEditOrder(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Client Select Modal for Admin/Manager editing */}
      {showClientSelect && (
        <AdminClientSelectModal
          isOpen={showClientSelect}
          onClose={() => setShowClientSelect(false)}
          onSelect={(client) => {
            setSelectedClientForEdit(client);
            setShowClientSelect(false);
            setShowEditOrder(true);
          }}
          selectedClient={selectedClientForEdit}
        />
      )}

      {/* Navigation Modal for Driver */}
      {showNavigation && selectedOrder && (
        <NavigationModal
          isOpen={showNavigation}
          onClose={() => {
            setShowNavigation(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default OrdersList;