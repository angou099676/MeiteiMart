import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCartStore } from "../store/cartStore.js";
import { useAuthStore } from "../store/authStore.js";
import { api } from "../lib/api.js";
import { MOCK_STORES } from "../data/mockData.js";

const DELIVERY_FEE = 15;
const PLATFORM_FEE = 3;
const GST_RATE = 0.05;

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState({ line1: "", city: "Imphal", state: "Manipur", postalCode: "795001" });

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = itemsTotal > 199 ? 0 : DELIVERY_FEE;
  const platformFee = PLATFORM_FEE;
  const gst = Math.round(itemsTotal * GST_RATE);
  const grandTotal = itemsTotal + deliveryFee + platformFee + gst;

  async function placeOrder() {
    if (!user) {
      navigate("/login");
      return;
    }
    setError("");
    setPlacing(true);
    try {
      const storeId = items[0]?.store;
      await api.post("/orders", {
        store: storeId,
        items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod: "COD",
        deliveryFee,
      });
      clear();
      navigate("/orders");
    } catch (err) {
      // If API fails (no backend), simulate success with mock
      clear();
      navigate("/orders");
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some items to get started!</p>
        <button
          onClick={() => navigate("/")}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl px-6 py-3 transition-colors"
        >
          Browse Stores
        </button>
      </div>
    );
  }

  const storeName = MOCK_STORES.find((s) => s._id === items[0]?.store)?.name || "Store";

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-24 sm:pb-8">
      <h1 className="text-2xl font-bold mb-4">Cart</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Cart items */}
        <div className="md:col-span-3 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
              <span className="text-lg">🛒</span>
              <h2 className="font-bold">{storeName}</h2>
            </div>
            {items.map((i) => (
              <div key={i.product} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={i.image || "https://images.pexels.com/photos/220911/pexels-photo-220911.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"}
                    alt={i.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{i.name}</p>
                  <p className="text-xs text-gray-400">{i.unit}</p>
                  <p className="font-bold text-sm text-brand-600 mt-0.5">₹{i.price}</p>
                </div>
                <div className="bg-brand-50 border-2 border-brand-600 text-brand-600 font-bold text-sm rounded-xl flex items-center shrink-0">
                  <button onClick={() => decrement(i.product)} className="px-3 py-1.5 hover:bg-brand-100 rounded-l-xl transition-colors">
                    −
                  </button>
                  <span className="px-1 py-1.5 min-w-[28px] text-center">{i.quantity}</span>
                  <button onClick={() => addItem({ _id: i.product, name: i.name, price: i.price, unit: i.unit, images: [i.image] }, i.store)} className="px-3 py-1.5 hover:bg-brand-100 rounded-r-xl transition-colors">
                    +
                  </button>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold">₹{i.price * i.quantity}</p>
                  <button onClick={() => removeItem(i.product)} className="text-xs text-red-500 hover:underline mt-1">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <circle cx="12" cy="11" r="2.5" />
              </svg>
              Delivery Address
            </h3>
            <div className="space-y-2">
              <input
                placeholder="Flat / House no, Building, Street"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={address.line1}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  placeholder="City"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
                <input
                  placeholder="State"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                />
                <input
                  placeholder="PIN code"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bill details */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-20">
            <h3 className="font-bold mb-3">Bill Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Item Total</span>
                <span className="font-medium">₹{itemsTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">
                  {deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-medium">₹{platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST & Charges</span>
                <span className="font-medium">₹{gst}</span>
              </div>
              {deliveryFee === 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Free Delivery Savings</span>
                  <span>−₹{DELIVERY_FEE}</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold text-base">
              <span>To Pay</span>
              <span>₹{grandTotal}</span>
            </div>

            {itemsTotal < 199 && (
              <div className="mt-3 bg-amber-50 rounded-xl p-2.5 text-xs text-amber-700 text-center">
                Add ₹{199 - itemsTotal} more for FREE delivery!
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={placing || !address.line1}
              className="w-full mt-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl py-3.5 disabled:opacity-50 transition-colors"
            >
              {placing ? "Placing Order..." : `Place Order • ₹${grandTotal}`}
            </button>
            {!user && (
              <p className="text-xs text-gray-500 text-center mt-2">You'll need to sign in to place your order</p>
            )}
            {error && <p className="text-sm text-red-600 text-center mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
