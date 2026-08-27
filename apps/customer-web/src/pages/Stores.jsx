import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useGeolocation } from "../lib/useGeolocation.js";

// Swiggy/Zomato-style landing page: browse nearby stores (sorted by distance/ETA) instead
// of a flat cross-store product grid — orders in this platform belong to a single store.
export default function Stores() {
  const { position, error: geoError } = useGeolocation();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!position) return;
    setLoading(true);
    api
      .get("/stores/nearby", { params: { lat: position.lat, lng: position.lng, radiusKm: 15 } })
      .then((res) => setStores(res.data.data.stores))
      .finally(() => setLoading(false));
  }, [position]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Stores near you</h2>
      {geoError && (
        <p className="text-sm text-amber-600 mb-4">
          Couldn't get your location ({geoError}). Enable location access in your browser to see nearby stores.
        </p>
      )}
      {!position && !geoError && <p className="text-gray-500">Requesting your location…</p>}
      {loading && <p className="text-gray-500">Finding stores near you…</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {stores.map((store) => (
          <Link
            key={store._id}
            to={`/stores/${store._id}`}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">{store.name}</h3>
            <p className="text-xs text-gray-500">{store.address?.city}</p>
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-brand-700 font-medium">⭐ {store.rating?.toFixed(1) || "New"}</span>
              <span className="text-gray-500">{store.distanceKm} km</span>
              <span className="text-gray-500">{store.etaMinutes} min</span>
            </div>
          </Link>
        ))}
        {position && !loading && stores.length === 0 && (
          <p className="text-gray-500 col-span-full">No approved stores near you yet.</p>
        )}
      </div>
    </div>
  );
}
