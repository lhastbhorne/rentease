import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import PropertyDetailsHero from "../../components/property/shared/PropertyDetailsHero";
import ImageGallery from "../../components/common/ImageGallery";
import PropertyInformation from "../../components/property/shared/PropertyInformation";
import Amenities from "../../components/property/shared/Amenities";
import ContactCard from "../../components/property/shared/ContactCard";
import PropertyLocation from "../../components/property/landlord/PropertyLocation";
import RelatedProperties from "../../components/property/public/RelatedProperties";
import ScheduleInspection from "../../components/property/shared/ScheduleInspection";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

import { getPropertyById } from "../../firebase/propertyService";
import { getMyApplications } from "../../firebase/applicationService";

import { useAuth } from "../../contexts/AuthContext";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const [property, setProperty] = useState(null);

  const [loading, setLoading] = useState(true);

  const [applicationLoading, setApplicationLoading] = useState(false);

  const [applicationStatus, setApplicationStatus] = useState(null);

  // =====================================================
  // LOAD PROPERTY
  // =====================================================

  useEffect(() => {
    async function loadProperty() {
      try {
        setLoading(true);

        const data = await getPropertyById(id);

        setProperty(data);
      } catch (error) {
        console.error("Error loading property:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProperty();
    }
  }, [id]);

  // =====================================================
  // CHECK TENANT APPLICATION
  // =====================================================

  useEffect(() => {
    async function checkApplication() {
      // No logged-in user
      if (!user?.uid) {
        setApplicationStatus(null);
        return;
      }

      // Only tenants can have rental applications
      if (user.role !== "tenant") {
        setApplicationStatus(null);
        return;
      }

      try {
        setApplicationLoading(true);

        const applications = await getMyApplications(user.uid);

        // Find applications for this property
        const propertyApplications = applications.filter(
          (application) => application.propertyId === id,
        );

        // No application
        if (propertyApplications.length === 0) {
          setApplicationStatus(null);
          return;
        }

        /*
        --------------------------------------------------
        Find the newest application.

        This is important because a tenant can have:

        Application 1 → rejected
        Application 2 → pending

        We want Application 2's status.
        --------------------------------------------------
        */

        const sortedApplications = [...propertyApplications].sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;

          const dateB = b.createdAt?.toMillis?.() || 0;

          return dateB - dateA;
        });

        const latestApplication = sortedApplications[0];

        setApplicationStatus(latestApplication.status || "pending");
      } catch (error) {
        console.error("Error checking application status:", error);

        setApplicationStatus(null);
      } finally {
        setApplicationLoading(false);
      }
    }

    if (property?.id) {
      checkApplication();
    }
  }, [user, id, property?.id]);

  // =====================================================
  // APPLY HANDLER
  // =====================================================

  function handleApply() {
    // Firebase is still checking authentication
    if (authLoading) {
      return;
    }

    // ===================================================
    // NOT LOGGED IN
    // ===================================================

    if (!user) {
      navigate("/login", {
        state: {
          from: `/properties/${id}`,
          action: "apply",
        },
      });

      return;
    }

    // ===================================================
    // NOT A TENANT
    // ===================================================

    if (user.role !== "tenant") {
      alert("Only registered tenants can apply for rental properties.");

      return;
    }

    // ===================================================
    // PENDING
    // ===================================================

    if (applicationStatus === "pending") {
      return;
    }

    // ===================================================
    // APPROVED
    // ===================================================

    if (applicationStatus === "approved") {
      return;
    }

    // ===================================================
    // REJECTED OR NO APPLICATION
    // ===================================================

    navigate("/tenant/apply", {
      state: {
        property,
      },
    });
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading || authLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[60vh] items-center justify-center bg-white dark:bg-slate-950"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg text-slate-500 dark:text-slate-400"
        >
          Loading property...
        </motion.p>
      </motion.div>
    );
  }

  // =====================================================
  // PROPERTY NOT FOUND
  // =====================================================

  if (!property) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[60vh] items-center justify-center bg-white px-6 dark:bg-slate-950"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Property Not Found
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            This property may have been removed.
          </p>
        </div>
      </motion.div>
    );
  }

  // =====================================================
  // BUTTON TEXT
  // =====================================================

  function getApplicationButtonText() {
    if (applicationLoading) {
      return "Checking Application...";
    }

    if (applicationStatus === "pending") {
      return "Application Pending";
    }

    if (applicationStatus === "approved") {
      return "Application Approved";
    }

    if (applicationStatus === "rejected") {
      return "Apply Again";
    }

    return "Apply for This Property";
  }

  // =====================================================
  // BUTTON STYLE
  // =====================================================

  function getApplicationButtonClass() {
    if (applicationStatus === "pending") {
      return "cursor-not-allowed bg-yellow-500";
    }

    if (applicationStatus === "approved") {
      return "cursor-not-allowed bg-green-600";
    }

    return "bg-blue-600 hover:bg-blue-700";
  }

  const cannotApply =
    applicationLoading ||
    applicationStatus === "pending" ||
    applicationStatus === "approved";

  return (
    <DashboardLayout>
      {/* Property Hero */}

      <PropertyDetailsHero property={property} />

      {/* Images */}

      <ImageGallery images={property.images || []} title={property.title} />

      {/* Information */}

      <PropertyInformation property={property} />

      {/* Amenities */}

      <Amenities amenities={property.amenities || []} />

      {/* Contact */}

      <ContactCard property={property} />

      {/* Location */}

      <PropertyLocation
        city={property.city || ""}
        state={property.state || ""}
      />

      {/* Related */}

      <RelatedProperties property={property} basePath="/tenant/properties" />

      {/* Inspection */}

      <ScheduleInspection property={property} />

      {/* =================================================
          APPLICATION SECTION
      ================================================= */}

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-50 px-6 py-16 transition-colors duration-300 dark:bg-slate-950"
      >
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl bg-white p-8 text-center shadow-sm transition-colors duration-300 dark:bg-slate-900 dark:shadow-black/30 md:p-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Interested in this property?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Submit an application to rent this property.
            </p>

            {/* =========================================
                NOT LOGGED IN
            ========================================= */}

            {!user && (
              <>
                <p className="mt-3 text-slate-500 dark:text-slate-400">
                  You need to be logged in as a tenant before you can apply.
                </p>

                <button
                  type="button"
                  onClick={handleApply}
                  className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Login to Apply
                </button>
              </>
            )}

            {/* =========================================
                LOGGED IN BUT NOT TENANT
            ========================================= */}

            {user && user.role !== "tenant" && (
              <p className="mt-6 text-red-600 dark:text-red-400">
                Only registered tenants can apply for properties.
              </p>
            )}

            {/* =========================================
                TENANT
            ========================================= */}

            {user && user.role === "tenant" && (
              <>
                {/* Pending */}

                {applicationStatus === "pending" && (
                  <div className="mt-6">
                    <p className="text-yellow-600">
                      Your application for this property is currently being
                      reviewed.
                    </p>
                  </div>
                )}

                {/* Approved */}

                {applicationStatus === "approved" && (
                  <div className="mt-6">
                    <p className="text-green-600">
                      Your application has been approved. This property has been
                      assigned to you.
                    </p>
                  </div>
                )}

                {/* Rejected */}

                {applicationStatus === "rejected" && (
                  <div className="mt-6">
                    <p className="text-red-600">
                      Your previous application was rejected.
                    </p>

                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                      You can submit a new application.
                    </p>
                  </div>
                )}

                {/* No application */}

                {!applicationStatus && (
                  <p className="mt-3 text-slate-500 dark:text-slate-400">
                    You are logged in as a tenant and can apply for this
                    property.
                  </p>
                )}

                {/* Apply Button */}

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={cannotApply}
                  className={`mt-8 rounded-xl px-8 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-90 ${getApplicationButtonClass()}`}
                >
                  {getApplicationButtonText()}
                </button>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>
    </DashboardLayout>
  );
}

export default PropertyDetails;
