import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,

      setAccessToken: (token) => set({ accessToken: token }),
      setSession: ({ accessToken, user }) => set({ accessToken, user }),
      logout: () => set({ accessToken: null, user: null }),

      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        if (user.isSuperAdmin || user.permissions?.includes("*")) return true;
        return user.permissions?.includes(permission);
      },
    }),
    { name: "meiteimart-admin-auth" }
  )
);
