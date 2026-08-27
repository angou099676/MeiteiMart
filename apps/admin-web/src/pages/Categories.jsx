import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data.categories));
  }, []);

  const topLevel = categories.filter((c) => !c.parent);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topLevel.map((c) => (
          <div key={c._id} className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium">{c.name}</h3>
            <p className="text-xs text-gray-400">{c.slug}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
