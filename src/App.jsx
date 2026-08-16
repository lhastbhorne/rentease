import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Properties from "./pages/public/Properties";
import PropertyDetails from "./pages/public/PropertyDetails";
import Contact from "./pages/public/Contact";
import Login from "./pages/auth/Login";
import RegisterTenant from "./pages/auth/RegisterTenant";
import RegisterLandlord from "./pages/auth/RegisterLandlord";
import Register from "./pages/auth/Register";
import RegisterAgent from "./pages/auth/RegisterAgent";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import TenantRoute from "./guards/TenantRoute";
import TenantDashboard from "./pages/tenant/Dashboard";
import LandlordRoute from "./guards/LandlordRoute";
import LandlordDashboard from "./pages/landlord/Dashboard";
import AgentRoute from "./guards/AgentRoute";
import AgentDashboard from "./pages/agent/Dashboard";
import AddProperty from "./pages/landlord/AddProperty";
import MyProperties from "./pages/landlord/MyProperties";
import LandlordPropertyDetails from "./pages/landlord/PropertyDetails";
import EditProperty from "./pages/landlord/EditProperty";
import Complaints from "./pages/tenant/Complaints";
import ApplyForProperty from "./pages/tenant/ApplyForProperty";
import TenantApplications from "./pages/tenant/Applications";
import LandlordApplications from "./pages/landlord/Applications";
import MyRental from "./pages/tenant/MyRental";
import TenantProperties from "./pages/tenant/Properties";
import Contract from "./pages/tenant/Contract";
import Payments from "./pages/tenant/Payments";
import TenantMessages from "./pages/tenant/Messages";
import SavedProperties from "./pages/tenant/SavedProperties";
import TenantNotifications from "./pages/tenant/Notifications";
import TenantTenancy from "./pages/tenant/Tenancy";
import AgentProperties from "./pages/agent/Properties";
import AgentAddProperty from "./pages/agent/AddProperty";
import AgentApplications from "./pages/agent/Applications";

import AdminRoute from "./guards/AdminRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminVerification from "./pages/admin/Verification";
import AdminProperties from "./pages/admin/Properties";
import Notifications from "./pages/shared/Notifications";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/register/tenant" element={<RegisterTenant />} />
        <Route path="/register/landlord" element={<RegisterLandlord />} />
        <Route path="/register/agent" element={<RegisterAgent />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/tenant/dashboard"
          element={
            <TenantRoute>
              <TenantDashboard />
            </TenantRoute>
          }
        />
        <Route
          path="/tenant/complaints"
          element={
            <TenantRoute>
              <Complaints />
            </TenantRoute>
          }
        />
        <Route
          path="/tenant/apply"
          element={
            <TenantRoute>
              <ApplyForProperty />
            </TenantRoute>
          }
        />
        <Route
          path="/tenant/applications"
          element={
            <TenantRoute>
              <TenantApplications />
            </TenantRoute>
          }
        />
        <Route
          path="/tenant/my-rental"
          element={
            <TenantRoute>
              <MyRental />
            </TenantRoute>
          }
        />
        <Route
          path="/tenant/properties"
          element={
            <TenantRoute>
              <TenantProperties />
            </TenantRoute>
          }
        />
        <Route
          path="/tenant/contract"
          element={
            <TenantRoute>
              <Contract />
            </TenantRoute>
          }
        />
        <Route
          path="/tenant/payments"
          element={
            <TenantRoute>
              <Payments />
            </TenantRoute>
          }
        />
        <Route
          path="/tenant/messages"
          element={
            <TenantRoute>
              <TenantMessages />
            </TenantRoute>
          }
        />
        <Route
          path="/tenant/saved"
          element={
            <TenantRoute>
              <SavedProperties />
            </TenantRoute>
          }
        />
        <Route
          path="/tenant/notifications"
          element={
            <TenantRoute>
              <TenantNotifications />
            </TenantRoute>
          }
        />
        <Route
          path="/tenant/tenancy"
          element={
            <TenantRoute>
              <TenantTenancy />
            </TenantRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <TenantRoute>
              <Notifications />
            </TenantRoute>
          }
        />

        <Route
          path="/landlord/dashboard"
          element={
            <LandlordRoute>
              <LandlordDashboard />
            </LandlordRoute>
          }
        />

        <Route
          path="/landlord/add-property"
          element={
            <LandlordRoute>
              <AddProperty />
            </LandlordRoute>
          }
        />

        <Route
          path="/landlord/my-properties"
          element={
            <LandlordRoute>
              <MyProperties />
            </LandlordRoute>
          }
        />
        <Route
          path="/landlord/property/:id"
          element={
            <LandlordRoute>
              <LandlordPropertyDetails />
            </LandlordRoute>
          }
        />
        <Route
          path="/landlord/edit-property/:id"
          element={
            <LandlordRoute>
              <EditProperty />
            </LandlordRoute>
          }
        />
        <Route
          path="/landlord/applications"
          element={
            <LandlordRoute>
              <LandlordApplications />
            </LandlordRoute>
          }
        />
        <Route
          path="/landlord/notifications"
          element={
            <LandlordRoute>
              <Notifications />
            </LandlordRoute>
          }
        />

        <Route
          path="/agent/dashboard"
          element={
            <AgentRoute>
              <AgentDashboard />
            </AgentRoute>
          }
        />
        <Route
          path="/agent/properties"
          element={
            <AgentRoute>
              <AgentProperties />
            </AgentRoute>
          }
        />
        <Route
          path="/agent/add-property"
          element={
            <AgentRoute>
              <AgentAddProperty />
            </AgentRoute>
          }
        />
        <Route
          path="/agent/applications"
          element={
            <AgentRoute>
              <AgentApplications />
            </AgentRoute>
          }
        />
        <Route
          path="/agent/notifications"
          element={
            <AgentRoute>
              <Notifications />
            </AgentRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/verification"
          element={
            <AdminRoute>
              <AdminVerification />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/properties"
          element={
            <AdminRoute>
              <AdminProperties />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <AdminRoute>
              <Notifications />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <AdminRoute>
              <Complaints />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
