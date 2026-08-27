import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

export default function ProtectedRoute({ children, permission }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  if (!accessToken) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(permission)) {
    return <div className="text-red-600">You do not have permission to view this page.</div>;
  }
  return children;
}
