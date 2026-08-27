import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { useCartStore } from "../store/cartStore.js";
import { api } from "../lib/api.js";

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } finally {
      logout();
      navigate("/login");
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold text-brand-700">
            MeiteiMart
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/orders" className="hover:text-brand-700">
              My Orders
            </Link>
            <Link to="/cart" className="hover:text-brand-700">
              Cart ({cartCount})
            </Link>
            {user ? (
              <button type="button" onClick={handleLogout} className="text-red-600 hover:underline">
                Sign out
              </button>
            ) : (
              <Link to="/login" className="text-brand-700 hover:underline">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
