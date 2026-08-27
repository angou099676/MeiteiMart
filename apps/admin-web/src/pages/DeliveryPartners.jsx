import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function DeliveryPartners() {
  const [profiles, setProfiles] = useState([]);

  async function load() {
    const res = await api.get("/delivery");
    setProfiles(res.data.data.profiles);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id) {
    await api.patch(`/delivery/${id}/approve`);
    load();
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Delivery Partners</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Status</th>
              <th className="p-3">Approved</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p._id} className="border-t border-gray-100">
                <td className="p-3">{p.user?.name}</td>
                <td className="p-3">{p.vehicleType}</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3">{p.isApproved ? "Yes" : "No"}</td>
                <td className="p-3">
                  {!p.isApproved && (
                    <button type="button" onClick={() => approve(p._id)} className="text-brand-700 hover:underline">
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
