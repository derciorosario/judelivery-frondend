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

  const stop = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setPosition(null);
    setGpsPermission("prompt");
    setLastUpdate(null);
    setIsActive(false);
    if (socket && connected) {
      socket.emit("driver:status", "offline");
    }
  }, [socket, connected]);

  const start = useCallback(() => {
    if (!navigator.geolocation) return;

    const watchSuccess = (pos) => {
      const { latitude, longitude, heading, accuracy } = pos.coords;
      const coords = { lat: latitude, lng: longitude };
      setPosition(coords);
      setHeading(heading || 0);
      setAccuracy(accuracy);
      setLastUpdate(new Date());
      setGpsPermission("granted");
      setIsActive(true);

      if (socket && connected) {
        socket.emit("driver:location", coords);
        socket.emit("driver:status", "online");
        if (orderId) {
          socket.emit("order:location", { orderId, coords });
        }
      }
    };

    const watchError = (err) => {
      console.error("Geolocation watch error:", err);
      setGpsPermission("denied");
      setIsActive(false);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      watchSuccess,
      watchError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }, [socket, connected, orderId]);

  const setPositionCallback = useCallback((pos) => {
    setPosition(pos);
  }, []);

  useEffect(() => {
    if (!autoStart) return;
    start();
    return () => stop();
  }, [autoStart, start, stop]);

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