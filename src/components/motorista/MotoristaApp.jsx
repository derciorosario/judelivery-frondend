import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { getOrder, updateOrder, getDriverProfile, getDriverDashboard } from "../../api/client";
import BottomNav from "../common/BottomNav";
import Header from "../common/Header";
import OrdersList from "../common/OrdersList";
import useDriverLocation from "./useDriverLocation";
import MotoristaHome from "./MotoristaHome";
import MotoristaHistory from "./MotoristaHistory";
import MotoristaProfile from "./MotoristaProfile";
import MotoristaMap from "./MotoristaMap";
import Notifications from "../common/Notifications";
import OrderDetailModal from "../modals/OrderDetailModal";
import { registerPush } from "../../services/push";
import { useData } from "../../contexts/DataContext";

// Memoize tab components to prevent unnecessary re-renders
const MemoizedMotoristaHome = memo(MotoristaHome);
const MemoizedMotoristaMap = memo(MotoristaMap);
const MemoizedOrdersList = memo(OrdersList);
const MemoizedMotoristaHistory = memo(MotoristaHistory);
const MemoizedMotoristaProfile = memo(MotoristaProfile);
const MemoizedNotifications = memo(Notifications);

const MotoristaApp = () => {
  const [online, setOnline] = useState(true);
  const { user, signOut } = useAuth();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const data = useData();
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderRefreshKey, setOrderRefreshKey] = useState(0);
  const [homeRefreshKey, setHomeRefreshKey] = useState(0);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [driverProfile, setDriverProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [orderDetailTab, setOrderDetailTab] = useState("details");

  // Use a single location instance at the app level
  const location = useDriverLocation({ autoStart: true });

  useEffect(() => {

    if(location?.gpsPermission!="granted") return

    if (user && !data.pushRegistered) {
      registerPush(user?.id, navigate, data);
    }
  }, [user, data, navigate, location])

  const tabs = useRef([
    { id: "home", label: "Início", icon: "home", path: "/" },
    { id: "map", label: "Mapa", icon: "map", path: "/map" },
    { id: "orders", label: "Pedidos", icon: "package", path: "/orders" },
    { id: "history", label: "Histórico", icon: "clock", path: "/history" },
    { id: "profile", label: "Perfil", icon: "settings", path: "/profile" },
    { id: "notifications", label: "Notificações", icon: "bell", path: "/notifications" },
  ]).current;

  const getTabFromPath = useCallback(() => {
    const rawPath = routerLocation.pathname;
    const normalized = rawPath.replace(/\/$/, "") || "/";
    const tab = tabs.find(t => {
      if (t.id === "home") return t.path === rawPath || t.path === rawPath.replace(/\/$/, "");
      return normalized === t.path || normalized === "/" + t.path || ("/" + t.path) === normalized;
    });
    return tab ? tab.id : "home";
  }, [routerLocation.pathname, tabs]);

  const activeTab = getTabFromPath();

  const setTab = useCallback((tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && tabId !== "home") {
      navigate(tab.path);
    } else {
      navigate("/");
    }
  }, [navigate, tabs]);

  const openOrderById = useCallback(async (orderId, tab) => {
    if (!orderId) return;
    try {
      const response = await getOrder(orderId);
      setSelectedOrder(response.data);
      setOrderDetailTab(tab || "details");
      setShowOrderDetails(true);
    } catch (err) {
      console.error("Failed to fetch order for notification:", err);
    }
  }, []);

  useEffect(() => {
    const handleOpenOrder = (e) => {
      const orderId = e.detail?.orderId;
      const tab = e.detail?.tab;
      if (orderId) openOrderById(orderId, tab);
    };
    window.addEventListener("notification:openOrder", handleOpenOrder);
    return () => window.removeEventListener("notification:openOrder", handleOpenOrder);
  }, [openOrderById]);

  const deepLinkRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const orderId = params.get('order_id');
    if (!orderId || deepLinkRef.current === orderId) return;
    deepLinkRef.current = orderId;
    window.dispatchEvent(new CustomEvent('notification:openOrder', { detail: { orderId } }));
  }, [routerLocation.search, openOrderById]);

  const handleOrderUpdate = useCallback((updatedOrder) => {
    setOrderRefreshKey(prev => prev + 1);
    setHomeRefreshKey(prev => prev + 1);
    setHistoryRefreshKey(prev => prev + 1);
    setSelectedOrder(prev => ({ ...prev, status: updatedOrder.status }));
  }, []);

  const handleStatusChange = useCallback((newStatus) => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, newStatus);
  }, [selectedOrder]);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      const payload = { status: newStatus };
      const res = await updateOrder(orderId, payload);
      handleOrderUpdate(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [handleOrderUpdate]);

  const loadDriverProfile = useCallback(async () => {
    if (!user?.id) return;
    setProfileLoading(true);
    try {
      const response = await getDriverProfile();
      setDriverProfile(response.data);
    } catch (err) {
      console.error("Failed to load driver profile", err);
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDriverProfile();
  }, [loadDriverProfile]);

  const handleCloseOrderDetails = useCallback(() => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
    setOrderRefreshKey(k => k + 1);
    setHomeRefreshKey(k => k + 1);
    setHistoryRefreshKey(k => k + 1);
    setOrderDetailTab("details");
  }, []);

  // Memoize the render of each tab to prevent unnecessary re-renders
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case "home":
        return (
          <MemoizedMotoristaHome 
            online={online} 
            setOnline={setOnline} 
            location={location} 
            onOrderUpdate={handleOrderUpdate}
            refreshKey={homeRefreshKey}
          />
        );
      case "map":
        return (
          <MemoizedMotoristaMap 
            online={online} 
            onToggleOnline={setOnline} 
            location={location} 
          />
        );
      case "orders":
        return (
          <MemoizedOrdersList
            refreshKey={orderRefreshKey}
            showNewOrderButton={false}
            title="Os Meus Pedidos"
            onOrderUpdate={handleOrderUpdate}
          />
        );
      case "history":
        return <MemoizedMotoristaHistory refreshKey={historyRefreshKey} />;
      case "profile":
        return profileLoading ? (
          <div className="text-center py-10 text-sm text-slate-500">A carregar perfil...</div>
        ) : (
          <MemoizedMotoristaProfile 
            user={user} 
            profileData={driverProfile} 
            onProfileUpdated={loadDriverProfile} 
          />
        );
      case "notifications":
        return <MemoizedNotifications />;
      default:
        return null;
    }
  }, [activeTab, online, location, homeRefreshKey, orderRefreshKey, historyRefreshKey, 
      handleOrderUpdate, profileLoading, user, driverProfile, loadDriverProfile]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header
        user={user}
        onLogout={signOut}
        title="Painel Motorista"
        onNotificationClick={() => setTab("notifications")}
      />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {renderTabContent()}
      </div>
      <BottomNav tabs={tabs} active={activeTab} setActive={setTab} />

      <OrderDetailModal
        isOpen={showOrderDetails}
        onClose={handleCloseOrderDetails}
        order={selectedOrder}
        onUpdate={handleOrderUpdate}
        onStatusChange={handleStatusChange}
        role="driver"
        initialTab={orderDetailTab}
      />
    </div>
  );
};

export default MotoristaApp;