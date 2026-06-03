import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "../common/BottomNav";
import Header from "../common/Header";
import AdminHome from "./AdminHome";
import AdminOrders from "./AdminOrders";
import AdminDrivers from "./AdminDrivers";
import AdminProducts from "./AdminProducts";
import AdminCustomers from "./AdminCustomers";
import AdminIncidents from "./AdminIncidents";
import AdminNotifications from "./AdminNotifications";
import AdminReports from "./AdminReports";
import AdminFinance from "./AdminFinance";
import AdminRequests from "./AdminRequests";
import AdminManagers from "./AdminManagers";
import { CUSTOMER_REQUESTS, NOTIFICATIONS, ORDERS } from "../../data/mockData";

const AdminApp = () => {
  const [customerRequests, setCustomerRequests] = useState(CUSTOMER_REQUESTS);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
      navigate("/login");
    }
  }, [user, navigate]);

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

  const setTab = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && tabId !== "home") {
      navigate(tab.path);
      console.log('--xx--'+tab.path)
    } else {
      console.log('--mm--')
      navigate("/");
    }
  };


  const handleApproveRequest = (requestId) => {
    const request = customerRequests.find(r => r.id === requestId);
    if (request) {
      const newOrder = {
        id: `#${String(ORDERS.length + 1).padStart(3, "0")}`,
        client: request.customerName,
        origin: request.origin,
        dest: request.dest,
        status: "Aprovado",
        driver: "—",
        total: "0 MZN",
        time: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }),
        dist: "5.0 km",
        productId: null,
        customerId: request.customerId,
        paymentMethod: "dinheiro",
        paymentStatus: "pendente",
        instructions: request.instructions,
        scheduledTime: request.scheduledTime,
      };
      const basePrice = 50;
      const pricePerKm = 15;
      const estimatedDist = 5.0;
      newOrder.total = (basePrice + pricePerKm * estimatedDist) + " MZN";
      newOrder.dist = estimatedDist + " km";
      
      ORDERS.push(newOrder);
      setCustomerRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "approved" } : r));
      
      NOTIFICATIONS.push({
        id: NOTIFICATIONS.length + 1,
        type: "customer",
        title: "Pedido Aprovado",
        message: `Seu pedido ${requestId} foi aprovado e está sendo preparado`,
        time: "agora",
        read: false,
        icon: "checkCircle",
        userId: request.customerId,
      });
    }
  };

  const handleRejectRequest = (requestId) => {
    setCustomerRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "rejected" } : r));
    const request = customerRequests.find(r => r.id === requestId);
    if (request) {
      NOTIFICATIONS.push({
        id: NOTIFICATIONS.length + 1,
        type: "customer",
        title: "Pedido Rejeitado",
        message: `Seu pedido ${requestId} foi rejeitado. Entre em contato com o suporte.`,
        time: "agora",
        read: false,
        icon: "xCircle",
        userId: request.customerId,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header user={user} onLogout={signOut} title="Painel Admin" notifs={NOTIFICATIONS.filter(n => !n.read).length} onNotificationClick={() => setTab("notifications")} />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {activeTab === "home" && <AdminHome customerRequests={customerRequests.filter(r => r.status === "pending")} />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "drivers" && <AdminDrivers />}
        {activeTab === "managers" && <AdminManagers />}
        {activeTab === "requests" && <AdminRequests requests={customerRequests} onApprove={handleApproveRequest} onReject={handleRejectRequest} />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "customers" && <AdminCustomers />}
        {activeTab === "incidents" && <AdminIncidents />}
        {activeTab === "finance" && <AdminFinance />}
        {activeTab === "reports" && <AdminReports />}
        {activeTab === "notifications" && <AdminNotifications />}
      </div>
      <BottomNav tabs={tabs} active={activeTab} setActive={setTab} />
    </div>
  );
};

export default AdminApp;