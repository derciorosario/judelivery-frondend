import { useState, useEffect, useRef, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { GoogleMap, Marker, DirectionsRenderer, InfoWindow } from "@react-google-maps/api";
import { useSocket } from "../../../contexts/SocketContext";
import {
  X,
  Truck,
  Clock,
  Check,
  Calendar,
  Package,
  Map,
  Navigation,
  MapPin,
  Flag,
  User,
  Loader2,
  LocateFixed,
  Route,
  Phone,
  ChevronUp
} from "lucide-react";

const GOOGLE_MAPS_KEY = "AIzaSyAt3JMQnStFWcbODF6HBHGck0IUseek_Ak";
const MAPUTO_CENTER = { lat: -25.9653, lng: 32.5778 };
const libraries = ["places"];

// Helper function to parse coordinates
const parseCoords = (coords) => {
  if (!coords) return null;
  
  if (typeof coords === 'object' && coords !== null) {
    const lat = parseFloat(coords.lat);
    const lng = parseFloat(coords.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
    return null;
  }
  
  if (typeof coords === 'string') {
    try {
      let cleanString = coords.trim();
      if (cleanString.startsWith('"') && cleanString.endsWith('"')) {
        cleanString = cleanString.slice(1, -1);
      }
      cleanString = cleanString.replace(/\\"/g, '"');
      
      const parsed = JSON.parse(cleanString);
      if (parsed && typeof parsed === 'object') {
        const lat = parseFloat(parsed.lat);
        const lng = parseFloat(parsed.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    } catch (e) {
      const latMatch = coords.match(/lat["']?\s*:\s*([-\d.]+)/i);
      const lngMatch = coords.match(/lng["']?\s*:\s*([-\d.]+)/i);
      if (latMatch && lngMatch) {
        const lat = parseFloat(latMatch[1]);
        const lng = parseFloat(lngMatch[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
  }
  
  if (Array.isArray(coords) && coords.length >= 2) {
    const lat = parseFloat(coords[0]);
    const lng = parseFloat(coords[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  
  return null;
};

// Custom marker icons
const createMarkerIcon = (color, scale = 8) => {
  if (!window.google) return null;
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: scale,
    anchor: new window.google.maps.Point(0, 0)
  };
};

// Car icon for driver
const getDriverCarIcon = () => {
  if (!window.google) return null;
  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    fillColor: "#3b82f6",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 1.5,
    anchor: new window.google.maps.Point(12, 12)
  };
};

// Motorcycle icon for driver (alternative)
const getDriverMotoIcon = () => {
  if (!window.google) return null;
  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    fillColor: "#f59e0b",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 1.3,
    anchor: new window.google.maps.Point(12, 12)
  };
};

const TrackOrderModal = ({ isOpen, onClose, order }) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_KEY, libraries });
  const { socket } = useSocket();
  const mapRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const geocoderRef = useRef(null);
  const mapContainerRef = useRef(null);
  const routeDetailsRef = useRef(null);
  const driverInfoRef = useRef(null);
  
  const [driverPosition, setDriverPosition] = useState(null);
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [originAddress, setOriginAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectedToSocket, setConnectedToSocket] = useState(false);
  const [requestedInitialLocation, setRequestedInitialLocation] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(MAPUTO_CENTER);
  const [zoom, setZoom] = useState(13);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingDriverLocation, setLoadingDriverLocation] = useState(false);
  const [useMotoIcon, setUseMotoIcon] = useState(false); // Toggle between car and moto

  const isDelivery = order?.serviceType !== "taxi";
  
  // Scroll to element function
  const scrollToElement = (elementRef, offset = 80) => {
    if (elementRef.current) {
      const elementPosition = elementRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Scroll to map
  const scrollToMap = () => {
    if (mapContainerRef.current) {
      scrollToElement(mapContainerRef, 80);
    }
  };

  // Handle show route details with scroll
  const handleShowRouteDetails = () => {
    setShowRouteDetails(!showRouteDetails);
    if (!showRouteDetails) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        if (routeDetailsRef.current) {
          scrollToElement(routeDetailsRef, 80);
        }
      }, 100);
    }
  };

  // Handle locate driver with scroll
  const handleLocateDriver = () => {
    if (driverPosition) {
      centerOnDriver();
      scrollToMap();
    }
  };
  
  const displayStatus = order?.status
    ? (s => {
        if (s === "in_transit") return { text: "Em entrega", color: "bg-blue-100 text-blue-700", icon: Truck };
        if (s === "pending_approval") return { text: "Aguardando aprovação", color: "bg-amber-100 text-amber-700", icon: Clock };
        if (s === "completed") return { text: "Concluído", color: "bg-green-100 text-green-700", icon: Check };
        if (s === "cancelled") return { text: "Cancelado", color: "bg-red-100 text-red-700", icon: X };
        if (s === "approved") return { text: "Aprovado", color: "bg-emerald-100 text-emerald-700", icon: Check };
        if (s === "scheduled") return { text: "Agendado", color: "bg-purple-100 text-purple-700", icon: Calendar };
        return { text: s, color: "bg-slate-100 text-slate-700", icon: Package };
      })(order.status)
    : { text: order?.statusCode || "Processando", color: "bg-slate-100 text-slate-700", icon: Package };

  // Get address from coordinates
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

  // Extract coordinates from order
  useEffect(() => {
    if (!order) return;

    if (isDelivery) {
      const originCoordsData = parseCoords(order.originCoords);
      const destCoordsData = parseCoords(order.destCoords);
      
      setOriginCoords(originCoordsData);
      setDestCoords(destCoordsData);
      
      if (order.origin && order.origin !== "null" && order.origin !== "undefined") {
        setOriginAddress(order.origin);
      } else if (originCoordsData) {
        setLoadingAddress(true);
        getAddressFromCoords(originCoordsData).then(address => {
          if (address) setOriginAddress(address);
          setLoadingAddress(false);
        });
      }
      
      if (order.dest && order.dest !== "null" && order.dest !== "undefined") {
        setDestAddress(order.dest);
      } else if (destCoordsData) {
        setLoadingAddress(true);
        getAddressFromCoords(destCoordsData).then(address => {
          if (address) setDestAddress(address);
          setLoadingAddress(false);
        });
      }
    } else {
      const pickupCoords = parseCoords(order.pickupCoords);
      const dropoffCoords = parseCoords(order.dropoffCoords);
      
      setOriginCoords(pickupCoords);
      setDestCoords(dropoffCoords);
      
      if (order.pickupLocation && order.pickupLocation !== "null" && order.pickupLocation !== "undefined") {
        setOriginAddress(order.pickupLocation);
      } else if (pickupCoords) {
        setLoadingAddress(true);
        getAddressFromCoords(pickupCoords).then(address => {
          if (address) setOriginAddress(address);
          setLoadingAddress(false);
        });
      }
      
      if (order.dropoffLocation && order.dropoffLocation !== "null" && order.dropoffLocation !== "undefined") {
        setDestAddress(order.dropoffLocation);
      } else if (dropoffCoords) {
        setLoadingAddress(true);
        getAddressFromCoords(dropoffCoords).then(address => {
          if (address) setDestAddress(address);
          setLoadingAddress(false);
        });
      }
    }
  }, [order, isDelivery, getAddressFromCoords]);

  // Calculate route
  const calculateRoute = useCallback(() => {
    if (!isLoaded || !window.google || !originCoords || !destCoords) return;

    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
    }

    directionsServiceRef.current.route(
      {
        origin: new window.google.maps.LatLng(originCoords.lat, originCoords.lng),
        destination: new window.google.maps.LatLng(destCoords.lat, destCoords.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
          const route = result.routes[0];
          const leg = route.legs[0];
          setRouteInfo({
            distance: leg.distance?.text,
            distanceValue: leg.distance?.value,
            duration: leg.duration?.text,
            durationValue: leg.duration?.value,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            steps: leg.steps.map(step => ({
              instruction: step.instructions,
              distance: step.distance.text,
              duration: step.duration.text
            }))
          });
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [isLoaded, originCoords, destCoords]);

  useEffect(() => {
    if (originCoords && destCoords) {
      calculateRoute();
    }
  }, [originCoords, destCoords, calculateRoute]);

  // Socket events
  useEffect(() => {
    if (socket && isOpen && order?.id) {
      socket.emit("join:tracking", order.id);
      setConnectedToSocket(true);
      setRequestedInitialLocation(false);
      setDriverPosition(null);
      setLoadingDriverLocation(true);

      socket.on("order:location:updated", (data) => {
        if (data.orderId === order.id || data.orderId === order._id) {
          const newPosition = { lat: data.coords.lat, lng: data.coords.lng };
          setDriverPosition(newPosition);
          setLastUpdate(new Date());
          setLoadingDriverLocation(false);
        }
      });

      socket.on("order:location:initial", (data) => {
        if (data.orderId === order.id || data.orderId === order._id) {
          if (data.location) {
            const parsedLocation = parseCoords(data.location);
            if (parsedLocation) {
              setDriverPosition(parsedLocation);
            }
            if (data.lastUpdate) {
              setLastUpdate(new Date(data.lastUpdate));
            }
          }
          setRequestedInitialLocation(true);
          setLoadingDriverLocation(false);
        }
      });

      socket.emit("order:location:request", order.id);

      const timeout = setTimeout(() => {
        setLoadingDriverLocation(false);
        setRequestedInitialLocation(true);
      }, 5000);

      return () => {
        socket.off("order:location:updated");
        socket.off("order:location:initial");
        socket.emit("leave:tracking", order.id);
        setConnectedToSocket(false);
        setRequestedInitialLocation(false);
        clearTimeout(timeout);
      };
    }
  }, [socket, isOpen, order?.id, order?._id]);

  // Fit bounds
  const fitBounds = useCallback(() => {
    if (mapRef.current && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasPoints = false;
      
      if (originCoords) {
        bounds.extend(new window.google.maps.LatLng(originCoords.lat, originCoords.lng));
        hasPoints = true;
      }
      if (destCoords) {
        bounds.extend(new window.google.maps.LatLng(destCoords.lat, destCoords.lng));
        hasPoints = true;
      }
      if (driverPosition) {
        bounds.extend(new window.google.maps.LatLng(driverPosition.lat, driverPosition.lng));
        hasPoints = true;
      }
      
      if (hasPoints) {
        mapRef.current.fitBounds(bounds);
        setTimeout(() => {
          const currentZoom = mapRef.current.getZoom();
          if (currentZoom > 15) {
            mapRef.current.setZoom(15);
          }
        }, 100);
      } else if (originCoords) {
        mapRef.current.setCenter(new window.google.maps.LatLng(originCoords.lat, originCoords.lng));
        mapRef.current.setZoom(13);
      }
    }
  }, [originCoords, destCoords, driverPosition]);

  const centerOnDriver = () => {
    if (mapRef.current && driverPosition) {
      mapRef.current.panTo(new window.google.maps.LatLng(driverPosition.lat, driverPosition.lng));
      mapRef.current.setZoom(15);
    }
  };

  const centerOnOrigin = () => {
    if (mapRef.current && originCoords) {
      mapRef.current.panTo(new window.google.maps.LatLng(originCoords.lat, originCoords.lng));
      mapRef.current.setZoom(16);
    }
  };

  const centerOnDestination = () => {
    if (mapRef.current && destCoords) {
      mapRef.current.panTo(new window.google.maps.LatLng(destCoords.lat, destCoords.lng));
      mapRef.current.setZoom(16);
    }
  };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    fitBounds();
  }, [fitBounds]);

  useEffect(() => {
    if (mapRef.current && (originCoords || destCoords || driverPosition)) {
      fitBounds();
    }
  }, [originCoords, destCoords, driverPosition, fitBounds]);

  const calculateProgress = useCallback(() => {
    if (!driverPosition || !originCoords || !routeInfo?.distanceValue) return 0;
    
    const R = 6371;
    const toRad = (value) => value * Math.PI / 180;
    
    const lat1 = toRad(originCoords.lat);
    const lat2 = toRad(driverPosition.lat);
    const deltaLat = toRad(driverPosition.lat - originCoords.lat);
    const deltaLon = toRad(driverPosition.lng - originCoords.lng);
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const traveledDistance = R * c;
    
    const progress = (traveledDistance / (routeInfo.distanceValue / 1000)) * 100;
    return Math.min(100, Math.max(0, progress));
  }, [driverPosition, originCoords, routeInfo]);

  if (!isOpen || !order) return null;

  const showRecenter = driverPosition || originCoords;
  const showLoading = !driverPosition && !requestedInitialLocation && loadingDriverLocation;
  const estimatedProgress = calculateProgress();
  const StatusIcon = displayStatus.icon;
  const DriverIcon = useMotoIcon ? getDriverMotoIcon() : getDriverCarIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${displayStatus.color.split(' ')[0]} flex items-center justify-center`}>
              <StatusIcon size={20} className={displayStatus.color.split(' ')[1]} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Acompanhar Pedido</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                #{order.id ? order.id.slice(-8).toUpperCase() : "PEDIDO"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseMotoIcon(!useMotoIcon)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              title="Alternar ícone do motorista"
            >
              {useMotoIcon ? <Truck size={16} /> : <Navigation size={16} />}
            </button>
            <div className={`w-2 h-2 rounded-full ${connectedToSocket ? "bg-green-500 animate-pulse" : "bg-slate-300"}`} 
                 title={connectedToSocket ? "Atualizações em tempo real" : "Desconectado"} />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Map Section - Fixed height percentage */}
          <div ref={mapContainerRef} className="relative bg-slate-100" style={{ height: '45vh', minHeight: 320, maxHeight: 400 }}>
            {!isLoaded ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">A carregar mapa...</p>
                </div>
              </div>
            ) : (
              <>
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={mapCenter}
                  zoom={zoom}
                  onLoad={onMapLoad}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    gestureHandling: 'cooperative'
                  }}
                >
                  {directions && (
                    <DirectionsRenderer
                      directions={directions}
                      options={{
                        polylineOptions: {
                          strokeColor: "#3b82f6",
                          strokeWeight: 5,
                          strokeOpacity: 0.8,
                        },
                        suppressMarkers: true,
                        preserveViewport: true
                      }}
                    />
                  )}

                  {originCoords && (
                    <Marker
                      position={new window.google.maps.LatLng(originCoords.lat, originCoords.lng)}
                      icon={createMarkerIcon("#10b981", 10)}
                      onClick={() => setSelectedMarker('origin')}
                    >
                      {selectedMarker === 'origin' && (
                        <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                          <div className="p-2 max-w-xs">
                            <p className="font-semibold text-sm text-emerald-600 flex items-center gap-1">
                              <MapPin size={14} /> Ponto de Partida
                            </p>
                            <p className="text-xs text-slate-600 mt-1 break-words">
                              {originAddress || "Localização de partida"}
                            </p>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  )}

                  {destCoords && (
                    <Marker
                      position={new window.google.maps.LatLng(destCoords.lat, destCoords.lng)}
                      icon={createMarkerIcon("#ef4444", 10)}
                      onClick={() => setSelectedMarker('destination')}
                    >
                      {selectedMarker === 'destination' && (
                        <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                          <div className="p-2 max-w-xs">
                            <p className="font-semibold text-sm text-red-600 flex items-center gap-1">
                              <Flag size={14} /> Ponto de Chegada
                            </p>
                            <p className="text-xs text-slate-600 mt-1 break-words">
                              {destAddress || "Localização de destino"}
                            </p>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  )}

                  {driverPosition && DriverIcon && (
                    <Marker
                      position={new window.google.maps.LatLng(driverPosition.lat, driverPosition.lng)}
                      icon={DriverIcon}
                      onClick={() => setSelectedMarker('driver')}
                    >
                      {selectedMarker === 'driver' && (
                        <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                          <div className="p-2 max-w-xs">
                            <p className="font-semibold text-sm text-blue-600 flex items-center gap-1">
                              <Truck size={14} /> Motorista
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                              {order.driver?.name || "Em deslocação"}
                            </p>
                            {lastUpdate && (
                              <p className="text-xs text-slate-400 mt-1">
                                Última atualização: {lastUpdate.toLocaleTimeString("pt-MZ")}
                              </p>
                            )}
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  )}
                </GoogleMap>

                {/* Map Controls */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between gap-2">
                  <div className="flex gap-2">
                    {showRecenter && (
                      <>
                        <button
                          type="button"
                          onClick={fitBounds}
                          className="w-9 h-9 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-orange-600 transition-colors"
                          title="Ajustar mapa para ver toda a rota"
                        >
                          <Map size={18} />
                        </button>
                        {driverPosition && (
                          <button
                            type="button"
                            onClick={handleLocateDriver}
                            className="w-9 h-9 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors"
                            title="Centralizar no motorista"
                          >
                            <LocateFixed size={18} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={centerOnOrigin}
                          className="w-9 h-9 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-emerald-600 hover:text-emerald-700 transition-colors"
                          title="Centralizar na origem"
                        >
                          <MapPin size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={centerOnDestination}
                          className="w-9 h-9 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-red-600 hover:text-red-700 transition-colors"
                          title="Centralizar no destino"
                        >
                          <Flag size={18} />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {routeInfo && (
                    <button
                      type="button"
                      onClick={handleShowRouteDetails}
                      className="px-3 py-2 bg-white rounded-lg shadow-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                    >
                      <Route size={14} />
                      {showRouteDetails ? "Ocultar rota" : "Ver rota"}
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                {driverPosition && routeInfo && (
                  <div className="absolute top-3 left-3 right-3">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">Progresso da entrega</span>
                        <span className="font-semibold text-blue-600">{Math.round(estimatedProgress)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${estimatedProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Driver Location Loading Indicator */}
                {showLoading && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-2">
                      <Loader2 size={14} className="text-blue-500 animate-spin" />
                      <span className="text-xs text-slate-600">A carregar localização...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Order Details Section */}
          <div className="p-4 space-y-4">
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${displayStatus.color}`}>
              <StatusIcon size={14} />
              <span className="text-xs font-semibold">{displayStatus.text}</span>
            </div>

            {/* Price and Basic Info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Valor total</p>
                <p className="text-2xl font-bold text-orange-500">{order.total} MZN</p>
              </div>
              {routeInfo && (
                <div className="text-right">
                  <p className="text-xs text-slate-400">Distância / Duração</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {routeInfo.distance} • {routeInfo.duration}
                  </p>
                </div>
              )}
            </div>

            {/* Route Details Panel */}
            {showRouteDetails && routeInfo && (
              <div ref={routeDetailsRef} className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                    <Route size={12} /> Detalhes da Rota
                  </h4>
                  <button
                    onClick={() => setShowRouteDetails(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {routeInfo.steps.map((step, idx) => (
                    <div key={idx} className="text-xs text-slate-600 pb-2 border-b border-slate-200 last:border-0">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div dangerouslySetInnerHTML={{ __html: step.instruction }} />
                          <div className="flex gap-3 mt-1">
                            <span className="text-[10px] text-slate-400">{step.distance}</span>
                            <span className="text-[10px] text-slate-400">{step.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Addresses */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Partida</p>
                  {loadingAddress ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Loader2 size={12} className="text-emerald-500 animate-spin" />
                      <p className="text-xs text-slate-500">A carregar endereço...</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-slate-700 font-medium break-words">
                        {originAddress || "Endereço não disponível"}
                      </p>
                      {originCoords && !originAddress && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Coord: {originCoords.lat.toFixed(5)}, {originCoords.lng.toFixed(5)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Flag size={14} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Chegada</p>
                  {loadingAddress ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Loader2 size={12} className="text-red-500 animate-spin" />
                      <p className="text-xs text-slate-500">A carregar endereço...</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-slate-700 font-medium break-words">
                        {destAddress || "Endereço não disponível"}
                      </p>
                      {destCoords && !destAddress && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Coord: {destCoords.lat.toFixed(5)}, {destCoords.lng.toFixed(5)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Driver Info */}
            {(order.driver || driverPosition) && (
              <div ref={driverInfoRef} className="border-t border-slate-100 pt-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Motorista</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {typeof order.driver === 'string' ? order.driver : order.driver?.name || "Motorista atribuído"}
                    </p>
                    {driverPosition && (
                      <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Em movimento
                      </p>
                    )}
                    {showLoading && !driverPosition && (
                      <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" />
                        A aguardar localização...
                      </p>
                    )}
                  </div>
                  {driverPosition && (
                    <button
                      onClick={handleLocateDriver}
                      className="px-3 py-1.5 bg-blue-50 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1"
                    >
                      <LocateFixed size={12} />
                      Localizar
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Order Details */}
            {isDelivery && order?.productName && (
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-400 mb-1">Produto</p>
                <p className="text-sm text-slate-700">
                  {order.productName} {order.quantity > 1 && `(x${order.quantity})`}
                </p>
              </div>
            )}

            {!isDelivery && order?.passengerCount && (
              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400">Passageiros</p>
                    <p className="text-sm text-slate-700">{order.passengerCount} pessoa(s)</p>
                  </div>
                  {order.hasLuggage && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Package size={12} />
                      <span>Com bagagem</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {order?.instructions && (
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-400 mb-1">Instruções especiais</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                  "{order.instructions}"
                </p>
              </div>
            )}

            {/* Contact Info */}
            {(order.contactOrigin || order.contactDest) && (
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-400 mb-2">Contactos</p>
                <div className="space-y-1">
                  {order.contactOrigin && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={12} className="text-slate-400" />
                      <span>Origem: {order.contactOrigin}</span>
                    </div>
                  )}
                  {order.contactDest && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={12} className="text-slate-400" />
                      <span>Destino: {order.contactDest}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Last Update */}
            {lastUpdate && (
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={12} />
                  <p className="text-xs">
                    Última atualização: {lastUpdate.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </p>
                </div>
              </div>
            )}

            {/* Scroll to top button */}
            <button
              onClick={() => scrollToMap()}
              className="fixed bottom-20 right-4 w-10 h-10 bg-orange-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-orange-600 transition-colors z-20"
              title="Voltar ao mapa"
            >
              <ChevronUp size={20} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderModal;