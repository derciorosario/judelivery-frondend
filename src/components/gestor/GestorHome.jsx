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

const GestorHome = ({ onOrderUpdate, refreshKey }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState([]);
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
      setActiveOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
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
      setActiveOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
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
    setActiveOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const response = await getAdminDashboard();
        setDashboard(response.data.data);

        // Fetch active orders
        const ordersRes = await getOrders({
          status: "in_transit",
          limit: 10
        });

        setActiveOrders(ordersRes.data.orders || []);
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
        <div className="animate-spin w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm text-slate-500">A carregar painel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-4 text-white">
        <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Operações de Hoje</p>
        <p className="text-2xl font-bold mt-1">Em curso 🚚</p>
        <p className="text-sm opacity-80 mt-0.5">{dashboard?.onlineDrivers || 0} motoristas activos</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Pedidos Hoje" value={dashboard?.todayOrders || 0} color="orange" />
        <StatCard label="Em Entrega" value={dashboard?.activeOrders || 0} color="blue" />
        <StatCard label="Concluídos" value={dashboard?.todayOrders || 0} color="green" />
        <StatCard label="Pendentes" value={dashboard?.pendingOrders || 0} color="purple" />
      </div>

      {/* Active Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-slate-700">Pedidos Activos</p>
          <span onClick={()=>navigate('/orders')} className="text-xs cursor-pointer text-teal-500 font-medium">ver todos →</span>
        </div>
        {activeOrders.length > 0 ? (
          activeOrders.map(o => (
            <div key={o.id} className="mb-3">
              <OrderCard
                order={o}
                showAssign
                role="manager"
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
            <p className="text-sm text-slate-500">Nenhum pedido activo no momento</p>
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
                  const ordersRes = await getOrders({
                    status: "in_transit",
                    limit: 10
                  });
                  setActiveOrders(ordersRes.data.orders || []);
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
          role="manager"
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

export default GestorHome;
