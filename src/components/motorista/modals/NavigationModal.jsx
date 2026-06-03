import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import Modal from "../../common/Modal";
import Icon from "../../common/Icon";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createDriverIcon = () => {
  return new L.DivIcon({
    className: "custom-driver-marker",
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
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
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

const NavigationModal = ({ isOpen, onClose, order }) => {
  const [mapCenter, setMapCenter] = useState([-25.9653, 32.5778]);
  
  useEffect(() => {
    if (isOpen && order) {
      if (order.originCoords && order.destCoords) {
        const centerLat = (order.originCoords[0] + order.destCoords[0]) / 2;
        const centerLng = (order.originCoords[1] + order.destCoords[1]) / 2;
        setMapCenter([centerLat, centerLng]);
      } else if (order.driverPosition) {
        setMapCenter(order.driverPosition);
      }
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const isActive = order.status === "Em entrega";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Navegação">
      <div className="space-y-4">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden border border-slate-100" style={{ height: 400 }}>
          <MapContainer
            key={order.id}
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Route Line */}
            {order.originCoords && order.destCoords && (
              <Polyline
                positions={[order.originCoords, order.destCoords]}
                color={isActive ? '#f97316' : '#94a3b8'}
                weight={4}
                opacity={0.8}
                lineCap="round"
                lineJoin="round"
              />
            )}
            
            {/* Driver position */}
            {order.driverPosition && isActive && (
              <Marker
                position={order.driverPosition}
                icon={createDriverIcon()}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">Sua posição</p>
                    <p>Você está aqui</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Origin marker - Green */}
            {order.originCoords && (
              <Marker
                position={order.originCoords}
                icon={getColoredPinIcon('#10b981')}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold text-green-600">📍 Origem</p>
                    <p>{order.origin}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Destination marker - Red */}
            {order.destCoords && (
              <Marker
                position={order.destCoords}
                icon={getColoredPinIcon('#ef4444')}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold text-red-600">🏁 Destino</p>
                    <p>{order.dest}</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Order Info */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-800">{order.id}</p>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isActive ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
              {order.status}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Origem</p>
                <p className="text-sm text-slate-700">{order.origin}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Destino</p>
                <p className="text-sm text-slate-700">{order.dest}</p>
              </div>
            </div>
          </div>

          {order.dist && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Icon name="navigation" size={14} />
              <span>Distância: {order.dist}</span>
            </div>
          )}

          {/* Estimated Time */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Icon name="clock" size={14} />
            <span>Tempo estimado: {order.estimatedTime || "25 min"}</span>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={onClose} className="flex-1 bg-slate-200 text-slate-700 text-sm font-semibold py-2.5 rounded-xl">
              Fechar
            </button>
            <button className="flex-1 bg-green-500 text-white text-sm font-semibold py-2.5 rounded-xl">
              Iniciar Navegação
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NavigationModal;