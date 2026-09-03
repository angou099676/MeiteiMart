import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CATEGORY_META, CATEGORY_IMAGES } from "../data/categories.js";
import { MOCK_STORES } from "../data/mockData.js";

export default function CategoryPage() {
  const { slug } = useParams();
  const category = CATEGORY_META.find((c) => c.slug === slug);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    // Show all stores for now (in a real app, this would filter by category)
    setStores(MOCK_STORES);
  }, [slug]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 pb-20 sm:pb-8">
      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 mb-3 transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to home
      </Link>

      {/* Category banner */}
      <div className="relative h-40 rounded-2xl overflow-hidden mb-6">
        <img
          src={CATEGORY_IMAGES[slug]}
          alt={category?.name || "Category"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-3xl mb-1">{category?.emoji || "🛍️"}</p>
          <h1 className="text-2xl font-bold">{category?.name || "Category"}</h1>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3">Stores in this category</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <Link
            key={store._id}
            to={`/stores/${store._id}`}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-brand-200 transition-all group"
          >
            <div className="relative h-32 overflow-hidden">
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {store.promo && (
                <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                  {store.promo}
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-bold text-base mb-0.5 group-hover:text-brand-600 transition-colors">{store.name}</h3>
              <p className="text-xs text-gray-500 mb-2 line-clamp-1">{store.description}</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold">
                  <span className="text-green-600">★</span>
                  {store.rating?.toFixed(1)}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600">{store.etaMinutes} min</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600">{store.distanceKm} km</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
