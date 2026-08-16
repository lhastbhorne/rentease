import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function LandlordRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "landlord") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default LandlordRoute;