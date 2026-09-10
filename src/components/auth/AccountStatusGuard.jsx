import { Navigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

function AccountStatusGuard({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  // ==========================================
  // AUTH LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ==========================================
  // ROLE CHECK
  // ==========================================

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // ==========================================
  // EMAIL VERIFICATION
  // ==========================================

  if (
    !user.emailVerified &&
    (user.role === "landlord" || user.role === "agent")
  ) {
    return <Navigate to="/verify-email" replace />;
  }

  // ==========================================
  // PENDING ACCOUNT
  // ==========================================

  if (
    (user.role === "landlord" || user.role === "agent") &&
    user.accountStatus === "pending"
  ) {
    return <Navigate to="/pending-approval" replace />;
  }

  // ==========================================
  // REJECTED ACCOUNT
  // ==========================================

  if (
    (user.role === "landlord" || user.role === "agent") &&
    (user.accountStatus === "rejected" || user.approvalStatus === "rejected")
  ) {
    return <Navigate to="/account-rejected" replace />;
  }

  // ==========================================
  // INACTIVE ACCOUNT
  // ==========================================

  if (
    (user.role === "landlord" || user.role === "agent") &&
    user.isActive === false
  ) {
    return <Navigate to="/pending-approval" replace />;
  }

  // ==========================================
  // APPROVED
  // ==========================================

  return children;
}

export default AccountStatusGuard;
