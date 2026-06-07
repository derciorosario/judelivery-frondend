import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../../contexts/SocketContext";

const useDriverLocation = ({ autoStart = true, orderId = null } = {}) => {
  const { socket, connected } = useSocket();
  const [position, setPosition] = useState(null);
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [gpsPermission, setGpsPermission] = useState("prompt");
  const [isActive, setIsActive] = useState(false);
  const watchIdRef = useRef(null);
  const isStartingRef = useRef(false);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setPosition(null);
    setLastUpdate(null);
    setIsActive(false);
    isStartingRef.current = false;
    
    if (socket && connected) {
      socket.emit("driver:status", "offline");
    }
  }, [socket, connected]);

  const start = useCallback(() => {
    // Prevent multiple start attempts
    if (isStartingRef.current || watchIdRef.current !== null) {
      console.log("Location tracking already active or starting");
      return;
    }

    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      setGpsPermission("denied");
      return;
    }

    isStartingRef.current = true;

    // First, check current permission state
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state === 'denied') {
          setGpsPermission("denied");
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
            setGpsPermission("granted");
            startWatching();
          } else if (permissionStatus.state === 'denied') {
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
  }, [socket, connected, orderId, stop]);

  const startWatching = useCallback(() => {
    // Don't start if already watching
    if (watchIdRef.current !== null) {
      console.log("Already watching location");
      isStartingRef.current = false;
      return;
    }

    const watchSuccess = (pos) => {
      const { latitude, longitude, heading, accuracy } = pos.coords;
      const coords = { lat: latitude, lng: longitude };
      
      setPosition(coords);
      setHeading(heading || 0);
      setAccuracy(accuracy);
      setLastUpdate(new Date());
      setGpsPermission("granted");
      setIsActive(true);

      // Only emit if socket is connected
      if (socket && connected) {
        socket.emit("driver:location", coords);
        socket.emit("driver:status", "online");
        if (orderId) {
          socket.emit("order:location", { orderId, coords });
        }
      } else {
        console.log("Socket not connected, location stored locally");
      }
    };

    const watchError = (err) => {
      console.error("Geolocation watch error:", err);
      
      if (err.code === err.PERMISSION_DENIED) {
        setGpsPermission("denied");
        setIsActive(false);
        isStartingRef.current = false;
      } else if (err.code === err.TIMEOUT) {
        // Retry on timeout
        console.log("Geolocation timeout, retrying...");
        setTimeout(() => {
          if (watchIdRef.current === null && !isStartingRef.current) {
            startWatching();
          }
        }, 3000);
      } else {
        setGpsPermission("prompt");
        setIsActive(false);
        isStartingRef.current = false;
      }
    };

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        watchSuccess,
        watchError,
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 5000 
        }
      );
      isStartingRef.current = false;
    } catch (error) {
      console.error("Error starting geolocation watch:", error);
      isStartingRef.current = false;
      setGpsPermission("denied");
    }
  }, [socket, connected, orderId]);

  const setPositionCallback = useCallback((pos) => {
    setPosition(pos);
  }, []);

  // Monitor socket connection and resend last position when reconnected
  useEffect(() => {
    if (connected && socket && isActive && position) {
      // Resend last known position when socket reconnects
      socket.emit("driver:location", position);
      socket.emit("driver:status", "online");
      if (orderId) {
        socket.emit("order:location", { orderId, coords: position });
      }
    }
  }, [connected, socket, isActive, position, orderId]);

  // Auto-start effect with better handling
  useEffect(() => {
    if (!autoStart) return;
    
    // Small delay to ensure everything is ready
    const timer = setTimeout(() => {
      start();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [autoStart, start, stop]);

  // Check if permission is already granted on mount and start if needed
  useEffect(() => {
    if (!autoStart) return;
    
    const checkExistingPermission = async () => {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          if (result.state === 'granted') {
            console.log("Existing permission found, starting location tracking");
            start();
          } else if (result.state === 'prompt') {
            console.log("Permission not yet granted, will request when available");
            // The start function will request permission
            start();
          }
        } catch (error) {
          console.error("Error checking permission:", error);
          start();
        }
      } else {
        start();
      }
    };
    
    checkExistingPermission();
  }, [autoStart, start]);

  console.log({socket,connected})

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