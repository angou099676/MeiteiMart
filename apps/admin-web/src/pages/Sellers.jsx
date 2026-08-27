import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Sellers() {
  const [stores, setStores] = useState([]);

  async function load() {
    const res = await api.get("/stores");
    setStores(res.data.data.stores);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id, status) {
    await api.patch(`/stores/${id}/status`, { status });
    load();
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Sellers</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Store</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s._id} className="border-t border-gray-100">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.owner?.name}</td>
                <td className="p-3">{s.status}</td>
                <td className="p-3 space-x-2">
                  <button type="button" onClick={() => updateStatus(s._id, "APPROVED")} className="text-brand-700 hover:underline">
                    Approve
                  </button>
                  <button type="button" onClick={() => updateStatus(s._id, "SUSPENDED")} className="text-red-600 hover:underline">
                    Suspend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
