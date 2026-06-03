import { useState } from "react";
import Icon from "../common/Icon";

const AdminRequests = ({ requests, onApprove, onReject }) => {
  const [filter, setFilter] = useState("Todos");
  const filters = ["Todos", "pending", "approved", "rejected"];
  
  const filtered = filter === "Todos" ? requests : requests.filter(r => r.status === filter);
  
  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-slate-700">Requisições de Clientes</p>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {f === "Todos" ? "Todos" : f === "pending" ? "Pendentes" : f === "approved" ? "Aprovados" : "Rejeitados"}
          </button>
        ))}
      </div>
      
      {filtered.map(req => (
        <div key={req.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-orange-500">{req.id}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${req.status === "pending" ? "bg-amber-100 text-amber-700" : req.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {req.status === "pending" ? "Pendente" : req.status === "approved" ? "Aprovado" : "Rejeitado"}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800">{req.customerName}</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-start gap-1.5 text-xs text-slate-500">
              <Icon name="location" size={12} className="mt-0.5 shrink-0 text-orange-400" />
              <span className="line-clamp-1">{req.origin}</span>
            </div>
            <div className="flex items-start gap-1.5 text-xs text-slate-500">
              <Icon name="navigation" size={12} className="mt-0.5 shrink-0 text-slate-400" />
              <span className="line-clamp-1">{req.dest}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50">
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
              <span className="flex items-center gap-1"><Icon name="package" size={12} />{req.productName}</span>
              <span className="flex items-center gap-1"><Icon name="hash" size={12} />{req.quantity}x</span>
              {req.urgent && <span className="flex items-center gap-1 text-red-500"><Icon name="zap" size={12} />Urgente</span>}
            </div>
            {req.scheduledTime && (
              <p className="text-xs text-slate-400 flex items-center gap-1"><Icon name="calendar" size={10} />Agendado: {new Date(req.scheduledTime).toLocaleString()}</p>
            )}
          </div>
          {req.status === "pending" && (
            <div className="flex gap-2 mt-3">
              <button onClick={() => onApprove(req.id)} className="flex-1 bg-green-500 text-white text-xs font-bold py-2 rounded-xl">Aprovar</button>
              <button onClick={() => onReject(req.id)} className="flex-1 bg-red-500 text-white text-xs font-bold py-2 rounded-xl">Rejeitar</button>
            </div>
          )}
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="text-center py-8">
          <Icon name="clipboard" size={48} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhuma requisição encontrada</p>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;