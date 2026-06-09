import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "../common/BottomNav";
import Header from "../common/Header";
import AdminOrders from "../admin/AdminOrders";
import AdminDrivers from "../admin/AdminDrivers";
import AdminProducts from "../admin/AdminProducts";
import AdminCustomers from "../admin/AdminCustomers";
import AdminIncidents from "../admin/AdminIncidents";
import AdminManagers from "../admin/AdminManagers";
import CreateOrderModal from "../cliente/modals/CreateOrderModal";
import AdminClientSelectModal from "../admin/AdminClientSelectModal";
import { AdminOrderDetailModal } from "../admin/AdminOrderDetailModal";
import GestorHome from "./GestorHome";
import GestorMap from "./GestorMap";
import GestorRequests from "./GestorRequests";
import L from "leaflet";
import { getOrder } from "../../api/client";
import Notifications from "../common/Notifications";

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

  const [showAdminCreateOrder, setShowAdminCreateOrder] = useState(false);
  const [showClientSelect, setShowClientSelect] = useState(false);
  const [selectedClientForOrder, setSelectedClientForOrder] = useState(null);
  const [orderRefreshKey, setOrderRefreshKey] = useState(0);
  const [selectedDriverForNotification, setSelectedDriverForNotification] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);



  const tabs = [
    { id: "home", label: "Início", icon: "home", path: "/" },
    { id: "orders", label: "Pedidos", icon: "package", path: "/orders" },
    { id: "map", label: "Mapa", icon: "map", path: "/map" },
    { id: "drivers", label: "Equipa", icon: "users", path: "/drivers" },
    { id: "managers", label: "Gestores", icon: "users", path: "/managers" },
    { id: "products", label: "Produtos", icon: "shopping", path: "/products" },
    { id: "requests", label: "Requisições", icon: "clipboard", path: "/requests" },
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
      />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {activeTab === "home" && <GestorHome />}
        {activeTab === "orders" && <AdminOrders onOpenCreateDelivery={() => setShowClientSelect(true)} refreshKey={orderRefreshKey} />}
        {activeTab === "map" && <GestorMap initialDriverId={selectedDriverForNotification} />}
        {activeTab === "drivers" && <AdminDrivers />}
        {activeTab === "managers" && <AdminManagers />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "customers" && <AdminCustomers />}
        {activeTab === "incidents" && <AdminIncidents />}
        {activeTab === "requests" && <GestorRequests />}
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

      <AdminOrderDetailModal
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onUpdate={handleOrderUpdate}
      />
    </div>
  );
};

export default GestorApp;
