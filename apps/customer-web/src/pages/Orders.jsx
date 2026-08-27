import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { getSocket } from "../lib/socket.js";
import LiveTrackingMap from "../components/LiveTrackingMap.jsx";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [tracking, setTracking] = useState({}); // orderId -> { lat, lng }
  const [ratingDrafts, setRatingDrafts] = useState({}); // orderId -> { storeRating, deliveryRating, comment }
  const [submitting, setSubmitting] = useState(null);

  async function load() {
    const res = await api.get("/orders");
    setOrders(res.data.data.orders);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    orders.forEach((o) => socket.emit("order:join", o._id));

    function onLocation({ orderId, lat, lng }) {
      setTracking((prev) => ({ ...prev, [orderId]: { lat, lng } }));
    }
    function onStatus() {
      load();
    }
    socket.on("delivery:location-broadcast", onLocation);
    socket.on("order:status-updated", onStatus);
    return () => {
      socket.off("delivery:location-broadcast", onLocation);
      socket.off("order:status-updated", onStatus);
    };
  }, [orders]);

  function updateDraft(orderId, patch) {
    setRatingDrafts((prev) => ({ ...prev, [orderId]: { ...prev[orderId], ...patch } }));
  }

  async function submitRating(orderId) {
    const draft = ratingDrafts[orderId] || {};
    setSubmitting(orderId);
    try {
      await api.post(`/orders/${orderId}/rate`, draft);
      await load();
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">My Orders</h2>
      <div className="space-y-4">
        {orders.map((o) => {
          const isTrackable = ["ASSIGNED_TO_DELIVERY", "OUT_FOR_DELIVERY"].includes(o.status);
          const canRate = o.status === "DELIVERED" && !o.rating?.ratedAt;
          const draft = ratingDrafts[o._id] || {};

          return (
            <div key={o._id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-gray-500">{o.store?.name}</p>
                </div>
                <span className="text-sm font-medium text-brand-700">{o.status}</span>
              </div>

              {isTrackable && (
                <div className="mt-3">
                  <LiveTrackingMap
                    storeLocation={
                      o.store?.address?.location?.coordinates
                        ? { lat: o.store.address.location.coordinates[1], lng: o.store.address.location.coordinates[0] }
                        : null
                    }
                    customerLocation={
                      o.shippingAddress?.location?.coordinates
                        ? { lat: o.shippingAddress.location.coordinates[1], lng: o.shippingAddress.location.coordinates[0] }
                        : null
                    }
                    riderLocation={tracking[o._id] || null}
                  />
                  {!tracking[o._id] && (
                    <p className="text-xs text-gray-500 mt-1">Waiting for the delivery partner to start sharing their live location…</p>
                  )}
                </div>
              )}

              {canRate && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-sm font-medium mb-2">Rate your order</p>
                  <div className="flex gap-4 mb-2 text-sm">
                    <label>
                      Store:{" "}
                      <select
                        value={draft.storeRating || ""}
                        onChange={(e) => updateDraft(o._id, { storeRating: Number(e.target.value) })}
                        className="border rounded px-2 py-1"
                      >
                        <option value="">–</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Delivery:{" "}
                      <select
                        value={draft.deliveryRating || ""}
                        onChange={(e) => updateDraft(o._id, { deliveryRating: Number(e.target.value) })}
                        className="border rounded px-2 py-1"
                      >
                        <option value="">–</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <textarea
                    placeholder="Add a comment (optional)"
                    className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
                    value={draft.comment || ""}
                    onChange={(e) => updateDraft(o._id, { comment: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => submitRating(o._id)}
                    disabled={submitting === o._id}
                    className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
                  >
                    {submitting === o._id ? "Submitting..." : "Submit rating"}
                  </button>
                </div>
              )}

              {o.rating?.ratedAt && (
                <p className="text-xs text-gray-500 mt-2">
                  You rated this order ⭐ {o.rating.storeRating || "–"} (store) / ⭐ {o.rating.deliveryRating || "–"} (delivery)
                </p>
              )}
            </div>
          );
        })}
        {orders.length === 0 && <p className="text-gray-500">No orders yet.</p>}
      </div>
    </div>
  );
}
