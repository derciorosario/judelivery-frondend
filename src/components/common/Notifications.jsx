import { useState, useEffect, useCallback, useRef } from "react";
import { 
  RefreshCw, MoreVertical, Trash2, Trash, X, Check, Bell,
  Package, Users, AlertTriangle, DollarSign, Gift, CheckCheck
} from "lucide-react";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";
import client from "../../api/client";

const ICON_MAP = {
  package: Package,
  users: Users,
  alertTriangle: AlertTriangle,
  dollar: DollarSign,
  gift: Gift,
  check: Check,
  bell: Bell,
  x: X,
  trash: Trash,
  trash2: Trash2,
  moreVertical: MoreVertical,
  refreshCw: RefreshCw,
  checkCheck: CheckCheck,
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todas");
  const [hasMarkedSeen, setHasMarkedSeen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [showDeleteBar, setShowDeleteBar] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const menuRef = useRef(null);
  const notificationRefs = useRef({});
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
      setNotifications(prev => {
        const updated = [notification, ...prev];
        const unseenCount = updated.filter(n => !n.seen).length;
        window.dispatchEvent(new CustomEvent('notifications:unseen', { detail: { count: unseenCount } }));
        return updated;
      });
    };

    const handleNotificationList = (list) => {
      setNotifications(list);
      const unseenCount = list.filter(n => !n.seen).length;
      window.dispatchEvent(new CustomEvent('notifications:unseen', { detail: { count: unseenCount } }));
    };

    const handleUnseenCount = (count) => {
      window.dispatchEvent(new CustomEvent('notifications:unseen', { detail: { count } }));
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:list', handleNotificationList);
    socket.on('notification:unseen-count', handleUnseenCount);
    socket.emit('notification:fetch');

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:list', handleNotificationList);
      socket.off('notification:unseen-count', handleUnseenCount);
    };
  }, [socket]);

  useEffect(() => {
    if (notifications.length > 0 && !hasMarkedSeen) {
      const markAllSeen = async () => {
        try {
          await client.patch('/notifications/seen-all');
          setNotifications(prev => prev.map(n => ({ ...n, seen: true, seenAt: n.seenAt || new Date().toISOString() })));
          window.dispatchEvent(new CustomEvent('notifications:unseen', { detail: { count: 0 } }));
        } catch (error) {
          console.error('Failed to mark all seen:', error);
        }
      };
      markAllSeen();
      setHasMarkedSeen(true);
    }
  }, [notifications, hasMarkedSeen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      let clickedOutside = true;
      Object.values(notificationRefs.current).forEach(ref => {
        if (ref && ref.contains(e.target)) {
          clickedOutside = false;
        }
      });
      if (clickedOutside && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    setMarkingAllRead(true);
    try {
      await client.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setMenuOpenId(null);
    } catch (error) {
      console.error('Failed to mark all read:', error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleDeleteSingle = async (id, e) => {
    e.stopPropagation();
    setMenuOpenId(null);
    try {
      await client.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const toggleSelection = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
      await client.post('/notifications/delete-many', { ids: selectedIds });
      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      setShowDeleteBar(false);
      setMenuOpenId(null);
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleStartDelete = () => {
    setShowDeleteBar(true);
    setSelectedIds([]);
    setMenuOpenId(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteBar(false);
    setSelectedIds([]);
  };

  const hasUnread = notifications.some(n => !n.read);

  const handleNotificationClick = async (n) => {
    if (showDeleteBar) return;
    
    if (!n.read) {
      try {
        await client.patch(`/notifications/${n.id}/read`);
        setNotifications(prev => prev.map(notif => 
          notif.id === n.id ? { ...notif, read: true } : notif
        ));
      } catch (error) {
        console.error('Failed to mark read:', error);
      }
    }

    if (n.category === "order" || n.category === "customer_order" || n.category === "customer_driver") {
      const orderId = n.content?.orderId;
      if (orderId) {
        window.dispatchEvent(new CustomEvent('notification:openOrder', { detail: { orderId } }));
      }
    } else if (n.category === "driver") {
      const driverId = n.content?.driverId;
      if (driverId) {
        window.dispatchEvent(new CustomEvent('notification:openMap', { detail: { driverId } }));
      }
    }
  };

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

  const getCategoryColor = (category) => {
    switch(category) {
      case "order": case "customer_order": return "bg-blue-100 text-blue-600";
      case "driver": case "customer_driver": return "bg-green-100 text-green-600";
      case "incident": return "bg-orange-100 text-orange-600";
      case "finance": case "customer_promo": return "bg-purple-100 text-purple-600";
      default: return "bg-slate-100 text-slate-600";
    }
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

  const renderIcon = (name, size = 18, className = "") => {
    const IconComponent = ICON_MAP[name];
    if (!IconComponent) return <Bell size={size} className={className} />;
    return <IconComponent size={size} className={className} />;
  };

  const handleFilterClick = (newFilter) => {
    setFilter(newFilter);
    setShowDeleteBar(false);
    setSelectedIds([]);
    setMenuOpenId(null);
  };

  return (
    <>
      {/* Delete Bar */}
      {showDeleteBar && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-50 shadow-md animate-slideDown">
          <button 
            onClick={handleCancelDelete}
            className="px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <span className="text-sm font-medium text-slate-600">
            {selectedIds.length > 0 ? `${selectedIds.length} selecionada${selectedIds.length > 1 ? 's' : ''}` : 'Selecionar notificações'}
          </span>
          <button 
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0 || deleting}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              selectedIds.length > 0 && !deleting 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            {deleting ? (
              <div className="flex items-center gap-1">
                <RefreshCw size={14} className="animate-spin" />
                <span>A eliminar...</span>
              </div>
            ) : (
              'Eliminar'
            )}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-slate-700">Notificações</p>
        {/* Only the 3-dots menu in the header */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setMenuOpenId(menuOpenId === 'header' ? null : 'header')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <MoreVertical size={18} />
          </button>
          
          {menuOpenId === 'header' && (
            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 min-w-[180px] z-50 animate-fadeIn">
              {hasUnread && (
                <button 
                  onClick={handleMarkAllRead}
                  disabled={markingAllRead}
                  className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-colors"
                >
                  {markingAllRead ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <CheckCheck size={14} />
                  )}
                  Marcar todas como lidas
                </button>
              )}
              <button 
                onClick={() => {
                  setMenuOpenId(null);
                  handleStartDelete();
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <Trash2 size={14} />
                Eliminar notificações
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mb-4">
        {filters.map(f => (
          <button 
            key={f} 
            onClick={() => handleFilterClick(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              filter === f && !showDeleteBar 
                ? "bg-orange-500 text-white border-orange-500" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <RefreshCw size={32} className="text-slate-300 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-slate-500">Carregando notificações...</p>
        </div>
      ) : filtered.length > 0 ? (
        filtered.map(n => {
          const isSelected = selectedIds.includes(n.id);
          const isMenuOpen = menuOpenId === n.id;
          return (
            <div 
              key={n.id} 
              ref={el => notificationRefs.current[n.id] = el}
              className={`bg-white rounded-2xl p-4 border shadow-sm mb-3 transition-all ${
                !n.read ? "border-l-4 border-l-orange-500 border-slate-100" : "border-slate-100"
              } ${showDeleteBar ? 'cursor-pointer hover:bg-slate-50' : ''}`}
              onClick={() => showDeleteBar && toggleSelection(n.id, { stopPropagation: () => {} })}
            >
              <div className="flex items-start gap-3">
                {showDeleteBar && (
                  <div 
                    onClick={(e) => toggleSelection(n.id, e)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer shrink-0 mt-0.5 transition-all ${
                      isSelected ? 'bg-orange-500 border-orange-500' : 'border-slate-300 hover:border-orange-400'
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  showDeleteBar ? 'bg-orange-100 text-orange-600' : getCategoryColor(n.category)
                }`}>
                  {showDeleteBar ? <Check size={18} /> : renderIcon(n.icon, 18)}
                </div>
                <div 
                  className="flex-1" 
                  onClick={() => !showDeleteBar && handleNotificationClick(n)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                    <div className="flex items-center gap-1">
                      {!n.read && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                      {!showDeleteBar && (
                        <div className="relative">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setMenuOpenId(isMenuOpen ? null : n.id);
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {isMenuOpen && (
                            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 min-w-[140px] z-50 animate-fadeIn">
                              <button 
                                onClick={(e) => handleDeleteSingle(n.id, e)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 size={14} />
                                Eliminar
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                  handleStartDelete();
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                              >
                                <Trash size={14} />
                                Eliminar várias
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  {n.createdAt && (
                    <p className="text-[10px] text-slate-400 mt-1">{formatTime(n.createdAt)}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-10">
          <Bell size={48} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhuma notificação encontrada</p>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Notifications;