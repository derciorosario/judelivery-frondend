import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { getDriverOrders, getOrder, updateOrder } from "../../api/client";
import BottomNav from "../common/BottomNav";
import Header from "../common/Header";
import useDriverLocation from "./useDriverLocation";
import MotoristaHome from "./MotoristaHome";
import MotoristaOrders from "./MotoristaOrders";
import { MotoristaOrderDetailModal } from "./MotoristaOrders";
import MotoristaHistory from "./MotoristaHistory";
import MotoristaProfile from "./MotoristaProfile";
import MotoristaMap from "./MotoristaMap";
import Notifications from "../common/Notifications";

const MotoristaApp = () => {
  const [online, setOnline] = useState(true);
  const { user, signOut } = useAuth();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  
  const [driverOrders, setDriverOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const [orderRefreshKey, setOrderRefreshKey] = useState(0);


  const tabs = [
    { id: "home", label: "Início", icon: "home", path: "/" },
    { id: "map", label: "Mapa", icon: "map", path: "/map" },
    { id: "orders", label: "Pedidos", icon: "package", path: "/orders" },
    { id: "history", label: "Histórico", icon: "clock", path: "/history" },
    { id: "profile", label: "Perfil", icon: "settings", path: "/profile" },
    { id: "notifications", label: "Notificações", icon: "bell", path: "/notifications" },
  ];

  const getTabFromPath = () => {
    const rawPath = routerLocation.pathname;
    const normalized = rawPath.replace(/\/$/, "") || "/";
    const tab = tabs.find(t => {
      if (t.id === "home") return t.path === rawPath || t.path === rawPath.replace(/\/$/, "");
      return normalized === t.path || normalized === "/" + t.path || ("/" + t.path) === normalized;
    });
    return tab ? tab.id : "home";
  };

  const activeTab = getTabFromPath();

  const setTab = useCallback((tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && tabId !== "home") {
      navigate(tab.path);
    } else {
      navigate("/");
    }
  }, [navigate, tabs]);

  useEffect(() => {
    const handleOpenOrder = async (e) => {
      const orderId = e.detail?.orderId;
      if (orderId) {
        try {
          const response = await getOrder(orderId);
          setSelectedOrder(response.data);
          setShowOrderDetails(true);
        } catch (err) {
          console.error("Failed to fetch order for notification:", err);
        }
      }
    };
    window.addEventListener("notification:openOrder", handleOpenOrder);
    return () => window.removeEventListener("notification:openOrder", handleOpenOrder);
  }, []);

  useEffect(() => {
    if (user) {
      getDriverOrders()
        .then(res => setDriverOrders(res.data))
        .catch(err => console.error("Failed to fetch driver orders:", err))
    }
  }, [user]);

  const activeOrder = driverOrders.find(o => o.status === "in_transit" || o.status === "assigned");

  const location = useDriverLocation({ autoStart: true, orderId: activeOrder?.id });

  const handleOrderUpdate = (updatedOrder) => {
    setSelectedOrder(updatedOrder);
    setDriverOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  };

  const handleStatusChange = (newStatus) => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, newStatus);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const payload = { status: newStatus };
      const res = await updateOrder(orderId, payload);
      handleOrderUpdate(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header
        user={user}
        onLogout={signOut}
        title="Painel Motorista"
        onNotificationClick={() => setTab("notifications")}
      />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {activeTab === "home" && <MotoristaHome online={online} setOnline={setOnline} location={location} />}
        {activeTab === "map" && <MotoristaMap online={online} onToggleOnline={setOnline} location={location} />}
        {activeTab === "orders" && <MotoristaOrders refreshKey={orderRefreshKey} />}
        {activeTab === "history" && <MotoristaHistory />}
        {activeTab === "profile" && <MotoristaProfile user={user} />}
        {activeTab === "notifications" && <Notifications />}
      </div>
      <BottomNav tabs={tabs} active={activeTab} setActive={setTab} />

      <MotoristaOrderDetailModal
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
          setOrderRefreshKey(k => k + 1);
        }}
        order={selectedOrder}
        onUpdate={handleOrderUpdate}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default MotoristaApp;
