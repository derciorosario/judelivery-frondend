import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import Icon from "../common/Icon";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createCarIcon = () => {
  return new L.DivIcon({
    className: "custom-car-marker",
    html: `
      <div style="
        background-color: #3b82f6;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 1.5s infinite;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="12" rx="2"></rect>
          <circle cx="7" cy="16" r="2"></circle>
          <circle cx="17" cy="16" r="2"></circle>
        </svg>
      </div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      </style>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const getColoredPinIcon = (color) => {
  return L.divIcon({
    className: "custom-pin",
    html: `
      <div style="position: relative; width: 25px; height: 41px;">
        <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.875 12.5 41 12.5 41C12.5 41 25 21.875 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}"/>
          <circle cx="12.5" cy="12.5" r="4" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [0, -41]
  });
};

const CustomerTracking = ({ activeOrder, orders, onSelectOrder }) => {
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(activeOrder || orders[0]);
  const [mapCenter, setMapCenter] = useState([-25.9653, 32.5778]);
  const [mapZoom, setMapZoom] = useState(13);

  const handleOrderSelect = (order) => {
    setSelectedTrackingOrder(order);
    if (order.originCoords && order.destCoords) {
      const centerLat = (order.originCoords[0] + order.destCoords[0]) / 2;
      const centerLng = (order.originCoords[1] + order.destCoords[1]) / 2;
      setMapCenter([centerLat, centerLng]);
      setMapZoom(13);
    } else if (order.driverPosition) {
      setMapCenter(order.driverPosition);
      setMapZoom(14);
    }
  };

  if (!selectedTrackingOrder) {
    return (
      <div className="text-center py-10">
        <Icon name="map" size={48} className="text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Nenhum pedido em andamento</p>
        <button className="mt-4 text-sm bg-orange-500 text-white px-4 py-2 rounded-xl">
          Fazer um pedido
        </button>
      </div>
    );
  }

  const isActive = selectedTrackingOrder.status === "Em entrega" || selectedTrackingOrder.statusCode === "in_progress";
  const progressPercent = selectedTrackingOrder.timeline ? 
    (selectedTrackingOrder.timeline.filter(t => t.completed).length / selectedTrackingOrder.timeline.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-slate-100" style={{ height: 320 }}>
        <MapContainer
          key={selectedTrackingOrder.id}
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {selectedTrackingOrder.originCoords && selectedTrackingOrder.destCoords && (
            <Polyline
              positions={[selectedTrackingOrder.originCoords, selectedTrackingOrder.destCoords]}
              color={isActive ? '#f97316' : '#94a3b8'}
              weight={4}
              opacity={0.8}
              lineCap="round"
              lineJoin="round"
              dashArray={isActive ? undefined : '5, 10'}
            />
          )}
          
          {selectedTrackingOrder.driverPosition && isActive && (
            <Marker
              position={selectedTrackingOrder.driverPosition}
              icon={createCarIcon()}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-bold">Motorista: {selectedTrackingOrder.driver}</p>
                  <p>Em rota de entrega</p>
                  {selectedTrackingOrder.eta && <p>ETA: {selectedTrackingOrder.eta}</p>}
                </div>
              </Popup>
            </Marker>
          )}
          
          {selectedTrackingOrder.originCoords && (
            <Marker
              position={selectedTrackingOrder.originCoords}
              icon={getColoredPinIcon('#10b981')}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-green-600">📍 Origem</p>
                  <p>{selectedTrackingOrder.origin}</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {selectedTrackingOrder.destCoords && (
            <Marker
              position={selectedTrackingOrder.destCoords}
              icon={getColoredPinIcon('#ef4444')}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-red-600">🏁 Destino</p>
                  <p>{selectedTrackingOrder.dest}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      
      {/* Order Info */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-400">Pedido</p>
            <p className="text-sm font-bold text-slate-800">{selectedTrackingOrder.id}</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isActive ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
            {selectedTrackingOrder.status}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400">Origem</p>
              <p className="text-sm text-slate-700">{selectedTrackingOrder.origin}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400">Destino</p>
              <p className="text-sm text-slate-700">{selectedTrackingOrder.dest}</p>
            </div>
          </div>
        </div>
        
        {selectedTrackingOrder.dist && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Icon name="navigation" size={14} />
            <span>Distância: {selectedTrackingOrder.dist}</span>
          </div>
        )}
        
        {isActive && (
          <>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500">Progresso da Entrega</p>
                <p className="text-xs text-orange-500">{Math.round(progressPercent)}%</p>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            
            <div className="mt-3 space-y-2">
              {selectedTrackingOrder.timeline?.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.completed ? "bg-green-100" : "bg-slate-100"}`}>
                    {step.completed ? (
                      <Icon name="check" size={14} className="text-green-500" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${step.completed ? "text-slate-700" : "text-slate-400"}`}>{step.status}</p>
                    <p className="text-xs text-slate-400">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Icon name="phone" size={16} className="text-blue-500" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Motorista: {selectedTrackingOrder.driver}</p>
                  <p className="text-xs text-slate-500">{selectedTrackingOrder.driverPhone || "+258 84 111 2233"}</p>
                </div>
                <button className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                  Ligar
                </button>
                <button className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <Icon name="messageCircle" size={16} className="text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Other Orders */}
      {orders.length > 1 && (
        <div>
          <p className="text-sm font-bold text-slate-700 mb-2">Outros Pedidos</p>
          <div className="space-y-2">
            {orders.filter(o => o.id !== selectedTrackingOrder.id).slice(0, 2).map(order => (
              <button key={order.id} onClick={() => handleOrderSelect(order)} className="w-full bg-white rounded-xl p-3 border border-slate-100 text-left hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{order.id}</p>
                    <p className="text-xs text-slate-400">{order.productName || "Encomenda"}</p>
                  </div>
                  <span className="text-xs text-orange-500">Ver →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTracking;