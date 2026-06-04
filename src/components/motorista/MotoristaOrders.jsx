import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import { getDriverOrders } from "../../api/client";
import NavigationModal from "./modals/NavigationModal";

const MotoristaOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    getDriverOrders()
      .then(res => setMyOrders(res.data))
      .catch(err => console.error("Failed to fetch driver orders:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleNavigate = (order) => {
    setSelectedOrder(order);
    setShowNavigationModal(true);
  };

  const STATUSCOLOR = {
    "in_transit": "bg-blue-100 text-blue-700",
    "assigned": "bg-blue-100 text-blue-700",
    "pending_approval": "bg-amber-100 text-amber-700",
    "approved": "bg-teal-100 text-teal-700",
    "completed": "bg-green-100 text-green-700",
    "cancelled": "bg-red-100 text-red-700"
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-slate-500">A carregar pedidos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <NavigationModal 
        isOpen={showNavigationModal} 
        onClose={() => setShowNavigationModal(false)} 
        order={selectedOrder}
      />
      
      <p className="text-sm font-bold text-slate-700">Os Meus Pedidos</p>
      
      {myOrders.map(o => {
        const isDelivery = o.serviceType !== "taxi";
        const dist = o.dist || o.distance || "—";
        const dest = o.dest || o.dropoffLocation || "";
        return (
          <div key={o.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-800">#{o.id?.slice(-6).toUpperCase()}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUSCOLOR[o.status] || "bg-slate-100 text-slate-700"}`}>
                {o.status === "in_transit" ? "Em entrega" : o.status === "assigned" ? "Atribuído" : o.status === "pending_approval" ? "Aguardando" : o.status === "approved" ? "Aprovado" : o.status === "completed" ? "Concluído" : o.status === "cancelled" ? "Cancelado" : o.status}
              </span>
            </div>
            <p className="text-sm text-slate-700">{typeof o.client === 'string' ? o.client : o.client?.name || "Cliente"}</p>
            <p className="text-xs text-slate-400 mt-1">{dest}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Icon name="location" size={12} />{dist}
              </span>
              <span className="text-sm font-bold text-orange-500">{o.total} MZN</span>
            </div>
            {(o.status === "in_transit" || o.status === "Em entrega") && (
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
        );
      })}
      
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