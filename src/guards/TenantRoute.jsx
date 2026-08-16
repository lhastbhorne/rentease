import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function TenantRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Firebase is still checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================
  if (!user) {
    const redirectPath =
      location.pathname + location.search;

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
        replace
      />
    );
  }

  // ==========================================
  // LOGGED IN BUT NOT A TENANT
  // ==========================================
  if (user.role !== "tenant") {
    return <Navigate to="/" replace />;
  }

  // ==========================================
  // TENANT
  // ==========================================
  return children;
}

export default TenantRoute;