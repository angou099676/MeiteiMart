import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Stores from "./pages/Stores.jsx";
import StoreDetail from "./pages/StoreDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Orders from "./pages/Orders.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Stores />} />
        <Route path="stores/:storeId" element={<StoreDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
