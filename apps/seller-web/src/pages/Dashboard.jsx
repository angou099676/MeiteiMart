import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newStore, setNewStore] = useState({ name: "", description: "" });
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function load() {
    try {
      const res = await api.get("/stores/me");
      setStore(res.data.data.store);
      const [prodRes, orderRes] = await Promise.all([
        api.get("/products", { params: { store: res.data.data.store._id } }),
        api.get("/orders"),
      ]);
      setProducts(prodRes.data.data.products);
      setOrders(orderRes.data.data.orders);
    } catch {
      setStore(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createStore(e) {
    e.preventDefault();
    await api.post("/stores", newStore);
    load();
  }

  async function handleLogout() {
    await api.post("/auth/logout");
    logout();
    navigate("/login");
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-700">Seller Dashboard</h1>
        <button type="button" onClick={handleLogout} className="text-sm text-red-600">Sign out</button>
      </div>

      {!store ? (
        <form onSubmit={createStore} className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 max-w-md">
          <h2 className="font-medium">Set up your store</h2>
          <input required placeholder="Store name" className="w-full border rounded-lg px-3 py-2" value={newStore.name} onChange={(e) => setNewStore({ ...newStore, name: e.target.value })} />
          <textarea placeholder="Description" className="w-full border rounded-lg px-3 py-2" value={newStore.description} onChange={(e) => setNewStore({ ...newStore, description: e.target.value })} />
          <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2">Submit for approval</button>
        </form>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <p className="font-medium">{store.name}</p>
            <p className="text-sm text-gray-500">Status: {store.status}</p>
          </div>

          <h2 className="text-lg font-semibold mb-3">My Products ({products.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {products.map((p) => (
              <div key={p._id} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">Stock: {p.stock} • ₹{p.price}</p>
                <p className="text-xs">{p.isApproved ? "Approved" : "Pending approval"}</p>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold mb-3">Orders</h2>
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between">
                <span>{o.orderNumber}</span>
                <span className="text-brand-700">{o.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
