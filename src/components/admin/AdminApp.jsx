import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "../common/BottomNav";
import Header from "../common/Header";
import OrdersList from "../common/OrdersList";
import AdminHome from "./AdminHome";
import AdminDrivers from "./AdminDrivers";
import AdminCustomers from "./AdminCustomers";
import AdminIncidents from "./AdminIncidents";
import AdminReports from "./AdminReports";
import AdminFinance from "./AdminFinance";
import AdminRequests from "./AdminRequests";
import AdminManagers from "./AdminManagers";
import AdminSettings from "./AdminSettings";
import AdminAuditLogs from "./AdminAuditLogs";
import CreateOrderModal from "../cliente/modals/CreateOrderModal";
import AdminClientSelectModal from "./AdminClientSelectModal";
import { getOrder, getUrgentCount } from "../../api/client";
import Notifications from "../common/Notifications";
import OrderDetailModal from "../modals/OrderDetailModal";
import { useData } from "../../contexts/DataContext";

const AdminApp = () => {
  const [customerRequests] = useState([]);
  const [orderRefreshKey, setOrderRefreshKey] = useState(0);
  const [showAdminCreateOrder, setShowAdminCreateOrder] = useState(false);
  const [showClientSelect, setShowClientSelect] = useState(false);
  const [selectedClientForOrder, setSelectedClientForOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderDetailTab, setOrderDetailTab] = useState("details");
  const [urgentOrdersCount, setUrgentOrdersCount] = useState(0);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const data=useData()

  const tabs = useMemo(() => [
    { id: "home", label: "Início", icon: "home", path: "/" },
    { id: "orders", label: "Pedidos", icon: "package", path: "/orders" },
    { id: "drivers", label: "Motoristas", icon: "users", path: "/drivers" },
    { id: "customers", label: "Clientes", icon: "user", path: "/customers" },
    { id: "managers", label: "Gestores", icon: "users", path: "/managers" },
    { id: "incidents", label: "Incidentes", icon: "alertTriangle", path: "/incidents" },
    { id: "finance", label: "Finanças", icon: "dollar", path: "/finance" },
    { id: "reports", label: "Relatórios", icon: "chart", path: "/reports" },
    { id: "audit-logs", label: "Auditoria", icon: "fileText", path: "/audit-logs" },
    { id: "notifications", label: "Notificações", icon: "bell", path: "/notifications" },
    { id: "settings", label: "Configurações", icon: "settings", path: "/settings" },
  ], []);

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
    const paymentId = params.get('payment_id');
    const key = orderId || incidentId || driverId || paymentId;
    if (!key || deepLinkRef.current === key) return;
    deepLinkRef.current = key;
    if (orderId) {
      window.dispatchEvent(new CustomEvent('notification:openOrder', { detail: { orderId } }));
    } else if (incidentId) {
      setTab('incidents');
    } else if (driverId) {
      setTab('drivers');
    } else if (paymentId) {
      setTab('finance');
    }
  }, [location.search, openOrderById, setTab]);

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
    data.setPostDialogOpen(true)
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
      <Header user={user} onLogout={signOut} title="Painel Admin" onNotificationClick={() => setTab("notifications")} urgentOrdersCount={urgentOrdersCount} />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {activeTab === "home" && <AdminHome refreshKey={orderRefreshKey} onOrderUpdate={handleOrderUpdate} />}
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
        {activeTab === "customers" && <AdminCustomers />}
        {activeTab === "incidents" && <AdminIncidents />}
        {activeTab === "finance" && <AdminFinance />}
        {activeTab === "reports" && <AdminReports />}
        {activeTab === "audit-logs" && <AdminAuditLogs />}
        {activeTab === "notifications" && <Notifications />}
        {activeTab === "settings" && <AdminSettings />}
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

export default AdminApp;