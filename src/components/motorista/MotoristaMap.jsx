import { useRef, useState, useEffect } from "react";
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

const MotoristaMap = ({ online, onToggleOnline, location }) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_KEY, libraries });
  const { user } = useAuth();
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const [locationName, setLocationName] = useState(null);
  const [isFetchingLocationName, setIsFetchingLocationName] = useState(false);
  const [showInfoWindow, setShowInfoWindow] = useState(true);

  const position = location?.position;
  const lastUpdate = location?.lastUpdate;
  const gpsPermission = location?.gpsPermission;

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
        // Get a shorter version (street name + area)
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
    } else if (!position) {
      setLocationName(null);
    }
  }, [position, isLoaded]);

  const recenter = () => {
    if (mapRef.current && position) {
      mapRef.current.panTo(position);
      mapRef.current.setZoom(16);
    }
  };

  const onMapLoad = (map) => {
    mapRef.current = map;
    if (position) {
      map.setCenter(position);
      map.setZoom(16);
    }
  };

  return (
    <div className="space-y-3">
      {gpsPermission === "denied" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <Icon name="alertTriangle" size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">Localização Desactivada</p>
              <p className="text-xs text-slate-500 mt-0.5">Active a permissão de localização nas configurações do navegador para partilhar a sua posição.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              online && location?.isActive ? "bg-green-500 animate-pulse" : "bg-slate-400"
            }`}
          />
          <div>
            <p className="text-xs font-bold text-slate-800">
              {online && location?.isActive ? "A partilhar localização" : "Sem partilha"}
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
            if (online) {
              if (location?.isActive) {
                location.stop();
              }
              onToggleOnline && onToggleOnline(false);
            } else {
              onToggleOnline && onToggleOnline(true);
              location.start();
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
            center={position}
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
              onClick={() => setShowInfoWindow(true)}
            />
            {showInfoWindow && locationName && (
              <InfoWindow 
                position={position} 
                onCloseClick={() => setShowInfoWindow(false)}
              >
                <div className="text-xs max-w-[220px]">
                  <p className="font-bold text-slate-800">{user?.name || "Motorista"}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {online ? "🟢 Online" : "🔴 Offline"}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1 pt-1 border-t border-slate-100">
                    📍 {locationName.short || locationName.full}
                  </p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}

        {position && (
          <button
            type="button"
            onClick={recenter}
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
            <div className="flex items-center gap-2 mb-2">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MotoristaMap;