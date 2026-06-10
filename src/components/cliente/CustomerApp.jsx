import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { CUSTOMER_ORDERS, CUSTOMERS } from "../../data/mockData";
import BottomNav from "../common/BottomNav";
import Header from "../common/Header";
import OrdersList from "../common/OrdersList";
import CustomerHome from "./CustomerHome";
import CustomerProfile from "./CustomerProfile";
import CreateOrderModal from "./modals/CreateOrderModal";
import FeedbackModal from "./modals/FeedbackModal";
import SupportModal from "./modals/SupportModal";
import ServiceSelectionModal from "./modals/ServiceSelectionModal";
import Notifications from "../common/Notifications";
import { createFeedback } from "../../api/client";
import { toast } from "../../lib/toast";
import Icon from "../common/Icon";
import OrderDetailModal from "../modals/OrderDetailModal";

const CustomerApp = () => {
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [shouldRefreshOrders, setShouldRefreshOrders] = useState(false);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [feedbackSuccessMessage, setFeedbackSuccessMessage] = useState("");
  const [showSupport, setShowSupport] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (refreshData) setRefreshData(false);
  }, [refreshData]);

  useEffect(() => {
    const handleOpenOrder = (e) => {
      const orderId = e.detail?.orderId;
      if (orderId) {
        setSelectedOrderId(orderId);
        setShowOrderDetails(true);
        setShouldRefreshOrders(prev => !prev);
      }
    };
    window.addEventListener("notification:openOrder", handleOpenOrder);
    return () => window.removeEventListener("notification:openOrder", handleOpenOrder);
  }, []);

  const tabs = [
    { id: "home", label: "Início", icon: "home", path: "/" },
    { id: "orders", label: "Pedidos", icon: "package", path: "/my-orders" },
    { id: "tracking", label: "Rastrear", icon: "map", path: "/tracking" },
    { id: "profile", label: "Perfil", icon: "user", path: "/profile" },
    { id: "notifications", label: "Notificações", icon: "bell", path: "/my-notifications" }
  ];

  const getTabFromPath = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    const tab = tabs.find(t => t.path === path);
    return tab ? tab.id : "home";
  };

  const activeTab = getTabFromPath();

  const setTab = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && tabId !== "home") {
      navigate(tab.path);
    } else {
      navigate("/");
    }
  };

  const customerOrders = CUSTOMER_ORDERS.filter(o => o.clientId === user.id);
  const activeOrder = customerOrders.find(o => o.statusCode === "in_progress" || o.status === "Em entrega");
  const pendingOrders = customerOrders.filter(o => o.statusCode === "pending_approval" || o.status === "Pendente");
  const completedOrders = customerOrders.filter(o => o.statusCode === "completed" || o.status === "Concluído");
  
  const customerData = CUSTOMERS.find(c => c.email === user.email) || {
    id: user.id,
    name: user.name,
    phone: user.phone || "",
    email: user.email,
    orders: customerOrders.length,
    rating: 4.8,
    frequent: true,
    addresses: ["Av. Eduardo Mondlane 45, Maputo"],
    defaultAddress: "Av. Eduardo Mondlane 45, Maputo"
  };

  const totalSpent = customerOrders.reduce((sum, o) => sum + (o.totalValue || 0), 0);
  const deliveryCount = customerOrders.length;
  const completedCount = customerOrders.filter(o => o.statusCode === "completed" || o.status === "Concluído").length;
  const averageRating = customerData.rating || 4.5;

  const handleCreateOrder = (serviceType = null) => {
    setSelectedServiceType(serviceType);
    setShowCreateOrder(true);
  };

  const handleOpenCreateOrder = () => {
    setShowServiceSelection(true);
  };

  const handleServiceSelect = (serviceType) => {
    setSelectedServiceType(serviceType);
    setShowServiceSelection(false);
    setShowCreateOrder(true);
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleGiveFeedback = (order) => {
    setFeedbackOrder(order);
    setShowFeedback(true);
    setShowOrderDetails(false)
  };

  const handleSubmitFeedback = async (rating, comment) => {
    if (!feedbackOrder) return;
    try {
      await createFeedback({
        orderId: feedbackOrder.id,
        rating,
        comment,
        category: "service",
        driverId: feedbackOrder.driverId || (typeof feedbackOrder.driver === "object" ? feedbackOrder.driver?.id : null)
      });
      setFeedbackSuccessMessage(`A sua avaliação para o pedido #${feedbackOrder.id ? feedbackOrder.id.slice(-6).toUpperCase() : ""} foi registada com sucesso!`);
      setShowFeedbackSuccess(true);
      setShowFeedback(false);
      setFeedbackOrder(null);
    } catch (error) {
      const message = error?.response?.data?.message || "Erro ao enviar avaliação";
      toast.error(message);
    }
  };

  const handleTrackOrder = () => {
    if (activeOrder) {
      setSelectedOrder(activeOrder);
    }
    setTab("tracking");
  };

  const handleOrderUpdate = (updatedOrder) => {
    setShouldRefreshOrders(prev => !prev);
    if (updatedOrder.action === "feedback" && updatedOrder.id) {
      handleGiveFeedback(updatedOrder);
    }
    setRefreshData(true)
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header
        user={user}
        onLogout={signOut}
        title="DeliveryMZ"
        onNotificationClick={() => setTab("notifications")}
      />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {activeTab === "home" && (
          <CustomerHome
            user={user}
            customerData={customerData}
            activeOrder={activeOrder}
            pendingOrders={pendingOrders}
            completedOrders={completedOrders}
            totalSpent={totalSpent}
            deliveryCount={deliveryCount}
            completedCount={completedCount}
            averageRating={averageRating}
            onCreateOrder={handleCreateOrder}
            onViewOrderDetails={handleViewOrderDetails}
            onTrackOrder={handleTrackOrder}
            onGiveFeedback={handleGiveFeedback}
          />
        )}
        {activeTab === "orders" && (
          <OrdersList
            refreshKey={shouldRefreshOrders || refreshData}
            onNewOrderClick={handleOpenCreateOrder}
            showNewOrderButton={true}
            title="Meus Pedidos"
            onOrderUpdate={handleOrderUpdate}
            onGiveFeedback={handleGiveFeedback}
          />
        )}
        {activeTab === "tracking" && (
          <OrdersList
            refreshKey={shouldRefreshOrders || refreshData}
            onNewOrderClick={handleOpenCreateOrder}
            showNewOrderButton={true}
            title="Rastrear Pedido"
            statusFilter="in_transit"
            onOrderUpdate={handleOrderUpdate}
           onGiveFeedback={handleGiveFeedback}
          />
        )}
        {activeTab === "profile" && (
          <CustomerProfile
            user={user}
            customerData={customerData}
            orders={customerOrders}
            signOut={signOut}
          />
        )}
        {activeTab === "notifications" && (
          <Notifications />
        )}
      </div>
      <BottomNav tabs={tabs} active={activeTab} setActive={setTab} />

      <CreateOrderModal
        isOpen={showCreateOrder}
        onClose={(refresh) => {
          setShowCreateOrder(false);
          setSelectedOrder(null);
          setSelectedServiceType(null);
          setShowServiceSelection(false);

          if (refresh === true) {
            setRefreshData(true);
          }
        }}
        user={user}
        customerData={customerData}
        repeatOrder={selectedOrder}
        serviceType={selectedServiceType}
        onRefreshOrders={handleOpenCreateOrder}
      />

      <ServiceSelectionModal
        isOpen={showServiceSelection}
        onClose={() => setShowServiceSelection(false)}
        onSelectService={handleServiceSelect}
      />

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => {
          setShowFeedback(false);
          setFeedbackOrder(null);
          setRefreshData(true)
        }}
        order={feedbackOrder}
        onSubmit={handleSubmitFeedback}
      />

      {showFeedbackSuccess && (
        <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="checkCircle" size={24} className="text-green-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Avaliação enviada!</h3>
              <p className="text-sm text-slate-500 mt-2">{feedbackSuccessMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowFeedbackSuccess(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

       <OrderDetailModal
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
          setSelectedOrderId(null);
          setRefreshData(true)
        }}
        order={selectedOrder}
        orderId={selectedOrderId}
        onGiveFeedback={handleGiveFeedback}
      />

      <SupportModal
        isOpen={showSupport}
        onClose={() => {
          setShowSupport(false);
        }}
      />
    </div>
  );
};

export default CustomerApp;
