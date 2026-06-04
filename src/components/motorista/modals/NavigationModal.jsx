import { useState, useEffect, useRef, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { GoogleMap, Marker, DirectionsRenderer, InfoWindow } from "@react-google-maps/api";
import { useSocket } from "../../../contexts/SocketContext";
import Modal from "../../common/Modal";
import {
  X,
  Navigation,
  MapPin,
  Flag,
  Truck,
  Clock,
  Compass,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const GOOGLE_MAPS_KEY = "AIzaSyAt3JMQnStFWcbODF6HBHGck0IUseek_Ak";
const libraries = ["places"];

// Helper to normalize coordinates
const normalizeCoords = (coord) => {
  if (!coord) return null;
  if (Array.isArray(coord) && coord.length >= 2) {
    const lat = parseFloat(coord[0]);
    const lng = parseFloat(coord[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  if (typeof coord === 'object' && coord !== null) {
    const lat = parseFloat(coord.lat);
    const lng = parseFloat(coord.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  if (typeof coord === 'string') {
    try {
      let cleanString = coord.trim();
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
      const latMatch = coord.match(/lat["']?\s*:\s*([-\d.]+)/i);
      const lngMatch = coord.match(/lng["']?\s*:\s*([-\d.]+)/i);
      if (latMatch && lngMatch) {
        const lat = parseFloat(latMatch[1]);
        const lng = parseFloat(lngMatch[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
  }
  return null;
};

// Custom driver car icon
const getDriverCarIcon = () => {
  if (!window.google) return null;
  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    fillColor: "#3b82f6",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 1.5,
    anchor: new window.google.maps.Point(12, 12),
    rotation: 0
  };
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

const NavigationModal = ({ isOpen, onClose, order }) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_KEY, libraries });
  const { socket } = useSocket();
  const mapRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const watchIdRef = useRef(null);
  
  const [driverPosition, setDriverPosition] = useState(null);
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: -25.9653, lng: 32.5778 });
  const [zoom, setZoom] = useState(13);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [remainingDistance, setRemainingDistance] = useState(null);
  const [remainingDuration, setRemainingDuration] = useState(null);
  const [showStepDetails, setShowStepDetails] = useState(false);

  const isActive = order?.status === "in_transit" || order?.status === "Em entrega";

  // Extract coordinates from order
  useEffect(() => {
    if (!order) return;
    
    const origin = normalizeCoords(order.originCoords || order.pickupCoords);
    const dest = normalizeCoords(order.destCoords || order.dropoffCoords);
    
    setOriginCoords(origin);
    setDestCoords(dest);
    
    if (origin && dest) {
      const centerLat = (origin.lat + dest.lat) / 2;
      const centerLng = (origin.lng + dest.lng) / 2;
      setMapCenter({ lat: centerLat, lng: centerLng });
    }
  }, [order]);

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
              distanceValue: step.distance.value,
              duration: step.duration.text,
              durationValue: step.duration.value,
              lat: step.end_location.lat(),
              lng: step.end_location.lng()
            }))
          });
          setRemainingDistance(leg.distance?.text);
          setRemainingDuration(leg.duration?.text);
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

  // Get driver's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setDriverPosition(pos);
        setMapCenter(pos);
        
        // Send location to server via socket
        if (socket && order?.id) {
          socket.emit("order:location", { orderId: order.id, coords: pos });
        }
        
        // Update current step based on position
        updateCurrentStep(pos);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Não foi possível obter sua localização. Verifique as permissões.");
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  };

  // Start navigation (continuous location tracking)
  const startNavigation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada");
      return;
    }

    setIsNavigating(true);
    
    // Get initial position
    getCurrentLocation();
    
    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setDriverPosition(pos);
        
        // Update map center if navigating
        if (mapRef.current && isNavigating) {
          mapRef.current.panTo(pos);
        }
        
        // Send location to server
        if (socket && order?.id) {
          socket.emit("order:location", { orderId: order.id, coords: pos });
        }
        
        // Update current step based on position
        updateCurrentStep(pos);
        
        // Update remaining distance and duration
        updateRemainingInfo(pos);
      },
      (error) => {
        console.error("Error watching location:", error);
      },
      { enableHighAccuracy: true, maximumAge: 5000, distanceFilter: 10 }
    );
  };

  // Stop navigation
  const stopNavigation = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsNavigating(false);
  };

  // Update current step based on driver position
  const updateCurrentStep = (position) => {
    if (!routeInfo?.steps) return;
    
    for (let i = routeInfo.steps.length - 1; i >= 0; i--) {
      const step = routeInfo.steps[i];
      const stepLat = step.lat;
      const stepLng = step.lng;
      
      if (stepLat && stepLng) {
        const distance = getDistance(position, { lat: stepLat, lng: stepLng });
        if (distance < 50) { // Within 50 meters
          setCurrentStepIndex(i);
          break;
        }
      }
    }
  };

  // Update remaining distance and duration
  const updateRemainingInfo = (position) => {
    if (!routeInfo?.steps) return;
    
    let remainingDist = 0;
    let remainingDur = 0;
    let foundCurrent = false;
    
    for (let i = currentStepIndex; i < routeInfo.steps.length; i++) {
      const step = routeInfo.steps[i];
      if (!foundCurrent && i === currentStepIndex) {
        const stepPos = { lat: step.lat, lng: step.lng };
        const distanceToStep = getDistance(position, stepPos);
        const stepDistance = step.distanceValue;
        remainingDist += Math.max(0, stepDistance - distanceToStep);
        remainingDur += step.durationValue * (1 - (distanceToStep / stepDistance));
        foundCurrent = true;
      } else {
        remainingDist += step.distanceValue;
        remainingDur += step.durationValue;
      }
    }
    
    setRemainingDistance(formatDistance(remainingDist));
    setRemainingDuration(formatDuration(remainingDur));
  };

  // Calculate distance between two points in meters
  const getDistance = (point1, point2) => {
    const R = 6371000; // meters
    const lat1 = point1.lat * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
    const deltaLon = (point2.lng - point1.lng) * Math.PI / 180;
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds) => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
      }
      return `${minutes} min`;
    }
    return `${Math.round(seconds)} seg`;
  };

  // Center map on driver
  const centerOnDriver = () => {
    if (mapRef.current && driverPosition) {
      mapRef.current.panTo(driverPosition);
      mapRef.current.setZoom(16);
    }
  };

  // Fit bounds to show full route
  const fitBounds = () => {
    if (mapRef.current && window.google && originCoords && destCoords) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(originCoords);
      bounds.extend(destCoords);
      if (driverPosition) bounds.extend(driverPosition);
      mapRef.current.fitBounds(bounds);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const mapElement = mapRef.current?.getDiv();
    if (mapElement) {
      if (!isFullscreen) {
        mapElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Simulate voice instruction (text-to-speech)
  const speakInstruction = (instruction) => {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(instruction);
    utterance.lang = "pt-BR";
    window.speechSynthesis.speak(utterance);
  };

  // Get next instruction
  const getNextInstruction = () => {
    if (routeInfo?.steps && currentStepIndex < routeInfo.steps.length) {
      const step = routeInfo.steps[currentStepIndex];
      const cleanInstruction = step.instruction.replace(/<[^>]*>/g, '');
      return {
        instruction: cleanInstruction,
        distance: step.distance,
        duration: step.duration
      };
    }
    return null;
  };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    fitBounds();
  }, [fitBounds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!isOpen || !order) return null;

  const currentInstruction = getNextInstruction();
  const DriverIcon = getDriverCarIcon();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Navegação">
      <div className="space-y-4">
        {/* Map */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-100" style={{ height: 450 }}>
          {!isLoaded ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-2" />
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
                  gestureHandling: 'greedy'
                }}
              >
                {/* Route */}
                {directions && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      polylineOptions: {
                        strokeColor: isNavigating ? "#f97316" : "#94a3b8",
                        strokeWeight: 5,
                        strokeOpacity: 0.8,
                      },
                      suppressMarkers: true,
                      preserveViewport: true
                    }}
                  />
                )}

                {/* Origin Marker */}
                {originCoords && (
                  <Marker
                    position={originCoords}
                    icon={createMarkerIcon("#10b981", 10)}
                    onClick={() => setSelectedMarker('origin')}
                  >
                    {selectedMarker === 'origin' && (
                      <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                        <div className="p-2">
                          <p className="font-semibold text-sm text-emerald-600 flex items-center gap-1">
                            <MapPin size={14} /> Origem
                          </p>
                          <p className="text-xs text-slate-600 mt-1">{order.origin || order.pickupLocation}</p>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                )}

                {/* Destination Marker */}
                {destCoords && (
                  <Marker
                    position={destCoords}
                    icon={createMarkerIcon("#ef4444", 10)}
                    onClick={() => setSelectedMarker('destination')}
                  >
                    {selectedMarker === 'destination' && (
                      <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                        <div className="p-2">
                          <p className="font-semibold text-sm text-red-600 flex items-center gap-1">
                            <Flag size={14} /> Destino
                          </p>
                          <p className="text-xs text-slate-600 mt-1">{order.dest || order.dropoffLocation}</p>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                )}

                {/* Driver Marker */}
                {driverPosition && DriverIcon && (
                  <Marker
                    position={driverPosition}
                    icon={DriverIcon}
                    onClick={() => setSelectedMarker('driver')}
                  >
                    {selectedMarker === 'driver' && (
                      <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                        <div className="p-2">
                          <p className="font-semibold text-sm text-blue-600 flex items-center gap-1">
                            <Truck size={14} /> Sua posição
                          </p>
                          <p className="text-xs text-slate-600 mt-1">Você está aqui</p>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                )}
              </GoogleMap>

              {/* Map Controls Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={fitBounds}
                    className="w-9 h-9 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-orange-600 transition-colors"
                    title="Ver rota completa"
                  >
                    <Compass size={18} />
                  </button>
                  {driverPosition && (
                    <button
                      onClick={centerOnDriver}
                      className="w-9 h-9 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors"
                      title="Centralizar no veículo"
                    >
                      <Navigation size={18} />
                    </button>
                  )}
                  <button
                    onClick={toggleFullscreen}
                    className="w-9 h-9 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-700 transition-colors"
                    title={isFullscreen ? "Sair do modo tela cheia" : "Tela cheia"}
                  >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-9 h-9 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-700 transition-colors"
                    title={isMuted ? "Ativar voz" : "Desativar voz"}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          {/* Current Instruction */}
          {isNavigating && currentInstruction && (
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Próxima instrução
                </p>
                <button
                  onClick={() => speakInstruction(currentInstruction.instruction)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Volume2 size={14} />
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {currentInstruction.instruction}
              </p>
              <div className="flex gap-3 mt-2">
                <span className="text-xs text-slate-500">{currentInstruction.distance}</span>
                <span className="text-xs text-slate-500">{currentInstruction.duration}</span>
              </div>
            </div>
          )}

          {/* Navigation Stats */}
          {isNavigating && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-slate-400">Distância restante</p>
                <p className="text-lg font-bold text-blue-600">{remainingDistance || routeInfo?.distance}</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-slate-400">Tempo restante</p>
                <p className="text-lg font-bold text-green-600">{remainingDuration || routeInfo?.duration}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isNavigating ? (
              <>
                <button
                  onClick={getCurrentLocation}
                  className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation size={16} />
                  Obter Localização
                </button>
                <button
                  onClick={startNavigation}
                  disabled={!driverPosition && !originCoords}
                  className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  Iniciar Navegação
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={stopNavigation}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Pause size={16} />
                  Parar Navegação
                </button>
                <button
                  onClick={() => {
                    setCurrentStepIndex(0);
                    getCurrentLocation();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} />
                  Reiniciar
                </button>
              </>
            )}
          </div>

          {/* Step Details Toggle */}
          {routeInfo && (
            <button
              onClick={() => setShowStepDetails(!showStepDetails)}
              className="w-full py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
            >
              <AlertCircle size={12} />
              {showStepDetails ? "Ocultar passos" : "Ver todos os passos"}
            </button>
          )}

          {/* Step Details */}
          {showStepDetails && routeInfo && (
            <div className="bg-white rounded-lg p-3 border border-slate-200 max-h-48 overflow-y-auto">
              <p className="text-xs font-semibold text-slate-500 mb-2">Passos da rota:</p>
              <div className="space-y-2">
                {routeInfo.steps.map((step, idx) => (
                  <div key={idx} className={`text-xs p-2 rounded-lg ${idx === currentStepIndex ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${idx === currentStepIndex ? 'bg-blue-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div dangerouslySetInnerHTML={{ __html: step.instruction }} />
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] text-slate-400">{step.distance}</span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[10px] text-slate-400">{step.duration}</span>
                        </div>
                      </div>
                      {idx === currentStepIndex && (
                        <ArrowRight size={12} className="text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Pedido #{order.id?.slice(-8).toUpperCase()}</p>
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                isActive ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
              }`}>
                <Clock size={10} />
                <span>{order.status}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-400">Valor: {order.total} MZN</p>
              <button onClick={onClose} className="text-xs text-orange-500 font-semibold hover:text-orange-600">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NavigationModal;