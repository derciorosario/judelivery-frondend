import { useCallback, useEffect, useRef, useState } from "react";
import { Geolocation } from "@capacitor/geolocation";
import { useSocket } from "../../contexts/SocketContext";
import { isNative } from "../../api/client";

// Singleton to track if location is already being watched globally
let globalWatchId = null;
let globalIsActive = false;
let globalPosition = null;
let globalHeading = 0;
let globalAccuracy = null;
let globalLastUpdate = null;
let globalGpsPermission = "prompt";
let globalListeners = [];

const useDriverLocation = ({ autoStart = true, orderId = null } = {}) => {
  const { socket, connected } = useSocket();
  const [position, setPosition] = useState(globalPosition);
  const [heading, setHeading] = useState(globalHeading);
  const [accuracy, setAccuracy] = useState(globalAccuracy);
  const [lastUpdate, setLastUpdate] = useState(globalLastUpdate);
  const [gpsPermission, setGpsPermission] = useState(globalGpsPermission);
  const [isActive, setIsActive] = useState(globalIsActive);
  const watchIdRef = useRef(null);
  const isStartingRef = useRef(false);
  const listenerIdRef = useRef(null);

  // Update all listeners when global state changes
  const updateAllListeners = useCallback(() => {
    globalListeners.forEach(listener => {
      if (listener.setPosition) listener.setPosition(globalPosition);
      if (listener.setHeading) listener.setHeading(globalHeading);
      if (listener.setAccuracy) listener.setAccuracy(globalAccuracy);
      if (listener.setLastUpdate) listener.setLastUpdate(globalLastUpdate);
      if (listener.setGpsPermission) listener.setGpsPermission(globalGpsPermission);
      if (listener.setIsActive) listener.setIsActive(globalIsActive);
    });
  }, []);

  const stop = useCallback(() => {
    // Only stop if we're the last listener or stopping globally
    if (globalListeners.length <= 1) {
      if (globalWatchId !== null) {
        if (isNative) {
          Geolocation.clearWatch({ id: globalWatchId });
        } else if (navigator.geolocation) {
          navigator.geolocation.clearWatch(globalWatchId);
        }
        globalWatchId = null;
      }
      globalIsActive = false;
      globalPosition = null;
      globalLastUpdate = null;
      isStartingRef.current = false;
      
      if (socket && connected) {
        socket.emit("driver:status", "offline");
      }
    } else {
      // Just remove this listener
      globalListeners = globalListeners.filter(l => l.id !== listenerIdRef.current);
    }
    
    // Update local state
    setIsActive(globalIsActive);
    setPosition(globalPosition);
    setLastUpdate(globalLastUpdate);
  }, [socket, connected]);

  const handlePosition = useCallback((pos) => {
    const { latitude, longitude, heading, accuracy } = pos.coords;
    const coords = { lat: latitude, lng: longitude };
    
    globalPosition = coords;
    globalHeading = heading || 0;
    globalAccuracy = accuracy;
    globalLastUpdate = new Date();
    globalGpsPermission = "granted";
    globalIsActive = true;

    // Update local state
    setPosition(coords);
    setHeading(heading || 0);
    setAccuracy(accuracy);
    setLastUpdate(globalLastUpdate);
    setGpsPermission("granted");
    setIsActive(true);

    // Notify all listeners
    updateAllListeners();

    // Only emit if socket is connected
    if (socket && connected) {
      socket.emit("driver:location", coords);
      if (orderId) {
        socket.emit("order:location", { orderId, coords });
      }
    } else {
      console.log("Socket not connected, location stored locally");
    }
  }, [socket, connected, orderId, updateAllListeners]);

  const handleError = useCallback((err) => {
    console.error("Geolocation watch error:", err);
    
    if (err && err.code === err.PERMISSION_DENIED) {
      globalGpsPermission = "denied";
      globalIsActive = false;
      setGpsPermission("denied");
      setIsActive(false);
      isStartingRef.current = false;
    } else if (err && err.code === err.TIMEOUT) {
      // Retry on timeout
      console.log("Geolocation timeout, retrying...");
      setTimeout(() => {
        if (globalWatchId === null && !isStartingRef.current) {
          startWatching();
        }
      }, 3000);
    } else {
      globalGpsPermission = "prompt";
      globalIsActive = false;
      setGpsPermission("prompt");
      setIsActive(false);
      isStartingRef.current = false;
    }
  }, []);

  const startWatching = useCallback(() => {
    // Don't start if already watching
    if (globalWatchId !== null) {
      console.log("Already watching location");
      isStartingRef.current = false;
      return;
    }

    if (isNative) {
      Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
        (position, err) => {
          if (err) {
            handleError(err);
            return;
          }
          if (position) handlePosition(position);
        }
      )
        .then((id) => {
          globalWatchId = id;
          watchIdRef.current = id;
          isStartingRef.current = false;
        })
        .catch((error) => {
          console.error("Error starting native geolocation watch:", error);
          isStartingRef.current = false;
          globalGpsPermission = "denied";
          setGpsPermission("denied");
        });
      return;
    }

    try {
      const id = navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 5000 
        }
      );
      globalWatchId = id;
      watchIdRef.current = id;
      isStartingRef.current = false;
    } catch (error) {
      console.error("Error starting geolocation watch:", error);
      isStartingRef.current = false;
      globalGpsPermission = "denied";
      setGpsPermission("denied");
    }
  }, [handlePosition, handleError]);

  const start = useCallback(() => {
    // Prevent multiple start attempts
    if (isStartingRef.current || globalWatchId !== null) {
      console.log("Location tracking already active or starting");
      return;
    }

    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      globalGpsPermission = "denied";
      setGpsPermission("denied");
      return;
    }

    isStartingRef.current = true;

    // On native platforms use the Capacitor Geolocation plugin
    if (isNative) {
      Geolocation.checkPermissions()
        .then((status) => {
          if (status.location === "denied") {
            globalGpsPermission = "denied";
            setGpsPermission("denied");
            globalIsActive = false;
            setIsActive(false);
            isStartingRef.current = false;
            return;
          }
          return Geolocation.requestPermissions();
        })
        .then((status) => {
          if (status && status.location === "denied") {
            globalGpsPermission = "denied";
            setGpsPermission("denied");
            globalIsActive = false;
            setIsActive(false);
            isStartingRef.current = false;
            return;
          }
          startWatching();
        })
        .catch((err) => {
          console.error("Native geolocation permission error:", err);
          globalGpsPermission = "denied";
          setGpsPermission("denied");
          globalIsActive = false;
          setIsActive(false);
          isStartingRef.current = false;
        });
      return;
    }

    // First, check current permission state
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state === 'denied') {
          globalGpsPermission = "denied";
          setGpsPermission("denied");
          globalIsActive = false;
          setIsActive(false);
          isStartingRef.current = false;
          return;
        }
        
        // Start watching if not denied
        startWatching();
        
        // Listen for permission changes
        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted') {
            console.log("Permission granted, starting location tracking...");
            globalGpsPermission = "granted";
            setGpsPermission("granted");
            startWatching();
          } else if (permissionStatus.state === 'denied') {
            globalGpsPermission = "denied";
            setGpsPermission("denied");
            stop();
          }
        };
      }).catch(() => {
        // Fallback if permissions API not supported
        startWatching();
      });
    } else {
      // Fallback for browsers without permissions API
      startWatching();
    }
  }, [startWatching, stop]);

  const setPositionCallback = useCallback((pos) => {
    globalPosition = pos;
    setPosition(pos);
    updateAllListeners();
  }, [updateAllListeners]);

  // Register this component as a listener
  useEffect(() => {
    const listenerId = Date.now() + Math.random();
    listenerIdRef.current = listenerId;
    
    const listener = {
      id: listenerId,
      setPosition,
      setHeading,
      setAccuracy,
      setLastUpdate,
      setGpsPermission,
      setIsActive
    };
    
    globalListeners.push(listener);

    // Initialize with current global state
    setPosition(globalPosition);
    setHeading(globalHeading);
    setAccuracy(globalAccuracy);
    setLastUpdate(globalLastUpdate);
    setGpsPermission(globalGpsPermission);
    setIsActive(globalIsActive);

    return () => {
      // Remove this listener on unmount
      globalListeners = globalListeners.filter(l => l.id !== listenerId);
      if (globalListeners.length === 0 && globalWatchId !== null) {
        // Only stop if no listeners remain
        if (isNative) {
          Geolocation.clearWatch({ id: globalWatchId });
        } else if (navigator.geolocation) {
          navigator.geolocation.clearWatch(globalWatchId);
        }
        globalWatchId = null;
        globalIsActive = false;
        globalPosition = null;
        globalLastUpdate = null;
      }
    };
  }, []);

  // Monitor socket connection and resend last position when reconnected
  useEffect(() => {
    if (connected && socket && globalIsActive && globalPosition) {
      // Resend last known position when socket reconnects
      socket.emit("driver:location", globalPosition);
      socket.emit("driver:status", "online");
      if (orderId) {
        socket.emit("order:location", { orderId, coords: globalPosition });
      }
    }
  }, [connected, socket, orderId]);

  // Auto-start effect with better handling
  useEffect(() => {
    if (!autoStart) return;
    
    // Small delay to ensure everything is ready
    const timer = setTimeout(() => {
      if (globalWatchId === null) {
        start();
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      // Don't stop here - other components might be using location
    };
  }, [autoStart, start]);

  // Check if permission is already granted on mount and start if needed
  useEffect(() => {
    if (!autoStart) return;
    
    const checkExistingPermission = async () => {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          if (result.state === 'granted' && globalWatchId === null) {
            console.log("Existing permission found, starting location tracking");
            start();
          } else if (result.state === 'prompt' && globalWatchId === null) {
            console.log("Permission not yet granted, will request when available");
            start();
          }
        } catch (error) {
          console.error("Error checking permission:", error);
          if (globalWatchId === null) {
            start();
          }
        }
      } else if (globalWatchId === null) {
        start();
      }
    };
    
    checkExistingPermission();
  }, [autoStart, start]);

  console.log({socket,connected, isActive, globalWatchId, listeners: globalListeners.length})

  return {
    position,
    heading,
    accuracy,
    lastUpdate,
    gpsPermission,
    isActive,
    start,
    stop,
    setPosition: setPositionCallback,
  };
};

export default useDriverLocation;