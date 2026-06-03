import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { NOTIFICATIONS } from "../../data/mockData";
import BottomNav from "../common/BottomNav";
import Header from "../common/Header";
import AdminNotifications from "../admin/AdminNotifications";
import MotoristaHome from "./MotoristaHome";
import MotoristaOrders from "./MotoristaOrders";
import MotoristaHistory from "./MotoristaHistory";
import MotoristaProfile from "./MotoristaProfile";

const MotoristaApp = () => {
  const [online, setOnline] = useState(true);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: "home", label: "Início", icon: "home", path: "/" },
    { id: "orders", label: "Pedidos", icon: "package", path: "/orders" },
    { id: "history", label: "Histórico", icon: "clock", path: "/history" },
    { id: "profile", label: "Perfil", icon: "settings", path: "/profile" },
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header 
        user={user} 
        onLogout={signOut} 
        title="Painel Motorista" 
        notifs={NOTIFICATIONS.filter(n => !n.read).length} 
        onNotificationClick={() => setTab("notifications")} 
      />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {activeTab === "home" && <MotoristaHome online={online} setOnline={setOnline} />}
        {activeTab === "orders" && <MotoristaOrders />}
        {activeTab === "history" && <MotoristaHistory />}
        {activeTab === "profile" && <MotoristaProfile user={user} />}
        {activeTab === "notifications" && <AdminNotifications />}
      </div>
      <BottomNav tabs={tabs} active={activeTab} setActive={setTab} />
    </div>
  );
};

export default MotoristaApp;