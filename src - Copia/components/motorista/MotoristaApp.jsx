import { useState, useEffect, useCallback } from "react";
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

const MotoristaApp = () => {
  const [online, setOnline] = useState(true);
  const { user, signOut } = useAuth();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderRefreshKey, setOrderRefreshKey] = useState(0);
  const [homeRefreshKey, setHomeRefreshKey] = useState(0);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [driverProfile, setDriverProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [orderDetailTab, setOrderDetailTab] = useState("details");

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
      const tab = e.detail?.tab;
       console.log({orderId})
      if (orderId) {
        try {
          const response = await getOrder(orderId);
          setSelectedOrder(response.data);
          if (tab) {
            setOrderDetailTab(tab);
          } else {
            setOrderDetailTab("details");
          }
          setShowOrderDetails(true);
        } catch (err) {
          console.error("Failed to fetch order for notification:", err);
        }
      }
    };
    window.addEventListener("notification:openOrder", handleOpenOrder);
    return () => window.removeEventListener("notification:openOrder", handleOpenOrder);
  }, []);

  const location = useDriverLocation({ autoStart: true });

  const handleOrderUpdate = (updatedOrder) => {
      
     setOrderRefreshKey(prev => prev + 1);
     setHomeRefreshKey(prev => prev + 1);
     setHistoryRefreshKey(prev => prev + 1);
     setSelectedOrder(prev => ({...prev,status:updatedOrder.status}))

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


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header
        user={user}
        onLogout={signOut}
        title="Painel Motorista"
        onNotificationClick={() => setTab("notifications")}
      />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {activeTab === "home" && (
           <MotoristaHome 
             online={online} 
             setOnline={setOnline} 
             location={location} 
             onOrderUpdate={handleOrderUpdate}
             refreshKey={homeRefreshKey}
           />
         )}
        {activeTab === "map" && (
          <MotoristaMap online={online} onToggleOnline={setOnline} location={location} />
        )}
        {activeTab === "orders" && (
          <OrdersList
            refreshKey={orderRefreshKey}
            showNewOrderButton={false}
            title="Os Meus Pedidos"
            onOrderUpdate={handleOrderUpdate}
          />
        )}
        {activeTab === "history" && <MotoristaHistory refreshKey={historyRefreshKey} />}
        {activeTab === "profile" && (
          profileLoading ? (
            <div className="text-center py-10 text-sm text-slate-500">A carregar perfil...</div>
          ) : (
            <MotoristaProfile user={user} profileData={driverProfile} onProfileUpdated={loadDriverProfile} />
          )
        )}
        {activeTab === "notifications" && <Notifications />}
      </div>
      <BottomNav tabs={tabs} active={activeTab} setActive={setTab} />

       <OrderDetailModal
          isOpen={showOrderDetails}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
            setOrderRefreshKey(k => k + 1);
            setHomeRefreshKey(k => k + 1);
            setHistoryRefreshKey(k => k + 1);
            setOrderDetailTab("details");
          }}
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