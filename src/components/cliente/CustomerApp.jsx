import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { CUSTOMER_ORDERS, ORDERS, NOTIFICATIONS, CUSTOMERS } from "../../data/mockData";
import BottomNav from "../common/BottomNav";
import Header from "../common/Header";
import CustomerHome from "./CustomerHome";
import CustomerOrders from "./CustomerOrders";
import CustomerTracking from "./CustomerTracking";
import CustomerProfile from "./CustomerProfile";
import CustomerNotifications from "./CustomerNotifications";
import CreateOrderModal from "./modals/CreateOrderModal";
import OrderDetailModal from "./modals/OrderDetailModal";
import FeedbackModal from "./modals/FeedbackModal";
import SupportModal from "./modals/SupportModal";

const CustomerApp = () => {
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [showSupport, setShowSupport] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState(null); // Add state for service type
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  // Get customer specific orders
  const customerOrders = CUSTOMER_ORDERS.filter(o => o.clientId === user.id);
  const activeOrder = customerOrders.find(o => o.statusCode === "in_progress" || o.status === "Em entrega");
  const pendingOrders = customerOrders.filter(o => o.statusCode === "pending_approval" || o.status === "Pendente");
  const completedOrders = customerOrders.filter(o => o.statusCode === "completed" || o.status === "Concluído");
  
  // Get customer data
  const customerData = CUSTOMERS.find(c => c.email === user.email) || {
    id: user.id,
    name: user.name,
    phone: user.email,
    email: user.email,
    orders: customerOrders.length,
    rating: 4.8,
    frequent: true,
    addresses: ["Av. Eduardo Mondlane 45, Maputo"],
    defaultAddress: "Av. Eduardo Mondlane 45, Maputo"
  };
  
  // Get customer notifications
  const customerNotifications = NOTIFICATIONS.filter(n => n.userId === user.id || n.userId === null).slice(0, 5);
  const unreadCount = customerNotifications.filter(n => !n.read).length;

  // Stats
  const totalSpent = customerOrders.reduce((sum, o) => sum + (o.totalValue || 0), 0);
  const deliveryCount = customerOrders.length;
  const completedCount = customerOrders.filter(o => o.statusCode === "completed" || o.status === "Concluído").length;
  const averageRating = customerData.rating || 4.5;

  const handleCreateOrder = (serviceType = null) => {
    setSelectedServiceType(serviceType);
    setShowCreateOrder(true);
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleGiveFeedback = (order) => {
    setFeedbackOrder(order);
    setShowFeedback(true);
  };

  const handleSubmitFeedback = (rating, comment) => {
    console.log(`Feedback for order ${feedbackOrder.id}: ${rating} stars, comment: ${comment}`);
    setShowFeedback(false);
    setFeedbackOrder(null);
  };

  const handleTrackOrder = () => {
    if (activeOrder) {
      setSelectedOrder(activeOrder);
      setShowOrderDetails(true);
    } else if (customerOrders.length > 0) {
      setSelectedOrder(customerOrders[0]);
      setShowOrderDetails(true);
    }
    setTab("tracking");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header
        user={user}
        onLogout={signOut}
        title="DeliveryMZ"
        notifs={unreadCount}
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
          <CustomerOrders
            user={user}
            onViewDetails={handleViewOrderDetails}
            onRepeatOrder={(order) => {
              setSelectedOrder(order);
              setSelectedServiceType(order.serviceType || "delivery");
              setShowCreateOrder(true);
            }}
            onGiveFeedback={handleGiveFeedback}
          />
        )}
        {activeTab === "tracking" && (
          <CustomerTracking
            activeOrder={activeOrder}
            orders={customerOrders}
            onSelectOrder={handleViewOrderDetails}
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
          <CustomerNotifications
            notifications={customerNotifications}
            onClose={() => setTab("home")}
          />
        )}
      </div>
      <BottomNav tabs={tabs} active={activeTab} setActive={setTab} />

      {/* Modals */}
      <CreateOrderModal
        isOpen={showCreateOrder}
        onClose={() => {
          setShowCreateOrder(false);
          setSelectedOrder(null);
          setSelectedServiceType(null);
        }}
        user={user}
        customerData={customerData}
        repeatOrder={selectedOrder}
        serviceType={selectedServiceType}
      />

      <OrderDetailModal
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onGiveFeedback={handleGiveFeedback}
      />

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => {
          setShowFeedback(false);
          setFeedbackOrder(null);
        }}
        order={feedbackOrder}
        onSubmit={handleSubmitFeedback}
      />

      <SupportModal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
      />
    </div>
  );
};

export default CustomerApp;