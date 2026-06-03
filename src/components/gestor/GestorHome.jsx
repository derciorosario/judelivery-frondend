import { useState } from "react";
import StatCard from "../common/StatCard";
import OrderCard from "../common/OrderCard";
import AddOrderModal from "../modals/AddOrderModal";
import Icon from "../common/Icon";
import { ORDERS } from "../../data/mockData";

const GestorHome = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddOrder = (newOrder) => {
    ORDERS.push(newOrder);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-4 text-white">
        <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Operações de Hoje</p>
        <p className="text-2xl font-bold mt-1">Em curso 🚚</p>
        <p className="text-sm opacity-80 mt-0.5">5 motoristas activos</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Pedidos Hoje" value="24" color="orange" />
        <StatCard label="Em Entrega" value="6" color="blue" />
        <StatCard label="Concluídos" value="14" color="green" />
        <StatCard label="Pendentes" value="4" color="purple" />
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Pedidos Activos</p>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="flex items-center gap-1 bg-teal-500 text-white text-xs font-semibold px-3 py-2 rounded-xl"
        >
          <Icon name="plus" size={14} /> Criar Pedido
        </button>
      </div>
      
      <AddOrderModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddOrder} />
      
      {ORDERS.filter(o => ["Em entrega", "Atribuído", "Pendente"].includes(o.status)).map(o => (
        <div key={o.id}><OrderCard order={o} showAssign /></div>
      ))}
    </div>
  );
};

export default GestorHome;