import Icon from "../../common/Icon";

const ServiceSelectionModal = ({ isOpen, onClose, onSelectService }) => {
  if (!isOpen) return null;

  const handleServiceSelect = (serviceType) => {
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
          {/* Delivery Option */}
          <button
            onClick={() => handleServiceSelect("delivery")}
            className="w-full p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white flex items-center gap-3 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
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
          
          {/* Taxi/Ride Option */}
          <button
            onClick={() => handleServiceSelect("taxi")}
            className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white flex items-center gap-3 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
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