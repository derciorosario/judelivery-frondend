import { useState, useEffect, useRef } from "react";
import Icon from "../../common/Icon";
import Modal from "../../common/Modal";
import { updateOrder } from "../../../api/client";
import { toast } from "../../../lib/toast";
import { useJsApiLoader } from "@react-google-maps/api";
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";

const GOOGLE_MAPS_KEY = "AIzaSyAt3JMQnStFWcbODF6HBHGck0IUseek_Ak";
const MAPUTO_CENTER = { lat: -25.9653, lng: 32.5778 };
const libraries = ["places"];

const CustomerOrderEditModal = ({ isOpen, onClose, order, onUpdated }) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_KEY, libraries });

  const [form, setForm] = useState({
    origin: "",
    dest: "",
    originCoords: null,
    destCoords: null,
    pickupLocation: "",
    dropoffLocation: "",
    pickupCoords: null,
    dropoffCoords: null,
    contactOrigin: "",
    contactDest: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order) return;
    const isTaxi = order.serviceType === "taxi";
    setForm({
      origin: isTaxi ? "" : (order.origin || ""),
      dest: isTaxi ? "" : (order.dest || ""),
      originCoords: isTaxi ? null : (order.originCoords || null),
      destCoords: isTaxi ? null : (order.destCoords || null),
      pickupLocation: isTaxi ? (order.pickupLocation || "") : "",
      dropoffLocation: isTaxi ? (order.dropoffLocation || "") : "",
      pickupCoords: isTaxi ? (order.pickupCoords || null) : null,
      dropoffCoords: isTaxi ? (order.dropoffCoords || null) : null,
      contactOrigin: order.contactOrigin || "",
      contactDest: order.contactDest || ""
    });
  }, [order]);

  const isTaxi = order?.serviceType === "taxi";
  const originField = isTaxi ? "pickupLocation" : "origin";
  const destField = isTaxi ? "dropoffLocation" : "dest";
  const originCoordsField = isTaxi ? "pickupCoords" : "originCoords";
  const destCoordsField = isTaxi ? "dropoffCoords" : "destCoords";

  const handleOriginPlaceChanged = (autocomplete) => {
    const place = autocomplete.getPlace();
    if (place.formatted_address && place.geometry) {
      const location = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      setForm(prev => ({ ...prev, [originField]: place.formatted_address, [originCoordsField]: location }));
    }
  };

  const handleDestPlaceChanged = (autocomplete) => {
    const place = autocomplete.getPlace();
    if (place.formatted_address && place.geometry) {
      const location = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      setForm(prev => ({ ...prev, [destField]: place.formatted_address, [destCoordsField]: location }));
    }
  };

  const openMapSelector = async (field) => {
    let center = MAPUTO_CENTER;
    const coordsField = field === originField ? originCoordsField : destCoordsField;
    const coords = form[coordsField];
    if (coords) {
      center = coords;
    } else if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
        });
        center = { lat: position.coords.latitude, lng: position.coords.longitude };
      } catch (e) {
        console.error("Geolocation error:", e);
      }
    }
    setMapTarget(field);
    setMapCenter(center);
    setMapMarker(null);
    setMapOpen(true);
  };

  const [mapOpen, setMapOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState(null);
  const [mapCenter, setMapCenter] = useState(MAPUTO_CENTER);
  const [mapMarker, setMapMarker] = useState(null);

  const handleMapClick = (e) => {
    if (!mapTarget) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const coords = { lat, lng };
    const label = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    const isOrigin = mapTarget === originField || mapTarget === "origin" || mapTarget === "pickupLocation";
    const coordsField = isOrigin ? originCoordsField : destCoordsField;

    setMapMarker(coords);
    setForm(prev => ({ ...prev, [mapTarget]: label, [coordsField]: coords }));
  };

  const handleMapMarkerEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const coords = { lat, lng };
    const label = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    const isOrigin = mapTarget === originField || mapTarget === "origin" || mapTarget === "pickupLocation";
    const coordsField = isOrigin ? originCoordsField : destCoordsField;

    setMapMarker(coords);
    setForm(prev => ({ ...prev, [mapTarget]: label, [coordsField]: coords }));
  };

  const clearInput = (field) => {
    const coordsField = field === originField ? originCoordsField : field === destField ? destCoordsField : null;
    setForm(prev => ({
      ...prev,
      [field]: "",
      ...(coordsField ? { [coordsField]: null } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!order) return;

    const originOk = !!form[originField] && !!form[originCoordsField];
    const destOk = !!form[destField] && !!form[destCoordsField];
    if (!originOk || !destOk) {
      toast.error("Selecione origem e destino válidos.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        origin: form.origin,
        dest: form.dest,
        originCoords: form.originCoords,
        destCoords: form.destCoords,
        pickupLocation: form.pickupLocation,
        dropoffLocation: form.dropoffLocation,
        pickupCoords: form.pickupCoords,
        dropoffCoords: form.dropoffCoords,
        contactOrigin: form.contactOrigin,
        contactDest: form.contactDest
      };
      const response = await updateOrder(order.id, payload);
      if (onUpdated) onUpdated(response.data);
      toast.success("Localização atualizada com sucesso");
      onClose();
    } catch (error) {
      let errorMessage = "Erro ao atualizar localização";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`Editar ${isTaxi ? "Corrida" : "Entrega"}`}>
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">A carregar mapas...</p>
        </div>
      </Modal>
    );
  }

  
  const originSet = !!form[originCoordsField];
  const destSet = !!form[destCoordsField];


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar ${isTaxi ? "Corrida" : "Entrega"}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Origin */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            {isTaxi ? "Local de Embarque" : "Origem (Local de coleta)"} *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 z-10">
              <Icon name="mapPin" size={16} className={isTaxi ? "text-green-500" : "text-orange-500"} />
            </div>
            {isLoaded ? (
              <Autocomplete
                onLoad={(autocomplete) => { window._editOriginAuto = autocomplete; }}
                onPlaceChanged={() => {
                  if (window._editOriginAuto) handleOriginPlaceChanged(window._editOriginAuto);
                }}
                options={{ componentRestrictions: { country: "mz" } }}
              >
                <input
                  type="text"
                  value={form[originField]}
                  onChange={(e) => setForm(prev => ({ ...prev, [originField]: e.target.value }))}
                  placeholder={isTaxi ? "Digite o endereço de embarque..." : "Digite o endereço de origem..."}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                value={form[originField]}
                disabled
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50"
              />
            )}
            {form[originField] && (
              <button type="button" onClick={() => clearInput(originField)} className="absolute right-2 top-2 p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200">
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-4 mt-1">
            <button type="button" onClick={() => openMapSelector(originField)} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium">
              <Icon name="map" size={12} /> Selecionar no mapa
            </button>
          </div>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            {isTaxi ? "Local de Desembarque" : "Destino (Local de entrega)"} *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 z-10">
              <Icon name="navigation" size={16} className="text-red-500" />
            </div>
            {isLoaded ? (
              <Autocomplete
                onLoad={(autocomplete) => { window._editDestAuto = autocomplete; }}
                onPlaceChanged={() => {
                  if (window._editDestAuto) handleDestPlaceChanged(window._editDestAuto);
                }}
                options={{ componentRestrictions: { country: "mz" } }}
              >
                <input
                  type="text"
                  value={form[destField]}
                  onChange={(e) => setForm(prev => ({ ...prev, [destField]: e.target.value }))}
                  placeholder={isTaxi ? "Digite o endereço de destino..." : "Digite o endereço de destino..."}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                value={form[destField]}
                disabled
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50"
              />
            )}
            {form[destField] && (
              <button type="button" onClick={() => clearInput(destField)} className="absolute right-2 top-2 p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200">
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-4 mt-1">
            <button type="button" onClick={() => openMapSelector(destField)} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium">
              <Icon name="map" size={12} /> Selecionar no mapa
            </button>
          </div>
        </div>

        {(!originSet || !destSet) && (
          <div className="bg-yellow-50 rounded-xl p-2 border border-yellow-200">
            <p className="text-xs text-yellow-700 text-center">⚠️ Selecione uma localização válida usando a pesquisa ou o mapa</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Contacto (Origem)</label>
            <input
              type="tel"
              value={form.contactOrigin}
              onChange={(e) => setForm(prev => ({ ...prev, contactOrigin: e.target.value }))}
              placeholder="+258 84 000 0000"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Contacto (Destino)</label>
            <input
              type="tel"
              value={form.contactDest}
              onChange={(e) => setForm(prev => ({ ...prev, contactDest: e.target.value }))}
              placeholder="+258 84 000 0000"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed">
            {saving ? "A guardar..." : "Guardar alterações"}
          </button>
        </div>
      </form>

      {mapOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Selecionar localização</h3>
              <button type="button" onClick={() => { setMapOpen(false); setMapMarker(null); }} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="h-80">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={14}
                onClick={handleMapClick}
                onDblClick={handleMapClick}
              >
                {mapMarker && <Marker position={mapMarker} draggable onDragEnd={handleMapMarkerEnd} />}
              </GoogleMap>
            </div>
            <div className="px-4 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                {mapMarker ? `Selecionado: ${mapMarker.lat.toFixed(6)}, ${mapMarker.lng.toFixed(6)}` : "Toque no mapa para selecionar"}
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CustomerOrderEditModal;
