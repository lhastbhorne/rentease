import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PropertyForm from "../../components/property/landlord/PropertyForm";

function AddProperty() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Add Property
          </h1>

          <p className="mt-2 text-slate-500">
            List a property on behalf of a landlord.
          </p>
        </div>

        <PropertyForm />

      </div>
    </DashboardLayout>
  );
}

export default AddProperty;