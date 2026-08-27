import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([api.get("/orders"), api.get("/users"), api.get("/stores")]).then(
      ([orders, users, stores]) => {
        setStats({
          orders: orders.status === "fulfilled" ? orders.value.data.data.orders.length : 0,
          users: users.status === "fulfilled" ? users.value.data.data.total : 0,
          stores: stores.status === "fulfilled" ? stores.value.data.data.stores.length : 0,
        });
      }
    );
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card label="Recent Orders" value={stats?.orders ?? "…"} />
        <Card label="Total Users" value={stats?.users ?? "…"} />
        <Card label="Stores" value={stats?.stores ?? "…"} />
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-brand-700 mt-2">{value}</p>
    </div>
  );
}
