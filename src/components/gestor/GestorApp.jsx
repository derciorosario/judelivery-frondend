import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { getOrder, getUrgentCount } from "../../api/client";
import BottomNav from "../common/BottomNav";
import Header from "../common/Header";
import OrdersList from "../common/OrdersList";
import AdminDrivers from "../admin/AdminDrivers";
import AdminCustomers from "../admin/AdminCustomers";
import AdminIncidents from "../admin/AdminIncidents";
import AdminManagers from "../admin/AdminManagers";
import CreateOrderModal from "../cliente/modals/CreateOrderModal";
import AdminClientSelectModal from "../admin/AdminClientSelectModal";
import { AdminOrderDetailModal } from "../admin/AdminOrderDetailModal";
import GestorHome from "./GestorHome";
import GestorMap from "./GestorMap";
import Notifications from "../common/Notifications";
import L from "leaflet";
import OrderDetailModal from "../modals/OrderDetailModal";
import { useData } from "../../contexts/DataContext";
import { registerPush } from "../../services/push";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const GestorApp = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const data=useData()

  const [showAdminCreateOrder, setShowAdminCreateOrder] = useState(false);
  const [showClientSelect, setShowClientSelect] = useState(false);
  const [selectedClientForOrder, setSelectedClientForOrder] = useState(null);
  const [orderRefreshKey, setOrderRefreshKey] = useState(0);
  const [selectedDriverForNotification, setSelectedDriverForNotification] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderDetailTab, setOrderDetailTab] = useState("details");
  const [urgentOrdersCount, setUrgentOrdersCount] = useState(0);


  useEffect(() => {
     if(user && !data.pushRegistered){
       registerPush(user?.id,navigate,data)
     }
   }, [user]);

  useEffect(() => {
    const fetchUrgentCount = async () => {
      try {
        const res = await getUrgentCount();
        setUrgentOrdersCount(res.data?.count || 0);
      } catch (err) {
        console.error("Failed to fetch urgent orders count", err);
      }
    };
    fetchUrgentCount();
    const interval = setInterval(fetchUrgentCount, 7000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: "home", label: "Início", icon: "home", path: "/" },
    { id: "orders", label: "Pedidos", icon: "package", path: "/orders" },
    { id: "map", label: "Mapa", icon: "map", path: "/map" },
    { id: "drivers", label: "Equipa", icon: "users", path: "/drivers" },
    { id: "customers", label: "Clientes", icon: "user", path: "/customers" },
    { id: "incidents", label: "Incidentes", icon: "alertTriangle", path: "/incidents" },
    { id: "notifications", label: "Notificações", icon: "bell", path: "/notifications" },
  ];

  const getTabFromPath = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    const tab = tabs.find(t => t.path === path);
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

  const openOrderById = useCallback(async (orderId, tab) => {
    if (!orderId) return;
    try {
      const response = await getOrder(orderId);
      setSelectedOrder(response.data);
      setOrderDetailTab(tab || "details");
      setShowOrderDetails(true);
      data.setPostDialogOpen(true)
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
    const params = new URLSearchParams(location.search);
    const orderId = params.get('order_id');
    const incidentId = params.get('incident_id');
    const driverId = params.get('driver_id');
    const key = orderId || incidentId || driverId;
    if (!key || deepLinkRef.current === key) return;
    deepLinkRef.current = key;
    if (orderId) {
      window.dispatchEvent(new CustomEvent('notification:openOrder', { detail: { orderId } }));
    } else if (incidentId) {
      setTab('incidents');
    } else if (driverId) {
      window.dispatchEvent(new CustomEvent('notification:openMap', { detail: { driverId } }));
    }
  }, [location.search, openOrderById, setTab]);

  useEffect(() => {
    const handleOpenMap = (e) => {
      const driverId = e.detail?.driverId;
      if (driverId) {
        setSelectedDriverForNotification(driverId);
        setTab("map");
      }
    };
    window.addEventListener("notification:openMap", handleOpenMap);
    return () => window.removeEventListener("notification:openMap", handleOpenMap);
  }, [setTab]);

  const handleClientSelected = (client) => {
    setSelectedClientForOrder(client);
    setShowClientSelect(false);
    setShowAdminCreateOrder(true);
    data.setPostDialogOpen(true)
  };

  const handleOrderCreated = () => {
    setShowAdminCreateOrder(false);
    setSelectedClientForOrder(null);
    setOrderRefreshKey(k => k + 1);
  };

  const handleAdminCreateOrderClose = () => {
    setShowAdminCreateOrder(false);
    setSelectedClientForOrder(null);
    setOrderRefreshKey(k => k + 1);
  };

  const handleOrderUpdate = (updatedOrder) => {
    setSelectedOrder(updatedOrder);
    setOrderRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header 
        user={user} 
        onLogout={signOut} 
        title="Gestão Operacional" 
        onNotificationClick={() => setTab("notifications")}
        urgentOrdersCount={urgentOrdersCount}
      />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {activeTab === "home" && <GestorHome refreshKey={orderRefreshKey} onOrderUpdate={handleOrderUpdate} />}
        {activeTab === "orders" && (
          <OrdersList
            refreshKey={orderRefreshKey}
            onNewOrderClick={() => setShowClientSelect(true)}
            showNewOrderButton={true}
            title="Gestão de Pedidos"
            onOrderUpdate={handleOrderUpdate}
          />
        )}
        {activeTab === "map" && <GestorMap initialDriverId={selectedDriverForNotification} />}
        {activeTab === "drivers" && <AdminDrivers />}
        {activeTab === "managers" && <AdminManagers />}
        {activeTab === "customers" && <AdminCustomers />}
        {activeTab === "incidents" && <AdminIncidents />}
        {activeTab === "notifications" && <Notifications />}
      </div>
      <BottomNav tabs={tabs} active={activeTab} setActive={setTab} />

      <AdminClientSelectModal
        isOpen={showClientSelect}
        onClose={() => setShowClientSelect(false)}
        onSelect={handleClientSelected}
        selectedClient={selectedClientForOrder}
      />

      {showAdminCreateOrder && (
        <CreateOrderModal
          autoClose={true}
          isOpen={showAdminCreateOrder}
          onClose={handleAdminCreateOrderClose}
          onOrderCreated={handleOrderCreated}
          user={user}
          serviceType="delivery"
          clientId={selectedClientForOrder?.userId || selectedClientForOrder?.id}
          onClientSelectClick={() => {
            setShowAdminCreateOrder(false);
            setShowClientSelect(true);
          }}
        />
      )}

      <OrderDetailModal
        autoClose={true}
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
          setOrderDetailTab("details");
        }}
        order={selectedOrder}
        onUpdate={handleOrderUpdate}
        role="manager"
        initialTab={orderDetailTab}
      />
    </div>
  );
};

export default GestorApp;