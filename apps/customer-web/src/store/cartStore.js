import { create } from "zustand";
import { persist } from "zustand/middleware";

// Simple client-side cart; checkout creates the real Order via the API.
// Like Swiggy/Zomato, an order belongs to a single store — adding an item from a
// different store clears whatever was in the cart before.
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { product, name, price, unit, quantity, store }
      addItem: (product, storeId) =>
        set((state) => {
          const isDifferentStore = state.items.length > 0 && state.items[0].store !== storeId;
          const baseItems = isDifferentStore ? [] : state.items;

          const existing = baseItems.find((i) => i.product === product._id);
          if (existing) {
            return {
              items: baseItems.map((i) =>
                i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return {
            items: [
              ...baseItems,
              { product: product._id, name: product.name, price: product.price, unit: product.unit, quantity: 1, store: storeId },
            ],
          };
        }),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((i) => i.product !== productId) })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "meiteimart-customer-cart" }
  )
);
