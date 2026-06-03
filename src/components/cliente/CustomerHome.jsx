import { useState } from "react";
import Icon from "../common/Icon";
import CreateOrderModal from "./modals/CreateOrderModal";

const CustomerHome = ({
  user,
  customerData,
  activeOrder,
  pendingOrders,
  completedOrders,
  totalSpent,
  deliveryCount,
  completedCount,
  averageRating,
  onCreateOrder,
  onViewOrderDetails,
  onTrackOrder,
  onGiveFeedback
}) => {
  const [showPromo, setShowPromo] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };
  
  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Bem-vindo(a)</p>
            <p className="text-xl font-bold mt-0.5">{customerData.name}</p>
            <p className="text-xs opacity-80 mt-0.5">Hoje é dia de entregar felicidade!</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon name="gift" size={24} className="text-white" />
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={() => handleServiceSelect('delivery')} 
          className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Icon name="package" size={20} className="text-orange-500" />
          </div>
         

           <div className="flex justify-center items-center gap-1">
              <Icon name="PlusCircle" size={13} className="text-orange-500" />
              <p className="text-xs font-medium text-slate-700">Delivery</p>
          </div>

        </button>
        <button 
          onClick={() => handleServiceSelect('taxi')} 
          className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <svg className="text-blue-500"  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
fill="currentColor" viewBox="0 0 24 24" >
<path d="M20.26 14.47s-.06-.04-.1-.05c-.5-.27-1.07-.42-1.66-.42h-.06l-2.19-5.01h1.26c.28 0 .5-.22.5-.5v-1c0-.28-.22-.5-.5-.5h-2.13l-.09-.2a3.01 3.01 0 0 0-2.75-1.8h-1.53v2h1.53c.4 0 .76.24.92.6l1.05 2.4h-3.93c-.29 0-.56.12-.75.33L7.44 13l-2.72-2.72a1 1 0 0 0-.71-.29H1.84v2h1.75L5.6 14s-.06-.01-.1-.01c-1.11 0-2.13.51-2.79 1.38-.3.39-.53.87-.65 1.43-.04.22-.07.45-.07.68 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5v-.1l1.3 1.3c.19.19.44.29.71.29h2c.25 0 .5-.1.68-.27L15 17.47c0 1.93 1.57 3.49 3.5 3.49s3.5-1.57 3.5-3.5c0-1.24-.67-2.4-1.74-3.03ZM5.5 19a1.498 1.498 0 0 1-1.47-1.79c.05-.23.14-.45.27-.61a1.506 1.506 0 0 1 1.94-.41l.06.03c.35.23.59.58.67.95.02.1.03.21.03.32 0 .83-.67 1.5-1.5 1.5Zm7.11-2h-1.19l-2.57-2.57L11.02 12h4.36l.76 1.73L12.62 17Zm5.89 2a1.498 1.498 0 0 1-1.2-2.4 1.506 1.506 0 0 1 1.94-.41 1.53 1.53 0 0 1 .77 1.31c0 .83-.67 1.5-1.5 1.5Z"></path>
</svg>

          </div>
          <div className="flex justify-center items-center gap-1">
              <Icon name="PlusCircle" size={13} className="text-blue-500" />
               <p className="text-xs font-medium text-slate-700">Taxi/Ride</p>
          </div>
        </button>
        <button className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Icon name="history" size={20} className="text-green-500" />
       
          </div>
          <p className="text-xs font-medium text-slate-700">Histórico</p>
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-lg font-bold text-slate-800">{deliveryCount}</p>
          <p className="text-[10px] text-slate-400">Entregas</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-lg font-bold text-slate-800">{totalSpent} MZN</p>
          <p className="text-[10px] text-slate-400">Total Gasto</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-lg font-bold text-slate-800">{completedCount}</p>
          <p className="text-[10px] text-slate-400">Concluídas</p>
        </div>
      </div>
      
      {/* Active Order (if any) */}
      {activeOrder && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-700">Entrega em Andamento</p>
            <button onClick={() => onViewOrderDetails(activeOrder)} className="text-xs text-orange-500 font-medium">Ver detalhes →</button>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold">{activeOrder.id}</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{activeOrder.status}</span>
            </div>
            <p className="text-base font-semibold">{activeOrder.productName}</p>
            <p className="text-xs opacity-80 mt-0.5">{activeOrder.dest}</p>
            <div className="mt-3 flex items-center gap-2 text-xs opacity-90">
              <Icon name="clock" size={14} />
              <span>Estimativa: {activeOrder.duration || "45 min"}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => onTrackOrder()} className="flex-1 bg-white text-blue-600 font-bold text-sm py-2.5 rounded-xl">
                Acompanhar
              </button>
              <button onClick={() => onViewOrderDetails(activeOrder)} className="flex-1 bg-blue-400 text-white font-bold text-sm py-2.5 rounded-xl">
                Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-700">Pedidos Pendentes</p>
            <button onClick={() => window.location.href = "#orders"} className="text-xs text-orange-500 font-medium">ver todos →</button>
          </div>
          {pendingOrders.slice(0, 2).map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-800">{order.id}</span>
                <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                  {order.status === "Aprovado" ? "Aprovado" : "Aguardando"}
                </span>
              </div>
              <p className="text-sm text-slate-700">{order.productName}</p>
              <p className="text-xs text-slate-400 mt-1">{order.dest}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-500">{order.orderDate}</span>
                <button onClick={() => onViewOrderDetails(order)} className="text-xs text-orange-500 font-medium">Ver detalhes →</button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Recent Completed Orders */}
      {completedOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-700">Entregas Recentes</p>
            <button onClick={() => window.location.href = "#orders"} className="text-xs text-orange-500 font-medium">ver todos →</button>
          </div>
          {completedOrders.slice(0, 2).map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                    <Icon name="checkCircle" size={16} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{order.id}</p>
                    <p className="text-xs text-slate-500">{order.productName}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-600">{order.total}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => onViewOrderDetails(order)} className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg">
                  Detalhes
                </button>
                <button onClick={() => onGiveFeedback(order)} className="flex-1 text-xs bg-amber-100 text-amber-600 font-semibold py-2 rounded-lg">
                  Avaliar
                </button>
                <button onClick={() => onViewOrderDetails(order)} className="flex-1 text-xs bg-orange-50 text-orange-600 font-semibold py-2 rounded-lg">
                  Repetir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Promo Banner */}
      {showPromo && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white relative overflow-hidden">
          <button onClick={() => setShowPromo(false)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Icon name="x" size={14} className="text-white" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon name="gift" size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Ganhe 20% de desconto!</p>
              <p className="text-xs opacity-80 mt-0.5">Na sua próxima entrega, use o código: BEMVINDO20</p>
              <button className="mt-2 text-xs bg-white text-purple-600 font-bold px-3 py-1 rounded-lg">
                Resgatar agora
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Support Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Icon name="helpCircle" size={20} className="text-slate-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Precisa de ajuda?</p>
            <p className="text-xs text-slate-400">Estamos aqui para ajudar com suas entregas</p>
          </div>
          <button className="text-xs bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg">
            Contactar
          </button>
        </div>
      </div>
      
      {/* Service Selection Modal */}
      {showServiceModal && (
        <CreateOrderModal 
          isOpen={showServiceModal}
          onClose={() => {
            setShowServiceModal(false);
            setSelectedService(null);
          }}
          user={user}
          customerData={customerData}
          serviceType={selectedService}
        />
      )}
    </div>
  );
};

export default CustomerHome;