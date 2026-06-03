import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";
import { useJsApiLoader } from "@react-google-maps/api";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import Icon from "../common/Icon";

const GOOGLE_MAPS_KEY = "AIzaSyAt3JMQnStFWcbODF6HBHGck0IUseek_Ak";
const MAPUTO_CENTER = { lat: -25.9653, lng: 32.5778 };
const libraries = ["places"];

const mapContainerStyle = { width: "100%", height: "100%" };
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

const MotoristaMap = ({ online, onToggleOnline }) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_KEY, libraries });
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const [position, setPosition] = useState(null);
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showStatus, setShowStatus] = useState(true);
  const [locationName, setLocationName] = useState(null);
  const [isFetchingLocationName, setIsFetchingLocationName] = useState(false);
  const watchIdRef = useRef(null);
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(MAPUTO_CENTER);
  const geocoderRef = useRef(null);

  // Initialize geocoder when Google Maps is loaded
  useEffect(() => {
    if (isLoaded && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  // Function to get location name from coordinates
  const getLocationName = async (lat, lng) => {
    if (!geocoderRef.current) return null;
    
    setIsFetchingLocationName(true);
    try {
      const response = await geocoderRef.current.geocode({
        location: { lat, lng }
      });
      
      if (response.results && response.results.length > 0) {
        // Get the most specific address (first result)
        const address = response.results[0].formatted_address;
        // Alternatively, get a shorter version (street name + area)
        const shortAddress = response.results[0].address_components?.reduce((acc, component) => {
          const types = component.types;
          if (types.includes('route') || types.includes('sublocality') || types.includes('neighborhood')) {
            return acc ? `${acc}, ${component.long_name}` : component.long_name;
          }
          return acc;
        }, '') || address;
        
        return { full: address, short: shortAddress };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    } finally {
      setIsFetchingLocationName(false);
    }
  };

  // Update location name whenever position changes
  useEffect(() => {
    if (position && isLoaded && geocoderRef.current) {
      getLocationName(position.lat, position.lng).then(name => {
        if (name) {
          setLocationName(name);
        }
      });
    }
  }, [position, isLoaded]);

  // Handle centering when location is available or status changes
  const centerToCurrentLocation = () => {
    if (position) {
      setMapCenter(position);
      // Also pan the map if map instance is available
      if (mapRef.current) {
        mapRef.current.panTo(position);
      }
    }
  };

  const centerToMaputo = () => {
    setMapCenter(MAPUTO_CENTER);
    if (mapRef.current) {
      mapRef.current.panTo(MAPUTO_CENTER);
    }
  };

  useEffect(() => {
    if (!online || !navigator.geolocation) return;

    const watchSuccess = (pos) => {
      const { latitude, longitude, heading, accuracy } = pos.coords;
      const coords = { lat: latitude, lng: longitude };
      setPosition(coords);
      setHeading(heading || 0);
      setAccuracy(accuracy);
      setLastUpdate(new Date());
      
      // Center to current location when we first get position while online
      if (online && (!mapCenter || (mapCenter === MAPUTO_CENTER && !position))) {
        setMapCenter(coords);
        if (mapRef.current) {
          mapRef.current.panTo(coords);
        }
      }

      if (socket && connected) {
        socket.emit("driver:location", coords);
      }
    };

    const watchError = (err) => {
      console.error("Geolocation watch error:", err);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      watchSuccess,
      watchError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [online, socket, connected]);

  // Center when online status changes
  useEffect(() => {
    if (online && position) {
      // When switching ON: center to current position
      setMapCenter(position);
      if (mapRef.current) {
        mapRef.current.panTo(position);
      }
    } else if (!online) {
      // When switching OFF: center to Maputo
      centerToMaputo();
    }
  }, [online, position]);

  useEffect(() => {
    if (!socket || !connected || !user) return;

    socket.emit("driver:status", online ? "online" : "offline");

    const handleStatusAck = (data) => {
      if (data.driverId === user.id || data.driverId === user.userId) {
        console.log("Status sync:", data.status);
      }
    };

    socket.on("driver:status:updated", handleStatusAck);
    return () => socket.off("driver:status:updated", handleStatusAck);
  }, [socket, connected, online, user]);

  const center = mapCenter;

  // Handle map load to store reference
  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${connected && online ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
          <div>
            <p className="text-xs font-bold text-slate-800">
              {connected && online ? "A partilhar localização" : "Sem partilha"}
            </p>
            <p className="text-[10px] text-slate-500">
              {lastUpdate
                ? `Atualizado ${lastUpdate.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                : "A aguardar GPS..."}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (onToggleOnline) {
              onToggleOnline(!online);
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            online ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {online ? "Parar" : "Ativar"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative" style={{ height: "60vh" }}>
        {!isLoaded ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-xs text-slate-500">A carregar mapa...</p>
            </div>
          </div>
        ) : !position ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-xs text-slate-500">A obter localização GPS...</p>
              <p className="text-[10px] text-slate-400 mt-1">Verifique as permissões do navegador</p>
            </div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={16}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            <Marker
              position={position}
              title={user?.name || "Motorista"}
              icon={{
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                fillColor: online ? "#22c55e" : "#94a3b8",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
                scale: 2.5,
                anchor: new window.google.maps.Point(12, 24),
              }}
            />
            {showStatus && position && (
              <InfoWindow position={position} onCloseClick={() => setShowStatus(false)}>
                <div className="text-xs">
                  <p className="font-bold text-slate-800">{user?.name || "Motorista"}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {online ? "🟢 Online" : "🔴 Offline"}
                  </p>
                  {locationName && (
                    <p className="text-[10px] text-slate-600 mt-0.5 max-w-[200px]">
                      📍 {locationName.short || locationName.full}
                    </p>
                  )}
                  {accuracy && (
                    <p className="text-[10px] text-slate-400">
                      Precisão: ±{Math.round(accuracy)}m
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}

        {position && (
          <button
            type="button"
            onClick={centerToCurrentLocation}
            className="absolute bottom-4 left-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-orange-600 hover:border-orange-300 transition-colors"
            title="Centralizar na minha localização"
          >
            <Icon name="navigation" size={20} />
          </button>
        )}
      </div>

      {position && (
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
          {isFetchingLocationName && !locationName ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full" />
              <p className="text-[10px] text-slate-500">A obter localização...</p>
            </div>
          ) : locationName ? (
            <>
              <p className="text-[10px] font-semibold text-slate-500 mb-1">LOCALIZAÇÃO ATUAL</p>
              <p className="text-xs font-medium text-slate-800">
                📍 {locationName.full}
              </p>
            </>
          ) : null}
          
          <div className={locationName ? "mt-2 pt-2 border-t border-slate-100" : ""}>
            <p className="text-[10px] font-semibold text-slate-500 mb-1">COORDENADAS</p>
            <p className="text-xs font-mono text-slate-700">
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </p>
            {heading !== null && heading !== undefined && (
              <p className="text-[10px] text-slate-500 mt-0.5">
                Direção: {Math.round(heading)}°
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MotoristaMap;