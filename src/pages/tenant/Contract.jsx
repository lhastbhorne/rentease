import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaDownload,
  FaEnvelope,
  FaFileContract,
  FaHome,
  FaIdCard,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhone,
  FaUser,
  FaUserTie,
} from "react-icons/fa";
import jsPDF from "jspdf";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { getMyTenancy } from "../../firebase/tenancyService";

function Contract() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tenancy, setTenancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadTenancy() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const data = await getMyTenancy(user.uid);
        setTenancy(data);
      } catch (error) {
        console.error("Error loading tenancy:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTenancy();
  }, [user]);

  // ==========================================
  // MANAGER / LANDLORD INFORMATION
  // ==========================================

  const managerRole =
    tenancy?.managerRole || (tenancy?.agentId ? "agent" : "landlord");

  const managerName =
    tenancy?.managerName || tenancy?.landlordName || "Not specified";

  const managerEmail =
    tenancy?.managerEmail || tenancy?.landlordEmail || "Not specified";

  const managerLabel =
    managerRole === "agent" ? "Property Manager / Agent" : "Landlord";

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(dateValue) {
    if (!dateValue) return "Not specified";

    if (typeof dateValue === "object" && dateValue?.toDate) {
      return dateValue.toDate().toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // ==========================================
  // FORMAT STATUS
  // ==========================================

  function formatStatus(status) {
    if (!status) return "Active";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  // ==========================================
  // DOWNLOAD PDF
  // ==========================================

  async function downloadContract() {
    if (!tenancy || downloading) return;

    setDownloading(true);

    try {
      const pdf = new jsPDF();

      let y = 20;

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      function checkPageBreak(requiredSpace = 20) {
        if (y + requiredSpace > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
      }

      function addSectionTitle(title) {
        checkPageBreak(25);

        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, 20, y);

        y += 10;
      }

      function addField(label, value) {
        checkPageBreak(15);

        pdf.setFontSize(10);

        pdf.setFont("helvetica", "bold");
        pdf.text(`${label}:`, 20, y);

        pdf.setFont("helvetica", "normal");

        const formattedValue = String(value || "N/A");

        const wrappedValue = pdf.splitTextToSize(formattedValue, 125);

        pdf.text(wrappedValue, 65, y);

        y += Math.max(9, wrappedValue.length * 6);
      }

      // ==========================================
      // PDF HEADER
      // ==========================================

      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");

      pdf.text("RentEase", pageWidth / 2, y, {
        align: "center",
      });

      y += 10;

      pdf.setFontSize(16);

      pdf.text("RESIDENTIAL RENTAL AGREEMENT", pageWidth / 2, y, {
        align: "center",
      });

      y += 7;

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");

      pdf.text(
        "Official rental contract generated through RentEase",
        pageWidth / 2,
        y,
        {
          align: "center",
        },
      );

      y += 18;

      // ==========================================
      // LANDLORD / MANAGER
      // ==========================================

      addSectionTitle(
        managerRole === "agent"
          ? "PROPERTY MANAGER / AGENT INFORMATION"
          : "LANDLORD INFORMATION",
      );

      addField(
        managerRole === "agent" ? "Agent Name" : "Landlord Name",
        managerName,
      );

      addField(
        managerRole === "agent" ? "Agent Email" : "Landlord Email",
        managerEmail,
      );

      y += 5;

      // ==========================================
      // TENANT
      // ==========================================

      addSectionTitle("TENANT INFORMATION");

      addField("Name", tenancy.tenantName);

      addField("Email", tenancy.tenantEmail);

      addField("Phone", tenancy.tenantPhone);

      y += 5;

      // ==========================================
      // PROPERTY
      // ==========================================

      addSectionTitle("PROPERTY INFORMATION");

      addField("Property", tenancy.propertyTitle);

      addField("Address", tenancy.propertyAddress);

      addField("City", tenancy.propertyCity);

      addField("State", tenancy.propertyState);

      y += 5;

      // ==========================================
      // RENTAL DETAILS
      // ==========================================

      addSectionTitle("RENTAL DETAILS");

      addField(
        "Rent",
        `NGN ${Number(tenancy.rentAmount || 0).toLocaleString()}`,
      );

      addField(
        "Start Date",
        formatDate(tenancy.contractStartDate || tenancy.moveInDate),
      );

      addField("End Date", formatDate(tenancy.contractEndDate));

      addField("Status", formatStatus(tenancy.status));

      if (tenancy.paymentReference) {
        addField("Payment Reference", tenancy.paymentReference);
      }

      y += 8;

      // ==========================================
      // AGREEMENT
      // ==========================================

      addSectionTitle("AGREEMENT");

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const agreementText =
        "This document records the rental relationship between the property owner or authorised property manager and the tenant through the RentEase rental management system. The tenant agrees to occupy the property subject to the agreed rental terms and applicable rental conditions.";

      const agreementLines = pdf.splitTextToSize(agreementText, 170);

      checkPageBreak(agreementLines.length * 6 + 20);

      pdf.text(agreementLines, 20, y);

      y += agreementLines.length * 6 + 20;

      // ==========================================
      // SIGNATURES
      // ==========================================

      checkPageBreak(40);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");

      pdf.text("Landlord / Manager Signature", 20, y);

      pdf.text("Tenant Signature", 110, y);

      y += 15;

      pdf.setLineWidth(0.5);

      pdf.line(20, y, 85, y);

      pdf.line(110, y, 175, y);

      y += 10;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);

      pdf.text(managerName, 20, y);

      pdf.text(tenancy.tenantName || "Tenant", 110, y);

      // ==========================================
      // FOOTER
      // ==========================================

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");

      pdf.text(
        "Generated by RentEase Rental Management System",
        pageWidth / 2,
        pageHeight - 15,
        {
          align: "center",
        },
      );

      const safeTitle = (tenancy.propertyTitle || "Rental")
        .replace(/[^a-z0-9]/gi, "-")
        .replace(/-+/g, "-");

      pdf.save(`RentEase-Contract-${safeTitle}.pdf`);
    } catch (error) {
      console.error("Error generating contract:", error);

      alert("Unable to generate the rental contract. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="flex flex-col items-center"
          >
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading rental contract...
            </p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // NO ACTIVE TENANCY
  // ==========================================

  if (!tenancy) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
              <FaFileContract className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
              No Rental Contract
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              You do not currently have an active rental contract. Once your
              rent has been successfully paid and your tenancy becomes active,
              your contract will appear here.
            </p>

            <motion.button
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => navigate("/tenant/my-rental")}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <FaArrowLeft />
              Back to My Rental
            </motion.button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // CONTRACT PAGE
  // ==========================================

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* PAGE HEADER */}

          <motion.div
            initial={{
              opacity: 0,
              y: -15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
                  <FaFileContract className="text-lg text-blue-600 dark:text-blue-400" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                    Rental Contract
                  </h1>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Your official rental agreement and tenancy details.
                  </p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={downloadContract}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <FaDownload />

              {downloading ? "Generating PDF..." : "Download PDF"}
            </motion.button>
          </motion.div>

          {/* CONTRACT DOCUMENT */}

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            {/* CONTRACT HEADER */}

            <div className="border-b border-slate-200 px-5 py-8 text-center dark:border-slate-800 sm:px-10 sm:py-10">
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.4,
                }}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40">
                  <FaHome className="text-xl text-blue-600 dark:text-blue-400" />
                </div>

                <h2 className="mt-4 text-3xl font-bold text-blue-600 dark:text-blue-400">
                  RentEase
                </h2>

                <p className="mt-2 text-sm font-bold tracking-wide text-slate-700 dark:text-slate-200">
                  RESIDENTIAL RENTAL AGREEMENT
                </p>

                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <FaCheckCircle />
                  <span>Official RentEase tenancy document</span>
                </div>
              </motion.div>
            </div>

            <div className="space-y-8 p-5 sm:p-8 lg:p-12">
              {/* MANAGER / LANDLORD */}

              <ContractSection
                icon={<FaUserTie />}
                title={`${managerLabel} Information`}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Info
                    icon={<FaUser />}
                    label={
                      managerRole === "agent" ? "Agent Name" : "Landlord Name"
                    }
                    value={managerName}
                  />

                  <Info
                    icon={<FaEnvelope />}
                    label={
                      managerRole === "agent" ? "Agent Email" : "Landlord Email"
                    }
                    value={managerEmail}
                  />
                </div>
              </ContractSection>

              {/* TENANT */}

              <ContractSection icon={<FaUser />} title="Tenant Information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Info
                    icon={<FaUser />}
                    label="Name"
                    value={tenancy.tenantName}
                  />

                  <Info
                    icon={<FaEnvelope />}
                    label="Email"
                    value={tenancy.tenantEmail}
                  />

                  <Info
                    icon={<FaPhone />}
                    label="Phone"
                    value={tenancy.tenantPhone}
                  />
                </div>
              </ContractSection>

              {/* PROPERTY */}

              <ContractSection icon={<FaHome />} title="Property Information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Info
                    icon={<FaHome />}
                    label="Property"
                    value={tenancy.propertyTitle}
                  />

                  <Info
                    icon={<FaMapMarkerAlt />}
                    label="Address"
                    value={tenancy.propertyAddress}
                  />

                  <Info
                    icon={<FaMapMarkerAlt />}
                    label="City"
                    value={tenancy.propertyCity}
                  />

                  <Info
                    icon={<FaMapMarkerAlt />}
                    label="State"
                    value={tenancy.propertyState}
                  />
                </div>
              </ContractSection>

              {/* RENTAL DETAILS */}

              <ContractSection
                icon={<FaMoneyBillWave />}
                title="Rental Details"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Info
                    icon={<FaMoneyBillWave />}
                    label="Rent"
                    value={`₦${Number(
                      tenancy.rentAmount || 0,
                    ).toLocaleString()}`}
                    highlight
                  />

                  <Info
                    icon={<FaCalendarAlt />}
                    label="Start Date"
                    value={formatDate(
                      tenancy.contractStartDate || tenancy.moveInDate,
                    )}
                  />

                  <Info
                    icon={<FaCalendarAlt />}
                    label="End Date"
                    value={formatDate(tenancy.contractEndDate)}
                  />

                  <Info
                    icon={<FaCheckCircle />}
                    label="Status"
                    value={formatStatus(tenancy.status)}
                    status
                  />

                  {tenancy.paymentReference && (
                    <Info
                      icon={<FaIdCard />}
                      label="Payment Reference"
                      value={tenancy.paymentReference}
                    />
                  )}
                </div>
              </ContractSection>

              {/* AGREEMENT */}

              <ContractSection icon={<FaFileContract />} title="Agreement">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    This document records the rental relationship between the
                    property owner or authorised property manager and the tenant
                    through the RentEase rental management system. The tenant
                    agrees to occupy the property subject to the agreed rental
                    terms and applicable rental conditions.
                  </p>
                </div>
              </ContractSection>

              {/* SIGNATURES */}

              <section>
                <div className="grid gap-10 sm:grid-cols-2">
                  <SignatureBox
                    label={
                      managerRole === "agent"
                        ? "Property Manager / Agent"
                        : "Landlord"
                    }
                    name={managerName}
                  />

                  <SignatureBox
                    label="Tenant"
                    name={tenancy.tenantName || "Tenant"}
                  />
                </div>
              </section>

              {/* FOOTER */}

              <div className="border-t border-slate-200 pt-8 text-center dark:border-slate-800">
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <FaCheckCircle />
                  <span>Generated by RentEase Rental Management System</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ==========================================
// CONTRACT SECTION
// ==========================================

function ContractSection({ icon, title, children }) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 15,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.35,
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          {icon}
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>

      {children}
    </motion.section>
  );
}

// ==========================================
// INFO COMPONENT
// ==========================================

function Info({ icon, label, value, highlight = false, status = false }) {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      transition={{
        duration: 0.2,
      }}
      className={`rounded-xl border p-4 transition ${
        highlight
          ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30"
          : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 ${
            highlight
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-400 dark:text-slate-500"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p
            className={`mt-1 break-words text-sm font-semibold ${
              status
                ? "text-emerald-600 dark:text-emerald-400"
                : highlight
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-slate-900 dark:text-white"
            }`}
          >
            {value || "N/A"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// SIGNATURE BOX
// ==========================================

function SignatureBox({ label, name }) {
  return (
    <div>
      <div className="h-10 border-b border-slate-400 dark:border-slate-600" />

      <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label} Signature
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
        {name}
      </p>
    </div>
  );
}

export default Contract;
