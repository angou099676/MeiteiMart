import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCartStore } from "../store/cartStore.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const total = useCartStore((s) => s.total());
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({ line1: "", city: "", state: "", postalCode: "" });

  async function placeOrder() {
    if (!user) return navigate("/login");
    setPlacing(true);
    try {
      const storeId = items[0]?.store;
      await api.post("/orders", {
        store: storeId,
        items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod: "COD",
      });
      clear();
      navigate("/orders");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {items.map((i) => (
              <div key={i.product} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-gray-500">{i.unit} × {i.quantity}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">₹{i.price * i.quantity}</span>
                  <button onClick={() => removeItem(i.product)} className="text-red-600 text-sm">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="font-medium">Delivery address</h3>
            <input placeholder="Address line" className="w-full border rounded-lg px-3 py-2 text-sm" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
            <input placeholder="City" className="w-full border rounded-lg px-3 py-2 text-sm" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            <input placeholder="State" className="w-full border rounded-lg px-3 py-2 text-sm" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
            <input placeholder="Postal code" className="w-full border rounded-lg px-3 py-2 text-sm" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
            <p className="font-semibold pt-2">Total: ₹{total}</p>
            <button onClick={placeOrder} disabled={placing} className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2 disabled:opacity-50">
              {placing ? "Placing order..." : "Place order (COD)"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
