import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "../common/BottomNav";
import Header from "../common/Header";
import OrdersList from "../common/OrdersList";
import AdminHome from "./AdminHome";
import AdminDrivers from "./AdminDrivers";
import AdminProducts from "./AdminProducts";
import AdminCustomers from "./AdminCustomers";
import AdminIncidents from "./AdminIncidents";
import AdminReports from "./AdminReports";
import AdminFinance from "./AdminFinance";
import AdminRequests from "./AdminRequests";
import AdminManagers from "./AdminManagers";
import CreateOrderModal from "../cliente/modals/CreateOrderModal";
import AdminClientSelectModal from "./AdminClientSelectModal";
import { AdminOrderDetailModal } from "./AdminOrderDetailModal";
import { getOrder } from "../../api/client";
import Notifications from "../common/Notifications";

const AdminApp = () => {
  const [customerRequests, setCustomerRequests] = useState([]);
  const [orderRefreshKey, setOrderRefreshKey] = useState(0);
  const [showAdminCreateOrder, setShowAdminCreateOrder] = useState(false);
  const [showClientSelect, setShowClientSelect] = useState(false);
  const [selectedClientForOrder, setSelectedClientForOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: "home", label: "Início", icon: "home", path: "/" },
    { id: "orders", label: "Pedidos", icon: "package", path: "/orders" },
    { id: "drivers", label: "Motoristas", icon: "users", path: "/drivers" },
    { id: "products", label: "Produtos", icon: "shopping", path: "/products" },
    { id: "customers", label: "Clientes", icon: "user", path: "/customers" },
    { id: "managers", label: "Gestores", icon: "users", path: "/managers" },
    { id: "incidents", label: "Incidentes", icon: "alertTriangle", path: "/incidents" },
    { id: "finance", label: "Finanças", icon: "dollar", path: "/finance" },
    { id: "reports", label: "Relatórios", icon: "chart", path: "/reports" },
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
        setTab("drivers");
      }
    };
    window.addEventListener("notification:openMap", handleOpenMap);
    return () => window.removeEventListener("notification:openMap", handleOpenMap);
  }, [setTab]);

  useEffect(() => {
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleApproveRequest = (requestId) => {
    // Handle request approval
    console.log("Approve request:", requestId);
  };

  const handleRejectRequest = (requestId) => {
    // Handle request rejection
    console.log("Reject request:", requestId);
  };

  const handleOpenCreateOrder = () => {
    setShowClientSelect(true);
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

  const handleOrderUpdate = (updatedOrder) => {
    setSelectedOrder(updatedOrder);
    setOrderRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header user={user} onLogout={signOut} title="Painel Admin" onNotificationClick={() => setTab("notifications")} />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {activeTab === "home" && <AdminHome customerRequests={customerRequests.filter(r => r.status === "pending")} />}
        {activeTab === "orders" && (
          <OrdersList
            refreshKey={orderRefreshKey}
            onNewOrderClick={handleOpenCreateOrder}
            showNewOrderButton={true}
            title="Gestão de Pedidos"
            onOrderUpdate={handleOrderUpdate}
          />
        )}
        {activeTab === "drivers" && <AdminDrivers />}
        {activeTab === "managers" && <AdminManagers />}
        {activeTab === "requests" && <AdminRequests requests={customerRequests} onApprove={handleApproveRequest} onReject={handleRejectRequest} />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "customers" && <AdminCustomers />}
        {activeTab === "incidents" && <AdminIncidents />}
        {activeTab === "finance" && <AdminFinance />}
        {activeTab === "reports" && <AdminReports />}
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
          onClose={() => {
            setShowAdminCreateOrder(false);
            setSelectedClientForOrder(null);
            setOrderRefreshKey(k => k + 1);
          }}
          onOrderCreated={handleOrderCreated}
          user={user}
          serviceType="delivery"
          clientId={selectedClientForOrder?.userId || selectedClientForOrder?.id}
          selectedClient={selectedClientForOrder}
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

export default AdminApp;