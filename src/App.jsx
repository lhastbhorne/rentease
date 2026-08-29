import { BrowserRouter, Routes, Route } from "react-router-dom";

// =====================================================
// LAYOUT
// =====================================================

import MainLayout from "./layouts/MainLayout";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Properties from "./pages/public/Properties";
import PropertyDetails from "./pages/public/PropertyDetails";
import Contact from "./pages/public/Contact";

// =====================================================
// AUTH
// =====================================================

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RegisterTenant from "./pages/auth/RegisterTenant";
import RegisterLandlord from "./pages/auth/RegisterLandlord";
import RegisterAgent from "./pages/auth/RegisterAgent";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// =====================================================
// GUARDS
// =====================================================

import TenantRoute from "./guards/TenantRoute";
import LandlordRoute from "./guards/LandlordRoute";
import AgentRoute from "./guards/AgentRoute";
import AdminRoute from "./guards/AdminRoute";

// =====================================================
// TENANT
// =====================================================

import TenantDashboard from "./pages/tenant/Dashboard";
import TenantComplaints from "./pages/tenant/Complaints";
import ApplyForProperty from "./pages/tenant/ApplyForProperty";
import TenantApplications from "./pages/tenant/Applications";
import MyRental from "./pages/tenant/MyRental";
import TenantProperties from "./pages/tenant/Properties";
import Contract from "./pages/tenant/Contract";
import Payments from "./pages/tenant/Payments";
import TenantMessages from "./pages/tenant/Messages";
import SavedProperties from "./pages/tenant/SavedProperties";
import TenantNotifications from "./pages/tenant/Notifications";
import TenantTenancy from "./pages/tenant/Tenancy";

// =====================================================
// LANDLORD
// =====================================================

import LandlordDashboard from "./pages/landlord/Dashboard";
import AddProperty from "./pages/landlord/AddProperty";
import MyProperties from "./pages/landlord/MyProperties";
import LandlordPropertyDetails from "./pages/landlord/PropertyDetails";
import EditProperty from "./pages/landlord/EditProperty";
import LandlordApplications from "./pages/landlord/Applications";

// =====================================================
// AGENT
// =====================================================

import AgentDashboard from "./pages/agent/Dashboard";
import AgentProperties from "./pages/agent/Properties";
import AgentAddProperty from "./pages/agent/AddProperty";
import AgentApplications from "./pages/agent/Applications";

// =====================================================
// ADMIN
// =====================================================

import AdminDashboard from "./pages/admin/Dashboard";
import AdminVerification from "./pages/admin/Verification";
import AdminProperties from "./pages/admin/Properties";
import AdminComplaints from "./pages/admin/Complaints";

// =====================================================
// SHARED
// =====================================================

import Notifications from "./pages/shared/Notifications";
import AdminSupport from "./pages/support/AdminSupport";

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            PUBLIC WEBSITE
        ================================================= */}

        <Route element={<MainLayout />}>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/properties"
            element={<Properties />}
          />

          <Route
            path="/properties/:id"
            element={<PropertyDetails />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

        </Route>

        {/* =================================================
            REGISTRATION
        ================================================= */}

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/register/tenant"
          element={<RegisterTenant />}
        />

        <Route
          path="/register/landlord"
          element={<RegisterLandlord />}
        />

        <Route
          path="/register/agent"
          element={<RegisterAgent />}
        />

        {/* =================================================
            PASSWORD / EMAIL VERIFICATION
        ================================================= */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        {/* =================================================
            TENANT ROUTES
        ================================================= */}

        <Route
          path="/tenant/dashboard"
          element={
            <TenantRoute>
              <TenantDashboard />
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
          path="/tenant/saved"
          element={
            <TenantRoute>
              <SavedProperties />
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
          path="/tenant/my-rental"
          element={
            <TenantRoute>
              <MyRental />
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
          path="/tenant/complaints"
          element={
            <TenantRoute>
              <TenantComplaints />
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
          path="/tenant/notifications"
          element={
            <TenantRoute>
              <TenantNotifications />
            </TenantRoute>
          }
        />

        {/* Tenant → Admin */}

        <Route
          path="/tenant/support"
          element={
            <TenantRoute>
              <AdminSupport />
            </TenantRoute>
          }
        />

        {/* =================================================
            LANDLORD ROUTES
        ================================================= */}

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

        {/* Landlord → Admin */}

        <Route
          path="/landlord/support"
          element={
            <LandlordRoute>
              <AdminSupport />
            </LandlordRoute>
          }
        />

        {/* =================================================
            AGENT ROUTES
        ================================================= */}

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

        {/* Agent → Admin */}

        <Route
          path="/agent/support"
          element={
            <AgentRoute>
              <AdminSupport />
            </AgentRoute>
          }
        />

        {/* =================================================
            ADMIN ROUTES
        ================================================= */}

        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminDashboard />
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
          path="/admin/verification"
          element={
            <AdminRoute>
              <AdminVerification />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/complaints"
          element={
            <AdminRoute>
              <AdminComplaints />
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

      </Routes>
    </BrowserRouter>
  );
}

export default App;