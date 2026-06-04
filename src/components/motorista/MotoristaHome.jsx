import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import { getDriverOrders } from "../../api/client";
import NavigationModal from "./modals/NavigationModal";

const MotoristaHome = ({ online, setOnline, location, activeOrder }) => {
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(false);

  const handleToggleOnline = () => {
    const next = !online;
    setOnline(next);
    if (next && location) {
      location.start();
    } else if (location) {
      location.stop();
    }
  };

  const handleNavigate = (order) => {
    setSelectedOrder(order);
    setShowNavigationModal(true);
  };

  const gpsPermission = location?.gpsPermission ?? "prompt";

  return (
    <div className="space-y-4">
      <NavigationModal
        isOpen={showNavigationModal}
        onClose={() => setShowNavigationModal(false)}
        order={selectedOrder}
      />

      {gpsPermission === "denied" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <Icon name="alertTriangle" size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">Localização Desactivada</p>
              <p className="text-xs text-slate-500 mt-0.5">Active a permissão de localização nas configurações do navegador para receber pedidos.</p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`rounded-2xl p-4 flex items-center justify-between ${
          online && gpsPermission === "granted"
            ? "bg-gradient-to-r from-green-500 to-emerald-500"
            : "bg-gradient-to-r from-slate-500 to-slate-600"
        } text-white cursor-pointer`}
        onClick={handleToggleOnline}
      >
        <div>
          <p className="text-xs font-semibold opacity-80">Estado Actual</p>
          <p className="text-xl font-bold mt-0.5">
            {online && gpsPermission === "granted"
              ? "Online 🟢"
              : online && gpsPermission === "prompt"
              ? "A activar..."
              : "Offline 🔴"}
          </p>
          <p className="text-xs opacity-75">
            {online && gpsPermission === "prompt" ? "A solicitar GPS..." : "Toque para alterar"}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleOnline();
          }}
          className={`w-14 h-7 rounded-full relative transition-all ${online ? "bg-white/30" : "bg-white/20"}`}
        >
          <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${online ? "left-7" : "left-0.5"}`} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-slate-800">12</p>
          <p className="text-[10px] text-slate-400">Hoje</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-slate-800">4.8⭐</p>
          <p className="text-[10px] text-slate-400">Avaliação</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-slate-800">1,240</p>
          <p className="text-[10px] text-slate-400">MZN Hoje</p>
        </div>
</div>

      {activeOrder && (
        <div>
          <p className="text-sm font-bold text-slate-700 mb-2">Entrega Activa</p>
          <div className="bg-blue-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold">#{activeOrder.id?.slice(-6).toUpperCase()}</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {activeOrder.status === "in_transit" ? "Em entrega" : activeOrder.status === "assigned" ? "Atribuído" : activeOrder.status}
              </span>
            </div>
            <p className="text-base font-semibold">{typeof activeOrder.client === 'string' ? activeOrder.client : activeOrder.client?.name}</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2 text-sm opacity-90">
                <div className="w-2 h-2 rounded-full bg-orange-300 mt-1 shrink-0" />
                <span>{activeOrder.origin}</span>
              </div>
              <div className="flex items-start gap-2 text-sm opacity-90">
                <div className="w-2 h-2 rounded-full bg-white mt-1 shrink-0" />
                <span>{activeOrder.dest}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleNavigate(activeOrder)}
                className="flex-1 bg-white text-blue-700 font-bold text-sm py-2.5 rounded-xl"
              >
                Navegar
              </button>
              <button className="flex-1 bg-green-400 text-white font-bold text-sm py-2.5 rounded-xl">Concluir ✓</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
            <Icon name="bell" size={18} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Novo Pedido Disponível</p>
            <p className="text-xs text-slate-500 mt-0.5">Marco Simango · Av. Julius Nyerere · 1.9 km</p>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 bg-orange-500 text-white text-xs font-bold py-2 rounded-xl">Aceitar</button>
              <button className="flex-1 bg-slate-100 text-slate-600 text-xs font-semibold py-2 rounded-xl">Recusar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotoristaHome;
