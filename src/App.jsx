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
import PendingApproval from "./pages/auth/PendingApproval";

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
import TenantPropertyDetails from "./pages/tenant/PropertyDetails"
import Contract from "./pages/tenant/Contract";
import Payments from "./pages/tenant/Payments";
import TenantMessages from "./pages/tenant/Messages";
import SavedProperties from "./pages/tenant/SavedProperties";
import TenantNotifications from "./pages/tenant/Notifications";
import TenantTenancy from "./pages/tenant/Tenancy";
import TenantProfile from "./pages/tenant/Profile";
import TenantSettings from "./pages/tenant/Settings";
import ReportUser from "./pages/tenant/ReportUser";
import Inspections from "./pages/tenant/Inspections"
import PaymentCallback from "./pages/tenant/PaymentCallback";

// =====================================================
// LANDLORD
// =====================================================

import LandlordDashboard from "./pages/landlord/Dashboard";
import AddProperty from "./pages/landlord/AddProperty";
import MyProperties from "./pages/landlord/MyProperties";
import LandlordPropertyDetails from "./pages/landlord/PropertyDetails";
import EditProperty from "./pages/landlord/EditProperty";
import LandlordApplications from "./pages/landlord/Applications";
import LandlordProfile from "./pages/landlord/Profile";
import LandlordSettings from "./pages/landlord/Settings";
import LandlordInspections from "./pages/landlord/Inspections";
import LandlordTenancies from "./pages/landlord/Tenancies";
import LandlordTenancyDetails from "./pages/landlord/TenancyDetails";
import LandlordPayments from "./pages/landlord/Payments";

// =====================================================
// AGENT
// =====================================================

import AgentDashboard from "./pages/agent/Dashboard";
import AgentProperties from "./pages/agent/Properties";
import AgentAddProperty from "./pages/agent/AddProperty";
import AgentApplications from "./pages/agent/Applications";
import AgentProfile from "./pages/agent/Profile";
import AgentSettings from "./pages/agent/Settings";
import AgentInspections from "./pages/agent/Inspections";
import AgentClients from "./pages/agent/Tenancies";
import AgentTenancyDetails from "./pages/agent/TenancyDetails";
import AgentPayments from "./pages/agent/Payments"

// =====================================================
// ADMIN
// =====================================================

import AdminDashboard from "./pages/admin/Dashboard";
import AdminVerification from "./pages/admin/Verification";
import AdminProperties from "./pages/admin/Properties";
import AdminComplaints from "./pages/admin/Complaints";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/Users";
import AdminReports from "./pages/admin/Reports";
import AdminPropertyDetails from "./pages/admin/PropertyDetails";
import AdminEarnings from "./pages/admin/Earnings";

// =====================================================
// SHARED
// =====================================================

import Notifications from "./pages/shared/Notifications";
import AdminSupport from "./pages/support/AdminSupport";

// =====================================================
// APP
// =====================================================

import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* =================================================
            PUBLIC WEBSITE
        ================================================= */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />

            <Route path="/about" element={<About />} />

            <Route path="/properties" element={<Properties />} />

            <Route path="/properties/:id" element={<PropertyDetails />} />

            <Route path="/contact" element={<Contact />} />

            <Route path="/login" element={<Login />} />
          </Route>
          {/* =================================================
            REGISTRATION
        ================================================= */}
          <Route path="/register" element={<Register />} />
          <Route path="/register/tenant" element={<RegisterTenant />} />
          <Route path="/register/landlord" element={<RegisterLandlord />} />
          <Route path="/register/agent" element={<RegisterAgent />} />
          {/* =================================================
            PASSWORD / EMAIL VERIFICATION
        ================================================= */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
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
            path="/tenant/properties/:id"
            element={
              <TenantRoute>
                <TenantPropertyDetails />
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
            path="/payment/callback"
            element={
              <ProtectedRoute>
                <PaymentCallback />
              </ProtectedRoute>
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
          <Route
            path="/tenant/profile"
            element={
              <TenantRoute>
                <TenantProfile />
              </TenantRoute>
            }
          />
          <Route
            path="/tenant/settings"
            element={
              <TenantRoute>
                <TenantSettings />
              </TenantRoute>
            }
          />
          <Route
            path="/tenant/support"
            element={
              <TenantRoute>
                <AdminSupport />
              </TenantRoute>
            }
          />

          <Route
            path="/tenant/report"
            element={
              <TenantRoute>
                <ReportUser />
              </TenantRoute>
            }
          />

          <Route
            path="/tenant/inspections"
            element={
              <TenantRoute>
                <Inspections />
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
            path="/landlord/tenancies"
            element={
              <LandlordRoute>
                <LandlordTenancies />
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
            path="/landlord/inspections"
            element={
              <LandlordRoute>
                <LandlordInspections />
              </LandlordRoute>
            }
          />

          <Route
            path="/landlord/tenancies/:tenancyId"
            element={
              <LandlordRoute>
                <LandlordTenancyDetails />
              </LandlordRoute>
            }
          />

          <Route
            path="/landlord/payments"
            element={
              <LandlordRoute>
                <LandlordPayments />
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
          <Route
            path="/landlord/profile"
            element={
              <LandlordRoute>
                <LandlordProfile />
              </LandlordRoute>
            }
          />
          <Route
            path="/landlord/settings"
            element={
              <LandlordRoute>
                <LandlordSettings />
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
            path="/agent/inspections"
            element={
              <AgentRoute>
                <AgentInspections />
              </AgentRoute>
            }
          />
          <Route
            path="/agent/payments"
            element={
              <AgentRoute>
                <AgentPayments />
              </AgentRoute>
            }
          />
          <Route
            path="/agent/tenancies/:tenancyId"
            element={
              <AgentRoute>
                <AgentTenancyDetails />
              </AgentRoute>
            }
          />
          <Route
            path="/agent/clients"
            element={
              <AgentRoute>
                <AgentClients />
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
          <Route
            path="/agent/profile"
            element={
              <AgentRoute>
                <AgentProfile />
              </AgentRoute>
            }
          />
          <Route
            path="/agent/settings"
            element={
              <AgentRoute>
                <AgentSettings />
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
                <AdminUsers />
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
            path="/admin/properties/:id"
            element={
              <AdminRoute>
                <AdminPropertyDetails />
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
            path="/admin/earnings"
            element={
              <AdminRoute>
                <AdminEarnings />
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
            path="/admin/profile"
            element={
              <AdminRoute>
                <AdminProfile />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <AdminReports />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;