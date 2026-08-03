import Icon from "../../common/Icon";

const SummaryStep = ({ 
   serviceType, 
   form, 
   distance, 
   duration, 
   price, 
   onPaymentMethodChange,
   getUrgencyLabel,
   getUrgencyColor,
   currency: currencyProp,
   paymentMethods,
   settings,
   supportContact: supportContactProp,
   isManualInput
 }) => {
  const appSettings = settings?.app || {};
  const pricing = settings?.pricing || {};
  const currency = currencyProp || appSettings.currency || "MZN";
  const supportContact = supportContactProp || appSettings || {};
  const methods = paymentMethods?.length ? paymentMethods : [{ name: "Transferência", code: "bank_transfer" }];
  const deliveryBasePrice = Number(pricing.deliveryBasePrice ?? 50);
  const urgentFactor = 1 + Number(pricing.urgentPercentage ?? 30) / 100;
  const veryUrgentFactor = 1 + Number(pricing.veryUrgentPercentage ?? 60) / 100;
  const urgentPercent = Number(pricing.urgentPercentage ?? 30);
  const veryUrgentPercent = Number(pricing.veryUrgentPercentage ?? 60);
  const luggageFee = Number(pricing.luggageFee ?? 40);
  const returnTripPercent = Number(pricing.returnTripFee ?? 100);
  const waitingFeePerMinute = Number(pricing.waitingFeePerMinute ?? 4);
  const taxiBasePrice = Number(pricing.taxiBasePrice ?? 80);
  const taxiPerKm = Number(pricing.taxiPerKm ?? 20);
  const baseTripTotal = taxiBasePrice + (distance * taxiPerKm);
  const returnTripAmount = form.returnTrip ? Math.round(baseTripTotal * (returnTripPercent / 100)) : 0;

  const promotion = settings?.promotion || {};
  const isPromotionEnabled =
    promotion.enabled &&
    Boolean(promotion.title || promotion.discountText || promotion.discountPercentage);

  const today = new Date();
  const startDate = promotion.startDate ? new Date(promotion.startDate) : null;
  const endDate = promotion.endDate ? new Date(promotion.endDate) : null;
  const isWithinDateRange =
    !startDate || today >= startDate
      ? !endDate || today <= endDate
      : false;

  const minOrderValue = Number(promotion.minOrderValue ?? 0);
  const maxOrderValue = Number(promotion.maxOrderValue ?? 0);
  const totalUsageLimit = Number(promotion.totalUsageLimit ?? 0);
  const discountPercentage = Number(promotion.discountPercentage ?? 0);

  const meetsValueRange =
    price >= (minOrderValue || 0) &&
    (maxOrderValue === 0 || price <= maxOrderValue);

  const discountAmount =
    isPromotionEnabled && isWithinDateRange && meetsValueRange
      ? Number((price * (discountPercentage / 100)).toFixed(2))
      : 0;

  const finalPrice = Number((price - discountAmount).toFixed(2));

  const formatAmount = (value) => `${Number(value) || 0} ${currency}`;

  const formatDuration = (minutes) => {

      if(isNaN(minutes)) {
        return minutes
      }

      if (!minutes || minutes < 0) return "0 min";
      
      // Round to nearest integer
      const totalMinutes = Math.round(minutes);
      
      if (totalMinutes === 0) return "0 min";
      
      const hours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      
      if (hours === 0) {
        return `${remainingMinutes} min`;
      }
      
      if (hours === 1 && remainingMinutes === 0) {
        return "1 hora";
      }
      
      if (hours === 1 && remainingMinutes > 0) {
        return `1h:${remainingMinutes.toString().padStart(2, '0')}min`;
      }
      
      if (remainingMinutes === 0) {
        return `${hours} horas`;
      }
      
      return `${hours}h:${remainingMinutes.toString().padStart(2, '0')}min`;
  };



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
                  <span className="font-medium text-slate-800">+{formatAmount(luggageFee)}</span>
                </div>
              )}
              {form.returnTrip && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Viagem de volta:</span>
                  <span className="font-medium text-slate-800">+{formatAmount(returnTripAmount)}</span>
                </div>
              )}
              {form.waitingTime > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tempo de espera:</span>
                  <span className="font-medium text-slate-800">{form.waitingTime} min (+{formatAmount(form.waitingTime * waitingFeePerMinute)})</span>
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
            {methods.map((method) => {
              const methodLabel = method.name || method.code;
              const methodCode = method.code || method.name;
              const active = form.paymentMethod === methodLabel || form.paymentMethod === methodCode;

              return (
                <button
                  key={methodCode || methodLabel}
                  type="button"
                  onClick={() => onPaymentMethodChange(methodLabel)}
                  className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                    active
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {methodLabel}
                </button>
              );
            })}
          </div>
        </div>
        
        {(supportContact.supportName || supportContact.supportPhone || supportContact.supportEmail) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500 mb-2">Contactos de apoio</p>
            <p className="text-sm font-medium text-slate-800">{supportContact.supportName || "Plataforma/Suporte"}</p>
            {supportContact.supportPhone && <p className="text-xs text-slate-500 mt-1">{supportContact.supportPhone}</p>}
            {supportContact.supportEmail && <p className="text-xs text-slate-500 mt-1">{supportContact.supportEmail}</p>}
          </div>
        )}

<div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
           <div className="flex items-center justify-between">
             <span className="text-sm font-bold text-slate-700">Valor Total:</span>
             <span className="text-xl font-bold text-blue-500">
               {isManualInput ? `(Não definido)` : formatAmount(finalPrice)}
             </span>
           </div>
           {discountAmount > 0 && (
             <div className="mt-2 pt-2 border-t border-blue-200">
               <div className="flex justify-between text-xs">
                 <span className="text-slate-600">Subtotal:</span>
                 <span className="font-medium text-black">{formatAmount(price)}</span>
               </div>
               <div className="flex justify-between text-xs">
                 <span className="text-green-600">Promoção ({promotion.title || discountPercentage + "% OFF"}):</span>
                 <span className="font-medium text-green-600">-{formatAmount(discountAmount)}</span>
               </div>
             </div>
           )}
           {isManualInput && (
             <div className="mt-2 pt-2 border-t border-blue-200">
               <p className="text-xs text-amber-600">
                 Nota: O valor final será definido pela equipa da plataforma.
               </p>
             </div>
           )}
         
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
              <p className="text-base font-bold text-slate-800">{formatDuration(duration)}</p>
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
          {methods.map((method) => {
            const methodLabel = method.name || method.code;
            const methodCode = method.code || method.name;
            const active = form.paymentMethod === methodLabel || form.paymentMethod === methodCode;

            return (
              <button
                key={methodCode || methodLabel}
                type="button"
                onClick={() => onPaymentMethodChange(methodLabel)}
                className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                  active
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                {methodLabel}
              </button>
            );
          })}
        </div>
      </div>
      
      {(supportContact.supportName || supportContact.supportPhone || supportContact.supportEmail) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500 mb-2">Contactos de apoio</p>
          <p className="text-sm font-medium text-slate-800">{supportContact.supportName || "Plataforma/Suporte"}</p>
          {supportContact.supportPhone && <p className="text-xs text-slate-500 mt-1">{supportContact.supportPhone}</p>}
          {supportContact.supportEmail && <p className="text-xs text-slate-500 mt-1">{supportContact.supportEmail}</p>}
        </div>
      )}

<div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
         <div className="flex items-center justify-between">
           <span className="text-sm font-bold text-slate-700">Valor Total:</span>
           <span className="text-xl font-bold text-orange-500">
             {isManualInput ? `(Valor não definido)` : formatAmount(price)}
           </span>
         </div>
         <div className="mt-2 pt-2 border-t border-orange-200">
           <div className="flex justify-between text-xs">
             <span className="text-slate-600">Taxa base:</span>
             <span className="font-medium text-black">{formatAmount(Math.round(price / (form.urgencyLevel === "urgent" ? urgentFactor : form.urgencyLevel === "very_urgent" ? veryUrgentFactor : 1)))}</span>
           </div>
           {form.urgencyLevel === "urgent" && (
             <div className="flex justify-between text-xs">
               <span className="text-slate-600">Taxa urgente ({urgentPercent}%):</span>
               <span className="font-medium text-amber-600">+{formatAmount(Math.round(price - (price / urgentFactor)))}</span>
             </div>
           )}
           {form.urgencyLevel === "very_urgent" && (
             <div className="flex justify-between text-xs">
               <span className="text-slate-600">Taxa muito urgente ({veryUrgentPercent}%):</span>
               <span className="font-medium text-red-600">+{formatAmount(Math.round(price - (price / veryUrgentFactor)))}</span>
             </div>
           )}
           <div className="flex justify-between text-xs font-semibold mt-1 pt-1 border-t border-orange-200">
             <span className="text-slate-700">Total a pagar:</span>
             <span className="text-orange-700">{isManualInput ? `(Valor não definido)` : formatAmount(finalPrice)}</span>
           </div>
           {discountAmount > 0 && (
             <div className="flex justify-between text-xs mt-1">
               <span className="text-green-600">Promoção ({promotion.title || discountPercentage + "% OFF"}):</span>
               <span className="font-medium text-green-600">-{formatAmount(discountAmount)}</span>
             </div>
           )}
         </div>
         {isManualInput && (
           <p className="text-xs text-amber-600 mt-2">
             Nota: O valor final será definido pela equipa da plataforma.
           </p>
         )}
         <p className="text-xs text-slate-400 mt-2">
           *O valor final será confirmado após análise do pedido
         </p>
       </div>
    </div>
    
  );
};

export default SummaryStep;