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
  X,
  Wifi,
  WifiOff,
  Compass,
  Clock,
  Car,
  ChevronRight,
  Search,
  Filter,
  List,
  Map as MapIcon,
  Award,
  TrendingUp,
  Circle,
  Menu,
  Mail
} from "lucide-react";

const GOOGLE_MAPS_KEY = "AIzaSyAt3JMQnStFWcbODF6HBHGck0IUseek_Ak";
const MAPUTO_CENTER = { lat: -25.9653, lng: 32.5778 };
const libraries = ["places"];

const GestorMap = ({ initialDriverId }) => {
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
  const [hoveredDriver, setHoveredDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDriverList, setShowDriverList] = useState(false);
  const [showDriverDetails, setShowDriverDetails] = useState(false);
  const geocoderRef = useRef(null);
  const initialDriverProcessed = useRef(false);

  const statusConfig = {
    working: {
      label: "Em entrega",
      color: "orange",
      bgLight: "bg-orange-50",
      bgMedium: "bg-orange-100",
      text: "text-orange-600",
      border: "border-orange-200",
      icon: Truck,
      dotColor: "bg-orange-500"
    },
    online: {
      label: "Disponível",
      color: "green",
      bgLight: "bg-green-50",
      bgMedium: "bg-green-100",
      text: "text-green-600",
      border: "border-green-200",
      icon: User,
      dotColor: "bg-green-500"
    },
    offline: {
      label: "Offline",
      color: "slate",
      bgLight: "bg-slate-50",
      bgMedium: "bg-slate-100",
      text: "text-slate-500",
      border: "border-slate-200",
      icon: User,
      dotColor: "bg-slate-400"
    }
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

  useEffect(() => {
    if (initialDriverId && drivers.length > 0 && !initialDriverProcessed.current) {
      const driver = drivers.find(d => d.id === initialDriverId || d.userId === initialDriverId);
      if (driver) {
        handleDriverSelect(driver);
        setShowDriverDetails(true);
        initialDriverProcessed.current = true;
      }
    }
  }, [drivers, initialDriverId]);

  useEffect(() => {
    initialDriverProcessed.current = false;
  }, [initialDriverId]);

  // Socket connection handlers
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
        
        if (mapRef.current && data.coords) {
          setMapCenter({ lat: data.coords.lat, lng: data.coords.lng });
        }
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
    setShowDriverDetails(true);
    setShowDriverList(false);

    if (driver.position) {
      setMapCenter({ lat: driver.position.lat, lng: driver.position.lng });
      setMapZoom(16);
      
      if (mapRef.current) {
        mapRef.current.panTo({ lat: driver.position.lat, lng: driver.position.lng });
        mapRef.current.setZoom(16);
      }
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

  // Filter drivers based on search and status filter
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          driver.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          driver.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const DriverListItem = ({ driver, isSelected }) => (
    <div
      onClick={() => handleDriverSelect(driver)}
      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 active:scale-98 ${
        isSelected 
          ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-sm' 
          : 'hover:bg-slate-50 border-transparent active:bg-slate-100'
      } border`}
    >
      <div className="flex items-center gap-3">
        <div className={`relative w-10 h-10 rounded-xl ${statusConfig[driver.status]?.bgLight} flex items-center justify-center flex-shrink-0`}>
          <User size={18} className={statusConfig[driver.status]?.text} />
          <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${statusConfig[driver.status]?.dotColor} ring-2 ring-white`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-semibold text-slate-800 truncate">{driver.name}</p>
            <div className="flex items-center gap-1 ml-2">
              <Star size={10} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium text-slate-600">{driver.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`px-1.5 py-0.5 rounded-full ${statusConfig[driver.status]?.bgMedium}`}>
              <p className={`text-[9px] font-bold ${statusConfig[driver.status]?.text}`}>
                {statusConfig[driver.status]?.label}
              </p>
            </div>
            {driver.vehicle && (
              <p className="text-[10px] text-slate-500 truncate">{driver.vehicle}</p>
            )}
          </div>
          
          {driver.currentDelivery && driver.status === "working" && (
            <p className="text-[10px] text-orange-600 truncate mt-1">
              📦 {driver.currentDelivery}
            </p>
          )}
        </div>
        
        <ChevronRight size={16} className={`flex-shrink-0 transition-transform ${isSelected ? 'text-orange-500 translate-x-0.5' : 'text-slate-300'}`} />
      </div>
    </div>
  );

  const DriverStatsCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl px-3 py-2 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center`}>
          <Icon size={14} className={color.replace('bg-', 'text-').replace('50', '600')} />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-800 leading-tight">{value}</p>
        </div>
      </div>
    </div>
  );

  // Floating Dialog Components
  const DriverListDialog = () => (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={() => setShowDriverList(false)}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 transform transition-transform duration-300 animate-slide-up max-h-[85vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-slate-800">Motoristas</p>
              <p className="text-xs text-slate-500 mt-0.5">{filteredDrivers.length} motoristas ativos</p>
            </div>
            <button
              onClick={() => setShowDriverList(false)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:bg-slate-200 transition-colors"
            >
              <X size={18} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar motorista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          
          <div className="flex gap-2">
            {["all", "online", "working", "offline"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  statusFilter === filter
                    ? `${
                        filter === "all" 
                          ? "bg-slate-800 text-white" 
                          : filter === "online"
                          ? "bg-green-500 text-white"
                          : filter === "working"
                          ? "bg-orange-500 text-white"
                          : "bg-slate-500 text-white"
                      }`
                    : "bg-slate-100 text-slate-600 active:bg-slate-200"
                }`}
              >
                {filter === "all" ? "Todos" : filter === "online" ? "Disponível" : filter === "working" ? "Em entrega" : "Offline"}
              </button>
            ))}
          </div>
        </div>

        {/* Drivers List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map(driver => (
              <DriverListItem
                key={driver.id}
                driver={driver}
                isSelected={selectedDriver?.id === driver.id}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Search size={24} className="text-slate-400" />
              </div>
              <p className="text-base font-medium text-slate-600">Nenhum motorista encontrado</p>
              <p className="text-sm text-slate-400 mt-1">Tente ajustar os filtros</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const DriverDetailsDialog = () => (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={() => setShowDriverDetails(false)}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 transform transition-transform duration-300 animate-slide-up max-h-[85vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{selectedDriver?.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={`px-2 py-0.5 rounded-full bg-white/20`}>
                    <p className="text-xs font-semibold text-white">
                      {statusConfig[selectedDriver?.status]?.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-white">{selectedDriver?.rating}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDriverDetails(false)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Contact Info */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Informações de Contato</p>
            
            {selectedDriver?.phone && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Phone size={18} className="text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Telefone</p>
                  <p className="text-sm font-medium text-slate-800">{selectedDriver.phone}</p>
                </div>
              </div>
            )}
            
            {selectedDriver?.email && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail size={18} className="text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-800">{selectedDriver.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Info */}
          {selectedDriver?.vehicle && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Veículo</p>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Car size={18} className="text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">{selectedDriver.vehicle}</p>
                  {selectedDriver.licensePlate && (
                    <p className="text-sm font-medium text-slate-800">{selectedDriver.licensePlate}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          {loadingAddress ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Localização Atual</p>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Loader2 size={18} className="text-slate-500 animate-spin" />
                <p className="text-sm text-slate-600">A carregar endereço...</p>
              </div>
            </div>
          ) : selectedDriverAddress ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Localização Atual</p>
              <div className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <MapPin size={18} className="text-slate-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 leading-relaxed">{selectedDriverAddress}</p>
              </div>
            </div>
          ) : selectedDriver?.position && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Coordenadas</p>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <MapPin size={18} className="text-slate-500" />
                <p className="text-sm font-mono text-slate-700">
                  {selectedDriver.position.lat.toFixed(6)}, {selectedDriver.position.lng.toFixed(6)}
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Estatísticas</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <Truck size={18} className="text-slate-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-slate-800">{selectedDriver?.ordersCount || 0}</p>
                <p className="text-xs text-slate-500">Total de entregas</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <Award size={18} className="text-amber-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-slate-800">{selectedDriver?.rating || 0}</p>
                <p className="text-xs text-slate-500">Avaliação média</p>
              </div>
            </div>
          </div>

          {/* Current Delivery */}
          {selectedDriver?.status === "working" && selectedDriver?.currentDelivery && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Entrega em andamento</p>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="flex items-start gap-2">
                  <Navigation size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-800">{selectedDriver.currentDelivery}</p>
                    {selectedDriver.eta && (
                      <p className="text-xs text-orange-600 mt-2 font-medium">
                        Tempo estimado: {selectedDriver.eta}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Last Seen */}
          {selectedDriver?.lastSeen && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <p className="text-xs text-slate-500">
                  Última atualização: {new Date(selectedDriver.lastSeen).toLocaleTimeString("pt-MZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={() => {
              if (selectedDriver?.position) {
                setMapCenter({ lat: selectedDriver.position.lat, lng: selectedDriver.position.lng });
                setMapZoom(16);
                if (mapRef.current) {
                  mapRef.current.panTo({ lat: selectedDriver.position.lat, lng: selectedDriver.position.lng });
                  mapRef.current.setZoom(16);
                }
              }
              setShowDriverDetails(false);
            }}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm active:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <Navigation size={16} />
            Centralizar no mapa
          </button>
          <button
            onClick={() => setShowDriverDetails(false)}
            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm active:bg-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );

  if (loadingDrivers) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Monitorização em Tempo Real</p>
            <p className="text-xs text-slate-400 mt-0.5">Localização dos motoristas</p>
          </div>
        </div>
        <div
          className="rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"
          style={{ height: 420 }}
        >
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            </div>
            <p className="text-sm font-medium text-slate-600">A carregar motoristas...</p>
            <p className="text-xs text-slate-400 mt-1">Aguarde um momento</p>
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
      {/* Header with stats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-base font-bold text-slate-800">Monitorização em Tempo Real</p>
            <p className="text-xs text-slate-400 mt-0.5">Acompanhe a localização dos motoristas</p>
          </div>
          <div className={`px-2 py-1 rounded-full flex items-center gap-1.5 ${connectedToSocket ? 'bg-green-50' : 'bg-slate-100'}`}>
            {connectedToSocket ? (
              <Wifi size={12} className="text-green-600" />
            ) : (
              <WifiOff size={12} className="text-slate-500" />
            )}
            <span className={`text-xs font-medium ${connectedToSocket ? 'text-green-700' : 'text-slate-600'}`}>
              {connectedToSocket ? "Tempo real" : "Polling"}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <DriverStatsCard
            icon={TrendingUp}
            label="Total"
            value={totalCount}
            color="bg-blue-50"
          />
          <DriverStatsCard
            icon={Car}
            label="Em entrega"
            value={workingCount}
            color="bg-orange-50"
          />
          <DriverStatsCard
            icon={User}
            label="Disponível"
            value={onlineCount}
            color="bg-green-50"
          />
        </div>
      </div>

      {/* Map Container */}
      <div className="rounded-xl overflow-hidden border border-slate-200 relative shadow-sm" style={{ height: 420 }}>
        {!isLoaded ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
              <p className="text-sm font-medium text-slate-600">A carregar mapa...</p>
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
              gestureHandling: "cooperative",
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ]
            }}
          >
            {activeDrivers.map(driver => (
              driver.position && (
                <Marker
                  key={driver.id}
                  position={{ lat: driver.position.lat, lng: driver.position.lng }}
                  icon={iconForStatus(driver.status)}
                  onClick={() => handleDriverSelect(driver)}
                  onMouseOver={() => setHoveredDriver(driver.id)}
                  onMouseOut={() => setHoveredDriver(null)}
                  animation={selectedDriver?.id === driver.id ? window.google?.maps?.Animation?.BOUNCE : undefined}
                >
                  {(hoveredDriver === driver.id && !showDriverDetails) && (
                    <InfoWindow 
                      options={{ pixelOffset: new window.google.maps.Size(0, -35) }}
                    >
                      <div className="px-2 py-1.5 max-w-[200px]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`w-7 h-7 rounded-full ${statusConfig[driver.status]?.bgMedium} flex items-center justify-center`}>
                            <User size={14} className={statusConfig[driver.status]?.text} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-800">{driver.name}</p>
                            <div className="flex items-center gap-1">
                              <Star size={10} className="text-amber-400 fill-amber-400" />
                              <span className="text-[10px] text-slate-500">{driver.rating}</span>
                              <span className="text-[10px] text-slate-300">•</span>
                              <span className="text-[10px] text-slate-500">{driver.ordersCount} entregas</span>
                            </div>
                          </div>
                        </div>
                        <p className={`text-[10px] font-medium ${statusConfig[driver.status]?.text} mb-1`}>
                          {statusConfig[driver.status]?.label}
                        </p>
                        {driver.vehicle && (
                          <p className="text-[10px] text-slate-500">{driver.vehicle}</p>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              )
            ))}
          </GoogleMap>
        )}

        {/* Map Controls */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <button
            type="button"
            onClick={handleFitAll}
            className="px-3 py-2 bg-white rounded-lg shadow-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all duration-200 flex items-center gap-1.5"
          >
            <Compass size={14} className="text-slate-500" />
            Ver todos
          </button>
         
          {/*** Leave this buttons here and commented
           * 
           *   <button
            type="button"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setZoom(mapRef.current.getZoom() + 1);
              }
            }}
            className="px-3 py-2 bg-white rounded-lg shadow-md border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all duration-200"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setZoom(mapRef.current.getZoom() - 1);
              }
            }}
            className="px-3 py-2 bg-white rounded-lg shadow-md border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all duration-200"
          >
            -
          </button>
           */}

        </div>

        {/* Floating Action Button for Driver List */}
        <button
          onClick={() => setShowDriverList(true)}
          className="absolute top-3 right-3 w-12 h-12 bg-orange-500 rounded-full shadow-lg flex items-center justify-center active:bg-orange-600 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <List size={20} className="text-white" />
        </button>

        {/* Mini legend on top */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-slate-100">
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs text-slate-600">{workingCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-slate-600">{onlineCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs text-slate-600">{totalCount - onlineCount - workingCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Dialogs */}
      {showDriverList && <DriverListDialog />}
      {showDriverDetails && <DriverDetailsDialog />}

      {/* Empty state */}
      {drivers.length === 0 && !loadingDrivers && (
        <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Car size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">Nenhum motorista disponível</p>
          <p className="text-xs text-slate-400 mt-1">Nenhum motorista com localização ativa no momento</p>
        </div>
      )}
    </div>
  );
};



export default GestorMap;