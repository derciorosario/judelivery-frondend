// ─── NOTIFICATIONS DATA ───────────────────────────────────────────────────────────
const NOTIFICATIONS = [
  { id: 1, type: "order", title: "Novo Pedido #006", message: "Ana Sitoe fez um novo pedido - Pizza Margherita", time: "5 min atrás", read: false, icon: "package", userId: null },
  { id: 2, type: "driver", title: "Motorista Online", message: "Beatriz Mache ficou online e está disponível", time: "12 min atrás", read: false, icon: "users", userId: null },
  { id: 3, type: "incident", title: "Incidente Reportado", message: "Colisão na Av. Julius Nyerere - João Motorista", time: "1 hora atrás", read: true, icon: "alertTriangle", userId: null },
  { id: 4, type: "order", title: "Pedido Concluído", message: "Entrega #003 concluída com sucesso - Fátima Bila", time: "2 horas atrás", read: true, icon: "check", userId: null },
  { id: 5, type: "finance", title: "Pagamento Recebido", message: "Recebido 1.240 MZN de entregas de hoje", time: "3 horas atrás", read: true, icon: "dollar", userId: null },
  { id: 6, type: "driver", title: "Motorista Offline", message: "Américo Cossa ficou offline - Sem atividade", time: "4 horas atrás", read: true, icon: "users", userId: null },
  { id: 7, type: "order", title: "Pedido Pendente", message: "Pedido #002 aguarda atribuição de motorista", time: "5 horas atrás", read: false, icon: "package", userId: null },
  { id: 8, type: "incident", title: "Avaria Resolvida", message: "Quebra de amortecedor - Américo Cossa - Resolvido", time: "Ontem", read: true, icon: "wrench", userId: null },
  // Customer notifications
  { id: 9, type: "customer_order", title: "Pedido Confirmado", message: "Seu pedido #006 foi confirmado e está sendo processado", time: "10 min atrás", read: false, icon: "checkCircle", userId: 5 },
  { id: 10, type: "customer_driver", title: "Motorista a caminho", message: "João Motorista está a caminho para coleta do seu pedido #001", time: "20 min atrás", read: false, icon: "truck", userId: 5 },
  { id: 11, type: "customer_promo", title: "Desconto Especial", message: "Ganhe 20% de desconto na sua próxima entrega!", time: "1 dia atrás", read: true, icon: "gift", userId: 5 },
];



const AdminNotifications = () => {
  const [filter, setFilter] = useState("Todas");
  const filters = ["Todas", "Não lidas", "Pedidos", "Motoristas", "Incidentes", "Finanças"];
  
  const filtered = filter === "Todas"
    ? NOTIFICATIONS.filter(n => n.userId === null)
    : filter === "Não lidas"
      ? NOTIFICATIONS.filter(n => !n.read && n.userId === null)
      : NOTIFICATIONS.filter(n => n.type === filter.toLowerCase().slice(0, -1) && n.userId === null ||
          (filter === "Pedidos" && n.type === "order") ||
          (filter === "Motoristas" && n.type === "driver") ||
          (filter === "Incidentes" && n.type === "incident") ||
          (filter === "Finanças" && n.type === "finance"));

  const getNotificationColor = (type) => {
    switch(type) {
      case "order": return "bg-blue-100 text-blue-600";
      case "driver": return "bg-green-100 text-green-600";
      case "incident": return "bg-orange-100 text-orange-600";
      case "finance": return "bg-purple-100 text-purple-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {f}
          </button>
        ))}
      </div>
      
      {filtered.length > 0 ? (
        filtered.map(n => (
          <div key={n.id} className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-sm ${!n.read ? "border-l-4 border-l-orange-500" : ""}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getNotificationColor(n.type)}`}>
                <Icon name={n.icon} size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  {!n.read && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                </div>
                <p className="text-xs text-slate-500">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
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



// ─── CUSTOMER NOTIFICATIONS PAGE ───────────────────────────────────────────────
const CustomerNotifications = ({ notifications, onClose }) => {
  const [filter, setFilter] = useState("Todas");
  const filters = ["Todas", "Pedidos", "Motorista", "Promoções"];
  
  const filtered = filter === "Todas"
    ? notifications
    : filter === "Pedidos"
      ? notifications.filter(n => n.type === "customer_order" || n.type === "order")
      : filter === "Motorista"
        ? notifications.filter(n => n.type === "customer_driver" || n.type === "driver")
        : notifications.filter(n => n.type === "customer_promo");
  
  const getIconColor = (type) => {
    switch(type) {
      case "customer_order": case "order": return "bg-blue-100 text-blue-600";
      case "customer_driver": case "driver": return "bg-green-100 text-green-600";
      case "customer_promo": return "bg-purple-100 text-purple-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };
  
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-slate-700">Notificações</p>
        <button onClick={onClose} className="text-xs text-orange-500">Fechar</button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mb-4">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {f}
          </button>
        ))}
      </div>
      {filtered.length > 0 ? (
        filtered.map(n => (
          <div key={n.id} className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-3 ${!n.read ? "border-l-4 border-l-orange-500" : ""}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconColor(n.type)}`}>
                <Icon name={n.icon} size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
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