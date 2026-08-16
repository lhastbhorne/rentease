import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PropertyForm from "../../components/property/landlord/PropertyForm";

function AddProperty() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="mb-6 text-3xl font-bold">Add New Property</h1>

        <PropertyForm />
      </div>
    </DashboardLayout>
  );
}

export default AddProperty;
