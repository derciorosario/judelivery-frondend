// src/components/motorista/MotoristaHome.jsx
import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import { getDriverDashboard, updateOrder } from "../../api/client";
import NavigationModal from "./modals/NavigationModal";
import { toast } from "../../lib/toast";
import OrderDetailModal from "../modals/OrderDetailModal";
import ConfirmDialog from "../common/ConfirmDialog";
import ReassignOrderModal from "../modals/ReassignOrderModal";

const MotoristaHome = ({ online, setOnline, location, onOrderUpdate, refreshKey }) => {
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [rejectOrder, setRejectOrder] = useState(null);

  const handleToggleOnline = () => {
    const next = !online;
    setOnline(next);
    if (next && location) {
      location.start();
    } else if (location) {
      location.stop();
    }
  };

  const handleNavigate = (order) => {
    setSelectedOrder(order);
    setShowNavigationModal(true);
  };

  const requestAction = (type, order) => {
    setPendingAction({ type, order });
    setShowConfirmDialog(true);
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) return;
    const { type, order } = pendingAction;
    try {
      if (type === "accept") {
        const res = await updateOrder(order.id, { status: "assigned", confirmed: true });
        toast.success("Pedido aceito com sucesso!");
        if (onOrderUpdate) onOrderUpdate(res.data);
        setDashboard(prev => ({
          ...prev,
          availableOrders: prev.availableOrders.filter(o => o.id !== order.id)
        }));
      } else if (type === "decline") {
        setShowConfirmDialog(false);
        setRejectOrder(order);
        setShowReassignModal(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao processar pedido";
      toast.error(msg);
    } finally {
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  };

  const handleViewDetails = (order) => {
    setDetailOrder(order);
    setShowOrderDetailModal(true);
  };

  const handleOrderUpdate = (updatedOrder) => {
    setDetailOrder(updatedOrder)
    if (onOrderUpdate) onOrderUpdate(updatedOrder);
    const fetchDashboard = async () => {
      try {
        const response = await getDriverDashboard();
        setDashboard(response.data);
      } catch (error) {
        console.error("Error refreshing dashboard:", error);
      }
    };
    fetchDashboard();
  };

  const gpsPermission = location?.gpsPermission ?? "prompt";

  useEffect(() => {
     const fetchDashboard = async () => {
       setLoading(true);
       try {
         const response = await getDriverDashboard();
         setDashboard(response.data);
       } catch (error) {
         const message = error?.response?.data?.message || "Erro ao carregar painel";
         toast.error(message);
       } finally {
         setLoading(false);
       }
     };

     fetchDashboard();
   }, [refreshKey]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm text-slate-500">A carregar painel...</p>
      </div>
    );
  }

  const getConfirmationMessage = () => {
    if (!pendingAction) return "";
    if (pendingAction.type === "accept") {
      return "Tem certeza que deseja aceitar este pedido?";
    }
    return "Tem certeza que deseja rejeitar este pedido? Esta ação não pode ser desfeita.";
  };

  const getConfirmationTitle = () => {
    if (!pendingAction) return "";
    if (pendingAction.type === "accept") {
      return "Confirmar Aceitação";
    }
    return "Confirmar Rejeição";
  };

  const getConfirmText = () => {
    if (!pendingAction) return "";
    if (pendingAction.type === "accept") {
      return "Sim, Aceitar";
    }
    return "Sim, Rejeitar";
  };

  return (
    <div className="space-y-4">
      <NavigationModal
        isOpen={showNavigationModal}
        onClose={() => setShowNavigationModal(false)}
        order={selectedOrder}
      />

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setPendingAction(null);
        }}
        onConfirm={confirmPendingAction}
        title={getConfirmationTitle()}
        message={getConfirmationMessage()}
        confirmText={getConfirmText()}
        cancelText="Cancelar"
        variant={pendingAction?.type === "decline" ? "danger" : "warning"}
      />

      {/* Order Detail Modal */}
      {showOrderDetailModal && detailOrder && (
        <OrderDetailModal
          isOpen={showOrderDetailModal}
          onClose={() => {
            setShowOrderDetailModal(false);
            setDetailOrder(null);
          }}
          order={detailOrder}
          role="driver"
          onUpdate={handleOrderUpdate}
        />
      )}

      <ReassignOrderModal
        isOpen={showReassignModal}
        onClose={() => {
          setShowReassignModal(false);
          setRejectOrder(null);
        }}
        order={rejectOrder}
        onReassigned={(updatedOrder) => {
          if (onOrderUpdate) onOrderUpdate(updatedOrder);
          setDashboard(prev => ({
            ...prev,
            availableOrders: prev.availableOrders.filter(o => o.id !== rejectOrder?.id)
          }));
        }}
      />

      {gpsPermission === "denied" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <Icon name="alertTriangle" size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">Localização Desactivada</p>
              <p className="text-xs text-slate-500 mt-0.5">Active a permissão de localização nas configurações do navegador para receber pedidos.</p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Bem-vindo(a)</p>
            <p className="text-xl font-bold mt-0.5">Painel Motorista</p>
            <p className="text-xs opacity-80 mt-0.5">Pronto para entregar hoje?</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon name="truck" size={24} className="text-white" />
          </div>
        </div>
      </div>

      {/* Online/Offline Toggle */}
      <div
        className={`rounded-2xl p-4 flex items-center justify-between ${
          online && gpsPermission === "granted"
            ? "bg-gradient-to-r from-green-500 to-emerald-500"
            : "bg-gradient-to-r from-slate-500 to-slate-600"
        } text-white cursor-pointer`}
        onClick={handleToggleOnline}
      >
        <div>
          <p className="text-xs font-semibold opacity-80">Estado Actual</p>
          <p className="text-xl font-bold mt-0.5">
            {online && gpsPermission === "granted"
              ? "Online 🟢"
              : online && gpsPermission === "prompt"
                ? "A activar..."
                : "Offline 🔴"}
          </p>
          <p className="text-xs opacity-75">
            {online && gpsPermission === "prompt" ? "A solicitar GPS..." : "Toque para alterar"}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleOnline();
          }}
          className={`w-14 h-7 rounded-full relative transition-all ${online ? "bg-white/30" : "bg-white/20"}`}
        >
          <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${online ? "left-7" : "left-0.5"}`} />
        </button>
      </div>

           {dashboard?.activeOrder && (
        <div>
          <p className="text-sm font-bold text-slate-700 mb-2">Entrega Activa</p>
          <div className="bg-blue-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold">#{dashboard.activeOrder.id?.slice(-6).toUpperCase()}</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {dashboard.activeOrder.status === "in_transit" ? "Em entrega" : dashboard.activeOrder.status === "assigned" ? "Atribuído" : dashboard.activeOrder.status}
              </span>
            </div>
            {(() => {
              const order = dashboard.activeOrder;
              const isDelivery = order.serviceType !== "taxi";
              return (
                <>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-base font-semibold truncate">{typeof order.client === 'string' ? order.client : order.client?.name}</p>
                   
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-start gap-2 text-xs opacity-90">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-300 mt-1 shrink-0" />
                      <span>{isDelivery ? (order.origin || "") : (order.pickupLocation || "")}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs opacity-90">
                      <div className="w-1.5 h-1.5 rounded-full bg-white mt-1 shrink-0" />
                      <span>{isDelivery ? (order.dest || "") : (order.dropoffLocation || "")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] opacity-90">
                    {order.dist && (
                      <span className="flex items-center gap-1">
                        <Icon name="navigation" size={10} />
                        {order.dist}
                      </span>
                    )}
                    {order.total && (
                      <span className="flex items-center gap-1">
                        <Icon name="dollarSign" size={10} />
                        {order.total} MZN
                      </span>
                    )}
                    {order.paymentMethod && (
                      <span className="flex items-center gap-1">
                        <Icon name="creditCard" size={10} />
                        {order.paymentMethod}
                      </span>
                    )}

                     <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full flex-shrink-0">
                      {isDelivery ? "Entrega" : "Táxi"}
                    </span>
                  </div>
                  {order.instructions && (
                    <p className="mt-2 text-[10px] opacity-80 bg-white/10 p-2 rounded-lg italic line-clamp-2">
                      "{order.instructions}"
                    </p>
                  )}
                </>
              );
            })()}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleNavigate(dashboard.activeOrder)}
                className="flex-1 bg-white text-blue-700 font-bold text-sm py-2.5 rounded-xl"
              >
                Navegar
              </button>
              <button 
                onClick={() => handleViewDetails(dashboard.activeOrder)}
                className="flex-1 bg-amber-400 text-white font-bold text-sm py-2.5 rounded-xl"
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {dashboard?.availableOrders && dashboard.availableOrders.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-slate-700">Pedidos Disponíveis</p>
          {dashboard.availableOrders.map(order => {
            const isDelivery = order.serviceType !== "taxi";
            return (
              <div key={order.id} className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <Icon name="bell" size={18} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-800">
                        #{order.id?.slice(-6).toUpperCase()}
                      </p>
                      <span className="text-[10px] bg-white/60 px-2 py-0.5 rounded-full text-slate-600 font-semibold">
                        {isDelivery ? "Entrega" : "Táxi"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {typeof order.client === 'string' ? order.client : order.client?.name}
                    </p>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1 shrink-0" />
                        <span>{isDelivery ? (order.origin || "") : (order.pickupLocation || "")}</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-white border border-slate-300 mt-1 shrink-0" />
                        <span>{isDelivery ? (order.dest || "") : (order.dropoffLocation || "")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                      {order.dist && (
                        <span className="flex items-center gap-1">
                          <Icon name="navigation" size={10} />
                          {order.dist}
                        </span>
                      )}
                      {order.total && (
                        <span className="flex items-center gap-1">
                          <Icon name="dollarSign" size={10} />
                          {order.total} MZN
                        </span>
                      )}
                      {order.paymentMethod && (
                        <span className="flex items-center gap-1">
                          <Icon name="creditCard" size={10} />
                          {order.paymentMethod}
                        </span>
                      )}
                    </div>
                    {order.instructions && (
                      <p className="mt-2 text-[10px] text-slate-500 bg-white/60 p-2 rounded-lg italic line-clamp-2">
                        "{order.instructions}"
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => handleViewDetails(order)}
                        className="flex-1 bg-white border border-orange-200 text-orange-700 text-xs font-bold py-2 rounded-xl"
                      >
                        Ver Detalhes
                      </button>
                      <button 
                        onClick={() => requestAction("accept", order)}
                        className="flex-1 bg-orange-500 text-white text-xs font-bold py-2 rounded-xl"
                      >
                        Aceitar
                      </button>
                      <button 
                        onClick={() => requestAction("decline", order)}
                        className="flex-1 bg-slate-100 text-slate-600 text-xs font-semibold py-2 rounded-xl"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Statistics Cards - Enhanced */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 text-center border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Icon name="package" size={18} className="text-orange-500" />
            <p className="text-lg font-bold text-slate-800">{dashboard?.todayOrders || 0}</p>
          </div>
          <p className="text-[10px] text-slate-400">Entregas Hoje</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Icon name="trendingUp" size={18} className="text-green-500" />
            <p className="text-lg font-bold text-slate-800">{dashboard?.weekOrders || 0}</p>
          </div>
          <p className="text-[10px] text-slate-400">Entregas Semana</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 text-center border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Icon name="dollarSign" size={18} className="text-emerald-500" />
            <p className="text-lg font-bold text-slate-800">{dashboard?.todayEarnings?.toFixed(0) || 0} MZN</p>
          </div>
          <p className="text-[10px] text-slate-400">Ganhos Hoje</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Icon name="star" size={18} className="text-amber-400" />
            <p className="text-lg font-bold text-slate-800">{dashboard?.stats?.averageRating?.toFixed(1) || "0.0"}</p>
          </div>
          <p className="text-[10px] text-slate-400">Avaliação</p>
        </div>
      </div>

      {/* Weekly Earnings Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-600">Resumo Semanal</p>
          <Icon name="barChart2" size={16} className="text-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">Entregas</p>
            <p className="text-lg font-bold text-slate-800">{dashboard?.weekOrders || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Ganhos</p>
            <p className="text-lg font-bold text-green-600">{dashboard?.weekEarnings?.toFixed(0) || 0} MZN</p>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-600">Resumo Mensal</p>
          <Icon name="calendar" size={16} className="text-purple-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">Entregas</p>
            <p className="text-lg font-bold text-slate-800">{dashboard?.monthOrders || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Ganhos</p>
            <p className="text-lg font-bold text-purple-600">{dashboard?.monthEarnings?.toFixed(0) || 0} MZN</p>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-slate-800">{dashboard?.stats?.totalDeliveries || 0}</p>
          <p className="text-[10px] text-slate-400">Total Entregas</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-slate-800">{dashboard?.stats?.acceptanceRate?.toFixed(0) || 0}%</p>
          <p className="text-[10px] text-slate-400">Taxa Aceitação</p>
        </div>
      </div>

    
    </div>
  );
};

export default MotoristaHome;
