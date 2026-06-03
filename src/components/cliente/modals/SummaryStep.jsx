import Icon from "../../common/Icon";

const SummaryStep = ({ 
  serviceType, 
  form, 
  distance, 
  duration, 
  price, 
  onPaymentMethodChange,
  getUrgencyLabel,
  getUrgencyColor
}) => {
  if (serviceType === "taxi") {
    return (
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 mb-3">Resumo da Corrida</p>
          <div className="space-y-3">
            <div className="flex items-start gap-2 pb-2 border-b border-slate-200">
              <Icon name="mapPin" size={16} className="text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Embarque</p>
                <p className="text-sm font-medium text-slate-800">{form.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 pb-2 border-b border-slate-200">
              <Icon name="navigation" size={16} className="text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Desembarque</p>
                <p className="text-sm font-medium text-slate-800">{form.dropoffLocation}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-slate-400">Distância</p>
                <p className="text-base font-bold text-slate-800">{distance} km</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-slate-400">Duração</p>
                <p className="text-base font-bold text-slate-800">{duration} min</p>
              </div>
            </div>
            
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Passageiros:</span>
                <span className="font-medium text-slate-800">{form.passengerCount}</span>
              </div>
              {form.hasLuggage && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Bagagem extra:</span>
                  <span className="font-medium text-slate-800">+40 MZN</span>
                </div>
              )}
              {form.returnTrip && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Viagem de volta:</span>
                  <span className="font-medium text-slate-800">+120 MZN</span>
                </div>
              )}
              {form.waitingTime > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tempo de espera:</span>
                  <span className="font-medium text-slate-800">{form.waitingTime} min (+{form.waitingTime * 4} MZN)</span>
                </div>
              )}
              {form.isScheduledRide && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Agendado para:</span>
                  <span className="font-medium text-slate-800">{new Date(form.scheduledRideTime).toLocaleString()}</span>
                </div>
              )}
              {form.rideInstructions && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Instruções:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[180px]">{form.rideInstructions}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Método de Pagamento *</label>
          <div className="grid grid-cols-2 gap-2">
            {["Transferência", "M-Pesa", "e-Mola"].map(method => (
              <button
                key={method}
                type="button"
                onClick={() => onPaymentMethodChange(method)}
                className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                  form.paymentMethod === method
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">Valor Total:</span>
            <span className="text-xl font-bold text-blue-500">
              {price} MZN
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            *Preço fixo garantido. Sem surpresas!
          </p>
        </div>
      </div>
    );
  }
  
  // Delivery summary
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-500 mb-3">Resumo do Pedido</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Item:</span>
            <span className="text-sm font-medium text-slate-800">{form.productName} (x{form.quantity})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Origem:</span>
            <span className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{form.origin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Destino:</span>
            <span className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{form.dest}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-white rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400">Distância</p>
              <p className="text-base font-bold text-slate-800">{distance} km</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400">Tempo Estimado</p>
              <p className="text-base font-bold text-slate-800">{duration} min</p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Urgência:</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getUrgencyColor(form.urgencyLevel)}`}>
              {getUrgencyLabel(form.urgencyLevel)}
            </span>
          </div>
          {form.isScheduled && form.scheduledTime && (
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Agendado para:</span>
              <span className="text-sm font-medium text-slate-800">{new Date(form.scheduledTime).toLocaleString()}</span>
            </div>
          )}
          {!form.isScheduled && (
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Entrega:</span>
              <span className="text-sm font-medium text-green-600">Imediata</span>
            </div>
          )}
          {form.instructions && (
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Instruções:</span>
              <span className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{form.instructions}</span>
            </div>
          )}
          {form.observations && (
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Observações:</span>
              <span className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{form.observations}</span>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Método de Pagamento *</label>
        <div className="grid grid-cols-2 gap-2">
          {["Transferência", "M-Pesa", "e-Mola"].map(method => (
            <button
              key={method}
              type="button"
              onClick={() => onPaymentMethodChange(method)}
              className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                form.paymentMethod === method
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700">Valor Total:</span>
          <span className="text-xl font-bold text-orange-500">
            {price} MZN
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-orange-200">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Taxa base:</span>
            <span className="font-medium">{Math.round(price / (form.urgencyLevel === "urgent" ? 1.3 : form.urgencyLevel === "very_urgent" ? 1.6 : 1))} MZN</span>
          </div>
          {form.urgencyLevel === "urgent" && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Taxa urgente (30%):</span>
              <span className="font-medium text-amber-600">+{Math.round(price - (price / 1.3))} MZN</span>
            </div>
          )}
          {form.urgencyLevel === "very_urgent" && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Taxa muito urgente (60%):</span>
              <span className="font-medium text-red-600">+{Math.round(price - (price / 1.6))} MZN</span>
            </div>
          )}
          <div className="flex justify-between text-xs font-semibold mt-1 pt-1 border-t border-orange-200">
            <span className="text-slate-700">Total a pagar:</span>
            <span className="text-orange-700">{price} MZN</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          *O valor final será confirmado após análise do pedido
        </p>
      </div>
    </div>
  );
};

export default SummaryStep;