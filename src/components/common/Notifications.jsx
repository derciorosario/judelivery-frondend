import { useState, useEffect, useCallback } from "react";
import Icon from "../common/Icon";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";
import client from "../../api/client";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todas");
  const { socket } = useSocket();
  const { user } = useAuth();

  const role = user?.role;

  const filters = role === 'admin' || role === 'manager' || role === 'superadmin'
    ? ["Todas", "Não lidas", "Pedidos", "Motoristas", "Incidentes", "Finanças"]
    : ["Todas", "Não lidas", "Pedidos", "Motorista", "Promoções"];

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/notifications');
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    const handleNotificationList = (list) => {
      setNotifications(list);
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:list', handleNotificationList);
    socket.emit('notification:fetch');

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:list', handleNotificationList);
    };
  }, [socket]);

  const handleMarkRead = async (id) => {
    try {
      await client.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await client.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  const hasUnread = notifications.some(n => !n.read);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    return date.toLocaleDateString('pt-MZ');
  };

  const filtered = filter === "Todas"
    ? notifications
    : filter === "Não lidas"
      ? notifications.filter(n => !n.read)
      : filter === "Pedidos"
        ? notifications.filter(n => n.category === "order" || n.category === "customer_order")
        : filter === "Motoristas" || filter === "Motorista"
          ? notifications.filter(n => n.category === "driver" || n.category === "customer_driver")
          : filter === "Incidentes"
            ? notifications.filter(n => n.category === "incident")
            : filter === "Finanças"
              ? notifications.filter(n => n.category === "finance")
              : notifications.filter(n => n.category === "customer_promo");

  const getIconColor = (category) => {
    switch(category) {
      case "order": case "customer_order": return "bg-blue-100 text-blue-600";
      case "driver": case "customer_driver": return "bg-green-100 text-green-600";
      case "incident": return "bg-orange-100 text-orange-600";
      case "finance": case "customer_promo": return "bg-purple-100 text-purple-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-slate-700">Notificações</p>
        {hasUnread && (
          <button 
            onClick={handleMarkAllRead}
            className="text-xs text-orange-500 font-medium"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mb-4">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {f}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-center py-10">
          <Icon name="refreshCw" size={32} className="text-slate-300 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-slate-500">Carregando notificações...</p>
        </div>
      ) : filtered.length > 0 ? (
        filtered.map(n => (
          <div key={n.id} 
            className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-3 ${!n.read ? "border-l-4 border-l-orange-500" : ""}`}
            onClick={() => !n.read && handleMarkRead(n.id)}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconColor(n.category)}`}>
                <Icon name={n.icon} size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  {!n.read && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                {n.createdAt && (
                  <p className="text-[10px] text-slate-400 mt-1">{formatTime(n.createdAt)}</p>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
          <Icon name="bell" size={48} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhuma notificação encontrada</p>
        </div>
      )}
    </>
  );
};

export default Notifications;