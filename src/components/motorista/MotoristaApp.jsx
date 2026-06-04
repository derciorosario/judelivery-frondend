import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { NOTIFICATIONS } from "../../data/mockData";
import { getDriverOrders } from "../../api/client";
import BottomNav from "../common/BottomNav";
import Header from "../common/Header";
import useDriverLocation from "./useDriverLocation";
import MotoristaHome from "./MotoristaHome";
import MotoristaOrders from "./MotoristaOrders";
import MotoristaHistory from "./MotoristaHistory";
import MotoristaProfile from "./MotoristaProfile";
import MotoristaMap from "./MotoristaMap";

const MotoristaApp = () => {
  const [online, setOnline] = useState(true);
  const { user, signOut } = useAuth();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  
  const [driverOrders, setDriverOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      getDriverOrders()
        .then(res => setDriverOrders(res.data))
        .catch(err => console.error("Failed to fetch driver orders:", err))
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  const activeOrder = driverOrders.find(o => o.status === "in_transit" || o.status === "assigned");

  const location = useDriverLocation({ autoStart: true, orderId: activeOrder?.id });

  const tabs = [
    { id: "home", label: "Início", icon: "home", path: "/" },
    { id: "map", label: "Mapa", icon: "map", path: "/map" },
    { id: "orders", label: "Pedidos", icon: "package", path: "/orders" },
    { id: "history", label: "Histórico", icon: "clock", path: "/history" },
    { id: "profile", label: "Perfil", icon: "settings", path: "/profile" },
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
        {activeTab === "home" && <MotoristaHome online={online} setOnline={setOnline} location={location} />}
        {activeTab === "map" && <MotoristaMap online={online} onToggleOnline={setOnline} location={location} />}
        {activeTab === "orders" && <MotoristaOrders />}
        {activeTab === "history" && <MotoristaHistory />}
        {activeTab === "profile" && <MotoristaProfile user={user} />}
      </div>
      <BottomNav tabs={tabs} active={activeTab} setActive={setTab} />
    </div>
  );
};

export default MotoristaApp;
