import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { getSocket } from "../lib/socket.js";
import { useAuthStore } from "../store/authStore.js";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [status, setStatus] = useState("OFFLINE");
  const [sharing, setSharing] = useState(false);
  const [claiming, setClaiming] = useState(null);
  const watchIdRef = useRef(null);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function loadMyOrders() {
    const res = await api.get("/orders");
    setOrders(res.data.data.orders);
  }

  async function loadAvailableOrders() {
    try {
      const res = await api.get("/orders/available-for-delivery");
      setAvailableOrders(res.data.data.orders);
    } catch {
      setAvailableOrders([]);
    }
  }

  useEffect(() => {
    loadMyOrders();
  }, []);

  // Refresh nearby unclaimed orders periodically while online — a lightweight
  // stand-in for Swiggy/Zomato's push-notification-driven rider order feed.
  useEffect(() => {
    if (status !== "ONLINE") return;
    loadAvailableOrders();
    const interval = setInterval(loadAvailableOrders, 15000);
    return () => clearInterval(interval);
  }, [status]);

  async function toggleStatus() {
    const next = status === "ONLINE" ? "OFFLINE" : "ONLINE";
    if (next === "ONLINE" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await api.post("/delivery/location", { lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
    await api.patch("/delivery/status", { status: next });
    setStatus(next);
  }

  async function claimOrder(orderId) {
    setClaiming(orderId);
    try {
      await api.patch(`/orders/${orderId}/claim`);
      await Promise.all([loadMyOrders(), loadAvailableOrders()]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to claim order");
    } finally {
      setClaiming(null);
    }
  }

  function startSharingLocation(orderId) {
    if (!navigator.geolocation) return;
    setSharing(true);
    const socket = getSocket();
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        socket?.emit("delivery:location-update", { orderId, lat, lng });
        await api.post("/delivery/location", { lat, lng, orderId });
      },
      console.error,
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }

  function stopSharingLocation() {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    setSharing(false);
  }

  async function updateOrderStatus(orderId, orderStatus) {
    await api.patch(`/orders/${orderId}/status`, { status: orderStatus });
    loadMyOrders();
  }

  async function handleLogout() {
    await api.post("/auth/logout");
    logout();
    navigate("/login");
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-700">MeiteiMart Delivery</h1>
        <div className="flex items-center gap-3">
          <button type="button" onClick={toggleStatus} className={`px-4 py-2 rounded-lg text-sm font-medium ${status === "ONLINE" ? "bg-green-600 text-white" : "bg-gray-200"}`}>
            {status === "ONLINE" ? "Online" : "Go Online"}
          </button>
          <button type="button" onClick={handleLogout} className="text-sm text-red-600">Sign out</button>
        </div>
      </div>

      {status === "ONLINE" && (
        <>
          <h2 className="text-lg font-semibold mb-3">Available orders near you</h2>
          <div className="space-y-3 mb-8">
            {availableOrders.map((o) => (
              <div key={o._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-gray-500">{o.store?.name} {o.distanceMeters != null && `• ${(o.distanceMeters / 1000).toFixed(1)} km away`}</p>
                </div>
                <button
                  type="button"
                  onClick={() => claimOrder(o._id)}
                  disabled={claiming === o._id}
                  className="text-xs bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-3 py-1.5 disabled:opacity-50"
                >
                  {claiming === o._id ? "Claiming..." : "Claim"}
                </button>
              </div>
            ))}
            {availableOrders.length === 0 && <p className="text-gray-500 text-sm">No unclaimed orders near you right now.</p>}
          </div>
        </>
      )}

      <h2 className="text-lg font-semibold mb-3">My Deliveries</h2>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between">
              <p className="font-medium">{o.orderNumber}</p>
              <span className="text-sm font-medium text-brand-700">{o.status}</span>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button type="button" onClick={() => updateOrderStatus(o._id, "OUT_FOR_DELIVERY")} className="text-xs bg-brand-600 text-white rounded-lg px-3 py-1.5">Out for delivery</button>
              <button type="button" onClick={() => updateOrderStatus(o._id, "DELIVERED")} className="text-xs bg-green-600 text-white rounded-lg px-3 py-1.5">Mark delivered</button>
              {!sharing ? (
                <button type="button" onClick={() => startSharingLocation(o._id)} className="text-xs bg-blue-600 text-white rounded-lg px-3 py-1.5">Share live location</button>
              ) : (
                <button type="button" onClick={stopSharingLocation} className="text-xs bg-gray-400 text-white rounded-lg px-3 py-1.5">Stop sharing</button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-gray-500">No assigned deliveries yet.</p>}
      </div>
    </div>
  );
}
