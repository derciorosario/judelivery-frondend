import { useState, useEffect, useRef } from "react";
import Icon from "../../common/Icon";
import { getAvailableDrivers } from "../../../api/client";
import { useSocket } from "../../../contexts/SocketContext";
import { toast } from "../../../lib/toast";

const DetailsStep = ({ serviceType, form, onFormChange, getUrgencyLabel, getUrgencyColor, onDriverAssigned, onOrderStatusChange }) => {
  const { socket } = useSocket();
  const [searchingDriver, setSearchingDriver] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchProgress, setSearchProgress] = useState(0);
  const searchIntervalRef = useRef(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Calculate estimated duration based on distance and urgency
  const getEstimatedDuration = () => {
    if (serviceType === "taxi") {
      return 30;
    }
    const baseDuration = 45;
    if (form.urgencyLevel === "urgent") return 30;
    if (form.urgencyLevel === "very_urgent") return 20;
    return baseDuration;
  };

  // Get pickup coordinates based on service type
  const getPickupCoords = () => {
    if (serviceType === "taxi") {
      return form.pickupCoords;
    }
    return form.originCoords;
  };

  // Get destination coordinates based on service type
  const getDestCoords = () => {
    if (serviceType === "taxi") {
      return form.dropoffCoords;
    }
    return form.destCoords;
  };

  // Start searching for drivers
  const startDriverSearch = async () => {
    if (searchingDriver || orderCreated) return;
    
    setSearchingDriver(true);
    setSearchProgress(0);
    setAvailableDrivers([]);
    setSelectedDriver(null);
    setSearchError(null);

    searchIntervalRef.current = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 100) {
          clearInterval(searchIntervalRef.current);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    try {
       // Map serviceType to what backend expects
       const apiServiceType = serviceType === "taxi" ? "taxi" : "delivery";
       const params = {
         serviceType: apiServiceType,
         originCoords: getPickupCoords() ? `${getPickupCoords().lat},${getPickupCoords().lng}` : undefined,
         destCoords: getDestCoords() ? `${getDestCoords().lat},${getDestCoords().lng}` : undefined,
         pickupCoords: form.pickupCoords ? `${form.pickupCoords.lat},${form.pickupCoords.lng}` : undefined,
         dropoffCoords: form.dropoffCoords ? `${form.dropoffCoords.lat},${form.dropoffCoords.lng}` : undefined,
         scheduledTime: form.isScheduled ? form.scheduledTime : form.isScheduledRide ? form.scheduledRideTime : undefined,
         isScheduled: form.isScheduled || form.isScheduledRide,
         estimatedDuration: getEstimatedDuration()
       };

      const response = await getAvailableDrivers(params);
      setAvailableDrivers(response.data.drivers || []);
      
      if (response.data.drivers && response.data.drivers.length > 0) {
        const closestDriver = response.data.drivers[0];
        setSelectedDriver(closestDriver);
        
        if (onDriverAssigned) {
          onDriverAssigned(closestDriver);
        }
      }
    } catch (error) {
      console.error("Error searching for drivers:", error);
      if (error.response?.status === 403) {
        setSearchError("Para procurar motoristas, é necessário estar autenticado. O seu pedido será atribuído após a criação.");
      } else {
        setSearchError("Erro ao procurar motoristas disponíveis");
      }
      if (error.response?.status !== 403) {
        toast.error("Erro ao procurar motoristas disponíveis");
      }
    } finally {
      clearInterval(searchIntervalRef.current);
      setSearchProgress(100);
      setTimeout(() => setSearchingDriver(false), 500);
    }
  };

  // Handle driver selection
  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver);
    if (onDriverAssigned) {
      onDriverAssigned(driver);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
      }
    };
  }, []);

  // Auto-start search when component mounts for delivery details step
  useEffect(() => {
    if (serviceType === "deliveryDetails" && !orderCreated) {
      const timer = setTimeout(() => {
        startDriverSearch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [serviceType, form.originCoords, form.destCoords, form.pickupCoords, form.dropoffCoords, form.isScheduled, form.scheduledTime]);

  // Auto-start search for taxi details step
  useEffect(() => {
    if (serviceType === "taxi" && !orderCreated) {
      const timer = setTimeout(() => {
        startDriverSearch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [serviceType, form.pickupCoords, form.dropoffCoords, form.isScheduledRide, form.scheduledRideTime]);

  // Socket listener for real-time driver updates
  useEffect(() => {
    if (!socket) return;

    const handleDriverUpdate = (data) => {
      if (searchingDriver) {
        startDriverSearch();
      }
    };

    socket.on('driver:status:updated', handleDriverUpdate);
    socket.on('driver:location:updated', handleDriverUpdate);

    return () => {
      socket.off('driver:status:updated', handleDriverUpdate);
      socket.off('driver:location:updated', handleDriverUpdate);
    };
  }, [socket, searchingDriver]);

  // Render driver search UI
  const renderDriverSearchUI = () => {
    if (!searchingDriver && availableDrivers.length === 0 && !selectedDriver && !searchError) {
      return null;
    }

    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        {searchingDriver && (
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="truck" size={16} className="text-blue-500" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">A procurar motorista...</p>
                <p className="text-xs text-slate-500">Encontrando o motorista mais próximo</p>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${searchProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{searchProgress}% concluído</p>
          </div>
        )}

        {availableDrivers.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
              <Icon name="check" size={14} className="text-green-500" />
              Motoristas disponíveis encontrados
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableDrivers.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => handleDriverSelect(driver)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedDriver?.id === driver.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon name="user" size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{driver.name}</p>
                        <p className="text-xs text-slate-500">{driver.vehicle} • {driver.licensePlate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {driver.distance !== null && (
                        <p className="text-xs font-semibold text-blue-600">{driver.distance} km</p>
                      )}
                      {driver.eta && (
                        <p className="text-[10px] text-slate-400">~{driver.eta} min</p>
                      )}
                    </div>
                  </div>
                  {driver.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Icon name="star" size={12} className="text-amber-400" />
                      <span className="text-xs text-slate-600">{driver.rating}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {searchError && !searchingDriver && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="info" size={24} className="text-amber-500" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Modo offline</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchError}
            </p>
          </div>
        )}

        {!searchingDriver && availableDrivers.length === 0 && !selectedDriver && !searchError && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="alertTriangle" size={24} className="text-amber-500" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Nenhum motorista disponível</p>
            <p className="text-xs text-slate-500 mt-1">
              O seu pedido ficará pendente e será atribuído assim que um motorista estiver disponível.
            </p>
          </div>
        )}

        {selectedDriver && !searchingDriver && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Icon name="check" size={14} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-700">Motorista atribuído!</p>
                <p className="text-xs text-green-600">{selectedDriver.name} está a caminho</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (serviceType === "taxi") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Número de Passageiros</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onFormChange({ ...form, passengerCount: Math.max(1, form.passengerCount - 1) })}
              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600"
            >
              <Icon name="minus" size={18} />
            </button>
            <span className="text-xl font-bold text-slate-800 w-8 text-center">{form.passengerCount}</span>
            <button
              type="button"
              onClick={() => onFormChange({ ...form, passengerCount: Math.min(6, form.passengerCount + 1) })}
              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600"
            >
              <Icon name="plus" size={18} />
            </button>
            <span className="text-xs text-slate-400 ml-2">máx. 6 pessoas</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-2">
            <Icon name="luggage" size={18} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Bagagem extra?</span>
          </div>
          <button
            type="button"
            onClick={() => onFormChange({ ...form, hasLuggage: !form.hasLuggage })}
            className={`w-12 h-6 rounded-full transition-colors ${form.hasLuggage ? "bg-blue-500" : "bg-slate-300"}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.hasLuggage ? "translate-x-6" : "translate-x-0.5"} mt-0.5`} />
          </button>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-2">
            <Icon name="repeat" size={18} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Viagem de volta?</span>
          </div>
          <button
            type="button"
            onClick={() => onFormChange({ ...form, returnTrip: !form.returnTrip })}
            className={`w-12 h-6 rounded-full transition-colors ${form.returnTrip ? "bg-blue-500" : "bg-slate-300"}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.returnTrip ? "translate-x-6" : "translate-x-0.5"} mt-0.5`} />
          </button>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Tempo de espera (minutos)</label>
          <input
            type="number"
            value={form.waitingTime}
            onChange={e => onFormChange({ ...form, waitingTime: parseInt(e.target.value) || 0 })}
            min="0"
            step="5"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-slate-400 mt-1">Taxa adicional de 4 MZN por minuto de espera</p>
        </div>
        
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="calendar" size={18} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Agendar corrida</span>
            </div>
            <button
              type="button"
              onClick={() => onFormChange({ ...form, isScheduledRide: !form.isScheduledRide })}
              className={`w-12 h-6 rounded-full transition-colors ${form.isScheduledRide ? "bg-blue-500" : "bg-slate-300"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.isScheduledRide ? "translate-x-6" : "translate-x-0.5"} mt-0.5`} />
            </button>
          </div>
          
          {form.isScheduledRide && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Data e Hora *</label>
              <input
                type="datetime-local"
                value={form.scheduledRideTime}
                onChange={e => onFormChange({ ...form, scheduledRideTime: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required={form.isScheduledRide}
              />
              <p className="text-xs text-green-600 mt-1">✓ Agendamento sem taxa adicional</p>
            </div>
          )}
          
          {!form.isScheduledRide && (
            <p className="text-xs text-blue-600">Corrida para agora mesmo</p>
          )}
        </div>
        
        {/* Driver Search UI - shown for taxi service type */}
        {renderDriverSearchUI()}
      </div>
    );
  }
  
  if (serviceType === "taxiInstructions") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Instruções para o motorista</label>
          <textarea
            value={form.rideInstructions}
            onChange={e => onFormChange({ ...form, rideInstructions: e.target.value })}
            placeholder="Ex: Portão azul, tocar campainha, estou no segundo andar, ponto de referência próximo ao mercadinho..."
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>
        
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
          <div className="flex items-start gap-2">
            <Icon name="info" size={16} className="text-amber-500 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700">Dica de segurança</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Compartilhe os detalhes da sua viagem com familiares ou amigos.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (serviceType === "deliveryItem") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Produto/Item *</label>
          <input
            type="text"
            value={form.productName}
            onChange={e => onFormChange({ ...form, productName: e.target.value })}
            placeholder="Ex: Pizza, Documentos, Encomenda..."
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Quantidade</label>
            <input
              type="number"
              value={form.quantity}
              onChange={e => onFormChange({ ...form, quantity: parseInt(e.target.value) || 1 })}
              min="1"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Peso Estimado (kg)</label>
            <input
              type="text"
              value={form.weight}
              onChange={e => onFormChange({ ...form, weight: e.target.value })}
              placeholder="Ex: 2.5"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Observações adicionais</label>
          <textarea
            value={form.observations}
            onChange={e => onFormChange({ ...form, observations: e.target.value })}
            placeholder="Ex: Frágil, Manusear com cuidado..."
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>
      </div>
    );
  }
  
  // Delivery details step (urgency, scheduling, instructions)
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2">Nível de Urgência *</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onFormChange({ ...form, urgencyLevel: "normal" })}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              form.urgencyLevel === "normal"
                ? "border-green-500 bg-green-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <Icon name="clock" size={20} className={`mx-auto mb-1 ${form.urgencyLevel === "normal" ? "text-green-500" : "text-slate-400"}`} />
            <p className={`text-xs font-semibold ${form.urgencyLevel === "normal" ? "text-green-700" : "text-slate-600"}`}>Normal</p>
            <p className="text-[10px] text-slate-400 mt-0.5">+0%</p>
          </button>
          
          <button
            type="button"
            onClick={() => onFormChange({ ...form, urgencyLevel: "urgent" })}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              form.urgencyLevel === "urgent"
                ? "border-amber-500 bg-amber-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <Icon name="zap" size={20} className={`mx-auto mb-1 ${form.urgencyLevel === "urgent" ? "text-amber-500" : "text-slate-400"}`} />
            <p className={`text-xs font-semibold ${form.urgencyLevel === "urgent" ? "text-amber-700" : "text-slate-600"}`}>Urgente</p>
            <p className="text-[10px] text-slate-400 mt-0.5">+10%</p>
          </button>
          
          <button
            type="button"
            onClick={() => onFormChange({ ...form, urgencyLevel: "very_urgent" })}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              form.urgencyLevel === "very_urgent"
                ? "border-red-500 bg-red-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <Icon name="alertTriangle" size={20} className={`mx-auto mb-1 ${form.urgencyLevel === "very_urgent" ? "text-red-500" : "text-slate-400"}`} />
            <p className={`text-xs font-semibold ${form.urgencyLevel === "very_urgent" ? "text-red-700" : "text-slate-600"}`}>Muito Urgente</p>
            <p className="text-[10px] text-slate-400 mt-0.5">+30%</p>
          </button>
        </div>
      </div>
      
      <div className="border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name="calendar" size={18} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Agendar entrega</span>
          </div>
          <button
             type="button"
             onClick={() => onFormChange({ ...form, isScheduled: !form.isScheduled })}
             className={`w-12 h-6 rounded-full transition-colors ${form.isScheduled ? "bg-orange-500" : "bg-slate-300"}`}
           >
             <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.isScheduled ? "translate-x-6" : "translate-x-0.5"} mt-0.5`} />
           </button>
         </div>
         
         {form.isScheduled && (
           <div>
             <label className="block text-xs font-semibold text-slate-500 mb-1">Data e Hora *</label>
             <input
               type="datetime-local"
               value={form.scheduledTime}
               onChange={e => onFormChange({ ...form, scheduledTime: e.target.value })}
               className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
               required={form.isScheduled}
             />
             <p className="text-xs text-green-600 mt-1">✓ Agendamento sem taxa adicional</p>
           </div>
         )}
         
         {!form.isScheduled && (
           <p className="text-xs text-blue-600">Entrega para agora mesmo</p>
         )}
       </div>
       
       {/* Driver Search UI - shown for delivery details service type */}
       {renderDriverSearchUI()}
     </div>
   );
};

export default DetailsStep;