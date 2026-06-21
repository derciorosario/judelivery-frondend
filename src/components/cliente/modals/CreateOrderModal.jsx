import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "../../common/Icon";
import { createOrder as apiCreateOrder, updateOrder } from "../../../api/client";
import { useJsApiLoader } from "@react-google-maps/api";
import { GoogleMap, Marker, DirectionsRenderer, Autocomplete } from "@react-google-maps/api";
import LocationStep from "./LocationStep";
import DetailsStep from "./DetailsStep";
import SummaryStep from "./SummaryStep";
import { toast } from "../../../lib/toast";
import { useAuth } from "../../../contexts/AuthContext";
import { usePlatformSettings } from "../../../contexts/SettingsContext";
import { getEnabledPaymentMethods, getPrimaryPaymentMethod, normalizePaymentMethod } from "../../../utils/platformSettings";

const GOOGLE_MAPS_KEY = "AIzaSyAt3JMQnStFWcbODF6HBHGck0IUseek_Ak";
const MAPUTO_CENTER = { lat: -25.9653, lng: 32.5778 };
const libraries = ["places"];
const CreateOrderModal = ({ isOpen, onClose, user, customerData, onOrderCreated, onOrderUpdated, repeatOrder, editOrder, serviceType, clientId, onClientSelectClick, selectedClient, settings, settingsLoading }) => {
  const {user:authUser} = useAuth()
  const { settings: contextSettings, loading: contextSettingsLoading } = usePlatformSettings();
  const platformSettings = settings || contextSettings;
  const settingsIsLoading = settingsLoading ?? contextSettingsLoading;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries 
  });
  const [mapOpen, setMapOpen] = useState(false);
  const [routeMapOpen, setRouteMapOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState(null);
  const [mapCenter, setMapCenter] = useState(MAPUTO_CENTER);
  const [mapMarker, setMapMarker] = useState(null);
  const [step, setStep] = useState(1);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState({
    origin: false,
    dest: false,
    pickupLocation: false,
    dropoffLocation: false
  });
  const [saving, setSaving] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');
  
  // Map ref for controlling the map
  const mapRef = useRef(null);

  const getResolvedServiceType = () => {
    if (serviceType && !settingsIsLoading && ((serviceType === "delivery" && platformSettings.order.allowDelivery) || (serviceType === "taxi" && platformSettings.order.allowTaxi))) {
      return serviceType;
    }
    if (!settingsIsLoading && platformSettings.order.allowDelivery) return "delivery";
    if (!settingsIsLoading && platformSettings.order.allowTaxi) return "taxi";
    return serviceType || "delivery";
  };

  const resolvedServiceType = getResolvedServiceType();
 
  const resetForm = useCallback(() => {
    setStep(1);
    setMapOpen(false);
    setRouteMapOpen(false);
    setMapTarget(null);
    setMapMarker(null);
    setDirections(null);
    setRouteInfo(null);
    setLoadingRoute(false);
    setLoadingLocations({
      origin: false,
      dest: false,
      pickupLocation: false,
      dropoffLocation: false
    });
    setSaving(false);
    setSubmitStatus('idle');
    setSearchValue("");
    setForm({
      origin: "",
      originCoords: null,
      dest: "",
      destCoords: null,
      productName: "",
      quantity: 1,
      weight: "",
      observations: "",
      instructions: "",
      scheduledTime: "",
      isScheduled: false,
      urgencyLevel: "normal",
      paymentMethod: "Transferência",
      contactOrigin: customerData?.phone || "",
      contactDest: customerData?.phone || "",
      pickupLocation: "",
      pickupCoords: null,
      dropoffLocation: "",
      dropoffCoords: null,
      passengerCount: 1,
      isScheduledRide: false,
      scheduledRideTime: "",
      rideInstructions: "",
      hasLuggage: false,
      returnTrip: false,
      waitingTime: 0,
      manualOrigin: false,
      manualDest: false,
      manualPickup: false,
      manualDropoff: false,
      driverId: null,
      driverName: null,
      driverPhone: null
    });
  }, [customerData]);
  
  const onMapLoad = (map) => {
    mapRef.current = map;
  };
  
  // Autocomplete refs
  const autocompleteRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");
  
  const [form, setForm] = useState({
    origin: "",
    originCoords: null,
    dest: "",
    destCoords: null,
    productName: "",
    quantity: 1,
    weight: "",
    observations: "",
    instructions: "",
    scheduledTime: "",
    isScheduled: false,
    urgencyLevel: "normal",
    paymentMethod: "Transferência",
    contactOrigin: customerData?.phone || "",
    contactDest: customerData?.phone || "",
    pickupLocation: "",
    pickupCoords: null,
    dropoffLocation: "",
    dropoffCoords: null,
    passengerCount: 1,
    isScheduledRide: false,
    scheduledRideTime: "",
    rideInstructions: "",
    hasLuggage: false,
    returnTrip: false,
    waitingTime: 0,
    // Manual input flags
    manualOrigin: false,
    manualDest: false,
    manualPickup: false,
    manualDropoff: false,
    // Driver assignment
    driverId: null,
    driverName: null,
    driverPhone: null
  });
  
  const calculateRealDistance = useCallback((coords1, coords2) => {
    if (!coords1 || !coords2) return null;
    const R = 6371;
    const lat1 = coords1.lat * Math.PI / 180;
    const lat2 = coords2.lat * Math.PI / 180;
    const deltaLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const deltaLon = (coords2.lng - coords1.lng) * Math.PI / 180;
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10;
  }, []);
  
  const calculateDistance = useCallback(() => {
    if (resolvedServiceType === "taxi") {
      if (form.pickupCoords && form.dropoffCoords) {
        return calculateRealDistance(form.pickupCoords, form.dropoffCoords);
      }
      const baseDistance = 3;
      const randomFactor = Math.random() * 4;
      return Math.round((baseDistance + randomFactor) * 10) / 10;
    } else {
      if (form.originCoords && form.destCoords) {
        return calculateRealDistance(form.originCoords, form.destCoords);
      }
      const baseDistance = 2;
      const randomFactor = Math.random() * 6;
      return Math.round((baseDistance + randomFactor) * 10) / 10;
    }
  }, [resolvedServiceType, form.pickupCoords, form.dropoffCoords, form.originCoords, form.destCoords, calculateRealDistance]);
  
  const calculateDuration = useCallback(() => {
    const distance = calculateDistance();
    const avgSpeed = 30;
    const minutes = Math.round((distance / avgSpeed) * 60);
    return minutes;
  }, [calculateDistance]);
  
  const calculateDeliveryDuration = useCallback(() => {
    const distance = calculateDistance();
    let avgSpeed = 25;
    if (form.urgencyLevel === "urgent") {
      avgSpeed = 35;
    } else if (form.urgencyLevel === "very_urgent") {
      avgSpeed = 45;
    }
    const minutes = Math.round((distance / avgSpeed) * 60);
    return minutes;
  }, [calculateDistance, form.urgencyLevel]);
  
  const calculateRidePrice = useCallback(() => {
    const distance = calculateDistance();
    const pricing = platformSettings.pricing || {};
    const basePrice = Number(pricing.taxiBasePrice ?? 80);
    const perKm = Number(pricing.taxiPerKm ?? 20);
    let total = basePrice + (distance * perKm);
    if (form.returnTrip) total += Number(pricing.returnTripFee ?? 120);
    if (form.waitingTime > 0) total += form.waitingTime * Number(pricing.waitingFeePerMinute ?? 4);
    if (form.hasLuggage) total += Number(pricing.luggageFee ?? 40);
    if (form.passengerCount > Number(pricing.extraPassengerThreshold ?? 3)) total += Number(pricing.extraPassengerFee ?? 30);
    return Math.round(total);
  }, [calculateDistance, form.returnTrip, form.waitingTime, form.hasLuggage, form.passengerCount, platformSettings.pricing]);
  
  const calculateDeliveryPrice = useCallback(() => {
    const distance = calculateDistance();
    const pricing = platformSettings.pricing || {};
    const basePrice = Number(pricing.deliveryBasePrice ?? 50);
    const perKm = Number(pricing.deliveryPerKm ?? 12);
    let total = basePrice + (distance * perKm);
    if (form.urgencyLevel === "urgent") {
      total *= 1 + Number(pricing.urgentPercentage ?? 30) / 100;
    } else if (form.urgencyLevel === "very_urgent") {
      total *= 1 + Number(pricing.veryUrgentPercentage ?? 60) / 100;
    }
    return Math.round(total);
  }, [calculateDistance, form.urgencyLevel, platformSettings.pricing]);

  const calculateRoute = useCallback(async () => {
    if (!isLoaded || !window.google) return;
    
    let originCoords, destCoords;
    if (resolvedServiceType === "taxi") {
      originCoords = form.pickupCoords;
      destCoords = form.dropoffCoords;
    } else {
      originCoords = form.originCoords;
      destCoords = form.destCoords;
    }
    
    if (!originCoords || !destCoords) {
      toast.error("Para ver a rota, selecione os endereços usando a pesquisa ou o mapa.");
      return;
    }
    
    setLoadingRoute(true);
    const directionsService = new window.google.maps.DirectionsService();
    const origin = new window.google.maps.LatLng(originCoords.lat, originCoords.lng);
    const destination = new window.google.maps.LatLng(destCoords.lat, destCoords.lng);
    
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
          const route = result.routes[0];
          const leg = route.legs[0];
          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            steps: leg.steps.map(step => ({
              instruction: step.instructions,
              distance: step.distance.text,
              duration: step.duration.text
            }))
          });
          setRouteMapOpen(true);
        } else {
          console.error("Directions request failed due to " + status);
          toast.error("Não foi possível calcular a rota. Por favor, tente novamente.");
        }
        setLoadingRoute(false);
      }
    );
  }, [isLoaded, resolvedServiceType, form.pickupCoords, form.dropoffCoords, form.originCoords, form.destCoords]);
  
  useEffect(() => {
    if (repeatOrder) {
      if (repeatOrder.serviceType === "taxi") {
        setForm(prev => ({
          ...prev,
          pickupLocation: repeatOrder.pickupLocation || "",
          pickupCoords: repeatOrder.pickupCoords || null,
          dropoffLocation: repeatOrder.dropoffLocation || "",
          dropoffCoords: repeatOrder.dropoffCoords || null,
          passengerCount: repeatOrder.passengerCount || 1,
          isScheduledRide: !!repeatOrder.scheduledRideTime,
          scheduledRideTime: repeatOrder.scheduledRideTime || "",
          rideInstructions: repeatOrder.instructions || "",
          hasLuggage: repeatOrder.hasLuggage || false,
          returnTrip: repeatOrder.returnTrip || false,
          waitingTime: repeatOrder.waitingTime || 0,
          manualPickup: false,
          manualDropoff: false
        }));
      } else {
        setForm(prev => ({
          ...prev,
          origin: repeatOrder.origin || "",
          originCoords: repeatOrder.originCoords || null,
          dest: repeatOrder.dest || "",
          destCoords: repeatOrder.destCoords || null,
          productName: repeatOrder.productName || "",
          quantity: repeatOrder.quantity || 1,
          weight: "",
          observations: repeatOrder.instructions || "",
          instructions: repeatOrder.instructions || "",
          scheduledTime: repeatOrder.scheduledTime || "",
          isScheduled: !!repeatOrder.scheduledTime,
          urgencyLevel: repeatOrder.urgencyLevel || "normal",
          paymentMethod: repeatOrder.paymentMethod || "Transferência",
          contactOrigin: customerData?.phone || "",
          contactDest: customerData?.phone || "",
          manualOrigin: false,
          manualDest: false
        }));
      }
    }
    if (editOrder) {
      if (editOrder.serviceType === "taxi") {
        setForm(prev => ({
          ...prev,
          pickupLocation: editOrder.pickupLocation || "",
          pickupCoords: editOrder.pickupCoords || null,
          dropoffLocation: editOrder.dropoffLocation || "",
          dropoffCoords: editOrder.dropoffCoords || null,
          passengerCount: editOrder.passengerCount || 1,
          isScheduledRide: !!editOrder.scheduledRideTime,
          scheduledRideTime: editOrder.scheduledRideTime || "",
          rideInstructions: editOrder.instructions || "",
          hasLuggage: editOrder.hasLuggage || false,
          returnTrip: editOrder.returnTrip || false,
          waitingTime: editOrder.waitingTime || 0,
          manualPickup: false,
          manualDropoff: false
        }));
      } else {
        setForm(prev => ({
          ...prev,
          origin: editOrder.origin || "",
          originCoords: editOrder.originCoords || null,
          dest: editOrder.dest || "",
          destCoords: editOrder.destCoords || null,
          productName: editOrder.productName || "",
          quantity: editOrder.quantity || 1,
          weight: editOrder.weight || "",
          observations: editOrder.observations || "",
          instructions: editOrder.instructions || "",
          scheduledTime: editOrder.scheduledTime || "",
          isScheduled: !!editOrder.scheduledTime,
          urgencyLevel: editOrder.urgencyLevel || "normal",
          paymentMethod: editOrder.paymentMethod || "Transferência",
          contactOrigin: editOrder.contactOrigin || customerData?.phone || "",
          contactDest: editOrder.contactDest || customerData?.phone || "",
          manualOrigin: false,
          manualDest: false
        }));
      }
    }
  }, [repeatOrder, editOrder, customerData]);

  useEffect(() => {
    if (!settingsIsLoading && serviceType && ((serviceType === "delivery" && !platformSettings.order.allowDelivery) || (serviceType === "taxi" && !platformSettings.order.allowTaxi))) {
      toast.error(serviceType === "delivery" ? "Pedidos de entrega estão temporariamente indisponíveis." : "Corridas estão temporariamente indisponíveis.");
    }
  }, [settingsIsLoading, serviceType, platformSettings.order.allowDelivery, platformSettings.order.allowTaxi]);

  useEffect(() => {
    const enabledMethods = getEnabledPaymentMethods(platformSettings);
    if (!enabledMethods.length) return;
    const enabledNames = enabledMethods.map((method) => method.name);
    if (!enabledNames.includes(form.paymentMethod)) {
      setForm((previous) => ({ ...previous, paymentMethod: enabledMethods.find((method) => method.primary)?.name || enabledNames[0] }));
    }
  }, [form.paymentMethod, platformSettings]);

  const openMapSelector = async (field) => {
    setMapTarget(field);
    setSearchValue("");
    let center = MAPUTO_CENTER;
    let hasCoords = false;
    
    if (field === "origin" && form.originCoords) {
      center = form.originCoords;
      hasCoords = true;
      setSearchValue(form.origin);
    } else if (field === "dest" && form.destCoords) {
      center = form.destCoords;
      hasCoords = true;
      setSearchValue(form.dest);
    } else if (field === "pickupLocation" && form.pickupCoords) {
      center = form.pickupCoords;
      hasCoords = true;
      setSearchValue(form.pickupLocation);
    } else if (field === "dropoffLocation" && form.dropoffCoords) {
      center = form.dropoffCoords;
      hasCoords = true;
      setSearchValue(form.dropoffLocation);
    }
    
    if (!hasCoords && navigator.geolocation) {
      setLoadingLocations(prev => ({ ...prev, [field]: true }));
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });
        center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setLoadingLocations(prev => ({ ...prev, [field]: false }));
      }
    }
    
    setMapCenter(center);
    setMapMarker(null);
    setMapOpen(true);
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMapMarker({ lat, lng });
    // Reverse geocode to get address for the clicked location
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        setSearchValue(results[0].formatted_address);
      } else {
        setSearchValue(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    });
  };

  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name;
        
        setSearchValue(address);
        setMapMarker({ lat, lng });
        setMapCenter({ lat, lng });
        
        // Optionally zoom in to the location
        if (window.google && mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(16);
        }
      }
    }
  };

  const confirmMapLocation = () => {
    if (mapMarker) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat: mapMarker.lat, lng: mapMarker.lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const formatted = results[0].formatted_address;
          const coords = { lat: mapMarker.lat, lng: mapMarker.lng };
          
          if (mapTarget === "origin") {
            setForm(prev => ({ ...prev, origin: formatted, originCoords: coords, manualOrigin: false }));
          } else if (mapTarget === "dest") {
            setForm(prev => ({ ...prev, dest: formatted, destCoords: coords, manualDest: false }));
          } else if (mapTarget === "pickupLocation") {
            setForm(prev => ({ ...prev, pickupLocation: formatted, pickupCoords: coords, manualPickup: false }));
          } else if (mapTarget === "dropoffLocation") {
            setForm(prev => ({ ...prev, dropoffLocation: formatted, dropoffCoords: coords, manualDropoff: false }));
          }
          setDirections(null);
          setRouteInfo(null);
        } else {
          const coords = { lat: mapMarker.lat, lng: mapMarker.lng };
          const label = searchValue || `${mapMarker.lat.toFixed(5)}, ${mapMarker.lng.toFixed(5)}`;
          if (mapTarget === "origin") {
            setForm(prev => ({ ...prev, origin: label, originCoords: coords, manualOrigin: false }));
          } else if (mapTarget === "dest") {
            setForm(prev => ({ ...prev, dest: label, destCoords: coords, manualDest: false }));
          } else if (mapTarget === "pickupLocation") {
            setForm(prev => ({ ...prev, pickupLocation: label, pickupCoords: coords, manualPickup: false }));
          } else if (mapTarget === "dropoffLocation") {
            setForm(prev => ({ ...prev, dropoffLocation: label, dropoffCoords: coords, manualDropoff: false }));
          }
          setDirections(null);
          setRouteInfo(null);
        }
        setMapOpen(false);
        setMapTarget(null);
        setMapMarker(null);
        setSearchValue("");
      });
    }
  };

  const closeMapSelector = () => {
    setMapOpen(false);
    setMapTarget(null);
    setMapMarker(null);
    setSearchValue("");
  };

  const closeRouteMap = () => {
    setRouteMapOpen(false);
    setDirections(null);
    setRouteInfo(null);
  };

  const useCurrentLocation = async (field) => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não é suportada pelo seu navegador.");
      return;
    }
    
    setLoadingLocations(prev => ({ ...prev, [field]: true }));
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const geocoder = new window.google.maps.Geocoder();
          const results = await new Promise((resolve, reject) => {
            geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
              if (status === "OK" && results && results[0]) resolve(results[0]);
              else reject(new Error(status));
            });
          });
          const formatted = results.formatted_address;
          const coords = { lat: latitude, lng: longitude };
          
          if (field === "origin") {
            setForm(prev => ({ ...prev, origin: formatted, originCoords: coords, manualOrigin: false }));
          } else if (field === "dest") {
            setForm(prev => ({ ...prev, dest: formatted, destCoords: coords, manualDest: false }));
          } else if (field === "pickupLocation") {
            setForm(prev => ({ ...prev, pickupLocation: formatted, pickupCoords: coords, manualPickup: false }));
          } else if (field === "dropoffLocation") {
            setForm(prev => ({ ...prev, dropoffLocation: formatted, dropoffCoords: coords, manualDropoff: false }));
          }
          setDirections(null);
          setRouteInfo(null);
        } catch {
          const label = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          const coords = { lat: latitude, lng: longitude };
          if (field === "origin") {
            setForm(prev => ({ ...prev, origin: label, originCoords: coords, manualOrigin: false }));
          } else if (field === "dest") {
            setForm(prev => ({ ...prev, dest: label, destCoords: coords, manualDest: false }));
          } else if (field === "pickupLocation") {
            setForm(prev => ({ ...prev, pickupLocation: label, pickupCoords: coords, manualPickup: false }));
          } else if (field === "dropoffLocation") {
            setForm(prev => ({ ...prev, dropoffLocation: label, dropoffCoords: coords, manualDropoff: false }));
          }
          setDirections(null);
          setRouteInfo(null);
        } finally {
          setLoadingLocations(prev => ({ ...prev, [field]: false }));
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        toast.error("Não foi possível obter a sua localização atual. Por favor, verifique as permissões.");
        setLoadingLocations(prev => ({ ...prev, [field]: false }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };
  
  const getUrgencyLabel = (level) => {
    switch(level) {
      case "normal": return "Normal";
      case "urgent": return "Urgente";
      case "very_urgent": return "Muito Urgente";
      default: return "Normal";
    }
  };
  
  const getUrgencyColor = (level) => {
    switch(level) {
      case "normal": return "bg-green-100 text-green-700 border-green-200";
      case "urgent": return "bg-amber-100 text-amber-700 border-amber-200";
      case "very_urgent": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-green-100 text-green-700 border-green-200";
    }
  };
  
  // Updated isLocationValid function to handle manual input
  const isLocationValid = () => {
    const requireCoordinates = !settingsIsLoading && platformSettings.order.requireCoordinates;
    const allowManualAddressInput = !settingsIsLoading ? platformSettings.order.allowManualAddressInput : true;

    if (resolvedServiceType === "taxi") {
      if (step === 1) {
        const hasPickup = form.pickupLocation && form.pickupLocation.trim() !== "";
        const hasDropoff = form.dropoffLocation && form.dropoffLocation.trim() !== "";
        
        if (!hasPickup || !hasDropoff) return false;
        
        if (form.manualPickup && form.manualDropoff && allowManualAddressInput) return true;
        if (requireCoordinates) return Boolean(form.pickupCoords && form.dropoffCoords);
        if (!form.manualPickup && !form.pickupCoords) return false;
        if (!form.manualDropoff && !form.dropoffCoords) return false;
        
        return true;
      }
      return true;
    } else {
      if (step === 2) {
        const hasOrigin = form.origin && form.origin.trim() !== "";
        const hasDest = form.dest && form.dest.trim() !== "";
        
        if (!hasOrigin || !hasDest) return false;
        
        if (form.manualOrigin && form.manualDest && allowManualAddressInput) return true;
        if (requireCoordinates) return Boolean(form.originCoords && form.destCoords);
        if (!form.manualOrigin && !form.originCoords) return false;
        if (!form.manualDest && !form.destCoords) return false;
        
        return true;
      }
      return true;
    }
  };

  const handleNextStep = () => {
    if (!isLocationValid()) {
      toast.error("Por favor, preencha a origem e destino corretamente.");
      return;
    }
    setStep(step + 1);
  };

  const handleDriverAssigned = (driver) => {
    setForm(prev => ({
      ...prev,
      driverId: driver?.id || null,
      driverName: driver?.name || null,
      driverPhone: driver?.phone || null
    }));
  };

  const handleCall = (phone) => {
    if (!phone) return;
    const normalizedPhone = phone.replace(/[^\d+]/g, "");
    window.open(`tel:${normalizedPhone}`, "_self");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < 4) {
      if (!isLocationValid()) {
        toast.error("Por favor, preencha todos os campos obrigatórios.");
        return;
      }
      setStep(step + 1);
      return;
    }
    
    setSaving(true);
    setSubmitStatus('loading');
    try {
      const distance = calculateDistance();
      const duration = resolvedServiceType === "taxi" ? calculateDuration() : calculateDeliveryDuration();
      const total = resolvedServiceType === "taxi" ? calculateRidePrice() : calculateDeliveryPrice();
      const maxDistanceKm = Number(platformSettings.order?.maxDistanceKm ?? 80);
      const maxWaitingTimeMinutes = Number(platformSettings.order?.maxWaitingTimeMinutes ?? 20);
      const selectedPaymentMethod = enabledPaymentMethods.find((method) => method.name === form.paymentMethod || method.code === form.paymentMethod);
      const paymentMethodCode = selectedPaymentMethod ? normalizePaymentMethod(selectedPaymentMethod, platformSettings) : normalizePaymentMethod(form.paymentMethod, platformSettings);
      const isScheduled = form.isScheduled || form.isScheduledRide;

      if (distance > maxDistanceKm) {
        toast.error(`A distância máxima permitida é de ${maxDistanceKm} km.`);
        setSaving(false);
        setSubmitStatus('idle');
        return;
      }

      if (form.waitingTime > maxWaitingTimeMinutes) {
        toast.error(`O tempo máximo de espera permitido é de ${maxWaitingTimeMinutes} minutos.`);
        setSaving(false);
        setSubmitStatus('idle');
        return;
      }

      if (isScheduled && !platformSettings.order?.allowScheduledOrders) {
        toast.error("Pedidos e corridas agendados estão temporariamente indisponíveis.");
        setSaving(false);
        setSubmitStatus('idle');
        return;
      }

      if (!enabledPaymentMethods.length || !selectedPaymentMethod) {
        toast.error("Nenhum método de pagamento disponível para concluir o pedido.");
        setSaving(false);
        setSubmitStatus('idle');
        return;
      }

      if (isScheduled && selectedPaymentMethod.code === "cash" && !platformSettings.payments?.allowCashForScheduledOrders) {
        toast.error("Pagamento em dinheiro não está disponível para pedidos agendados.");
        setSaving(false);
        setSubmitStatus('idle');
        return;
      }
      
      const companyId = user?.companyId || customerData?.companyId || null;
      const resolvedClientId = clientId || user?.id || null;
      
      // Determine status: if driver is assigned, use 'assigned', otherwise the configured default status
      const hasDriver = form.driverId;
      const orderStatus = hasDriver 
        ? (isScheduled ? "scheduled" : "assigned")
        : (isScheduled ? "scheduled" : (platformSettings.order?.defaultStatus || "pending_approval"));
      
      const orderPayload = resolvedServiceType === "taxi" ? {
        companyId,
        clientId: resolvedClientId,
        serviceType: "taxi",
        status: orderStatus,
        driverId: form.driverId,
        pickupLocation: form.pickupLocation,
        dropoffLocation: form.dropoffLocation,
        pickupCoords: form.pickupCoords,
        dropoffCoords: form.dropoffCoords,
        passengerCount: form.passengerCount,
        hasLuggage: form.hasLuggage,
        returnTrip: form.returnTrip,
        waitingTime: form.waitingTime,
        instructions: form.rideInstructions,
        scheduledTime: form.isScheduledRide ? form.scheduledRideTime : null,
        contactOrigin: form.contactOrigin,
        contactDest: form.contactDest,
        total,
        dist: `${distance} km`,
        time: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }),
        paymentMethod: paymentMethodCode,
        paymentStatus: "pending",
        isManualInput: form.manualPickup || form.manualDropoff
      } : {
        companyId,
        clientId: resolvedClientId,
        serviceType: "delivery",
        status: orderStatus,
        driverId: form.driverId,
        origin: form.origin,
        dest: form.dest,
        originCoords: form.originCoords,
        destCoords: form.destCoords,
        urgencyLevel: form.urgencyLevel,
        productName: form.productName,
        quantity: form.quantity,
        weight: form.weight,
        instructions: form.instructions,
        observations: form.observations,
        scheduledTime: form.isScheduled ? form.scheduledTime : null,
        contactOrigin: form.contactOrigin,
        contactDest: form.contactDest,
        total,
        dist: `${distance} km`,
        time: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }),
        paymentMethod: paymentMethodCode,
        paymentStatus: "pending",
        isManualInput: form.manualOrigin || form.manualDest
      };
      
      if (editOrder) {
        const response = await updateOrder(editOrder.id, orderPayload);
        setSubmitStatus('success');
        if (onOrderUpdated) onOrderUpdated(response.data);
      } else {
        await apiCreateOrder(orderPayload);
        setSubmitStatus('success');
      }
    } catch (error) {
      console.error("Failed to save order:", error);
      setSubmitStatus('idle');
      setSaving(false);
      toast.error(error.response?.data?.message || "Falha ao salvar pedido. Tente novamente.");
    }
  };
  
  if (!isOpen) return null;
  
  const getStepTitle = () => {
    if (resolvedServiceType === "taxi") {
      const titles = ["Localização", "Detalhes da Corrida", "Instruções", "Resumo"];
      return titles[step - 1];
    }
    return ["Item", "Endereços", "Detalhes", "Resumo"][step - 1];
  };
  
  const distance = calculateDistance();
  const duration = resolvedServiceType === "taxi" ? calculateDuration() : calculateDeliveryDuration();
  const ridePrice = resolvedServiceType === "taxi" ? calculateRidePrice() : 0;
  const deliveryPrice = resolvedServiceType === "delivery" ? calculateDeliveryPrice() : 0;
  const currency = platformSettings.app?.currency || "MZN";
  const countryRestriction = platformSettings.app?.countryRestriction || "mz";
  const enabledPaymentMethods = getEnabledPaymentMethods(platformSettings);
  const supportContact = platformSettings.app?.support || platformSettings.app || {};
  const isCurrentStepValid = isLocationValid();
  
  return (
    <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {editOrder
                ? (resolvedServiceType === "taxi" ? "Editar Corrida" : "Editar Pedido de Entrega")
                : (resolvedServiceType === "taxi" ? "Solicitar Corrida" : "Novo Pedido de Entrega")
              }
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {Array(4).fill().map((_, s) => (
                <div key={s} className={`h-1 w-8 rounded-full ${step >= s + 1 ? "bg-orange-500" : "bg-slate-200"}`} />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">{getStepTitle()}</p>
          </div>
          <button onClick={() => { resetForm(); onClose(); }} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Icon name="x" size={18} />
          </button>
        </div>
        
        <div className="p-4">
          {(selectedClient && authUser?.role!="customer") && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                  <Icon name="user" size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{selectedClient.name}</p>
                  <p className="text-[11px] text-slate-500">{selectedClient.phone}</p>
                </div>
              </div>
              {onClientSelectClick && (
                <button
                  type="button"
                  onClick={onClientSelectClick}
                  className="text-[11px] font-semibold text-orange-600 hover:text-orange-700"
                >
                  Alterar
                </button>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {step === 1 && resolvedServiceType === "taxi" && (
              <LocationStep
                serviceType="taxi"
                form={form}
                onFormChange={setForm}
                isLoaded={isLoaded}
                onUseCurrentLocation={useCurrentLocation}
                onSelectOnMap={openMapSelector}
                onCalculateRoute={calculateRoute}
                distance={distance}
                duration={duration}
                price={ridePrice}
                loadingRoute={loadingRoute}
                loadingLocations={loadingLocations}
                settings={platformSettings}
                onClearInput={(field) => {
                  if (field === "pickupLocation") {
                    setForm(prev => ({ ...prev, pickupLocation: "", pickupCoords: null, manualPickup: false }));
                  } else if (field === "dropoffLocation") {
                    setForm(prev => ({ ...prev, dropoffLocation: "", dropoffCoords: null, manualDropoff: false }));
                  }
                  setDirections(null);
                  setRouteInfo(null);
                }}
              />
            )}

            {step === 2 && resolvedServiceType === "taxi" && (
              <DetailsStep
                serviceType="taxi"
                form={form}
                onFormChange={setForm}
                onDriverAssigned={handleDriverAssigned}
                settings={platformSettings}
              />
            )}

            {step === 3 && resolvedServiceType === "taxi" && (
              <DetailsStep
                serviceType="taxiInstructions"
                form={form}
                onFormChange={setForm}
                settings={platformSettings}
              />
            )}

            {step === 1 && resolvedServiceType === "delivery" && (
              <DetailsStep
                serviceType="deliveryItem"
                form={form}
                onFormChange={setForm}
                settings={platformSettings}
              />
            )}

            {step === 2 && resolvedServiceType === "delivery" && (
              <LocationStep
                serviceType="delivery"
                form={form}
                onFormChange={setForm}
                isLoaded={isLoaded}
                onUseCurrentLocation={useCurrentLocation}
                onSelectOnMap={openMapSelector}
                onCalculateRoute={calculateRoute}
                distance={distance}
                duration={duration}
                price={deliveryPrice}
                loadingRoute={loadingRoute}
                loadingLocations={loadingLocations}
                settings={platformSettings}
                onClearInput={(field) => {
                  if (field === "origin") {
                    setForm(prev => ({ ...prev, origin: "", originCoords: null, manualOrigin: false }));
                  } else if (field === "dest") {
                    setForm(prev => ({ ...prev, dest: "", destCoords: null, manualDest: false }));
                  }
                  setDirections(null);
                  setRouteInfo(null);
                }}
              />
            )}

            {step === 3 && resolvedServiceType === "delivery" && (
              <DetailsStep
                serviceType="deliveryDetails"
                form={form}
                onFormChange={setForm}
                settings={platformSettings}
                getUrgencyLabel={getUrgencyLabel}
                getUrgencyColor={getUrgencyColor}
                onDriverAssigned={handleDriverAssigned}
              />
            )}

            {step === 4 && (
              <SummaryStep
                serviceType={resolvedServiceType}
                form={form}
                distance={distance}
                duration={duration}
                price={resolvedServiceType === "taxi" ? ridePrice : deliveryPrice}
                currency={currency}
                paymentMethods={enabledPaymentMethods}
                onPaymentMethodChange={(method) => setForm(prev => ({ ...prev, paymentMethod: method }))}
                getUrgencyLabel={getUrgencyLabel}
                getUrgencyColor={getUrgencyColor}
                settings={platformSettings}
                supportContact={supportContact}
              />
            )}

            <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm"
                >
                  Voltar
                </button>
              )}
              {step === 1 && onClientSelectClick && (
                <button
                  type="button"
                  onClick={() => {
                    onClientSelectClick();
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                >
                  Alterar Cliente
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg ${
                  resolvedServiceType === "taxi"
                    ? "bg-blue-500 shadow-blue-500/30 hover:bg-blue-600"
                    : "bg-orange-500 shadow-orange-500/30 hover:bg-orange-600"
                } ${((resolvedServiceType === "taxi" && step === 1) || (resolvedServiceType === "delivery" && step === 2)) && !isCurrentStepValid ? "opacity-50 cursor-not-allowed" : ""} ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {saving ? "A criar..." : step < 4 ? "Continuar" : "Confirmar"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Map Selection Modal with Autocomplete */}
      {mapOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                Selecionar {mapTarget === "origin" || mapTarget === "pickupLocation" ? "Origem" : "Destino"} no Mapa
              </h3>
              <button
                type="button"
                onClick={closeMapSelector}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="px-4 pt-3 pb-2 border-b border-slate-100">
              {isLoaded && (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <Autocomplete
                    onLoad={onAutocompleteLoad}
                    onPlaceChanged={onPlaceChanged}
                    restrictions={{ country: countryRestriction }}
                    options={{
                      componentRestrictions: { country: countryRestriction },
                      types: ["geocode", "establishment"]
                    }}
                  >
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Pesquisar localização..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                    />
                  </Autocomplete>
                </div>
              )}
              <p className="text-xs text-slate-400 mt-2 text-center">
                Pesquise um local ou clique no mapa
              </p>
            </div>
            
            {/* Map */}
            <div className="h-80 bg-slate-100 relative">
              {!isLoaded || loadingLocations[mapTarget] ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-xs text-slate-500">A carregar mapa...</p>
                  </div>
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={mapCenter}
                  zoom={14}
                  onClick={handleMapClick}
                  onLoad={onMapLoad}
                  options={{ 
                    disableDefaultUI: true, 
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false
                  }}
                >
                  {mapMarker && <Marker position={mapMarker} />}
                </GoogleMap>
              )}
            </div>
            
            {/* Selected location preview */}
            {searchValue && mapMarker && (
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                <p className="text-xs text-blue-700 font-medium truncate">
                  📍 {searchValue}
                </p>
              </div>
            )}
            
            {/* Actions */}
            <div className="px-4 py-3 border-t border-slate-100">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeMapSelector}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmMapLocation}
                  disabled={!mapMarker}
                  className={`flex-1 py-2 rounded-xl text-white font-bold text-sm shadow-lg transition-colors ${
                    mapMarker 
                      ? "bg-green-500 hover:bg-green-600 active:bg-green-700" 
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Confirmar Localização
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Map Dialog */}
      {routeMapOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-2 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">Detalhes da Rota</h3>
                {routeInfo && (
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                    {routeInfo.distance} • {routeInfo.duration}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeRouteMap}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
              <div className="w-full sm:w-1/2 h-64 sm:h-96 bg-slate-100 relative">
                {isLoaded && directions && (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={mapCenter}
                    zoom={12}
                    options={{ 
                      disableDefaultUI: true, 
                      zoomControl: true,
                      gestureHandling: 'greedy'
                    }}
                  >
                    <DirectionsRenderer 
                      directions={directions}
                      options={{
                        polylineOptions: {
                          strokeColor: "#3b82f6",
                          strokeWeight: 4,
                          strokeOpacity: 0.8
                        }
                      }}
                    />
                  </GoogleMap>
                )}
              </div>
              
              <div className="w-full sm:w-1/2 bg-slate-50 overflow-y-auto p-3 sm:p-4 max-h-48 sm:max-h-none">
                <h4 className="text-xs font-semibold text-slate-700 mb-2 sticky top-0 bg-slate-50 py-1">
                  Instruções da Rota
                </h4>
                <div className="space-y-2">
                  {routeInfo && routeInfo.steps.map((step, idx) => (
                    <div key={idx} className="text-xs text-slate-600 pb-2 border-b border-slate-200 last:border-0">
                      <div className="text-[11px] sm:text-xs" dangerouslySetInnerHTML={{ __html: step.instruction }} />
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px] sm:text-[10px] text-slate-400">{step.distance}</span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400">{step.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeRouteMap}
                  className="flex-1 py-2 sm:py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-xs sm:text-sm hover:bg-blue-600 active:bg-blue-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Feedback Popup */}
      {submitStatus === 'loading' && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">A processar pedido</h3>
            <p className="text-xs text-slate-500">Por favor, aguarde enquanto o seu pedido é enviado...</p>
          </div>
        </div>
      )}

      {submitStatus === 'success' && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center shadow-2xl">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {editOrder ? "Pedido atualizado com sucesso!" : (form.driverId ? "Motorista atribuído!" : "Pedido enviado com sucesso!")}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editOrder
                ? "O seu pedido foi atualizado com sucesso."
                : form.driverId
                  ? `${form.driverName} foi atribuído ao seu pedido. Use os contactos abaixo para acompanhamento.`
                  : "O seu pedido foi recebido e está a ser processado. Um motorista será atribuído em breve e você será notificado."
              }
            </p>

            <div className="text-left space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <Icon name="phone" size={14} className="text-orange-500" /> Contactos para acompanhamento
              </h4>

              <div className="space-y-2">
                {form.driverId && form.driverName && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{form.driverName}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {form.driverPhone || "Contacto indisponível"}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!form.driverPhone}
                        onClick={() => handleCall(form.driverPhone)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                          form.driverPhone
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <Icon name="phone" size={14} /> Ligar
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">Motorista</p>
                  </div>
                )}

                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{supportContact.supportName || supportContact.name || "Plataforma/Suporte"}</p>
                        <p className="text-xs text-slate-500 truncate">{supportContact.supportPhone || supportContact.phone || "Contacto indisponível"}</p>
                      </div>
                      <button
                        type="button"
                        disabled={!supportContact.supportPhone && !supportContact.phone}
                        onClick={() => handleCall(supportContact.supportPhone || supportContact.phone)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1 ${
                          supportContact.supportPhone || supportContact.phone
                            ? "bg-orange-500 text-white"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <Icon name="phone" size={14} /> Ligar
                      </button>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <p className="text-xs text-slate-500">{supportContact.supportHours || supportContact.hours || "Contacte-nos por telefone ou email"}</p>
                      <p className="text-xs text-orange-500 mt-1">{supportContact.supportResponseTime || supportContact.responseTime || "Resposta assim que possível"}</p>
                    </div>
                  <p className="text-xs text-slate-400 mt-1">Plataforma/Suporte</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmitStatus('idle');
                resetForm();
                onClose(true);
              }}
              className="w-full py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrderModal;