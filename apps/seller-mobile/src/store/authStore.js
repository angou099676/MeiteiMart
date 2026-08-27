import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  hydrated: false,

  hydrate: async () => {
    const [token, userJson] = await Promise.all([
      AsyncStorage.getItem("accessToken"),
      AsyncStorage.getItem("user"),
    ]);
    set({ accessToken: token, user: userJson ? JSON.parse(userJson) : null, hydrated: true });
  },

  setSession: async ({ accessToken, refreshToken, user }) => {
    await AsyncStorage.setItem("accessToken", accessToken);
    if (refreshToken) await AsyncStorage.setItem("refreshToken", refreshToken);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    set({ accessToken, user });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
    set({ accessToken: null, user: null });
  },
}));
