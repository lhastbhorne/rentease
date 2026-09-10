import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaCheck,
  FaTimes,
  FaFileAlt,
  FaEye,
  FaBuilding,
  FaUserCheck,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getPendingProperties,
  approveProperty,
  rejectProperty,
} from "../../firebase/adminService";

function Verification() {
  const { user } = useAuth();

  // ==========================================
  // STATE
  // ==========================================

  const [activeTab, setActiveTab] = useState("accounts");

  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(true);

  const [processingId, setProcessingId] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // ==========================================
  // LOAD PENDING USERS
  // ==========================================

  async function loadPendingUsers() {
    try {
      setLoadingUsers(true);

      const data = await getPendingUsers();

      setUsers(data);
    } catch (error) {
      console.error("Error loading pending users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }

  // ==========================================
  // LOAD PENDING PROPERTIES
  // ==========================================

  async function loadPendingProperties() {
    try {
      setLoadingProperties(true);

      const data = await getPendingProperties();

      setProperties(data);
    } catch (error) {
      console.error("Error loading pending properties:", error);
    } finally {
      setLoadingProperties(false);
    }
  }

  // ==========================================
  // LOAD EVERYTHING
  // ==========================================

  useEffect(() => {
    loadPendingUsers();
    loadPendingProperties();
  }, []);

  // ==========================================
  // APPROVE USER
  // ==========================================

  async function handleApproveUser(selectedUser) {
    const confirmed = window.confirm(
      `Approve ${selectedUser.fullName || "this account"}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(selectedUser.id);

      await approveUser(selectedUser.id, user?.uid);

      alert("Account approved successfully.");

      setSelectedUser(null);

      await loadPendingUsers();
    } catch (error) {
      console.error("Error approving user:", error);

      alert(error.message || "Failed to approve account.");
    } finally {
      setProcessingId(null);
    }
  }

  // ==========================================
  // REJECT USER
  // ==========================================

  async function handleRejectUser(selectedUser) {
    const reason = window.prompt("Why is this account being rejected?");

    if (reason === null) {
      return;
    }

    try {
      setProcessingId(selectedUser.id);

      await rejectUser(selectedUser.id, user?.uid, reason.trim());

      alert("Account rejected successfully.");

      setSelectedUser(null);

      await loadPendingUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);

      alert(error.message || "Failed to reject account.");
    } finally {
      setProcessingId(null);
    }
  }

  // ==========================================
  // APPROVE PROPERTY
  // ==========================================

  async function handleApproveProperty(property) {
    const confirmed = window.confirm(
      `Approve "${property.title || "this property"}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(property.id);

      await approveProperty(property.id, user?.uid);

      alert("Property approved successfully.");

      setSelectedProperty(null);

      await loadPendingProperties();
    } catch (error) {
      console.error("Error approving property:", error);

      alert(error.message || "Failed to approve property.");
    } finally {
      setProcessingId(null);
    }
  }

  // ==========================================
  // REJECT PROPERTY
  // ==========================================

  async function handleRejectProperty(property) {
    const reason = window.prompt("Why is this property being rejected?");

    if (reason === null) {
      return;
    }

    try {
      setProcessingId(property.id);

      await rejectProperty(property.id, user?.uid, reason.trim());

      alert("Property rejected successfully.");

      setSelectedProperty(null);

      await loadPendingProperties();
    } catch (error) {
      console.error("Error rejecting property:", error);

      alert(error.message || "Failed to reject property.");
    } finally {
      setProcessingId(null);
    }
  }

  // ==========================================
  // FORMAT ROLE
  // ==========================================

  function formatRole(role) {
    if (!role) {
      return "Unknown";
    }

    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  function formatRentFrequency(frequency) {
    switch (frequency) {
      case "monthly":
        return "Per Month";

      case "annual":
        return "Per Annum";

      case "quarterly":
        return "Per Quarter";

      case "half_yearly":
        return "Every 6 Months";

      default:
        return "Not specified";
    }
  }

  function formatPrice(price) {
    const amount = Number(price);

    if (!amount || Number.isNaN(amount)) {
      return "₦0";
    }

    return `₦${amount.toLocaleString("en-NG")}`;
  }

  // ==========================================
  // GET VERIFICATION DOCUMENT
  // ==========================================

  function getVerificationDocument(account) {
    if (account.role === "landlord") {
      return (
        account.identificationDocument ||
        account.identificationDocumentUrl ||
        account.idDocument ||
        account.idDocumentUrl ||
        account.verificationDocument ||
        account.verificationDocumentUrl ||
        ""
      );
    }

    if (account.role === "agent") {
      return (
        account.cacDocument ||
        account.cacDocumentUrl ||
        account.cacCertificate ||
        account.cacCertificateUrl ||
        account.verificationDocument ||
        account.verificationDocumentUrl ||
        ""
      );
    }

    return "";
  }

  // ==========================================
  // GET DOCUMENT NAME
  // ==========================================

  function getDocumentName(account) {
    if (account.role === "landlord") {
      return (
        account.identificationDocumentName ||
        account.idDocumentName ||
        "Identification Document"
      );
    }

    if (account.role === "agent") {
      return (
        account.cacDocumentName ||
        account.cacCertificateName ||
        "CAC Registration Certificate"
      );
    }

    return "Verification Document";
  }

  // ==========================================
  // ACCOUNT STATUS
  // ==========================================

  function AccountStatus({ status }) {
    if (status === "approved") {
      return (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="
            inline-flex items-center gap-2 rounded-full
            bg-green-100 px-3 py-1
            text-sm font-semibold text-green-700
            dark:bg-green-950/50
            dark:text-green-400
          "
        >
          <FaCheck />
          Approved
        </motion.span>
      );
    }

    if (status === "rejected") {
      return (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="
            inline-flex items-center gap-2 rounded-full
            bg-red-100 px-3 py-1
            text-sm font-semibold text-red-700
            dark:bg-red-950/50
            dark:text-red-400
          "
        >
          <FaTimes />
          Rejected
        </motion.span>
      );
    }

    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="
          inline-flex items-center gap-2 rounded-full
          bg-yellow-100 px-3 py-1
          text-sm font-semibold text-yellow-700
          dark:bg-yellow-950/50
          dark:text-yellow-400
        "
      >
        <FaClock />
        Pending
      </motion.span>
    );
  }

  // ==========================================
  // DETAIL COMPONENT
  // ==========================================

  function Detail({ label, value }) {
    return (
      <motion.div
        whileHover={{
          y: -2,
        }}
        transition={{
          duration: 0.2,
        }}
        className="
          rounded-lg
          border border-slate-200
          bg-slate-50
          p-4
          dark:border-slate-700
          dark:bg-slate-800
        "
      >
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words font-semibold text-slate-800 dark:text-slate-100">
          {value || "Not provided"}
        </p>
      </motion.div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <DashboardLayout>
      <motion.div
        className="mx-auto max-w-7xl"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
        }}
      >
        {/* ======================================
            HEADER
        ====================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Verification
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Review and approve user accounts and property listings before they
            become active on RentEase.
          </p>
        </motion.div>

        {/* ======================================
            TABS
        ====================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.1,
          }}
          className="
            mb-8 flex flex-col gap-3
            rounded-2xl
            border border-slate-200
            bg-white
            p-2
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
            sm:flex-row
          "
        >
          <motion.button
            type="button"
            onClick={() => setActiveTab("accounts")}
            whileHover={{
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-colors ${
              activeTab === "accounts"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <FaUserCheck />
            Account Verification
            {users.length > 0 && (
              <motion.span
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === "accounts"
                    ? "bg-white text-blue-600"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400"
                }`}
              >
                {users.length}
              </motion.span>
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setActiveTab("properties")}
            whileHover={{
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-colors ${
              activeTab === "properties"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <FaBuilding />
            Property Verification
            {properties.length > 0 && (
              <motion.span
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === "properties"
                    ? "bg-white text-blue-600"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400"
                }`}
              >
                {properties.length}
              </motion.span>
            )}
          </motion.button>
        </motion.div>

        {/* ======================================
            TAB CONTENT
        ====================================== */}

        <AnimatePresence mode="wait">
          {/* ======================================
              ACCOUNT VERIFICATION
          ====================================== */}

          {activeTab === "accounts" && (
            <motion.div
              key="accounts"
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: 20,
              }}
              transition={{
                duration: 0.35,
              }}
            >
              {loadingUsers ? (
                <Loading message="Loading pending accounts..." />
              ) : users.length === 0 ? (
                <EmptyState
                  icon={<FaCheck />}
                  title="All Accounts Verified"
                  message="There are no landlord or agent accounts waiting for verification."
                />
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                      },
                    },
                  }}
                  className="space-y-6"
                >
                  {users.map((account) => {
                    const documentUrl = getVerificationDocument(account);

                    return (
                      <motion.div
                        key={account.id}
                        variants={{
                          hidden: {
                            opacity: 0,
                            y: 25,
                          },
                          visible: {
                            opacity: 1,
                            y: 0,
                          },
                        }}
                        whileHover={{
                          y: -3,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="
                          overflow-hidden
                          rounded-2xl
                          border border-slate-200
                          bg-white
                          shadow-sm
                          dark:border-slate-800
                          dark:bg-slate-900
                        "
                      >
                        <div className="p-6">
                          {/* ACCOUNT HEADER */}

                          <div className="flex flex-col justify-between gap-4 sm:flex-row">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                  {account.fullName || "Unnamed User"}
                                </h2>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    account.role === "landlord"
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                                      : "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400"
                                  }`}
                                >
                                  {formatRole(account.role)}
                                </span>
                              </div>

                              <p className="mt-2 text-slate-500 dark:text-slate-400">
                                {account.email || "No email"}
                              </p>
                            </div>

                            <AccountStatus status={account.accountStatus} />
                          </div>

                          {/* ACCOUNT INFORMATION */}

                          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Detail
                              label="Full Name"
                              value={account.fullName}
                            />

                            <Detail label="Email" value={account.email} />

                            <Detail label="Phone" value={account.phone} />

                            {account.role === "landlord" && (
                              <Detail label="NIN" value={account.nin} />
                            )}

                            {account.role === "agent" && (
                              <Detail
                                label="Agency"
                                value={account.agencyName}
                              />
                            )}

                            {account.role === "agent" && (
                              <Detail
                                label="CAC Number"
                                value={account.cacNumber}
                              />
                            )}

                            {account.role === "agent" && (
                              <Detail
                                label="Office Address"
                                value={account.officeAddress}
                              />
                            )}

                            {account.role === "landlord" && (
                              <Detail
                                label="ID Type"
                                value={
                                  account.identificationType || account.idType
                                }
                              />
                            )}
                          </div>

                          {/* VERIFICATION DOCUMENT */}

                          <motion.div
                            initial={{
                              opacity: 0,
                            }}
                            animate={{
                              opacity: 1,
                            }}
                            transition={{
                              delay: 0.15,
                            }}
                            className="
                              mt-6 rounded-xl
                              border border-slate-200
                              bg-slate-50
                              p-5
                              dark:border-slate-700
                              dark:bg-slate-800
                            "
                          >
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                              <div className="flex items-start gap-3">
                                <motion.div
                                  whileHover={{
                                    rotate: 5,
                                    scale: 1.08,
                                  }}
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                                    account.role === "landlord"
                                      ? "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                                      : "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"
                                  }`}
                                >
                                  <FaFileAlt />
                                </motion.div>

                                <div>
                                  <p className="font-semibold text-slate-800 dark:text-white">
                                    {account.role === "landlord"
                                      ? "Means of Identification"
                                      : "CAC Registration Certificate"}
                                  </p>

                                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {documentUrl
                                      ? getDocumentName(account)
                                      : "No document uploaded"}
                                  </p>
                                </div>
                              </div>

                              {documentUrl ? (
                                <motion.a
                                  href={documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{
                                    scale: 1.03,
                                  }}
                                  whileTap={{
                                    scale: 0.97,
                                  }}
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                                >
                                  <FaEye />
                                  View Document
                                </motion.a>
                              ) : (
                                <span className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-400">
                                  <FaExclamationTriangle />
                                  Missing Document
                                </span>
                              )}
                            </div>
                          </motion.div>

                          {/* ACTIONS */}

                          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <motion.button
                              type="button"
                              onClick={() => setSelectedUser(account)}
                              whileHover={{
                                scale: 1.02,
                              }}
                              whileTap={{
                                scale: 0.98,
                              }}
                              className="
                                flex items-center justify-center gap-2
                                rounded-lg
                                border border-slate-300
                                px-5 py-3
                                font-semibold
                                text-slate-700
                                hover:bg-slate-50
                                dark:border-slate-700
                                dark:text-slate-200
                                dark:hover:bg-slate-800
                              "
                            >
                              <FaEye />
                              Review Account
                            </motion.button>

                            <motion.button
                              type="button"
                              onClick={() => handleApproveUser(account)}
                              disabled={processingId === account.id}
                              whileHover={{
                                scale: 1.02,
                              }}
                              whileTap={{
                                scale: 0.98,
                              }}
                              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <FaCheck />

                              {processingId === account.id
                                ? "Processing..."
                                : "Approve Account"}
                            </motion.button>

                            <motion.button
                              type="button"
                              onClick={() => handleRejectUser(account)}
                              disabled={processingId === account.id}
                              whileHover={{
                                scale: 1.02,
                              }}
                              whileTap={{
                                scale: 0.98,
                              }}
                              className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <FaTimes />
                              Reject Account
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ======================================
              PROPERTY VERIFICATION
          ====================================== */}

          {activeTab === "properties" && (
            <motion.div
              key="properties"
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
              transition={{
                duration: 0.35,
              }}
            >
              {loadingProperties ? (
                <Loading message="Loading pending properties..." />
              ) : properties.length === 0 ? (
                <EmptyState
                  icon={<FaCheck />}
                  title="All Properties Verified"
                  message="There are no properties waiting for admin verification."
                />
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                      },
                    },
                  }}
                  className="space-y-6"
                >
                  {properties.map((property) => (
                    <motion.div
                      key={property.id}
                      variants={{
                        hidden: {
                          opacity: 0,
                          y: 25,
                        },
                        visible: {
                          opacity: 1,
                          y: 0,
                        },
                      }}
                      whileHover={{
                        y: -3,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="
                        overflow-hidden
                        rounded-2xl
                        border border-slate-200
                        bg-white
                        shadow-sm
                        dark:border-slate-800
                        dark:bg-slate-900
                      "
                    >
                      <div className="grid lg:grid-cols-3">
                        {/* IMAGE */}

                        <div className="bg-slate-100 dark:bg-slate-800">
                          <motion.img
                            whileHover={{
                              scale: 1.03,
                            }}
                            transition={{
                              duration: 0.4,
                            }}
                            src={
                              property.images?.[0] ||
                              "https://placehold.co/800x600?text=Property"
                            }
                            alt={property.title || "Property"}
                            className="h-full min-h-64 w-full object-cover"
                          />
                        </div>

                        {/* DETAILS */}

                        <div className="p-6 lg:col-span-2">
                          <div className="flex flex-col justify-between gap-4 sm:flex-row">
                            <div>
                              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {property.title || "Untitled Property"}
                              </h2>

                              <p className="mt-2 text-slate-500 dark:text-slate-400">
                                {property.city || "Unknown City"}

                                {property.state ? `, ${property.state}` : ""}
                              </p>
                            </div>

                            <motion.span
                              initial={{
                                opacity: 0,
                                scale: 0.8,
                              }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                              }}
                              className="
                                h-fit rounded-full
                                bg-yellow-100
                                px-4 py-2
                                text-sm font-semibold
                                text-yellow-700
                                dark:bg-yellow-950/50
                                dark:text-yellow-400
                              "
                            >
                              Pending
                            </motion.span>
                          </div>

                          {/* PROPERTY INFORMATION */}

                          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Detail
                              label="Property Type"
                              value={property.type || property.propertyType}
                            />

                            <Detail
                              label="Price"
                              value={`₦${Number(
                                property.price || 0,
                              ).toLocaleString()}`}
                            />

                            <Detail
                              label="Bedrooms"
                              value={property.bedrooms || 0}
                            />

                            <Detail
                              label="Bathrooms"
                              value={property.bathrooms || 0}
                            />
                          </div>

                          {/* SUBMITTED BY */}

                          <motion.div
                            whileHover={{
                              x: 3,
                            }}
                            className="
                              mt-6 rounded-xl
                              bg-slate-50
                              p-4
                              dark:bg-slate-800
                            "
                          >
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                              Submitted By
                            </p>

                            <p className="mt-1 font-semibold capitalize text-slate-800 dark:text-white">
                              {property.submittedByRole ||
                                property.role ||
                                "Unknown"}
                            </p>
                          </motion.div>

                          {/* OWNERSHIP DOCUMENT */}

                          {property.ownershipProof && (
                            <motion.div
                              initial={{
                                opacity: 0,
                              }}
                              animate={{
                                opacity: 1,
                              }}
                              className="
                                mt-5 rounded-xl
                                border border-blue-100
                                bg-blue-50
                                p-4
                                dark:border-blue-900/50
                                dark:bg-blue-950/30
                              "
                            >
                              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-3">
                                  <FaFileAlt className="text-blue-600 dark:text-blue-400" />

                                  <div>
                                    <p className="font-semibold text-slate-800 dark:text-white">
                                      Proof of Ownership
                                    </p>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      Ownership document submitted with property
                                    </p>
                                  </div>
                                </div>

                                <motion.a
                                  href={property.ownershipProof}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{
                                    scale: 1.03,
                                  }}
                                  whileTap={{
                                    scale: 0.97,
                                  }}
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                                >
                                  <FaEye />
                                  View Document
                                </motion.a>
                              </div>
                            </motion.div>
                          )}

                          {/* ACTIONS */}

                          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <motion.button
                              type="button"
                              onClick={() => setSelectedProperty(property)}
                              whileHover={{
                                scale: 1.02,
                              }}
                              whileTap={{
                                scale: 0.98,
                              }}
                              className="
                                flex items-center justify-center gap-2
                                rounded-lg
                                border border-slate-300
                                px-5 py-3
                                font-semibold
                                text-slate-700
                                hover:bg-slate-50
                                dark:border-slate-700
                                dark:text-slate-200
                                dark:hover:bg-slate-800
                              "
                            >
                              <FaEye />
                              Review Property
                            </motion.button>

                            <motion.button
                              type="button"
                              onClick={() => handleApproveProperty(property)}
                              disabled={processingId === property.id}
                              whileHover={{
                                scale: 1.02,
                              }}
                              whileTap={{
                                scale: 0.98,
                              }}
                              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <FaCheck />

                              {processingId === property.id
                                ? "Processing..."
                                : "Approve Property"}
                            </motion.button>

                            <motion.button
                              type="button"
                              onClick={() => handleRejectProperty(property)}
                              disabled={processingId === property.id}
                              whileHover={{
                                scale: 1.02,
                              }}
                              whileTap={{
                                scale: 0.98,
                              }}
                              className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <FaTimes />
                              Reject Property
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ========================================
          USER REVIEW MODAL
      ======================================== */}

      <AnimatePresence>
        {selectedUser && (
          <Modal
            title={`${formatRole(selectedUser.role)} Account Review`}
            onClose={() => setSelectedUser(null)}
          >
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Full Name" value={selectedUser.fullName} />

                <Detail label="Email" value={selectedUser.email} />

                <Detail label="Phone" value={selectedUser.phone} />

                <Detail label="Role" value={formatRole(selectedUser.role)} />
              </div>

              {/* LANDLORD */}

              {selectedUser.role === "landlord" && (
                <>
                  <Detail label="NIN" value={selectedUser.nin} />

                  <Detail
                    label="Identification Type"
                    value={
                      selectedUser.identificationType || selectedUser.idType
                    }
                  />
                </>
              )}

              {/* AGENT */}

              {selectedUser.role === "agent" && (
                <>
                  <Detail
                    label="Agency / Business Name"
                    value={selectedUser.agencyName}
                  />

                  <Detail
                    label="Office Address"
                    value={selectedUser.officeAddress}
                  />

                  <Detail label="CAC Number" value={selectedUser.cacNumber} />
                </>
              )}

              {/* DOCUMENT */}

              <div
                className="
                rounded-xl
                border border-slate-200
                bg-slate-50
                p-5
                dark:border-slate-700
                dark:bg-slate-800
              "
              >
                <div className="flex items-start gap-3">
                  <FaFileAlt className="mt-1 text-blue-600 dark:text-blue-400" />

                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {selectedUser.role === "landlord"
                        ? "Means of Identification"
                        : "CAC Registration Certificate"}
                    </p>

                    {getVerificationDocument(selectedUser) ? (
                      <motion.a
                        href={getVerificationDocument(selectedUser)}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{
                          x: 3,
                        }}
                        className="mt-2 inline-flex items-center gap-2 font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <FaEye />
                        Open Document
                      </motion.a>
                    ) : (
                      <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                        No verification document uploaded.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 sm:flex-row">
                <motion.button
                  type="button"
                  onClick={() => handleApproveUser(selectedUser)}
                  disabled={processingId === selectedUser.id}
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaCheck />

                  {processingId === selectedUser.id
                    ? "Processing..."
                    : "Approve Account"}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => handleRejectUser(selectedUser)}
                  disabled={processingId === selectedUser.id}
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaTimes />
                  Reject Account
                </motion.button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ========================================
    PROPERTY REVIEW MODAL
======================================== */}

      <AnimatePresence>
        {selectedProperty && (
          <Modal
            title="Property Review"
            onClose={() => setSelectedProperty(null)}
          >
            <div className="space-y-6">
              {/* ========================================
            PROPERTY IMAGE GALLERY
        ======================================== */}

              <div>
                {selectedProperty.images?.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedProperty.images.map((image, index) => (
                      <motion.img
                        key={`${image}-${index}`}
                        initial={{
                          opacity: 0,
                          scale: 0.95,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{
                          duration: 0.35,
                          delay: index * 0.05,
                        }}
                        whileHover={{
                          scale: 1.02,
                        }}
                        src={image}
                        alt={selectedProperty.title || "Property"}
                        className={`w-full rounded-xl object-cover ${
                          index === 0 ? "h-64 sm:col-span-2" : "h-48"
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    No property images available.
                  </div>
                )}
              </div>

              {/* ========================================
            PROPERTY TITLE
        ======================================== */}

              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {selectedProperty.title || "Untitled Property"}
                </h3>

                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  {selectedProperty.areaName
                    ? `${selectedProperty.areaName}, `
                    : ""}
                  {selectedProperty.city || "Unknown City"}
                  {selectedProperty.state ? `, ${selectedProperty.state}` : ""}
                </p>
              </div>

              {/* ========================================
            PROPERTY DETAILS
        ======================================== */}

              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">
                  Property Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Detail
                    label="Property Type"
                    value={
                      selectedProperty.type || selectedProperty.propertyType
                    }
                  />

                  <Detail label="Category" value={selectedProperty.category} />

                  <Detail
                    label="Rental Price"
                    value={`${formatPrice(selectedProperty.price)} / ${
                      selectedProperty.rentFrequency === "monthly"
                        ? "month"
                        : selectedProperty.rentFrequency === "annual"
                          ? "annum"
                          : selectedProperty.rentFrequency || "not specified"
                    }`}
                  />

                  <Detail
                    label="Rent Frequency"
                    value={formatRentFrequency(selectedProperty.rentFrequency)}
                  />

                  <Detail
                    label="Bedrooms"
                    value={selectedProperty.bedrooms ?? 0}
                  />

                  <Detail
                    label="Toilets"
                    value={selectedProperty.toilets ?? 0}
                  />

                  <Detail
                    label="Bathrooms"
                    value={selectedProperty.bathrooms ?? 0}
                  />

                  <Detail
                    label="Parking"
                    value={selectedProperty.parking ?? 0}
                  />

                  <Detail
                    label="Furnished"
                    value={selectedProperty.furnished || "Not specified"}
                  />

                  <Detail
                    label="Property Size"
                    value={
                      selectedProperty.area
                        ? `${Number(selectedProperty.area).toLocaleString(
                            "en-NG",
                          )} sqft`
                        : "Not specified"
                    }
                  />
                </div>
              </div>

              {/* ========================================
            LOCATION
        ======================================== */}

              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">
                  Property Location
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Detail
                    label="Area / Neighborhood"
                    value={selectedProperty.areaName}
                  />

                  <Detail label="City" value={selectedProperty.city} />

                  <Detail label="State" value={selectedProperty.state} />

                  <Detail
                    label="Exact Address"
                    value={selectedProperty.address}
                  />
                </div>
              </div>

              {/* ========================================
            DESCRIPTION
        ======================================== */}

              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">
                  Description
                </h3>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
                  <p className="whitespace-pre-line leading-7 text-slate-600 dark:text-slate-300">
                    {selectedProperty.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* ========================================
            AMENITIES
        ======================================== */}

              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">
                  Amenities
                </h3>

                {selectedProperty.amenities?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity) => (
                      <motion.span
                        key={amenity}
                        whileHover={{
                          y: -2,
                        }}
                        className="rounded-full bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                      >
                        ✓ {amenity}
                      </motion.span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No amenities provided.
                  </p>
                )}
              </div>

              {/* ========================================
            NEARBY FACILITIES
        ======================================== */}

              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">
                  Nearby Facilities
                </h3>

                {selectedProperty.nearbyFacilities?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.nearbyFacilities.map((facility) => (
                      <motion.span
                        key={facility}
                        whileHover={{
                          y: -2,
                        }}
                        className="rounded-full bg-purple-100 px-3 py-2 text-sm font-medium text-purple-700 dark:bg-purple-950/50 dark:text-purple-400"
                      >
                        ✓ {facility}
                      </motion.span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No nearby facilities provided.
                  </p>
                )}
              </div>

              {/* ========================================
            PROPERTY MANAGER
        ======================================== */}

              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">
                  Property Manager
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Detail
                    label="Manager Name"
                    value={
                      selectedProperty.managerName ||
                      selectedProperty.ownerName ||
                      selectedProperty.submittedByName
                    }
                  />

                  <Detail
                    label="Manager Role"
                    value={
                      selectedProperty.managerRole ||
                      selectedProperty.ownerRole ||
                      selectedProperty.submittedByRole ||
                      selectedProperty.role
                    }
                  />

                  <Detail label="Owner ID" value={selectedProperty.ownerId} />

                  <Detail label="Agent ID" value={selectedProperty.agentId} />
                </div>
              </div>

              {/* ========================================
            SUBMISSION INFORMATION
        ======================================== */}

              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">
                  Submission Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Detail
                    label="Submitted By"
                    value={
                      selectedProperty.submittedByRole || selectedProperty.role
                    }
                  />

                  <Detail
                    label="Approval Status"
                    value={selectedProperty.approvalStatus || "Pending"}
                  />

                  <Detail
                    label="Property Status"
                    value={selectedProperty.status || "Available"}
                  />
                </div>
              </div>

              {/* ========================================
            OWNERSHIP DOCUMENT
        ======================================== */}

              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">
                  Ownership Verification
                </h3>

                {selectedProperty.ownershipProof ? (
                  <div
                    className="
                rounded-xl
                border border-blue-100
                bg-blue-50
                p-5
                dark:border-blue-900/50
                dark:bg-blue-950/30
              "
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                          <FaFileAlt />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">
                            Proof of Ownership
                          </p>

                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Ownership document submitted with this property.
                          </p>
                        </div>
                      </div>

                      <motion.a
                        href={selectedProperty.ownershipProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{
                          scale: 1.03,
                        }}
                        whileTap={{
                          scale: 0.97,
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                      >
                        <FaEye />
                        View Document
                      </motion.a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30">
                    <p className="font-semibold text-red-700 dark:text-red-400">
                      No proof of ownership was uploaded.
                    </p>

                    <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">
                      Review this carefully before approving the property.
                    </p>
                  </div>
                )}
              </div>

              {/* ========================================
            ACTIONS
        ======================================== */}

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row">
                <motion.button
                  type="button"
                  onClick={() => handleApproveProperty(selectedProperty)}
                  disabled={processingId === selectedProperty.id}
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaCheck />

                  {processingId === selectedProperty.id
                    ? "Processing..."
                    : "Approve Property"}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => handleRejectProperty(selectedProperty)}
                  disabled={processingId === selectedProperty.id}
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaTimes />

                  {processingId === selectedProperty.id
                    ? "Processing..."
                    : "Reject Property"}
                </motion.button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

// ==========================================
// LOADING COMPONENT
// ==========================================

function Loading({ message }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      className="
        rounded-2xl
        border border-slate-200
        bg-white
        p-12
        text-center
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          mx-auto h-10 w-10
          rounded-full
          border-4
          border-slate-200
          border-t-blue-600
          dark:border-slate-700
          dark:border-t-blue-400
        "
      />

      <p className="mt-4 text-slate-500 dark:text-slate-400">{message}</p>
    </motion.div>
  );
}

// ==========================================
// EMPTY STATE
// ==========================================

function EmptyState({ icon, title, message }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.4,
      }}
      className="
        rounded-2xl
        border border-slate-200
        bg-white
        p-12
        text-center
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <motion.div
        initial={{
          scale: 0,
        }}
        animate={{
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 15,
        }}
        className="
          mx-auto flex h-16 w-16
          items-center justify-center
          rounded-full
          bg-green-100
          text-2xl text-green-600
          dark:bg-green-950/50
          dark:text-green-400
        "
      >
        {icon}
      </motion.div>

      <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">
        {title}
      </h2>

      <p className="mt-2 text-slate-500 dark:text-slate-400">{message}</p>
    </motion.div>
  );
}

// ==========================================
// MODAL
// ==========================================

function Modal({ title, onClose, children }) {
  return (
    <motion.div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
        dark:bg-black/70
      "
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.92,
          y: 25,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.92,
          y: 25,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        onClick={(event) => event.stopPropagation()}
        className="
          max-h-[90vh]
          w-full
          max-w-3xl
          overflow-y-auto
          rounded-2xl
          border border-slate-200
          bg-white
          shadow-2xl
          dark:border-slate-700
          dark:bg-slate-900
        "
      >
        {/* HEADER */}

        <div
          className="
            sticky top-0 z-10
            flex items-center justify-between
            border-b border-slate-200
            bg-white
            px-6 py-5
            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {title}
          </h2>

          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{
              scale: 1.1,
              rotate: 90,
            }}
            whileTap={{
              scale: 0.9,
            }}
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-full
              text-xl
              text-slate-500
              hover:bg-slate-100
              dark:text-slate-400
              dark:hover:bg-slate-800
            "
          >
            <FaTimes />
          </motion.button>
        </div>

        {/* BODY */}

        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

export default Verification;
