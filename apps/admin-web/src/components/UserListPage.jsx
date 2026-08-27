import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

/**
 * Reusable role-scoped user list: shows users for a single role, with an optional
 * "create user" form (Admins onboard Sellers/Delivery Partners/Support Agents/other
 * Admins here — Customers self-register via OTP so no create form is shown for them).
 */
export default function UserListPage({ title, roleName, allowCreate = true }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/users", { params: { role: roleName, limit: 100 } });
      setUsers(res.data.data.users);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [roleName]);

  async function createUser(e) {
    e.preventDefault();
    setError("");
    if (!form.email && !form.phone) {
      setError("Provide an email or phone number");
      return;
    }
    setCreating(true);
    try {
      await api.post("/users", { ...form, roleName });
      setForm({ name: "", email: "", phone: "" });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(user) {
    await api.patch(`/users/${user._id}/status`, { isActive: !user.isActive });
    load();
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>

      {allowCreate && (
        <form onSubmit={createUser} className="bg-white border border-gray-200 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3 items-start">
          <input
            required
            placeholder="Full name"
            className="border rounded-lg px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Email (optional)"
            className="border rounded-lg px-3 py-2 text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Phone (optional)"
            className="border rounded-lg px-3 py-2 text-sm"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <button type="submit" disabled={creating} className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50">
            {creating ? "Creating..." : `Add ${title.replace(/s$/, "")}`}
          </button>
          {error && <p className="text-sm text-red-600 sm:col-span-4">{error}</p>}
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Active</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-gray-100">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email || "—"}</td>
                <td className="p-3">{u.phone || "—"}</td>
                <td className="p-3">{u.isActive ? "Yes" : "No"}</td>
                <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <button type="button" onClick={() => toggleActive(u)} className="text-brand-700 hover:underline">
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={6}>
                  No {title.toLowerCase()} yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
