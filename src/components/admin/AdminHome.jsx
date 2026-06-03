import StatCard from "../common/StatCard";
import OrderCard from "../common/OrderCard";
import { ORDERS } from "../../data/mockData";

const AdminHome = ({ customerRequests = [] }) => (
  <div className="space-y-4">
    <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white">
      <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Visão Geral — Hoje</p>
      <p className="text-2xl font-bold mt-1">Boa tarde 👋</p>
      <p className="text-sm opacity-80 mt-0.5">Quinta, 8 de Maio · Maputo</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Pedidos Ativos" value="18" sub="↑ 3 vs ontem" color="orange" />
      <StatCard label="Receita Hoje" value="12.4K" sub="MZN" color="green" />
      <StatCard label="Motoristas Online" value="5/8" color="blue" />
      <StatCard label="Taxa Conclusão" value="94%" sub="↑ 2%" color="purple" />
    </div>

    {customerRequests.length > 0 && (
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-slate-700">Requisições Pendentes</p>
          <span className="text-xs text-orange-500 font-medium">{customerRequests.length} novas</span>
        </div>
        {customerRequests.slice(0, 2).map(req => (
          <div key={req.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-orange-500">{req.id}</span>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pendente</span>
            </div>
            <p className="text-sm font-medium text-slate-700">{req.customerName}</p>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{req.productName} · {req.quantity}x</p>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 bg-green-500 text-white text-xs font-bold py-1.5 rounded-lg">Aprovar</button>
              <button className="flex-1 bg-red-500 text-white text-xs font-bold py-1.5 rounded-lg">Rejeitar</button>
            </div>
          </div>
        ))}
      </div>
    )}

    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-slate-700">Pedidos Recentes</p>
        <span className="text-xs text-orange-500 font-medium">ver todos →</span>
      </div>
      {ORDERS.slice(0, 3).map(o => <div key={o.id} className="mb-3"><OrderCard order={o} showAssign /></div>)}
    </div>
  </div>
);

export default AdminHome;