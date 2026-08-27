import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders").then((res) => setOrders(res.data.data.orders));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Orders</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Order #</th>
              <th className="p-3">Store</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t border-gray-100">
                <td className="p-3">{o.orderNumber}</td>
                <td className="p-3">{o.store?.name}</td>
                <td className="p-3">{o.status}</td>
                <td className="p-3">₹{o.grandTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
