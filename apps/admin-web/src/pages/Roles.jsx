import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [catalogue, setCatalogue] = useState({});
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [rolesRes, permRes] = await Promise.all([
      api.get("/roles"),
      api.get("/roles/permissions/catalogue"),
    ]);
    setRoles(rolesRes.data.data.roles);
    setCatalogue(permRes.data.data.permissions);
  }

  useEffect(() => {
    load();
  }, []);

  function togglePermission(permission) {
    if (!selected) return;
    const has = selected.permissions.includes(permission);
    setSelected({
      ...selected,
      permissions: has
        ? selected.permissions.filter((p) => p !== permission)
        : [...selected.permissions, permission],
    });
  }

  async function save() {
    setSaving(true);
    try {
      await api.patch(`/roles/${selected._id}`, { permissions: selected.permissions });
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Roles & Permissions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-medium mb-3">Roles</h3>
          <ul className="space-y-1">
            {roles.map((role) => (
              <li key={role._id}>
                <button
                  onClick={() => setSelected(role)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    selected?._id === role._id ? "bg-brand-50 text-brand-700" : "hover:bg-gray-100"
                  }`}
                >
                  {role.name} {role.isSystem && <span className="text-xs text-gray-400">(system)</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">{selected.name} permissions</h3>
                <button
                  onClick={save}
                  disabled={saving}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg px-4 py-2 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-auto">
                {Object.values(catalogue).map((permission) => (
                  <label key={permission} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.permissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                    />
                    {permission}
                  </label>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Select a role to edit its permissions.</p>
          )}
        </div>
      </div>
    </div>
  );
}
