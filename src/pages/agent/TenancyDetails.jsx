import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import TenancyDetailsComponent from "../../components/tenancy/TenancyDetails";
import { getAgentTenancies } from "../../firebase/tenancyService";
import { useAuth } from "../../contexts/AuthContext";

function TenancyDetails() {
  const { tenancyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tenancy, setTenancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTenancy = async () => {
      if (!user?.uid || !tenancyId) return;

      try {
        setLoading(true);
        setError("");

        const tenancies = await getAgentTenancies(user.uid);

        const found = tenancies.find((item) => item.id === tenancyId);

        if (!found) {
          throw new Error("Tenancy not found.");
        }

        setTenancy(found);
      } catch (err) {
        console.error("Failed to load tenancy:", err);
        setError(err?.message || "Unable to load tenancy.");
      } finally {
        setLoading(false);
      }
    };

    loadTenancy();
  }, [user?.uid, tenancyId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
          <div className="mx-auto max-w-6xl">
            <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="mt-6 h-80 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              <p>{error}</p>

              <button
                type="button"
                onClick={() => navigate("/agent/tenancies")}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Back to Tenancies
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TenancyDetailsComponent
        tenancy={tenancy}
        onBack={() => navigate("/agent/tenancies")}
      />
    </DashboardLayout>
  );
}

export default TenancyDetails;
