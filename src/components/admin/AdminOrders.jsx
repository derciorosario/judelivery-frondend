import { useState } from "react";
import Icon from "../common/Icon";
import OrderCard from "../common/OrderCard";
import AddOrderModal from "../modals/AddOrderModal";
import { ORDERS } from "../../data/mockData";

const AdminOrders = () => {
  const [filter, setFilter] = useState("Todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const statuses = ["Todos", "Pendente", "Em entrega", "Concluído", "Cancelado", "Aprovado"];
  const filtered = filter === "Todos" ? ORDERS : ORDERS.filter(o => o.status === filter);

  const handleAddOrder = (newOrder) => {
    ORDERS.push(newOrder);
    setFilter(filter);
  };

  const handleAssignDriver = (order) => {
    console.log("Assign driver to order", order);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Gestão de Pedidos</p>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-orange-300">
          <Icon name="plus" size={14} /> Novo
        </button>
      </div>
      <AddOrderModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddOrder} />
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === s ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {s}
          </button>
        ))}
      </div>
      {filtered.map(o => <div key={o.id} className="mb-3"><OrderCard order={o} showAssign onAssign={handleAssignDriver} /></div>)}
    </div>
  );
};

export default AdminOrders;