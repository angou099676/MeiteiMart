import { Link, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../store/authStore.js";
import { useCartStore } from "../store/cartStore.js";
import { api } from "../lib/api.js";

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const cartTotal = useCartStore((s) => s.total());
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-extrabold text-brand-600 tracking-tight">MeiteiMart</span>
          </Link>

          <div className="hidden sm:flex items-center gap-6 text-sm">
            <Link to="/orders" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
              My Orders
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-gray-700 font-medium hover:text-brand-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline">{user.name?.split(" ")[0]}</span>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email || user.phone}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                Sign in
              </Link>
            )}
          </div>

          <Link
            to="/cart"
            className="flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-2 rounded-xl font-semibold text-sm transition-colors relative"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex items-center justify-around py-2 px-4">
        <Link to="/" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-brand-600">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" />
          </svg>
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link to="/orders" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-brand-600">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-xs font-medium">Orders</span>
        </Link>
        <Link to="/cart" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-brand-600 relative">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute top-0 right-2 bg-brand-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-xs font-medium">Cart</span>
        </Link>
        {user ? (
          <Link to="/orders" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-brand-600">
            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium">Account</span>
          </Link>
        ) : (
          <Link to="/login" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-brand-600">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Sign in</span>
          </Link>
        )}
      </nav>

      {/* Floating cart bar (Swiggy-style) */}
      {cartCount > 0 && (
        <div className="sm:hidden pb-16" />
      )}
    </div>
  );
}
