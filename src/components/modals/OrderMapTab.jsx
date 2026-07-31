import { useState, useEffect, useCallback, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { MapPin, Flag, Navigation } from "lucide-react";

const GOOGLE_MAPS_KEY = "AIzaSyAt3JMQnStFWcbODF6HBHGck0IUseek_Ak";
const MAPUTO_CENTER = { lat: -25.9653, lng: 32.5778 };
const libraries = ["places"];

const parseCoords = (coords) => {
  if (!coords) return null;
  if (typeof coords === "object" && coords !== null) {
    const lat = parseFloat(coords.lat);
    const lng = parseFloat(coords.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
    return null;
  }
  if (typeof coords === "string") {
    try {
      let cleanString = coords.trim();
      if (cleanString.startsWith('"') && cleanString.endsWith('"')) {
        cleanString = cleanString.slice(1, -1);
      }
      cleanString = cleanString.replace(/\\"/g, '"');
      const parsed = JSON.parse(cleanString);
      if (parsed && typeof parsed === "object") {
        const lat = parseFloat(parsed.lat);
        const lng = parseFloat(parsed.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    } catch {
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

const createMarkerIcon = (color, scale = 8) => {
  if (!window.google || !window.google.maps || typeof window.google.maps.Point !== "function") {
    return null;
  }
  try {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: scale,
      anchor: new window.google.maps.Point(0, 0),
    };
  } catch {
    return null;
  }
};

const OrderMapTab = ({ order }) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_KEY, libraries });
  const mapRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const geocoderRef = useRef(null);

  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [originAddress, setOriginAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [directions, setDirections] = useState(null);
  const [mapCenter, setMapCenter] = useState(MAPUTO_CENTER);
  const [zoom, setZoom] = useState(13);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const isDelivery = order?.serviceType !== "taxi";

  const getAddressFromCoords = useCallback(
    async (coords) => {
      if (!coords || !isLoaded || !window.google || !window.google.maps) return null;
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
      } catch {
        return null;
      }
    },
    [isLoaded]
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!order) return;

    const nextOriginCoords = isDelivery ? parseCoords(order.originCoords) : parseCoords(order.pickupCoords);
    const nextDestCoords = isDelivery ? parseCoords(order.destCoords) : parseCoords(order.dropoffCoords);
    setOriginCoords(nextOriginCoords);
    setDestCoords(nextDestCoords);

    const nextOriginAddress = isDelivery
      ? (order.origin && order.origin !== "null" && order.origin !== "undefined" ? order.origin : null)
      : (order.pickupLocation && order.pickupLocation !== "null" && order.pickupLocation !== "undefined" ? order.pickupLocation : null);
    const nextDestAddress = isDelivery
      ? (order.dest && order.dest !== "null" && order.dest !== "undefined" ? order.dest : null)
      : (order.dropoffLocation && order.dropoffLocation !== "null" && order.dropoffLocation !== "undefined" ? order.dropoffLocation : null);

    if (nextOriginAddress) {
      setOriginAddress(nextOriginAddress);
    } else if (nextOriginCoords) {
      setLoadingAddress(true);
      getAddressFromCoords(nextOriginCoords).then((address) => {
        if (address) setOriginAddress(address);
        setLoadingAddress(false);
      });
    }

    if (nextDestAddress) {
      setDestAddress(nextDestAddress);
    } else if (nextDestCoords) {
      setLoadingAddress(true);
      getAddressFromCoords(nextDestCoords).then((address) => {
        if (address) setDestAddress(address);
        setLoadingAddress(false);
      });
    }
  }, [order, isDelivery, getAddressFromCoords]);
/* eslint-enable react-hooks/set-state-in-effect */

  const calculateRoute = useCallback(() => {
    if (!isLoaded || !window.google || !window.google.maps || !originCoords || !destCoords) {
      return;
    }
    if (!directionsServiceRef.current) {
      try {
        directionsServiceRef.current = new window.google.maps.DirectionsService();
      } catch {
        return;
      }
    }
    try {
      directionsServiceRef.current.route(
        {
          origin: new window.google.maps.LatLng(originCoords.lat, originCoords.lng),
          destination: new window.google.maps.LatLng(destCoords.lat, destCoords.lng),
          travelMode: window.google.maps.TravelMode.DRIVING,
          language: "pt",
        },
        (result, status) => {
          if (status === "OK" && result) {
            setDirections(result);
            const route = result.routes[0];
            const leg = route.legs[0];
            if (leg) {
              setMapCenter({
                lat: (originCoords.lat + destCoords.lat) / 2,
                lng: (originCoords.lng + destCoords.lng) / 2,
              });
              setZoom(13);
            }
          }
        }
      );
    } catch {
      // Directions request failed
    }
  }, [isLoaded, originCoords, destCoords]);

  useEffect(() => {
    if (originCoords && destCoords) {
      calculateRoute();
    }
  }, [originCoords, destCoords, calculateRoute]);

  const onMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
    },
    []
  );

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative bg-slate-100 rounded-xl overflow-hidden" style={{ height: "40vh", minHeight: 280 }}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={mapCenter}
          zoom={zoom}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: "auto",
            draggable: true,
            scrollwheel: false,
            touchZoom: true,
            doubleClickZoom: true,
            disableDoubleClickZoom: false,
            clickableIcons: false,
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
                preserveViewport: true,
                language: "pt",
                region: "mz",
              }}
            />
          )}

          {originCoords && window.google && window.google.maps && (
            <Marker
              position={new window.google.maps.LatLng(originCoords.lat, originCoords.lng)}
              icon={createMarkerIcon("#10b981", 10)}
            />
          )}

          {destCoords && window.google && window.google.maps && (
            <Marker
              position={new window.google.maps.LatLng(destCoords.lat, destCoords.lng)}
              icon={createMarkerIcon("#ef4444", 10)}
            />
          )}
        </GoogleMap>

        <div className="absolute bottom-3 left-3 flex gap-2">
          {originCoords && (
            <button
              type="button"
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.panTo(new window.google.maps.LatLng(originCoords.lat, originCoords.lng));
                  mapRef.current.setZoom(16);
                }
              }}
              className="w-9 h-9 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-emerald-600 hover:text-emerald-700 transition-colors"
              title="Centralizar na origem"
            >
              <MapPin size={18} />
            </button>
          )}
          {destCoords && (
            <button
              type="button"
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.panTo(new window.google.maps.LatLng(destCoords.lat, destCoords.lng));
                  mapRef.current.setZoom(16);
                }
              }}
              className="w-9 h-9 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-red-600 hover:text-red-700 transition-colors"
              title="Centralizar no destino"
            >
              <Flag size={18} />
            </button>
          )}
          {(originCoords || destCoords) && (
            <button
              type="button"
              onClick={() => {
                if (mapRef.current && window.google && window.google.maps) {
                  const bounds = new window.google.maps.LatLngBounds();
                  if (originCoords) bounds.extend(new window.google.maps.LatLng(originCoords.lat, originCoords.lng));
                  if (destCoords) bounds.extend(new window.google.maps.LatLng(destCoords.lat, destCoords.lng));
                  mapRef.current.fitBounds(bounds);
                }
              }}
              className="w-9 h-9 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-orange-600 transition-colors"
              title="Ajustar mapa para ver a rota"
            >
              <Navigation size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <MapPin size={14} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400">Partida</p>
            {loadingAddress ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="animate-spin w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full" />
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
                <div className="animate-spin w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full" />
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
    </div>
  );
};

export default OrderMapTab;