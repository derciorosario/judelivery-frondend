import { useState, useEffect } from "react";
import StatCard from "../common/StatCard";
import OrderCard from "../common/OrderCard";
import Icon from "../common/Icon";
import { getAdminDashboard, getOrders, getOrder, updateOrder, cancelOrder, deleteOrder } from "../../api/client";
import { toast } from "../../lib/toast";
import OrderDetailModal from "../modals/OrderDetailModal";
import TrackOrderModal from "../cliente/modals/TrackOrderModal";
import CancelOrderDialog from "../common/CancelOrderDialog";
import ContactSupportModal from "../common/modals/ContactSupportModal";
import { useNavigate } from "react-router-dom";

const AdminHome = ({ onOrderUpdate, refreshKey }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const navigate=useNavigate()

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
  };

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setShowTrackOrder(true);
  };

  const handleCancelClick = (order) => {
    setSelectedOrder(order);
    setShowCancelDialog(true);
  };

  const handleContactClick = (order) => {
    setSelectedOrder(order);
    setShowContactModal(true);
  };

  const handleDeleteOrder = async (order) => {
    setSelectedOrder(order);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;
    try {
      await deleteOrder(selectedOrder.id);
      setRecentOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      toast.success("Pedido removido com sucesso");
      setShowDeleteDialog(false);
      setSelectedOrder(null);
      if (onOrderUpdate) onOrderUpdate(selectedOrder);
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao remover pedido";
      toast.error(msg);
    }
  };

  const handleCancelOrder = async (cancelData) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const response = await cancelOrder(selectedOrder.id, cancelData);
      const updatedOrder = response.data;
      setRecentOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      if (onOrderUpdate) onOrderUpdate(updatedOrder);
      toast.success("Pedido cancelado com sucesso");
      setShowCancelDialog(false);
      setShowOrderDetails(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao cancelar pedido";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleOrderUpdate = (updatedOrder) => {
    setRecentOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const response = await getAdminDashboard();
        setDashboard(response.data.data);

        // Fetch recent orders
        const ordersRes = await getOrders({ limit: 5, sort: "createdAt", order: "desc" });
        setRecentOrders(ordersRes.data.orders || []);
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

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white">
        <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Visão Geral — Hoje</p>
        <p className="text-2xl font-bold mt-1">Boa tarde 👋</p>
        <p className="text-sm opacity-80 mt-0.5">Quinta, 8 de Maio · Maputo</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Pedidos Ativos"
          value={dashboard?.activeOrders || 0}
          sub={dashboard?.activeOrders > 0 ? "↑ em andamento" : "Nenhum ativo"}
          color="orange"
        />
        <StatCard
          label="Receita Hoje"
          value={`${(dashboard?.todayRevenue || 0).toFixed(0)} MZN`}
          sub="Hoje"
          color="green"
        />
        <StatCard
          label="Motoristas Online"
          value={`${dashboard?.onlineDrivers || 0}/${dashboard?.totalDrivers || 0}`}
          color="blue"
        />
        <StatCard
          label="Pedidos Concluídos"
          value={dashboard?.totalCompleted || 0}
          sub=""
          color="purple"
        />
      </div>

      {/* Pending Orders Section */}
      {dashboard?.pendingOrders > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-700">Requisições Pendentes</p>
            <span className="text-xs text-orange-500 font-medium">{dashboard.pendingOrders} novas</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-sm text-slate-600">Existem {dashboard.pendingOrders} pedidos aguardando aprovação</p>
            <button
              onClick={() => window.location.href = "#/orders"}
              className="mt-2 text-xs bg-orange-500 text-white font-semibold px-3 py-1.5 rounded-lg"
            >
              Ver Pedidos
            </button>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-slate-700">Pedidos Recentes</p>
          <span onClick={() => navigate('/orders')} className="text-xs text-orange-500 cursor-pointer font-medium">ver todos →</span>
        </div>
        {recentOrders.length > 0 ? (
          recentOrders.map(o => (
            <div key={o.id} className="mb-3">
              <OrderCard
                order={o}
                showAssign
                role="admin"
                onOrderUpdate={onOrderUpdate}
                onViewDetails={handleViewDetails}
                onTrack={handleTrackOrder}
                onCancel={handleCancelClick}
                onContact={handleContactClick}
                onDelete={handleDeleteOrder}
                onEdit={(order) => {
                  setSelectedOrder(order);
                  setShowOrderDetails(true);
                }}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500">Nenhum pedido recente</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailModal
          isOpen={showOrderDetails}
          onClose={(refresh) => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
            if (refresh === true) {
              // Refresh orders
              const fetchOrders = async () => {
                try {
                  const ordersRes = await getOrders({ limit: 5, sort: "createdAt", order: "desc" });
                  setRecentOrders(ordersRes.data.orders || []);
                } catch (error) {
                  console.error(error);
                }
              };
              fetchOrders();
            }
          }}
          order={selectedOrder}
          onUpdate={handleOrderUpdate}
          role="manager"
        />
      )}

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
          role="admin"
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
                Tem certeza que deseja remover <strong>{selectedOrder.id}</strong>? Esta ação não pode ser revertida.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteDialog(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={handleConfirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      {showContactModal && selectedOrder && (
        <ContactSupportModal
          isOpen={showContactModal}
          onClose={() => {
            setShowContactModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default AdminHome;
