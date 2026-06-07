import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { NOTIFICATIONS } from "../../data/mockData";
import BottomNav from "../common/BottomNav";
import Header from "../common/Header";
import AdminOrders from "../admin/AdminOrders";
import AdminDrivers from "../admin/AdminDrivers";
import AdminProducts from "../admin/AdminProducts";
import AdminCustomers from "../admin/AdminCustomers";
import AdminIncidents from "../admin/AdminIncidents";
import AdminNotifications from "../admin/AdminNotifications";
import AdminManagers from "../admin/AdminManagers";
import CreateOrderModal from "../cliente/modals/CreateOrderModal";
import AdminClientSelectModal from "../admin/AdminClientSelectModal";
import ServiceSelectionModal from "../cliente/modals/ServiceSelectionModal";
import GestorHome from "./GestorHome";
import GestorMap from "./GestorMap";
import GestorRequests from "./GestorRequests";
import L from "leaflet";

// Fix Leaflet icon issue
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

  const setTab = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && tabId !== "home") {
      navigate(tab.path);
    } else {
      navigate("/");
    }
  };

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
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header 
        user={user} 
        onLogout={signOut} 
        title="Gestão Operacional" 
        notifs={NOTIFICATIONS.filter(n => !n.read).length} 
        onNotificationClick={() => setTab("notifications")} 
      />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {activeTab === "home" && <GestorHome />}
        {activeTab === "orders" && <AdminOrders onOpenCreateDelivery={() => setShowClientSelect(true)} refreshKey={orderRefreshKey} />}
        {activeTab === "map" && <GestorMap />}
        {activeTab === "drivers" && <AdminDrivers />}
        {activeTab === "managers" && <AdminManagers />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "customers" && <AdminCustomers />}
        {activeTab === "incidents" && <AdminIncidents />}
        {activeTab === "requests" && <GestorRequests />}
        {activeTab === "notifications" && <AdminNotifications />}
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
    </div>
  );
};

export default GestorApp;