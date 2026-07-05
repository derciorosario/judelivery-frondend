import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "../../common/Icon";
import { ORDERS, CUSTOMER_ORDERS, NOTIFICATIONS } from "../../../data/mockData";
import { useJsApiLoader } from "@react-google-maps/api";
import { GoogleMap, Marker, DirectionsRenderer, Autocomplete } from "@react-google-maps/api";

const GOOGLE_MAPS_KEY = "AIzaSyAt3JMQnStFWcbODF6HBHGck0IUseek_Ak";
const MAPUTO_CENTER = { lat: -25.9653, lng: 32.5778 };
const libraries = ["places"];

const CreateOrderModal = ({ isOpen, onClose, user, customerData, onOrderCreated, repeatOrder, serviceType }) => {
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
  
  // Autocomplete refs
  const originAutocompleteRef = useRef(null);
  const destAutocompleteRef = useRef(null);
  const pickupAutocompleteRef = useRef(null);
  const dropoffAutocompleteRef = useRef(null);
  
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
    waitingTime: 0
  });
  
  // Calculate real distance between two coordinates using Haversine formula
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
    if (serviceType === "taxi") {
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
  }, [serviceType, form.pickupCoords, form.dropoffCoords, form.originCoords, form.destCoords, calculateRealDistance]);
  
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
    const basePrice = 80;
    const perKm = 20;
    let total = basePrice + (distance * perKm);
    
    if (form.returnTrip) total += 120;
    if (form.waitingTime > 0) total += form.waitingTime * 4;
    if (form.hasLuggage) total += 40;
    if (form.passengerCount > 3) total += 30;
    
    return Math.round(total);
  }, [calculateDistance, form.returnTrip, form.waitingTime, form.hasLuggage, form.passengerCount]);
  
  const calculateDeliveryPrice = useCallback(() => {
    const distance = calculateDistance();
    const basePrice = 50;
    const perKm = 12;
    let total = basePrice + (distance * perKm);
    
    if (form.urgencyLevel === "urgent") {
      total *= 1.3;
    } else if (form.urgencyLevel === "very_urgent") {
      total *= 1.6;
    }
    
    return Math.round(total);
  }, [calculateDistance, form.urgencyLevel]);

  // Calculate route using Google Directions API
  const calculateRoute = useCallback(async () => {
    if (!isLoaded || !window.google) return;
    
    let originCoords, destCoords;
    
    if (serviceType === "taxi") {
      originCoords = form.pickupCoords;
      destCoords = form.dropoffCoords;
    } else {
      originCoords = form.originCoords;
      destCoords = form.destCoords;
    }
    
    if (!originCoords || !destCoords) {
      alert("Por favor, selecione origem e destino primeiro.");
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
          
          // Extract route information
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
          alert("Não foi possível calcular a rota. Por favor, tente novamente.");
        }
        setLoadingRoute(false);
      }
    );
  }, [isLoaded, serviceType, form.pickupCoords, form.dropoffCoords, form.originCoords, form.destCoords]);
  
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
          waitingTime: repeatOrder.waitingTime || 0
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
          contactDest: customerData?.phone || ""
        }));
      }
    }
  }, [repeatOrder, customerData]);

  // Google Places Autocomplete handlers
  const onOriginLoad = (autocomplete) => {
    originAutocompleteRef.current = autocomplete;
  };
  
  const onOriginPlaceChanged = () => {
    if (originAutocompleteRef.current) {
      const place = originAutocompleteRef.current.getPlace();
      if (place.formatted_address && place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setForm(prev => ({ 
          ...prev, 
          origin: place.formatted_address, 
          originCoords: location 
        }));
      }
    }
  };
  
  const onDestLoad = (autocomplete) => {
    destAutocompleteRef.current = autocomplete;
  };
  
  const onDestPlaceChanged = () => {
    if (destAutocompleteRef.current) {
      const place = destAutocompleteRef.current.getPlace();
      if (place.formatted_address && place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setForm(prev => ({ 
          ...prev, 
          dest: place.formatted_address, 
          destCoords: location 
        }));
      }
    }
  };
  
  const onPickupLoad = (autocomplete) => {
    pickupAutocompleteRef.current = autocomplete;
  };
  
  const onPickupPlaceChanged = () => {
    if (pickupAutocompleteRef.current) {
      const place = pickupAutocompleteRef.current.getPlace();
      if (place.formatted_address && place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setForm(prev => ({ 
          ...prev, 
          pickupLocation: place.formatted_address, 
          pickupCoords: location 
        }));
      }
    }
  };
  
  const onDropoffLoad = (autocomplete) => {
    dropoffAutocompleteRef.current = autocomplete;
  };
  
  const onDropoffPlaceChanged = () => {
    if (dropoffAutocompleteRef.current) {
      const place = dropoffAutocompleteRef.current.getPlace();
      if (place.formatted_address && place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setForm(prev => ({ 
          ...prev, 
          dropoffLocation: place.formatted_address, 
          dropoffCoords: location 
        }));
      }
    }
  };

  const clearInput = (field) => {
    if (field === "origin") {
      setForm(prev => ({ ...prev, origin: "", originCoords: null }));
    } else if (field === "dest") {
      setForm(prev => ({ ...prev, dest: "", destCoords: null }));
    } else if (field === "pickupLocation") {
      setForm(prev => ({ ...prev, pickupLocation: "", pickupCoords: null }));
    } else if (field === "dropoffLocation") {
      setForm(prev => ({ ...prev, dropoffLocation: "", dropoffCoords: null }));
    }
    // Clear directions when location changes
    setDirections(null);
    setRouteInfo(null);
  };

  const openMapSelector = async (field) => {
    setMapTarget(field);
    
    let center = MAPUTO_CENTER;
    let hasCoords = false;
    
    if (field === "origin" && form.originCoords) {
      center = form.originCoords;
      hasCoords = true;
    } else if (field === "dest" && form.destCoords) {
      center = form.destCoords;
      hasCoords = true;
    } else if (field === "pickupLocation" && form.pickupCoords) {
      center = form.pickupCoords;
      hasCoords = true;
    } else if (field === "dropoffLocation" && form.dropoffCoords) {
      center = form.dropoffCoords;
      hasCoords = true;
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
  };

  const confirmMapLocation = () => {
    if (mapMarker) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat: mapMarker.lat, lng: mapMarker.lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const formatted = results[0].formatted_address;
          const coords = { lat: mapMarker.lat, lng: mapMarker.lng };
          
          if (mapTarget === "origin") {
            setForm(prev => ({ ...prev, origin: formatted, originCoords: coords }));
          } else if (mapTarget === "dest") {
            setForm(prev => ({ ...prev, dest: formatted, destCoords: coords }));
          } else if (mapTarget === "pickupLocation") {
            setForm(prev => ({ ...prev, pickupLocation: formatted, pickupCoords: coords }));
          } else if (mapTarget === "dropoffLocation") {
            setForm(prev => ({ ...prev, dropoffLocation: formatted, dropoffCoords: coords }));
          }
          // Clear directions when location changes
          setDirections(null);
          setRouteInfo(null);
        } else {
          const coords = { lat: mapMarker.lat, lng: mapMarker.lng };
          const label = `${mapMarker.lat.toFixed(5)}, ${mapMarker.lng.toFixed(5)}`;
          if (mapTarget === "origin") {
            setForm(prev => ({ ...prev, origin: label, originCoords: coords }));
          } else if (mapTarget === "dest") {
            setForm(prev => ({ ...prev, dest: label, destCoords: coords }));
          } else if (mapTarget === "pickupLocation") {
            setForm(prev => ({ ...prev, pickupLocation: label, pickupCoords: coords }));
          } else if (mapTarget === "dropoffLocation") {
            setForm(prev => ({ ...prev, dropoffLocation: label, dropoffCoords: coords }));
          }
          setDirections(null);
          setRouteInfo(null);
        }
        setMapOpen(false);
        setMapTarget(null);
        setMapMarker(null);
      });
    }
  };

  const closeMapSelector = () => {
    setMapOpen(false);
    setMapTarget(null);
    setMapMarker(null);
  };

  const closeRouteMap = () => {
    setRouteMapOpen(false);
    setDirections(null);
    setRouteInfo(null);
  };

  const useCurrentLocation = async (field) => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador.");
      return;
    }
    
    setLoadingLocations(prev => ({ ...prev, [field]: true }));

    console.log('--to get location--')
    
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

          console.log({formatted,coords})
          
          if (field === "origin") {
            setForm(prev => ({ ...prev, origin: formatted, originCoords: coords }));
          } else if (field === "dest") {
            setForm(prev => ({ ...prev, dest: formatted, destCoords: coords }));
          } else if (field === "pickupLocation") {
            setForm(prev => ({ ...prev, pickupLocation: formatted, pickupCoords: coords }));
          } else if (field === "dropoffLocation") {
            setForm(prev => ({ ...prev, dropoffLocation: formatted, dropoffCoords: coords }));
          }
          setDirections(null);
          setRouteInfo(null);
        } catch {
          const label = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          const coords = { lat: latitude, lng: longitude };
          if (field === "origin") {
            setForm(prev => ({ ...prev, origin: label, originCoords: coords }));
          } else if (field === "dest") {
            setForm(prev => ({ ...prev, dest: label, destCoords: coords }));
          } else if (field === "pickupLocation") {
            setForm(prev => ({ ...prev, pickupLocation: label, pickupCoords: coords }));
          } else if (field === "dropoffLocation") {
            setForm(prev => ({ ...prev, dropoffLocation: label, dropoffCoords: coords }));
          }
          setDirections(null);
          setRouteInfo(null);
        } finally {
          setLoadingLocations(prev => ({ ...prev, [field]: false }));
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Não foi possível obter a sua localização atual. Por favor, verifique as permissões.");
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
  
  const isLocationValid = () => {
    if (serviceType === "taxi") {
      if (step === 1) {
        return form.pickupCoords && form.dropoffCoords && form.pickupLocation && form.dropoffLocation;
      }
      return true;
    } else {
      if (step === 2) {
        return form.originCoords && form.destCoords && form.origin && form.dest;
      }
      return true;
    }
  };

  const handleNextStep = () => {
    if (!isLocationValid()) {
      alert("Por favor, selecione uma localização válida usando a pesquisa ou o mapa.");
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (step < (serviceType === "taxi" ? 4 : 4)) {
      if (!isLocationValid()) {
        alert("Por favor, selecione uma localização válida usando a pesquisa ou o mapa.");
        return;
      }
      setStep(step + 1);
      return;
    }
    
    if (serviceType === "taxi") {
      const distance = calculateDistance();
      const duration = calculateDuration();
      const total = calculateRidePrice();
      
      const newOrder = {
        id: `#TAXI${String(ORDERS.length + CUSTOMER_ORDERS.length + 1).padStart(3, "0")}`,
        clientId: user.id,
        client: user.name,
        serviceType: "taxi",
        pickupLocation: form.pickupLocation,
        dropoffLocation: form.dropoffLocation,
        pickupCoords: form.pickupCoords,
        dropoffCoords: form.dropoffCoords,
        passengerCount: form.passengerCount,
        returnTrip: form.returnTrip,
        waitingTime: form.waitingTime,
        hasLuggage: form.hasLuggage,
        instructions: form.rideInstructions,
        isScheduled: form.isScheduledRide,
        scheduledRideTime: form.scheduledRideTime,
        distance: `${distance} km`,
        duration: `${duration} min`,
        status: form.isScheduledRide ? "Agendado" : "Pendente",
        statusCode: form.isScheduledRide ? "scheduled" : "pending_approval",
        driver: null,
        total: `${total} MZN`,
        totalValue: total,
        orderDate: new Date().toISOString().split('T')[0],
        orderTime: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }),
        paymentMethod: form.paymentMethod,
        paymentStatus: "Pendente",
        timeline: form.isScheduledRide ? [
          { time: "Agora", status: "Corrida agendada", completed: true },
          { time: form.scheduledRideTime, status: "Motorista a caminho", completed: false },
          { time: "Em breve", status: "Em viagem", completed: false },
          { time: "Em breve", status: "Destino alcançado", completed: false }
        ] : [
          { time: "Agora", status: "Corrida solicitada", completed: true },
          { time: "Em breve", status: "Procurando motorista", completed: false },
          { time: "Em breve", status: "Motorista a caminho", completed: false },
          { time: "Em breve", status: "Em viagem", completed: false },
          { time: "Em breve", status: "Destino alcançado", completed: false }
        ]
      };
      
      CUSTOMER_ORDERS.push(newOrder);
      ORDERS.push({
        id: newOrder.id,
        client: user.name,
        clientId: user.id,
        serviceType: "taxi",
        pickupLocation: form.pickupLocation,
        dropoffLocation: form.dropoffLocation,
        status: newOrder.status,
        driver: "—",
        total: newOrder.total,
        time: newOrder.orderTime,
        distance: newOrder.distance,
        duration: newOrder.duration,
        passengerCount: form.passengerCount,
        paymentMethod: form.paymentMethod,
        paymentStatus: "Pendente"
      });
      
      NOTIFICATIONS.unshift({
        id: NOTIFICATIONS.length + 1,
        type: "ride",
        title: form.isScheduledRide ? `Corrida Agendada ${newOrder.id}` : `Nova Corrida ${newOrder.id}`,
        message: `${user.name} ${form.isScheduledRide ? 'agendou' : 'solicitou'} uma corrida`,
        time: "agora",
        read: false,
        icon: "car",
        userId: null
      });
    } else {
      const distance = calculateDistance();
      const duration = calculateDeliveryDuration();
      const total = calculateDeliveryPrice();
      
      const newOrder = {
        id: `#${String(ORDERS.length + CUSTOMER_ORDERS.length + 1).padStart(3, "0")}`,
        clientId: user.id,
        client: user.name,
        serviceType: "delivery",
        origin: form.origin,
        dest: form.dest,
        originCoords: form.originCoords,
        destCoords: form.destCoords,
        urgencyLevel: form.urgencyLevel,
        distance: `${distance} km`,
        duration: `${duration} min`,
        status: form.isScheduled ? "Agendado" : "Pendente",
        statusCode: form.isScheduled ? "scheduled" : "pending_approval",
        driver: null,
        total: `${total} MZN`,
        totalValue: total,
        orderDate: new Date().toISOString().split('T')[0],
        orderTime: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }),
        productName: form.productName,
        quantity: form.quantity,
        paymentMethod: form.paymentMethod,
        paymentStatus: "Pendente",
        instructions: form.instructions,
        observations: form.observations,
        scheduledTime: form.scheduledTime,
        timeline: form.isScheduled ? [
          { time: "Agora", status: "Pedido agendado", completed: true },
          { time: form.scheduledTime, status: "Preparando entrega", completed: false },
          { time: "Em breve", status: "Motorista designado", completed: false },
          { time: "Em breve", status: "Em coleta", completed: false },
          { time: "Em breve", status: "Em rota de entrega", completed: false },
          { time: "Em breve", status: "Entregue", completed: false }
        ] : [
          { time: "Agora", status: "Pedido enviado", completed: true },
          { time: "Em breve", status: "Aguardando aprovação", completed: false },
          { time: "Em breve", status: "Motorista designado", completed: false },
          { time: "Em breve", status: "Em coleta", completed: false },
          { time: "Em breve", status: "Em rota de entrega", completed: false },
          { time: "Em breve", status: "Entregue", completed: false }
        ]
      };
      
      CUSTOMER_ORDERS.push(newOrder);
      ORDERS.push({
        id: newOrder.id,
        client: user.name,
        clientId: user.id,
        origin: form.origin,
        dest: form.dest,
        status: newOrder.status,
        driver: "—",
        total: newOrder.total,
        time: newOrder.orderTime,
        distance: newOrder.distance,
        duration: newOrder.duration,
        productId: null,
        productName: form.productName,
        quantity: form.quantity,
        paymentMethod: form.paymentMethod,
        paymentStatus: "Pendente",
        urgencyLevel: form.urgencyLevel
      });
      
      NOTIFICATIONS.unshift({
        id: NOTIFICATIONS.length + 1,
        type: "order",
        title: form.isScheduled ? `Pedido Agendado ${newOrder.id}` : `Novo Pedido ${newOrder.id}`,
        message: `${user.name} fez um novo pedido - ${form.productName}`,
        time: "agora",
        read: false,
        icon: "package",
        userId: null
      });
    }
    
    onOrderCreated();
    onClose();
    setStep(1);
    setMapOpen(false);
    setRouteMapOpen(false);
    setMapTarget(null);
    setMapMarker(null);
    setDirections(null);
    setRouteInfo(null);
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
      waitingTime: 0
    });
  };
  
  if (!isOpen) return null;
  
  const getStepTitle = () => {
    if (serviceType === "taxi") {
      const titles = ["Localização", "Detalhes da Corrida", "Instruções", "Resumo"];
      return titles[step - 1];
    }
    return ["Item", "Endereços", "Detalhes", "Resumo"][step - 1];
  };
  
  const distance = calculateDistance();
  const duration = serviceType === "taxi" ? calculateDuration() : calculateDeliveryDuration();
  const ridePrice = serviceType === "taxi" ? calculateRidePrice() : 0;
  const deliveryPrice = serviceType === "delivery" ? calculateDeliveryPrice() : 0;
  const isCurrentStepValid = isLocationValid();
  
  // Check if both locations are selected to show route button
  const hasBothLocations = serviceType === "taxi" 
    ? (form.pickupCoords && form.dropoffCoords)
    : (form.originCoords && form.destCoords);
  
  return (
    <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {serviceType === "taxi" ? "Solicitar Corrida" : "Novo Pedido de Entrega"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {Array(4).fill().map((_, s) => (
                <div key={s} className={`h-1 w-8 rounded-full ${step >= s + 1 ? "bg-orange-500" : "bg-slate-200"}`} />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">{getStepTitle()}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Icon name="x" size={18} />
          </button>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            {serviceType === "taxi" ? (
              <>
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Local de Embarque *</label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 z-10">
                          <Icon name="mapPin" size={16} className="text-green-500" />
                        </div>
                        {isLoaded ? (
                          <Autocomplete
                            onLoad={onPickupLoad}
                            onPlaceChanged={onPickupPlaceChanged}
                            options={{ componentRestrictions: { country: "mz" } }}
                          >
                            <input
                              type="text"
                              value={form.pickupLocation}
                              onChange={(e) => setForm(prev => ({ ...prev, pickupLocation: e.target.value }))}
                              placeholder="Digite o endereço de embarque..."
                              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                              required
                            />
                          </Autocomplete>
                        ) : (
                          <input
                            type="text"
                            value={form.pickupLocation}
                            onChange={(e) => setForm(prev => ({ ...prev, pickupLocation: e.target.value }))}
                            placeholder="Carregando mapas..."
                            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                            disabled
                          />
                        )}
                        {form.pickupLocation && (
                          <button
                            type="button"
                            onClick={() => clearInput("pickupLocation")}
                            className="absolute right-2 top-2 p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200"
                          >
                            <Icon name="x" size={14} />
                          </button>
                        )}
                      </div>
                      <div className="flex gap-4 mt-2">
                        <button
                          type="button"
                          onClick={() => useCurrentLocation("pickupLocation")}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                          disabled={loadingLocations.pickupLocation}
                        >
                          {loadingLocations.pickupLocation ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                              <span>A obter localização...</span>
                            </>
                          ) : (
                            <>
                              <Icon name="navigation" size={12} />
                              <span>Usar minha localização</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openMapSelector("pickupLocation")}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          <Icon name="map" size={12} />
                          Selecionar no mapa
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Local de Desembarque *</label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 z-10">
                          <Icon name="navigation" size={16} className="text-red-500" />
                        </div>
                        {isLoaded ? (
                          <Autocomplete
                            onLoad={onDropoffLoad}
                            onPlaceChanged={onDropoffPlaceChanged}
                            options={{ componentRestrictions: { country: "mz" } }}
                          >
                            <input
                              type="text"
                              value={form.dropoffLocation}
                              onChange={(e) => setForm(prev => ({ ...prev, dropoffLocation: e.target.value }))}
                              placeholder="Digite o endereço de destino..."
                              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                              required
                            />
                          </Autocomplete>
                        ) : (
                          <input
                            type="text"
                            value={form.dropoffLocation}
                            onChange={(e) => setForm(prev => ({ ...prev, dropoffLocation: e.target.value }))}
                            placeholder="Carregando mapas..."
                            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                            disabled
                          />
                        )}
                        {form.dropoffLocation && (
                          <button
                            type="button"
                            onClick={() => clearInput("dropoffLocation")}
                            className="absolute right-2 top-2 p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200"
                          >
                            <Icon name="x" size={14} />
                          </button>
                        )}
                      </div>
                      <div className="flex gap-4 mt-2">
                        <button
                          type="button"
                          onClick={() => useCurrentLocation("dropoffLocation")}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                          disabled={loadingLocations.dropoffLocation}
                        >
                          {loadingLocations.dropoffLocation ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                              <span>A obter localização...</span>
                            </>
                          ) : (
                            <>
                              <Icon name="navigation" size={12} />
                              <span>Usar minha localização</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openMapSelector("dropoffLocation")}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          <Icon name="map" size={12} />
                          Selecionar no mapa
                        </button>
                      </div>
                    </div>
                    
                    {/* Live Preview */}
                    {form.pickupLocation && form.dropoffLocation && form.pickupCoords && form.dropoffCoords && (
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon name="map" size={16} className="text-blue-500" />
                            <span className="text-xs font-semibold text-blue-700">Estimativa de viagem</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-blue-700">{distance} km</p>
                            <p className="text-xs text-blue-600">Distância</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-blue-700">{duration} min</p>
                            <p className="text-xs text-blue-600">Duração</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-blue-700">{ridePrice} MZN</p>
                            <p className="text-xs text-blue-600">Estimativa</p>
                          </div>
                        </div>
                        
                        {/* Ver Rota Button */}
                        <button
                          type="button"
                          onClick={calculateRoute}
                          disabled={loadingRoute}
                          className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                        >
                          {loadingRoute ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>A calcular rota...</span>
                            </>
                          ) : (
                            <>
                              <Icon name="map" size={16} />
                              <span>Ver Rota</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {(!form.pickupCoords || !form.dropoffCoords) && (
                      <div className="bg-yellow-50 rounded-xl p-2 border border-yellow-200">
                        <p className="text-xs text-yellow-700 text-center">
                          ⚠️ Selecione uma localização válida usando a pesquisa ou o mapa
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Rest of taxi steps... */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Número de Passageiros</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, passengerCount: Math.max(1, form.passengerCount - 1) })}
                          className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600"
                        >
                          <Icon name="minus" size={18} />
                        </button>
                        <span className="text-xl font-bold text-slate-800 w-8 text-center">{form.passengerCount}</span>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, passengerCount: Math.min(6, form.passengerCount + 1) })}
                          className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600"
                        >
                          <Icon name="plus" size={18} />
                        </button>
                        <span className="text-xs text-slate-400 ml-2">máx. 6 pessoas</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Icon name="luggage" size={18} className="text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">Bagagem extra?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, hasLuggage: !form.hasLuggage })}
                        className={`w-12 h-6 rounded-full transition-colors ${form.hasLuggage ? "bg-blue-500" : "bg-slate-300"}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.hasLuggage ? "translate-x-6" : "translate-x-0.5"} mt-0.5`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Icon name="repeat" size={18} className="text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">Viagem de volta?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, returnTrip: !form.returnTrip })}
                        className={`w-12 h-6 rounded-full transition-colors ${form.returnTrip ? "bg-blue-500" : "bg-slate-300"}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.returnTrip ? "translate-x-6" : "translate-x-0.5"} mt-0.5`} />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Tempo de espera (minutos)</label>
                      <input
                        type="number"
                        value={form.waitingTime}
                        onChange={e => setForm({ ...form, waitingTime: parseInt(e.target.value) || 0 })}
                        min="0"
                        step="5"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <p className="text-xs text-slate-400 mt-1">Taxa adicional de 4 MZN por minuto de espera</p>
                    </div>
                    
                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon name="calendar" size={18} className="text-slate-500" />
                          <span className="text-sm font-medium text-slate-700">Agendar corrida</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, isScheduledRide: !form.isScheduledRide })}
                          className={`w-12 h-6 rounded-full transition-colors ${form.isScheduledRide ? "bg-blue-500" : "bg-slate-300"}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.isScheduledRide ? "translate-x-6" : "translate-x-0.5"} mt-0.5`} />
                        </button>
                      </div>
                      
                      {form.isScheduledRide && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Data e Hora *</label>
                          <input
                            type="datetime-local"
                            value={form.scheduledRideTime}
                            onChange={e => setForm({ ...form, scheduledRideTime: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required={form.isScheduledRide}
                          />
                          <p className="text-xs text-green-600 mt-1">✓ Agendamento sem taxa adicional</p>
                        </div>
                      )}
                      
                      {!form.isScheduledRide && (
                        <p className="text-xs text-blue-600">Corrida para agora mesmo</p>
                      )}
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Instruções para o motorista</label>
                      <textarea
                        value={form.rideInstructions}
                        onChange={e => setForm({ ...form, rideInstructions: e.target.value })}
                        placeholder="Ex: Portão azul, tocar campainha, estou no segundo andar, ponto de referência próximo ao mercadinho..."
                        rows={4}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      />
                    </div>
                    
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                      <div className="flex items-start gap-2">
                        <Icon name="info" size={16} className="text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-amber-700">Dica de segurança</p>
                          <p className="text-xs text-amber-600 mt-0.5">
                            Compartilhe os detalhes da sua viagem com familiares ou amigos.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-500 mb-3">Resumo da Corrida</p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 pb-2 border-b border-slate-200">
                          <Icon name="mapPin" size={16} className="text-green-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-slate-400">Embarque</p>
                            <p className="text-sm font-medium text-slate-800">{form.pickupLocation}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 pb-2 border-b border-slate-200">
                          <Icon name="navigation" size={16} className="text-red-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-slate-400">Desembarque</p>
                            <p className="text-sm font-medium text-slate-800">{form.dropoffLocation}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="bg-white rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-400">Distância</p>
                            <p className="text-base font-bold text-slate-800">{distance} km</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-400">Duração</p>
                            <p className="text-base font-bold text-slate-800">{duration} min</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1 pt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Passageiros:</span>
                            <span className="font-medium text-slate-800">{form.passengerCount}</span>
                          </div>
                          {form.hasLuggage && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Bagagem extra:</span>
                              <span className="font-medium text-slate-800">+40 MZN</span>
                            </div>
                          )}
                          {form.returnTrip && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Viagem de volta:</span>
                              <span className="font-medium text-slate-800">+120 MZN</span>
                            </div>
                          )}
                          {form.waitingTime > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Tempo de espera:</span>
                              <span className="font-medium text-slate-800">{form.waitingTime} min (+{form.waitingTime * 4} MZN)</span>
                            </div>
                          )}
                          {form.isScheduledRide && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Agendado para:</span>
                              <span className="font-medium text-slate-800">{new Date(form.scheduledRideTime).toLocaleString()}</span>
                            </div>
                          )}
                          {form.rideInstructions && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Instruções:</span>
                              <span className="font-medium text-slate-800 truncate max-w-[180px]">{form.rideInstructions}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Método de Pagamento *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Transferência", "M-Pesa", "e-Mola"].map(method => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setForm({ ...form, paymentMethod: method })}
                            className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                              form.paymentMethod === method
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-slate-600 border-slate-200"
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">Valor Total:</span>
                        <span className="text-xl font-bold text-blue-500">
                          {ridePrice} MZN
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        *Preço fixo garantido. Sem surpresas!
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // DELIVERY FLOW
              <>
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Produto/Item *</label>
                      <input
                        type="text"
                        value={form.productName}
                        onChange={e => setForm({ ...form, productName: e.target.value })}
                        placeholder="Ex: Pizza, Documentos, Encomenda..."
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Quantidade</label>
                        <input
                          type="number"
                          value={form.quantity}
                          onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                          min="1"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Peso Estimado (kg)</label>
                        <input
                          type="text"
                          value={form.weight}
                          onChange={e => setForm({ ...form, weight: e.target.value })}
                          placeholder="Ex: 2.5"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Observações adicionais</label>
                      <textarea
                        value={form.observations}
                        onChange={e => setForm({ ...form, observations: e.target.value })}
                        placeholder="Ex: Frágil, Manusear com cuidado..."
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                      />
                    </div>
                  </div>
                )}
                
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Origem (Local de coleta) *</label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 z-10">
                          <Icon name="mapPin" size={16} className="text-green-500" />
                        </div>
                        {isLoaded ? (
                          <Autocomplete
                            onLoad={onOriginLoad}
                            onPlaceChanged={onOriginPlaceChanged}
                            options={{ componentRestrictions: { country: "mz" } }}
                          >
                            <input
                              type="text"
                              value={form.origin}
                              onChange={(e) => setForm(prev => ({ ...prev, origin: e.target.value }))}
                              placeholder="Digite o endereço de origem..."
                              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                              required
                            />
                          </Autocomplete>
                        ) : (
                          <input
                            type="text"
                            value={form.origin}
                            onChange={(e) => setForm(prev => ({ ...prev, origin: e.target.value }))}
                            placeholder="Carregando mapas..."
                            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                            disabled
                          />
                        )}
                        {form.origin && (
                          <button
                            type="button"
                            onClick={() => clearInput("origin")}
                            className="absolute right-2 top-2 p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200"
                          >
                            <Icon name="x" size={14} />
                          </button>
                        )}
                      </div>
                      <div className="flex gap-4 mt-2">
                        <button
                          type="button"
                          onClick={() => useCurrentLocation("origin")}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                          disabled={loadingLocations.origin}
                        >
                          {loadingLocations.origin ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                              <span>A obter localização...</span>
                            </>
                          ) : (
                            <>
                              <Icon name="navigation" size={12} />
                              <span>Usar minha localização</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openMapSelector("origin")}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          <Icon name="map" size={12} />
                          Selecionar no mapa
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Destino (Local de entrega) *</label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 z-10">
                          <Icon name="navigation" size={16} className="text-red-500" />
                        </div>
                        {isLoaded ? (
                          <Autocomplete
                            onLoad={onDestLoad}
                            onPlaceChanged={onDestPlaceChanged}
                            options={{ componentRestrictions: { country: "mz" } }}
                          >
                            <input
                              type="text"
                              value={form.dest}
                              onChange={(e) => setForm(prev => ({ ...prev, dest: e.target.value }))}
                              placeholder="Digite o endereço de destino..."
                              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                              required
                            />
                          </Autocomplete>
                        ) : (
                          <input
                            type="text"
                            value={form.dest}
                            onChange={(e) => setForm(prev => ({ ...prev, dest: e.target.value }))}
                            placeholder="Carregando mapas..."
                            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                            disabled
                          />
                        )}
                        {form.dest && (
                          <button
                            type="button"
                            onClick={() => clearInput("dest")}
                            className="absolute right-2 top-2 p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200"
                          >
                            <Icon name="x" size={14} />
                          </button>
                        )}
                      </div>
                      <div className="flex gap-4 mt-2">
                        <button
                          type="button"
                          onClick={() => useCurrentLocation("dest")}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                          disabled={loadingLocations.dest}
                        >
                          {loadingLocations.dest ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                              <span>A obter localização...</span>
                            </>
                          ) : (
                            <>
                              <Icon name="navigation" size={12} />
                              <span>Usar minha localização</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openMapSelector("dest")}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          <Icon name="map" size={12} />
                          Selecionar no mapa
                        </button>
                      </div>
                    </div>
                    
                    {/* Live Preview for Delivery */}
                    {form.origin && form.dest && form.originCoords && form.destCoords && (
                      <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon name="map" size={16} className="text-orange-500" />
                            <span className="text-xs font-semibold text-orange-700">Estimativa de entrega</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-orange-700">{distance} km</p>
                            <p className="text-xs text-orange-600">Distância</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-orange-700">{duration} min</p>
                            <p className="text-xs text-orange-600">Duração estimada</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-orange-700">{deliveryPrice} MZN</p>
                            <p className="text-xs text-orange-600">Estimativa</p>
                          </div>
                        </div>
                        {form.urgencyLevel !== "normal" && (
                          <div className="mt-2 pt-2 border-t border-orange-200">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-orange-600">Prioridade {getUrgencyLabel(form.urgencyLevel)}:</span>
                              <span className="font-semibold text-orange-700">+{form.urgencyLevel === "urgent" ? "30%" : "60%"} na taxa</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Ver Rota Button */}
                        <button
                          type="button"
                          onClick={calculateRoute}
                          disabled={loadingRoute}
                          className="w-full mt-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors"
                        >
                          {loadingRoute ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>A calcular rota...</span>
                            </>
                          ) : (
                            <>
                              <Icon name="map" size={16} />
                              <span>Ver Rota</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {(!form.originCoords || !form.destCoords) && (
                      <div className="bg-yellow-50 rounded-xl p-2 border border-yellow-200">
                        <p className="text-xs text-yellow-700 text-center">
                          ⚠️ Selecione uma localização válida usando a pesquisa ou o mapa
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Contacto da origem</label>
                      <input
                        type="tel"
                        value={form.contactOrigin}
                        onChange={e => setForm({ ...form, contactOrigin: e.target.value })}
                        placeholder="+258 84 000 0000"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Contacto do destino</label>
                      <input
                        type="tel"
                        value={form.contactDest}
                        onChange={e => setForm({ ...form, contactDest: e.target.value })}
                        placeholder="+258 84 000 0000"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2">Nível de Urgência *</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, urgencyLevel: "normal" })}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            form.urgencyLevel === "normal"
                              ? "border-green-500 bg-green-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <Icon name="clock" size={20} className={`mx-auto mb-1 ${form.urgencyLevel === "normal" ? "text-green-500" : "text-slate-400"}`} />
                          <p className={`text-xs font-semibold ${form.urgencyLevel === "normal" ? "text-green-700" : "text-slate-600"}`}>Normal</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">+0%</p>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, urgencyLevel: "urgent" })}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            form.urgencyLevel === "urgent"
                              ? "border-amber-500 bg-amber-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <Icon name="zap" size={20} className={`mx-auto mb-1 ${form.urgencyLevel === "urgent" ? "text-amber-500" : "text-slate-400"}`} />
                          <p className={`text-xs font-semibold ${form.urgencyLevel === "urgent" ? "text-amber-700" : "text-slate-600"}`}>Urgente</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">+30%</p>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, urgencyLevel: "very_urgent" })}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            form.urgencyLevel === "very_urgent"
                              ? "border-red-500 bg-red-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <Icon name="alertTriangle" size={20} className={`mx-auto mb-1 ${form.urgencyLevel === "very_urgent" ? "text-red-500" : "text-slate-400"}`} />
                          <p className={`text-xs font-semibold ${form.urgencyLevel === "very_urgent" ? "text-red-700" : "text-slate-600"}`}>Muito Urgente</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">+60%</p>
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon name="calendar" size={18} className="text-slate-500" />
                          <span className="text-sm font-medium text-slate-700">Agendar entrega</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, isScheduled: !form.isScheduled })}
                          className={`w-12 h-6 rounded-full transition-colors ${form.isScheduled ? "bg-orange-500" : "bg-slate-300"}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.isScheduled ? "translate-x-6" : "translate-x-0.5"} mt-0.5`} />
                        </button>
                      </div>
                      
                      {form.isScheduled && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Data e Hora da Entrega *</label>
                          <input
                            type="datetime-local"
                            value={form.scheduledTime}
                            onChange={e => setForm({ ...form, scheduledTime: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required={form.isScheduled}
                          />
                          <p className="text-xs text-green-600 mt-1">✓ Agendamento sem taxa adicional</p>
                        </div>
                      )}
                      
                      {!form.isScheduled && (
                        <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                          <div className="flex items-center gap-2">
                            <Icon name="clock" size={16} className="text-green-500" />
                            <p className="text-xs text-green-700 font-medium">Entrega para agora mesmo</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Instruções para o motorista</label>
                      <textarea
                        value={form.instructions}
                        onChange={e => setForm({ ...form, instructions: e.target.value })}
                        placeholder="Ex: Portão azul, tocar campainha, interfone 45, ponto de referência..."
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                      />
                    </div>
                    
                    {form.urgencyLevel !== "normal" && (
                      <div className={`rounded-xl p-3 border ${
                        form.urgencyLevel === "urgent" 
                          ? "bg-amber-50 border-amber-200" 
                          : "bg-red-50 border-red-200"
                      }`}>
                        <div className="flex items-start gap-2">
                          <Icon name={form.urgencyLevel === "urgent" ? "zap" : "alertTriangle"} size={16} className={form.urgencyLevel === "urgent" ? "text-amber-500" : "text-red-500"} />
                          <div>
                            <p className={`text-xs font-semibold ${form.urgencyLevel === "urgent" ? "text-amber-700" : "text-red-700"}`}>
                              {form.urgencyLevel === "urgent" ? "Entrega Urgente" : "Entrega Muito Urgente"}
                            </p>
                            <p className={`text-xs ${form.urgencyLevel === "urgent" ? "text-amber-600" : "text-red-600"} mt-0.5`}>
                              {form.urgencyLevel === "urgent" 
                                ? "Taxa adicional de 30% para prioridade na entrega" 
                                : "Taxa adicional de 60% para prioridade máxima - entrega em até 30min"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-500 mb-3">Resumo do Pedido</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Item:</span>
                          <span className="text-sm font-medium text-slate-800">{form.productName} (x{form.quantity})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Origem:</span>
                          <span className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{form.origin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Destino:</span>
                          <span className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{form.dest}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="bg-white rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-400">Distância</p>
                            <p className="text-base font-bold text-slate-800">{distance} km</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-400">Tempo Estimado</p>
                            <p className="text-base font-bold text-slate-800">{duration} min</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Urgência:</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getUrgencyColor(form.urgencyLevel)}`}>
                            {getUrgencyLabel(form.urgencyLevel)}
                          </span>
                        </div>
                        {form.isScheduled && form.scheduledTime && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Agendado para:</span>
                            <span className="text-sm font-medium text-slate-800">{new Date(form.scheduledTime).toLocaleString()}</span>
                          </div>
                        )}
                        {!form.isScheduled && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Entrega:</span>
                            <span className="text-sm font-medium text-green-600">Imediata</span>
                          </div>
                        )}
                        {form.instructions && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Instruções:</span>
                            <span className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{form.instructions}</span>
                          </div>
                        )}
                        {form.observations && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Observações:</span>
                            <span className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{form.observations}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Método de Pagamento *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Transferência", "M-Pesa", "e-Mola"].map(method => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setForm({ ...form, paymentMethod: method })}
                            className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                              form.paymentMethod === method
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-white text-slate-600 border-slate-200"
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">Valor Total:</span>
                        <span className="text-xl font-bold text-orange-500">
                          {deliveryPrice} MZN
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-orange-200">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Taxa base:</span>
                          <span className="font-medium">{Math.round(deliveryPrice / (form.urgencyLevel === "urgent" ? 1.3 : form.urgencyLevel === "very_urgent" ? 1.6 : 1))} MZN</span>
                        </div>
                        {form.urgencyLevel === "urgent" && (
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Taxa urgente (30%):</span>
                            <span className="font-medium text-amber-600">+{Math.round(deliveryPrice - (deliveryPrice / 1.3))} MZN</span>
                          </div>
                        )}
                        {form.urgencyLevel === "very_urgent" && (
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Taxa muito urgente (60%):</span>
                            <span className="font-medium text-red-600">+{Math.round(deliveryPrice - (deliveryPrice / 1.6))} MZN</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs font-semibold mt-1 pt-1 border-t border-orange-200">
                          <span className="text-slate-700">Total a pagar:</span>
                          <span className="text-orange-700">{deliveryPrice} MZN</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        *O valor final será confirmado após análise do pedido
                      </p>
                    </div>
                  </div>
                )}
              </>
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
              <button
                type="submit"
                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg ${
                  serviceType === "taxi" 
                    ? "bg-blue-500 shadow-blue-500/30 hover:bg-blue-600" 
                    : "bg-orange-500 shadow-orange-500/30 hover:bg-orange-600"
                } ${(serviceType === "taxi" && step === 1 && !isCurrentStepValid) || (serviceType === "delivery" && step === 2 && !isCurrentStepValid) ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={(serviceType === "taxi" && step === 1 && !isCurrentStepValid) || (serviceType === "delivery" && step === 2 && !isCurrentStepValid)}
              >
                {step < 4 ? "Continuar" : "Confirmar"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Map Selection Modal - Fixed height */}
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
                  options={{ disableDefaultUI: true, zoomControl: true }}
                >
                  {mapMarker && <Marker position={mapMarker} />}
                </GoogleMap>
              )}
            </div>
            <div className="px-4 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-3 text-center">
                Clique no mapa para selecionar uma localização
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeMapSelector}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmMapLocation}
                  disabled={!mapMarker}
                  className={`flex-1 py-2 rounded-xl text-white font-bold text-sm shadow-lg ${
                    mapMarker 
                      ? "bg-green-500 hover:bg-green-600" 
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Detalhes da Rota</h3>
                {routeInfo && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {routeInfo.distance} • {routeInfo.duration}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeRouteMap}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Map Side */}
              <div className="w-1/2 h-96 bg-slate-100 relative">
                {isLoaded && directions && (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={mapCenter}
                    zoom={12}
                    options={{ disableDefaultUI: true, zoomControl: true }}
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
              
              {/* Directions Side */}
              <div className="w-1/2 bg-slate-50 overflow-y-auto p-3">
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Instruções da Rota</h4>
                <div className="space-y-2">
                  {routeInfo && routeInfo.steps.map((step, idx) => (
                    <div key={idx} className="text-xs text-slate-600 pb-2 border-b border-slate-200 last:border-0">
                      <div dangerouslySetInnerHTML={{ __html: step.instruction }} />
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-slate-400">{step.distance}</span>
                        <span className="text-[10px] text-slate-400">{step.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeRouteMap}
                  className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrderModal;