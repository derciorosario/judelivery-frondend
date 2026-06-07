import { useState, useEffect, useCallback, useRef } from "react";
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useSocket } from "../../contexts/SocketContext";
import { getDrivers, getDriverStatuses } from "../../api/client";
import {
  Truck,
  Navigation,
  User,
  Phone,
  Loader2,
  MapPin,
  Star,
  X
} from "lucide-react";

const GOOGLE_MAPS_KEY = "AIzaSyAt3JMQnStFWcbODF6HBHGck0IUseek_Ak";
const MAPUTO_CENTER = { lat: -25.9653, lng: 32.5778 };
const libraries = ["places"];

const GestorMap = () => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_KEY, libraries });
  const { socket, connected } = useSocket();
  const mapRef = useRef(null);

  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedDriverAddress, setSelectedDriverAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [mapCenter, setMapCenter] = useState(MAPUTO_CENTER);
  const [mapZoom, setMapZoom] = useState(13);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [connectedToSocket, setConnectedToSocket] = useState(false);
  const geocoderRef = useRef(null);

  const statusLabel = (status) => {
    if (status === "working") return "Em entrega";
    if (status === "online") return "Disponível";
    return "Offline";
  };

  const statusColor = (status) => {
    if (status === "working") return "text-orange-600";
    if (status === "online") return "text-green-600";
    return "text-slate-500";
  };

  const getAddressFromCoords = useCallback(async (coords) => {
    if (!coords || !isLoaded || !window.google) return null;

    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }

    try {
      const result = await new Promise((resolve, reject) => {
        geocoderRef.current.geocode(
          { location: { lat: coords.lat, lng: coords.lng } },
          (results, status) => {
            if (status === "OK" && results && results[0]) {
              resolve(results[0].formatted_address);
            } else {
              reject(new Error(status));
            }
          }
        );
      });
      return result;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }, [isLoaded]);

  // Fetch initial drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const [driversRes, statusesRes] = await Promise.all([
          getDrivers(),
          getDriverStatuses()
        ]);

        const driversData = driversRes.data || [];
        const statusesData = statusesRes.data || [];

        const statusMap = new Map(statusesData.map(s => [s.userId, s]));

        const merged = driversData
          .filter(d => d.position)
          .map(d => {
            let position = d.position;
            if (typeof position === "string") {
              try {
                const clean = position.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"');
                const parsed = JSON.parse(clean);
                position = parsed;
              } catch {
                position = null;
              }
            }

            const socketStatus = statusMap.get(d.userId);

            return {
              id: d.id,
              userId: d.userId,
              name: d.name,
              phone: d.phone,
              email: d.email,
              vehicle: d.vehicle,
              licensePlate: d.licensePlate,
              rating: d.rating || 0,
              ordersCount: d.ordersCount || 0,
              status: socketStatus?.status || d.status || "offline",
              currentDelivery: socketStatus?.currentDelivery || d.currentDelivery || null,
              eta: socketStatus?.eta || d.eta || null,
              position,
              lastSeen: socketStatus?.lastSeen || d.lastSeen || d.updatedAt || null
            };
          });

        setDrivers(merged);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      } finally {
        setLoadingDrivers(false);
      }
    };

    fetchDrivers();
  }, []);

  // Fetch addresses via statuses endpoint to keep positions fresh without depending on socket
  useEffect(() => {
    if (!connected || !socket || typeof socket.join !== "function" || drivers.length === 0) return;

    socket.join("monitoring");
    socket.join("drivers");
    setConnectedToSocket(true);

    const handleLocationUpdated = (data) => {
      setDrivers(prev => prev.map(d => {
        if (d.userId === data.driverId || d.id === data.driverId) {
          return {
            ...d,
            position: data.coords,
            lastSeen: new Date().toISOString(),
            status: d.status === "offline" ? "online" : d.status
          };
        }
        return d;
      }));

      if (selectedDriver && (selectedDriver.userId === data.driverId || selectedDriver.id === data.driverId)) {
        setSelectedDriver(prev => ({
          ...prev,
          position: data.coords,
          lastSeen: new Date().toISOString()
        }));
      }
    };

    const handleStatusUpdated = (data) => {
      setDrivers(prev => prev.map(d => {
        if (d.userId === data.driverId || d.id === data.driverId) {
          return { ...d, status: data.status };
        }
        return d;
      }));

      if (selectedDriver && (selectedDriver.userId === data.driverId || selectedDriver.id === data.driverId)) {
        setSelectedDriver(prev => ({ ...prev, status: data.status }));
      }
    };

    const handleSnapshot = (statuses) => {
      const statusMap = new Map(statuses.map(s => [s.userId, s]));
      setDrivers(prev => prev.map(d => {
        const snapshot = statusMap.get(d.userId);
        if (snapshot) {
          return { ...d, ...snapshot };
        }
        return d;
      }));
    };

    socket.on("driver:location:updated", handleLocationUpdated);
    socket.on("driver:status:updated", handleStatusUpdated);
    socket.on("admin:snapshot", handleSnapshot);

    return () => {
      socket.off("driver:location:updated", handleLocationUpdated);
      socket.off("driver:status:updated", handleStatusUpdated);
      socket.off("admin:snapshot", handleSnapshot);
    };
  }, [connected, socket, selectedDriver]);

  // Fetch selected driver address
  useEffect(() => {
    if (!selectedDriver?.position) {
      setSelectedDriverAddress("");
      return;
    }

    let cancelled = false;
    setLoadingAddress(true);

    getAddressFromCoords(selectedDriver.position).then(address => {
      if (!cancelled && address) {
        setSelectedDriverAddress(address);
      }
      setLoadingAddress(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedDriver?.position, getAddressFromCoords]);

  // Fallback polling for positions
  useEffect(() => {
    if (!connected) {
      const poll = setInterval(async () => {
        try {
          const statusesRes = await getDriverStatuses();
          const statusesData = statusesRes.data || [];

          const updated = drivers.map(d => {
            const snap = statusesData.find(s => s.userId === d.userId || s.userId === d.userId);
            if (!snap) return d;
            return {
              ...d,
              position: snap.position || d.position,
              status: snap.status || d.status,
              lastSeen: snap.lastSeen || d.lastSeen
            };
          });

          setDrivers(updated);
        } catch (error) {
          console.error("Error polling driver statuses:", error);
        }
      }, 10000);

      return () => clearInterval(poll);
    }
  }, [connected]);

  const handleDriverSelect = useCallback((driver) => {
    setSelectedDriver(driver);

    if (driver.position) {
      setMapCenter({ lat: driver.position.lat, lng: driver.position.lng });
      setMapZoom(16);
    }
  }, []);

  const handleFitAll = useCallback(() => {
    if (!window.google || !mapRef.current || drivers.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    drivers.forEach(d => {
      if (d.position && typeof d.position.lat === "number") {
        bounds.extend(new window.google.maps.LatLng(d.position.lat, d.position.lng));
        hasPoints = true;
      }
    });

    if (hasPoints) {
      mapRef.current.fitBounds(bounds);
      setTimeout(() => {
        const currentZoom = mapRef.current.getZoom();
        if (currentZoom > 15) {
          mapRef.current.setZoom(15);
        }
      }, 100);
    }
  }, [drivers]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (drivers.length > 0 && mapRef.current) {
      handleFitAll();
    }
  }, [drivers.length, handleFitAll]);

  const iconForStatus = (status) => {
    if (!window.google) return undefined;
    const color = status === "working" ? "#f97316" : status === "online" ? "#10b981" : "#94a3b8";
    return {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5-2.5z",
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: 1.6,
      anchor: new window.google.maps.Point(12, 12)
    };
  };

  if (loadingDrivers) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-bold text-slate-700">Monitorização em Tempo Real</p>
        <div
          className="rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-50"
          style={{ height: 320 }}
        >
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">A carregar motoristas...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeDrivers = drivers.filter(d => d.position);
  const onlineCount = drivers.filter(d => d.status === "online").length;
  const workingCount = drivers.filter(d => d.status === "working").length;
  const totalCount = drivers.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Monitorização em Tempo Real</p>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            {workingCount} em entrega
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            {onlineCount} disponível
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            {totalCount - onlineCount - workingCount} offline
          </span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-100 relative" style={{ height: 420 }}>
        {!isLoaded ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">A carregar mapa...</p>
            </div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapCenter}
            zoom={mapZoom}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              gestureHandling: "cooperative"
            }}
          >
            {activeDrivers.map(driver => (
              driver.position && (
                <Marker
                  key={driver.id}
                  position={{ lat: driver.position.lat, lng: driver.position.lng }}
                  icon={iconForStatus(driver.status)}
                  onClick={() => handleDriverSelect(driver)}
                >
                  {selectedDriver?.id === driver.id && (
                    <InfoWindow onCloseClick={() => setSelectedDriver(null)}>
                      <div className="p-2 max-w-[220px]">
                        <p className="font-bold text-sm text-slate-800">{driver.name}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${statusColor(driver.status)}`}>
                          {statusLabel(driver.status)}
                        </p>
                        {driver.vehicle && (
                          <p className="text-xs text-slate-600 mt-0.5">
                            {driver.vehicle} • {driver.licensePlate || "Sem matrícula"}
                          </p>
                        )}
                        {driver.status === "working" && driver.currentDelivery && (
                          <>
                            <p className="text-xs text-slate-600 mt-1">{driver.currentDelivery}</p>
                            {driver.eta && (
                              <p className="text-xs text-orange-500 mt-0.5">ETA: {driver.eta}</p>
                            )}
                          </>
                        )}
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Star size={10} className="text-amber-400 fill-amber-400" />
                          {driver?.rating} • {driver?.ordersCount} entregas
                        </p>
                        {driver.phone && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <Phone size={10} />
                            {driver.phone}
                          </div>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              )
            ))}
          </GoogleMap>
        )}

        <div className="absolute bottom-3 left-3 flex gap-2">
          <button
            type="button"
            onClick={handleFitAll}
            className="px-3 py-2 bg-white rounded-lg shadow-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
          >
            <Truck size={14} />
            Ver todos
          </button>
        </div>

        <div className={`absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-2`}>
          <span className={`w-2 h-2 rounded-full ${connectedToSocket ? "bg-green-500 animate-pulse" : "bg-slate-300"}`} />
          <span className="text-xs text-slate-600">
            {connectedToSocket ? "Tempo real" : "Polling"}
          </span>
        </div>
      </div>

      {selectedDriver && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Motorista Selecionado</p>
            <button
              onClick={() => setSelectedDriver(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              selectedDriver.status === "working"
                ? "bg-orange-100"
                : selectedDriver.status === "online"
                  ? "bg-green-100"
                  : "bg-slate-100"
            }`}>
              <User size={16} className={`${
                selectedDriver.status === "working"
                  ? "text-orange-600"
                  : selectedDriver.status === "online"
                    ? "text-green-600"
                    : "text-slate-500"
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{selectedDriver.name}</p>
              <p className={`text-xs font-medium ${statusColor(selectedDriver.status)}`}>
                {statusLabel(selectedDriver.status)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Star size={10} className="text-amber-400 fill-amber-400" />
                {selectedDriver.rating} • {selectedDriver.ordersCount} entregas
              </p>
              {selectedDriver.vehicle && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedDriver.vehicle} {selectedDriver.licensePlate && `• ${selectedDriver.licensePlate}`}
                </p>
              )}
              {selectedDriver.phone && (
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Phone size={10} />
                  {selectedDriver.phone}
                </p>
              )}
              {loadingAddress ? (
                <div className="flex items-center gap-1 mt-1">
                  <Loader2 size={10} className="text-slate-400 animate-spin" />
                  <span className="text-[10px] text-slate-400">A carregar endereço...</span>
                </div>
              ) : selectedDriverAddress ? (
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  <MapPin size={10} className="inline mr-1 text-slate-400" />
                  {selectedDriverAddress}
                </p>
              ) : selectedDriver.position ? (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Coord: {selectedDriver.position.lat.toFixed(5)}, {selectedDriver.position.lng.toFixed(5)}
                </p>
              ) : null}
            </div>
          </div>

          {selectedDriver.status === "working" && selectedDriver.currentDelivery && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-orange-600 mb-1">Entrega em andamento</p>
              <p className="text-xs text-slate-700">{selectedDriver.currentDelivery}</p>
              {selectedDriver.eta && (
                <p className="text-xs text-orange-500 mt-0.5">
                  Tempo estimado: {selectedDriver.eta}
                </p>
              )}
            </div>
          )}

          {selectedDriver.lastSeen && (
            <div className="mt-2 pt-2 border-t border-slate-50">
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Navigation size={10} />
                Última atualização: {new Date(selectedDriver.lastSeen).toLocaleTimeString("pt-MZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })}
              </p>
            </div>
          )}
        </div>
      )}

      {drivers.length === 0 && !loadingDrivers && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
          <p className="text-xs text-slate-500">Nenhum motorista com localização disponível</p>
        </div>
      )}
    </div>
  );
};

export default GestorMap;
