import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { useCartStore } from "../store/cartStore.js";

export default function StoreDetail() {
  const { storeId } = useParams();
  const [products, setProducts] = useState([]);
  const [storeName, setStoreName] = useState("");
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);

  useEffect(() => {
    api.get("/products", { params: { store: storeId, limit: 100 } }).then((res) => {
      setProducts(res.data.data.products);
      if (res.data.data.products[0]) setStoreName(res.data.data.products[0].store?.name || "");
    });
  }, [storeId]);

  const cartHasOtherStore = items.length > 0 && items[0].store !== storeId;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1">{storeName || "Store"}</h2>
      {cartHasOtherStore && (
        <p className="text-sm text-amber-600 mb-4">
          Your cart has items from a different store. Adding an item here will replace your current cart.
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {products.map((p) => (
          <div key={p._id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col">
            <div className="h-24 bg-gray-100 rounded-lg mb-3" />
            <h3 className="font-medium text-sm">{p.name}</h3>
            <p className="text-xs text-gray-500">{p.unit}</p>
            <div className="mt-auto flex items-center justify-between pt-3">
              <span className="font-semibold">₹{p.price}</span>
              <button
                type="button"
                onClick={() => addItem(p, storeId)}
                className="text-xs bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-3 py-1.5"
              >
                Add
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-gray-500 col-span-full">No products listed yet.</p>}
      </div>
    </div>
  );
}
