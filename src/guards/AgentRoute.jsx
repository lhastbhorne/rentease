import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function AgentRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "agent") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AgentRoute;