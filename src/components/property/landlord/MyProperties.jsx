import { useEffect, useState } from "react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import LandlordPropertyGrid from "../../components/property/LandlordPropertyGrid";

import {
  getMyProperties,
  deleteProperty,
} from "../../firebase/propertyService";

import { useAuth } from "../../contexts/AuthContext";

function MyProperties() {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await getMyProperties(user.uid);
        setProperties(data);
      } catch (error) {
        console.error("Error loading properties:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadProperties();
    }
  }, [user]);

  async function handleDelete(propertyId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) return;

    try {
      await deleteProperty(propertyId);

      setProperties((prev) =>
        prev.filter((property) => property.id !== propertyId)
      );
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Failed to delete property.");
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          My Properties
        </h1>

        <p className="mt-2 text-slate-500">
          Manage your uploaded properties.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl bg-white p-8 text-center">
          Loading properties...
        </div>
      ) : (
        <LandlordPropertyGrid
          properties={properties}
          onDelete={handleDelete}
        />
      )}
    </DashboardLayout>
  );
}

export default MyProperties;