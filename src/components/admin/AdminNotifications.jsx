import { useState } from "react";
import Icon from "../common/Icon";
import { NOTIFICATIONS } from "../../data/mockData";

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

export default AdminNotifications;