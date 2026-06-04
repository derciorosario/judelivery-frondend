import Icon from "../../common/Icon";

const DetailsStep = ({ serviceType, form, onFormChange, getUrgencyLabel, getUrgencyColor }) => {
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
            <label className="block text-xs font-semibold text-slate-500 mb-1">Data e Hora da Entrega *</label>
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
          <div className="bg-green-50 rounded-xl p-3 border border-green-200">
            <div className="flex items-center gap-2">
              <Icon name="clock" size={16} className="text-green-500" />
              <p className="text-xs text-green-700 font-medium">Entrega para agora mesmo</p>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Instruções para o motorista</label>
        <textarea
          value={form.instructions}
          onChange={e => onFormChange({ ...form, instructions: e.target.value })}
          placeholder="Ex: Portão azul, tocar campainha, interfone 45, ponto de referência..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
      </div>
      
      {form.urgencyLevel !== "normal" && (
        <div className={`rounded-xl p-3 border ${
          form.urgencyLevel === "urgent" 
            ? "bg-amber-50 border-amber-200" 
            : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-start gap-2">
            <Icon name={form.urgencyLevel === "urgent" ? "zap" : "alertTriangle"} size={16} className={form.urgencyLevel === "urgent" ? "text-amber-500" : "text-red-500"} />
            <div>
              <p className={`text-xs font-semibold ${form.urgencyLevel === "urgent" ? "text-amber-700" : "text-red-700"}`}>
                {form.urgencyLevel === "urgent" ? "Entrega Urgente" : "Entrega Muito Urgente"}
              </p>
              <p className={`text-xs ${form.urgencyLevel === "urgent" ? "text-amber-600" : "text-red-600"} mt-0.5`}>
                {form.urgencyLevel === "urgent" 
                  ? "Taxa adicional de 10% para prioridade na entrega" 
                  : "Taxa adicional de 30% para prioridade máxima - entrega em até 30min"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsStep;