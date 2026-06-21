import { useEffect } from "react";
import Icon from "../../common/Icon";

const ServiceSelectionModal = ({ isOpen, onClose, onSelectService, settings, settingsLoading }) => {
  if (!isOpen) return null;


  const canDelivery = !settingsLoading && settings?.order?.allowDelivery;
  const canTaxi = !settingsLoading && settings?.order?.allowTaxi;


   // Auto-select if only one service is available
  useEffect(() => {
    if (!isOpen || settingsLoading) return;
    
    if (canDelivery && !canTaxi) {
      onSelectService("delivery");
      onClose();
    } else if (!canDelivery && canTaxi) {
      onSelectService("taxi");
      onClose();
    }
  }, [isOpen, settingsLoading, canDelivery, canTaxi, onSelectService, onClose]);



  const handleServiceSelect = (serviceType) => {
    if (settingsLoading) return;
    onSelectService(serviceType);
    onClose();
  };

  return (
    <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-fadeInUp">
        <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Escolha o Serviço</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        
        <div className="p-4 space-y-3">
          <button
            onClick={() => handleServiceSelect("delivery")}
            disabled={settingsLoading || !canDelivery}
            className={`w-full  p-4 rounded-xl text-white flex items-center gap-3 transition-all active:scale-[0.98] ${
              settingsLoading || !canDelivery ? "bg-slate-300 hidden cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:scale-[1.02]"
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon name="package" size={24} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-base">Entrega</p>
              <p className="text-xs opacity-80">Encomendas, documentos, compras</p>
            </div>
            <Icon name="chevronRight" size={20} className="text-white" />
          </button>
          
          <button
            onClick={() => handleServiceSelect("taxi")}
            disabled={settingsLoading || !canTaxi}
            className={`w-full p-4 rounded-xl text-white flex items-center gap-3 transition-all active:scale-[0.98] ${
              settingsLoading || !canTaxi ? "bg-slate-300 hidden cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-lg hover:scale-[1.02]"
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon name="car" size={24} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-base">Taxi / Ride</p>
              <p className="text-xs opacity-80">Transporte de passageiros</p>
            </div>
            <Icon name="chevronRight" size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionModal;
