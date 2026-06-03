import { useState } from "react";
import Icon from "../common/Icon";
import { ORDERS, STATUSCOLOR } from "../../data/mockData";
import NavigationModal from "./modals/NavigationModal";

const MotoristaOrders = () => {
  const myOrders = ORDERS.filter(o => o.driver === "João Motorista");
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleNavigate = (order) => {
    setSelectedOrder(order);
    setShowNavigationModal(true);
  };

  return (
    <div className="space-y-4">
      <NavigationModal 
        isOpen={showNavigationModal} 
        onClose={() => setShowNavigationModal(false)} 
        order={selectedOrder}
      />
      
      <p className="text-sm font-bold text-slate-700">Os Meus Pedidos</p>
      
      {myOrders.map(o => (
        <div key={o.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-800">{o.id}</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUSCOLOR[o.status]}`}>
              {o.status}
            </span>
          </div>
          <p className="text-sm text-slate-700">{o.client}</p>
          <p className="text-xs text-slate-400 mt-1">{o.dest}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Icon name="location" size={12} />{o.dist}
            </span>
            <span className="text-sm font-bold text-orange-500">{o.total}</span>
          </div>
          {o.status === "Em entrega" && (
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => handleNavigate(o)}
                className="flex-1 bg-blue-50 text-blue-600 text-xs font-semibold py-2 rounded-xl"
              >
                Navegar
              </button>
              <button className="flex-1 bg-green-500 text-white text-xs font-bold py-2 rounded-xl">
                Concluir
              </button>
            </div>
          )}
        </div>
      ))}
      
      {myOrders.length === 0 && (
        <div className="text-center py-10">
          <Icon name="package" size={48} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhum pedido atribuído</p>
        </div>
      )}
    </div>
  );
};

export default MotoristaOrders;