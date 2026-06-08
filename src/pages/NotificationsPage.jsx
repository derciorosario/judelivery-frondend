import { useState } from "react";
import Icon from "../common/Icon";

const Notifications = ({ notifications }) => {
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

export default Notifications;