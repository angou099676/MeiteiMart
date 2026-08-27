import { useEffect, useState } from "react";

// Simple browser geolocation hook shared by the store-discovery and order-tracking pages.
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setError(err.message)
    );
  }, []);

  return { position, error };
}
