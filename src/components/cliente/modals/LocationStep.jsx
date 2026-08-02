import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import Icon from "../../common/Icon";
import { Autocomplete } from "@react-google-maps/api";

const SavedAddressPicker = ({ addresses, onSelect, colorClass, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!addresses || addresses.length === 0) return null;

  const handleSelect = (addr) => {
    onSelect(addr);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        title="Endereços guardados"
        className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}
      >
        <Icon name="mapPin" size={12} />
        <span>Guardados</span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-64 max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              type="button"
              onClick={() => handleSelect(addr)}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-0"
            >
              <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                {addr.label || "Endereço"}
                {addr.isDefault && (
                  <span className="text-[10px] text-green-600 font-normal">(Padrão)</span>
                )}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{addr.fullAddress}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const LocationStep = ({ 
  serviceType, 
  form, 
  onFormChange, 
  isLoaded, 
  onUseCurrentLocation, 
  onSelectOnMap,
  onCalculateRoute,
  distance,
  duration,
  price,
  loadingRoute,
  loadingLocations,
  onClearInput,
  settings
}) => {
  const orderSettings = settings?.order || {};
  const appSettings = settings?.app || {};
  const pricing = settings?.pricing || {};
  const allowManualAddressInput = orderSettings.allowManualAddressInput ?? true;
  const requireCoordinates = orderSettings.requireCoordinates ?? false;
  const countryRestriction = appSettings.countryRestriction || "mz";
  const currency = appSettings.currency || "MZN";
  const urgentPercent = Number(pricing.urgentPercentage ?? 30);
  const veryUrgentPercent = Number(pricing.veryUrgentPercentage ?? 60);
  const manualInputDisabled = !allowManualAddressInput;

  const {addresses} = useAuth()


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
    const isAnyManual = form.manualPickup || form.manualDropoff;
    
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-500">Local de Embarque *</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-slate-600">Digitar manualmente</span>
              <button
                type="button"
                onClick={() => onFormChange(prev => ({ 
                  ...prev, 
                  manualPickup: !prev.manualPickup,
                  pickupCoords: !prev.manualPickup ? null : prev.pickupCoords
                }))}
                disabled={manualInputDisabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  manualInputDisabled ? 'cursor-not-allowed opacity-50' : ''
                } ${
                  form.manualPickup ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.manualPickup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <Icon name="mapPin" size={16} className="text-green-500" />
            </div>
            {isLoaded && !form.manualPickup ? (
              <Autocomplete
                onLoad={(autocomplete) => {
                  window.pickupAutocomplete = autocomplete;
                }}
                onPlaceChanged={() => {
                  if (window.pickupAutocomplete) {
                    const place = window.pickupAutocomplete.getPlace();
                    if (place.formatted_address && place.geometry) {
                      const location = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                      };
                      onFormChange(prev => ({ 
                        ...prev, 
                        pickupLocation: place.formatted_address, 
                        pickupCoords: location 
                      }));
                    }
                  }
                }}
                options={{ componentRestrictions: { country: countryRestriction } }}
              >
                <input
                  type="text"
                  value={form.pickupLocation}
                  onChange={(e) => onFormChange(prev => ({ ...prev, pickupLocation: e.target.value }))}
                  placeholder="Digite o endereço de embarque..."
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                value={form.pickupLocation}
                onChange={(e) => onFormChange(prev => ({ 
                  ...prev, 
                  pickupLocation: e.target.value,
                  pickupCoords: null
                }))}
                placeholder="Digite o endereço de embarque manualmente..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            )}
            {form.pickupLocation && (
              <button
                type="button"
                onClick={() => onClearInput("pickupLocation")}
                className="!absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 z-10"
                style={{ transform: 'translateY(-50%)' }}
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
          {!form.manualPickup && (
            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={() => onUseCurrentLocation("pickupLocation")}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                disabled={loadingLocations.pickupLocation}
              >
                {loadingLocations.pickupLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span>A obter localização...</span>
                  </>
                ) : (
                  <>
                    <Icon name="navigation" size={12} />
                    <span>Usar minha localização</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onSelectOnMap("pickupLocation")}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
              >
                <Icon name="map" size={12} />
                Selecionar no mapa
              </button>
              <SavedAddressPicker
                addresses={addresses}
                colorClass="text-indigo-600 hover:text-indigo-800"
                disabled={form.manualPickup}
                onSelect={(addr) => onFormChange(prev => ({
                  ...prev,
                  pickupLocation: addr.fullAddress,
                  pickupCoords: { lat: Number(addr.lat), lng: Number(addr.lng) }
                }))}
              />
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-500">Local de Desembarque *</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-slate-600">Digitar manualmente</span>
              <button
                type="button"
                onClick={() => onFormChange(prev => ({ 
                  ...prev, 
                  manualDropoff: !prev.manualDropoff,
                  dropoffCoords: !prev.manualDropoff ? null : prev.dropoffCoords
                }))}
                disabled={manualInputDisabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  manualInputDisabled ? 'cursor-not-allowed opacity-50' : ''
                } ${
                  form.manualDropoff ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.manualDropoff ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <Icon name="navigation" size={16} className="text-red-500" />
            </div>
            {isLoaded && !form.manualDropoff ? (
              <Autocomplete
                onLoad={(autocomplete) => {
                  window.dropoffAutocomplete = autocomplete;
                }}
                onPlaceChanged={() => {
                  if (window.dropoffAutocomplete) {
                    const place = window.dropoffAutocomplete.getPlace();
                    if (place.formatted_address && place.geometry) {
                      const location = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                      };
                      onFormChange(prev => ({ 
                        ...prev, 
                        dropoffLocation: place.formatted_address, 
                        dropoffCoords: location 
                      }));
                    }
                  }
                }}
                options={{ componentRestrictions: { country: countryRestriction } }}
              >
                <input
                  type="text"
                  value={form.dropoffLocation}
                  onChange={(e) => onFormChange(prev => ({ ...prev, dropoffLocation: e.target.value }))}
                  placeholder="Digite o endereço de destino..."
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                value={form.dropoffLocation}
                onChange={(e) => onFormChange(prev => ({ 
                  ...prev, 
                  dropoffLocation: e.target.value,
                  dropoffCoords: null
                }))}
                placeholder="Digite o endereço de destino manualmente..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            )}
            {form.dropoffLocation && (
              <button
                type="button"
                onClick={() => onClearInput("dropoffLocation")}
                className="!absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 z-10"
                style={{ transform: 'translateY(-50%)' }}
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
          {!form.manualDropoff && (
            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={() => onUseCurrentLocation("dropoffLocation")}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                disabled={loadingLocations.dropoffLocation}
              >
                {loadingLocations.dropoffLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span>A obter localização...</span>
                  </>
                ) : (
                  <>
                    <Icon name="navigation" size={12} />
                    <span>Usar minha localização</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onSelectOnMap("dropoffLocation")}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
              >
                <Icon name="map" size={12} />
                Selecionar no mapa
              </button>
              <SavedAddressPicker
                addresses={addresses}
                colorClass="text-indigo-600 hover:text-indigo-800"
                disabled={form.manualDropoff}
                onSelect={(addr) => onFormChange(prev => ({
                  ...prev,
                  dropoffLocation: addr.fullAddress,
                  dropoffCoords: { lat: Number(addr.lat), lng: Number(addr.lng) }
                }))}
              />
            </div>
          )}
        </div>
        
        {form.pickupLocation && form.dropoffLocation && (
          <>
            {!isAnyManual ? (
              // Show full estimate when both locations are from autocomplete/map
              form.pickupCoords && form.dropoffCoords ? (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="map" size={16} className="text-blue-500" />
                      <span className="text-xs font-semibold text-blue-700">Estimativa de viagem</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-blue-700">{distance} km</p>
                      <p className="text-xs text-blue-600">Distância</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-700">{duration} min</p>
                      <p className="text-xs text-blue-600">Duração</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-700">{price} {currency}</p>
                      <p className="text-xs text-blue-600">Estimativa</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={onCalculateRoute}
                    disabled={loadingRoute}
                    className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    {loadingRoute ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>A calcular rota...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="map" size={16} />
                        <span>Ver Rota</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                // Show info that coordinates are needed
                <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <Icon name="alertCircle" size={16} className="text-yellow-600" />
                    <p className="text-xs text-yellow-700">
                      Para ver a estimativa completa, selecione os endereços usando a pesquisa ou o mapa.
                    </p>
                  </div>
                </div>
              )
            ) : (
              // Show message when manual input is enabled
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Icon name="info" size={16} className="text-gray-500" />
                  <p className="text-xs text-gray-600">
                    Modo de digitação manual ativado. A estimativa de distância será calculada após a confirmação do pedido.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        
        {(!form.pickupLocation || !form.dropoffLocation) && (
          <div className="bg-yellow-50 rounded-xl p-2 border border-yellow-200">
            <p className="text-xs text-yellow-700 text-center">
              ⚠️ Por favor, preencha a origem e destino
            </p>
          </div>
        )}
      </div>
    );
  }
  
  // Delivery location step
  const isAnyManual = form.manualOrigin || form.manualDest;
  
  return (
  
  <div className="space-y-4">
  <div>
    <div className="flex items-center justify-between mb-1">
      <label className="block text-xs font-semibold text-slate-500">Origem (Local de coleta) *</label>
      <label className="flex items-center gap-2 cursor-pointer">
        <span className="text-xs text-slate-600">Digitar manualmente</span>
        <button
          type="button"
          onClick={() => onFormChange(prev => ({ 
            ...prev, 
            manualOrigin: !prev.manualOrigin,
            originCoords: !prev.manualOrigin ? null : prev.originCoords
          }))}
          disabled={manualInputDisabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
            manualInputDisabled ? 'cursor-not-allowed opacity-50' : ''
          } ${
            form.manualOrigin ? 'bg-orange-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              form.manualOrigin ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </label>
    </div>
    
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <Icon name="mapPin" size={16} className="text-green-500" />
      </div>
      {isLoaded && !form.manualOrigin ? (
        <Autocomplete
          onLoad={(autocomplete) => {
            window.originAutocomplete = autocomplete;
          }}
          onPlaceChanged={() => {
            if (window.originAutocomplete) {
              const place = window.originAutocomplete.getPlace();
              if (place.formatted_address && place.geometry) {
                const location = {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                };
                onFormChange(prev => ({ 
                  ...prev, 
                  origin: place.formatted_address, 
                  originCoords: location 
                }));
              }
            }
          }}
          options={{ componentRestrictions: { country: countryRestriction } }}
        >
          <input
            type="text"
            value={form.origin}
            onChange={(e) => onFormChange(prev => ({ ...prev, origin: e.target.value }))}
            placeholder="Digite o endereço de origem..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </Autocomplete>
      ) : (
        <input
          type="text"
          value={form.origin}
          onChange={(e) => onFormChange(prev => ({ 
            ...prev, 
            origin: e.target.value,
            originCoords: null
          }))}
          placeholder="Digite o endereço de origem manualmente..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
      )}
      {form.origin && (
        <button
          type="button"
          onClick={() => onClearInput("origin")}
          className="!absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 z-10"
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
    {!form.manualOrigin && (
      <div className="flex gap-4 mt-2">
        <button
          type="button"
          onClick={() => onUseCurrentLocation("origin")}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
          disabled={loadingLocations.origin}
        >
          {loadingLocations.origin ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>A obter localização...</span>
            </>
          ) : (
            <>
              <Icon name="navigation" size={12} />
              <span>Usar minha localização</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => onSelectOnMap("origin")}
          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
        >
          <Icon name="map" size={12} />
          Selecionar no mapa
        </button>
        <SavedAddressPicker
          addresses={addresses}
          colorClass="text-indigo-600 hover:text-indigo-800"
          disabled={form.manualOrigin}
          onSelect={(addr) => onFormChange(prev => ({
            ...prev,
            origin: addr.fullAddress,
            originCoords: { lat: Number(addr.lat), lng: Number(addr.lng) }
          }))}
        />
      </div>
    )}
  </div>
  
  <div>
    <div className="flex items-center justify-between mb-1">
      <label className="block text-xs font-semibold text-slate-500">Destino (Local de entrega) *</label>
      <label className="flex items-center gap-2 cursor-pointer">
        <span className="text-xs text-slate-600">Digitar manualmente</span>
        <button
          type="button"
          onClick={() => onFormChange(prev => ({ 
            ...prev, 
            manualDest: !prev.manualDest,
            destCoords: !prev.manualDest ? null : prev.destCoords
          }))}
          disabled={manualInputDisabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
            manualInputDisabled ? 'cursor-not-allowed opacity-50' : ''
          } ${
            form.manualDest ? 'bg-orange-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              form.manualDest ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </label>
    </div>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <Icon name="navigation" size={16} className="text-red-500" />
      </div>
      {isLoaded && !form.manualDest ? (
        <Autocomplete
          onLoad={(autocomplete) => {
            window.destAutocomplete = autocomplete;
          }}
          onPlaceChanged={() => {
            if (window.destAutocomplete) {
              const place = window.destAutocomplete.getPlace();
              if (place.formatted_address && place.geometry) {
                const location = {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                };
                onFormChange(prev => ({ 
                  ...prev, 
                  dest: place.formatted_address, 
                  destCoords: location 
                }));
              }
            }
          }}
          options={{ componentRestrictions: { country: countryRestriction } }}
        >
          <input
            type="text"
            value={form.dest}
            onChange={(e) => onFormChange(prev => ({ ...prev, dest: e.target.value }))}
            placeholder="Digite o endereço de destino..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </Autocomplete>
      ) : (
        <input
          type="text"
          value={form.dest}
          onChange={(e) => onFormChange(prev => ({ 
            ...prev, 
            dest: e.target.value,
            destCoords: null
          }))}
          placeholder="Digite o endereço de destino manualmente..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
      )}
      {form.dest && (
        <button
          type="button"
          onClick={() => onClearInput("dest")}
          className="!absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 z-10"
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
    {!form.manualDest && (
      <div className="flex gap-4 mt-2">
        <button
          type="button"
          onClick={() => onUseCurrentLocation("dest")}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
          disabled={loadingLocations.dest}
        >
          {loadingLocations.dest ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>A obter localização...</span>
            </>
          ) : (
            <>
              <Icon name="navigation" size={12} />
              <span>Usar minha localização</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => onSelectOnMap("dest")}
          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
        >
          <Icon name="map" size={12} />
          Selecionar no mapa
        </button>
        <SavedAddressPicker
          addresses={addresses}
          colorClass="text-indigo-600 hover:text-indigo-800"
          disabled={form.manualDest}
          onSelect={(addr) => onFormChange(prev => ({
            ...prev,
            dest: addr.fullAddress,
            destCoords: { lat: Number(addr.lat), lng: Number(addr.lng) }
          }))}
        />
      </div>
    )}
  </div>
  
  {form.origin && form.dest && (
    <>
      {!isAnyManual ? (
        // Show full estimate when both locations are from autocomplete/map
        form.originCoords && form.destCoords ? (
          <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="map" size={16} className="text-orange-500" />
                <span className="text-xs font-semibold text-orange-700">Estimativa de entrega</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-orange-700">{distance} km</p>
                <p className="text-xs text-orange-600">Distância</p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-700">{formatDuration(duration)}</p>
                <p className="text-xs text-orange-600">Duração estimada</p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-700">{price} {currency}</p>
                <p className="text-xs text-orange-600">Estimativa</p>
              </div>

            </div>
            {form.urgencyLevel !== "normal" && (
              <div className="mt-2 pt-2 border-t border-orange-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-600">Prioridade {form.urgencyLevel === "urgent" ? "Urgente" : "Muito Urgente"}:</span>
                  <span className="font-semibold text-orange-700">+{form.urgencyLevel === "urgent" ? `${urgentPercent}%` : `${veryUrgentPercent}%`}</span>
                </div>
              </div>
            )}
            
            <button
              type="button"
              onClick={onCalculateRoute}
              disabled={loadingRoute}
              className="w-full mt-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors"
            >
              {loadingRoute ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>A calcular rota...</span>
                </>
              ) : (
                <>
                  <Icon name="map" size={16} />
                  <span>Ver Rota</span>
                </>
              )}
            </button>
          </div>
        ) : (
          // Show info that coordinates are needed
          <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
            <div className="flex items-center gap-2">
              <Icon name="alertCircle" size={16} className="text-yellow-600" />
              <p className="text-xs text-yellow-700">
                Para ver a estimativa completa, selecione os endereços usando a pesquisa ou o mapa.
              </p>
            </div>
          </div>
        )
      ) : (
        // Show message when manual input is enabled
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="flex items-center gap-2">
            <Icon name="info" size={16} className="text-gray-500" />
            <p className="text-xs text-gray-600">
              Modo de digitação manual ativado. A estimativa de distância será calculada após a confirmação do pedido.
            </p>
          </div>
        </div>
      )}
    </>
  )}
  
  {(!form.origin || !form.dest) && (
    <div className="bg-yellow-50 rounded-xl p-2 border border-yellow-200">
      <p className="text-xs text-yellow-700 text-center">
        ⚠️ Por favor, preencha a origem e destino
      </p>
    </div>
  )}
  
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1">Contacto da origem</label>
    <input
      type="tel"
      value={form.contactOrigin}
      onChange={e => onFormChange(prev => ({ ...prev, contactOrigin: e.target.value }))}
      placeholder="+258 84 000 0000"
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  </div>
  
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1">Contacto do destino</label>
    <input
      type="tel"
      value={form.contactDest}
      onChange={e => onFormChange(prev => ({ ...prev, contactDest: e.target.value }))}
      placeholder="+258 84 000 0000"
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  </div>
</div>
  );
};

export default LocationStep;