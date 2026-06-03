import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Icon from "../common/Icon";
import { DRIVERS } from "../../data/mockData";

const GestorMap = () => {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [mapCenter, setMapCenter] = useState([-25.9653, 32.5778]);
  const [mapZoom, setMapZoom] = useState(13);
  const [drivers, setDrivers] = useState(DRIVERS);
  
  // Simulate driver movement without updating map
  useEffect(() => {
    const intervals = [];
    
    drivers.forEach((driver, index) => {
      if (driver.status === "working") {
        const interval = setInterval(() => {
          setDrivers(prevDrivers => {
            const newDrivers = [...prevDrivers];
            const driverIndex = newDrivers.findIndex(d => d.id === driver.id);
            
            if (driverIndex !== -1) {
              // Simulate small movement (0.001-0.003 degrees)
              const latChange = (Math.random() - 0.5) * 0.003;
              const lngChange = (Math.random() - 0.5) * 0.003;
              
              newDrivers[driverIndex] = {
                ...newDrivers[driverIndex],
                position: [
                  newDrivers[driverIndex].position[0] + latChange,
                  newDrivers[driverIndex].position[1] + lngChange
                ]
              };
            }
            
            return newDrivers;
          });
        }, 5000); // Update every 5 seconds
        
        intervals.push(interval);
      }
    });
    
    // Randomly set online drivers to working status
    const statusInterval = setInterval(() => {
      setDrivers(prevDrivers => {
        const newDrivers = [...prevDrivers];
        const onlineDrivers = newDrivers.filter(d => d.status === "online");
        
        if (onlineDrivers.length > 0 && Math.random() < 0.3) {
          const randomDriver = onlineDrivers[Math.floor(Math.random() * onlineDrivers.length)];
          const driverIndex = newDrivers.findIndex(d => d.id === randomDriver.id);
          
          if (driverIndex !== -1) {
            newDrivers[driverIndex] = {
              ...newDrivers[driverIndex],
              status: "working",
              currentDelivery: `Entregando para Cliente ${Math.floor(Math.random() * 100)}`,
              eta: `${Math.floor(Math.random() * 15) + 3} min`
            };
          }
        }
        
        return newDrivers;
      });
    }, 15000); // Every 15 seconds
    
    return () => {
      intervals.forEach(interval => clearInterval(interval));
      clearInterval(statusInterval);
    };
  }, []);
  
  const createTruckIcon = (status) => {
    let color;
    if (status === "working") {
      color = '#f97316'; // Orange
    } else if (status === "online") {
      color = "#10b981"; // Green
    } else {
      color = "#94a3b8"; // Gray
    }
    
    return new L.DivIcon({
      className: "custom-truck-marker",
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ${status === "working" ? 'pulse 1.5s infinite' : 'none'};
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
        <style>
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(249, 115, 22, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(249, 115, 22, 0);
            }
          }
        </style>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };
  
  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver);
    if (driver.position) {
      setMapCenter(driver.position);
      setMapZoom(16);
    }
  };
  
  // Get the current driver position for the selected driver
  const currentSelectedDriver = selectedDriver 
    ? drivers.find(d => d.id === selectedDriver.id) 
    : null;
  
  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-slate-700">Monitorização em Tempo Real</p>
      
      <div className="rounded-2xl overflow-hidden border border-slate-100" style={{ height: 280 }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {drivers.map(driver => (
            driver.position && (
              <Marker
                key={driver.id}
                position={driver.position}
                icon={createTruckIcon(driver.status)}
              >
                <Popup>
                  <div className="text-xs min-w-[150px]">
                    <p className="font-bold text-slate-800">{driver.name}</p>
                    <p className={driver.status === "working" ? "text-orange-600 font-semibold" : driver.status === "online" ? "text-green-600" : "text-slate-500"}>
                      {driver.status === "working" ? "🚚 Em entrega" : driver.status === "online" ? "✅ Disponível" : "⭕ Offline"}
                    </p>
                    {driver.status === "working" && driver.currentDelivery && (
                      <>
                        <p className="text-slate-600 mt-1">{driver.currentDelivery}</p>
                        <p className="text-orange-500 text-xs mt-0.5">⏱️ ETA: {driver.eta}</p>
                      </>
                    )}
                    <p className="text-slate-400 mt-1">{driver.zone}</p>
                    <p className="text-slate-400 text-xs mt-0.5">⭐ {driver.rating} · {driver.orders} entregas</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
      
      {currentSelectedDriver?.status === "working" && (
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
          <p className="text-xs font-semibold text-orange-600 mb-1">🚚 Entrega em andamento</p>
          <p className="text-sm text-slate-700">{currentSelectedDriver.currentDelivery}</p>
          <p className="text-xs text-orange-500 mt-1">Tempo estimado: {currentSelectedDriver.eta}</p>
        </div>
      )}
      
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-2">Estado Motoristas</p>
        {drivers.map(d => {
          const isSelected = selectedDriver?.id === d.id;
          return (
            <button
              key={d.id}
              onClick={() => handleDriverSelect(d)}
              className={`w-full flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg px-2 transition-colors ${isSelected ? "bg-orange-50" : ""}`}
            >
              <div className={`w-2 h-2 rounded-full ${d.status === "working" ? "bg-orange-500 animate-pulse" : d.status === "online" ? "bg-green-400" : "bg-slate-300"}`} />
              <div className="flex-1 text-left">
                <span className="text-sm text-slate-700 block">{d.name}</span>
                {d.status === "working" && d.currentDelivery && (
                  <span className="text-xs text-orange-500 block">{d.currentDelivery}</span>
                )}
                {isSelected && currentSelectedDriver?.status === "working" && currentSelectedDriver?.eta && (
                  <span className="text-xs text-orange-500 block">ETA: {currentSelectedDriver.eta}</span>
                )}
              </div>
              <span className="text-xs font-medium text-gray-700 px-2 py-1 rounded-full bg-slate-100">
                {d.status === "working" ? "Em entrega" : d.status === "online" ? "Disponível" : "Inactivo"}
              </span>
              {d.status !== "offline" && (
                <Icon name="location" size={14} className="text-orange-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GestorMap;