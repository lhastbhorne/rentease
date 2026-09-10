import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaExclamationCircle,
  FaHeadset,
  FaReply,
  FaUser,
  FaTimes,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  getAllComplaints,
  replyToComplaint,
  updateComplaintStatus,
} from "../../firebase/complaintService";

function AdminComplaints() {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [reply, setReply] = useState("");

  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD COMPLAINTS
  // =====================================================

  useEffect(() => {
    if (user?.uid) {
      loadComplaints();
    }
  }, [user?.uid]);

  async function loadComplaints() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllComplaints();

      setComplaints(data);
    } catch (err) {
      console.error("Error loading admin complaints:", err);

      setError("Unable to load support requests.");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // OPEN COMPLAINT
  // =====================================================

  function openComplaint(complaint) {
    setSelectedComplaint(complaint);

    setReply(complaint.adminReply || "");

    setError("");
    setSuccess("");
  }

  // =====================================================
  // CLOSE COMPLAINT
  // =====================================================

  function closeComplaint() {
    setSelectedComplaint(null);
    setReply("");
    setError("");
    setSuccess("");
  }

  // =====================================================
  // SEND REPLY
  // =====================================================

  async function handleReply() {
    if (!selectedComplaint) {
      return;
    }

    if (!reply.trim()) {
      setError("Please enter a reply.");
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      await replyToComplaint(selectedComplaint.id, reply);

      setSuccess("Reply sent successfully.");

      const updatedComplaint = {
        ...selectedComplaint,
        adminReply: reply.trim(),
        status: "resolved",
      };

      setSelectedComplaint(updatedComplaint);

      setComplaints((prev) =>
        prev.map((item) =>
          item.id === selectedComplaint.id ? updatedComplaint : item,
        ),
      );

      setReply("");
    } catch (err) {
      console.error("Error replying to complaint:", err);

      setError(err.message || "Failed to send reply.");
    } finally {
      setProcessing(false);
    }
  }

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  async function handleStatusChange(status) {
    if (!selectedComplaint) {
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      await updateComplaintStatus(selectedComplaint.id, status);

      const updatedComplaint = {
        ...selectedComplaint,
        status,
      };

      setSelectedComplaint(updatedComplaint);

      setComplaints((prev) =>
        prev.map((item) =>
          item.id === selectedComplaint.id ? updatedComplaint : item,
        ),
      );

      setSuccess("Complaint status updated.");
    } catch (err) {
      console.error("Error updating complaint:", err);

      setError(err.message || "Failed to update status.");
    } finally {
      setProcessing(false);
    }
  }

  // =====================================================
  // DATE
  // =====================================================

  function formatDate(timestamp) {
    if (!timestamp) {
      return "Just now";
    }

    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleString();
    }

    return "";
  }

  // =====================================================
  // STATUS
  // =====================================================

  function getStatus(status) {
    switch (status) {
      case "resolved":
        return {
          label: "Resolved",
          className:
            "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
          icon: <FaCheckCircle />,
        };

      case "in-progress":
        return {
          label: "In Progress",
          className:
            "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
          icon: <FaClock />,
        };

      case "rejected":
        return {
          label: "Rejected",
          className:
            "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
          icon: <FaExclamationCircle />,
        };

      default:
        return {
          label: "Pending",
          className:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400",
          icon: <FaClock />,
        };
    }
  }

  // =====================================================
  // USER ROLE
  // =====================================================

  function getRoleLabel(role) {
    switch (role) {
      case "tenant":
        return "Tenant";

      case "landlord":
        return "Landlord";

      case "agent":
        return "Agent";

      default:
        return "User";
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

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
          duration: 0.4,
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

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
          <div className="flex items-center gap-3">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.7,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              whileHover={{
                rotate: 8,
                scale: 1.05,
              }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 15,
              }}
              className="
                flex h-12 w-12
                items-center justify-center
                rounded-xl
                bg-blue-100
                text-blue-600
                dark:bg-blue-950/50
                dark:text-blue-400
              "
            >
              <FaHeadset className="text-xl" />
            </motion.div>

            <div>
              <h1
                className="
                text-3xl font-bold
                text-slate-900
                dark:text-white
              "
              >
                Complaints & Support
              </h1>

              <p
                className="
                mt-1
                text-slate-500
                dark:text-slate-400
              "
              >
                Manage support requests submitted by RentEase users.
              </p>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            ERROR
        ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -15,
                height: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                y: -10,
                height: 0,
              }}
              className="
                mb-6 flex items-start gap-3
                overflow-hidden
                rounded-xl
                border border-red-200
                bg-red-50
                p-4
                text-red-700
                dark:border-red-900/50
                dark:bg-red-950/30
                dark:text-red-400
              "
            >
              <FaExclamationCircle className="mt-1 shrink-0" />

              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            SUCCESS
        ================================================= */}

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -15,
                height: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                y: -10,
                height: 0,
              }}
              className="
                mb-6 flex items-start gap-3
                overflow-hidden
                rounded-xl
                border border-green-200
                bg-green-50
                p-4
                text-green-700
                dark:border-green-900/50
                dark:bg-green-950/30
                dark:text-green-400
              "
            >
              <FaCheckCircle className="mt-1 shrink-0" />

              <p>{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            LOADING
        ================================================= */}

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
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

              <p
                className="
                mt-4
                text-slate-500
                dark:text-slate-400
              "
              >
                Loading support requests...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            EMPTY
        ================================================= */}

        <AnimatePresence mode="wait">
          {!loading && complaints.length === 0 && (
            <motion.div
              key="empty"
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
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
                    mx-auto
                    flex h-16 w-16
                    items-center justify-center
                    rounded-full
                    bg-slate-100
                    dark:bg-slate-800
                  "
              >
                <FaHeadset
                  className="
                    text-2xl
                    text-slate-400
                    dark:text-slate-500
                  "
                />
              </motion.div>

              <h2
                className="
                  mt-5 text-2xl font-bold
                  text-slate-800
                  dark:text-white
                "
              >
                No Support Requests
              </h2>

              <p
                className="
                  mt-2
                  text-slate-500
                  dark:text-slate-400
                "
              >
                There are currently no complaints or support requests from
                users.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            COMPLAINT LIST
        ================================================= */}

        <AnimatePresence mode="wait">
          {!loading && complaints.length > 0 && (
            <motion.div
              key="complaints"
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
              className="
                  grid gap-6
                  lg:grid-cols-2
                "
            >
              {complaints.map((complaint) => {
                const status = getStatus(complaint.status);

                return (
                  <motion.button
                    key={complaint.id}
                    type="button"
                    onClick={() => openComplaint(complaint)}
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
                      y: -5,
                    }}
                    whileTap={{
                      scale: 0.99,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="
                          rounded-2xl
                          border border-slate-200
                          bg-white
                          p-6
                          text-left
                          shadow-sm
                          transition-colors
                          duration-300
                          hover:shadow-md
                          dark:border-slate-800
                          dark:bg-slate-900
                          dark:hover:border-slate-700
                        "
                  >
                    {/* HEADER */}

                    <div
                      className="
                          flex items-start
                          justify-between
                          gap-4
                        "
                    >
                      <div
                        className="
                            flex min-w-0
                            items-center gap-3
                          "
                      >
                        <motion.div
                          whileHover={{
                            scale: 1.08,
                            rotate: 5,
                          }}
                          className="
                                flex h-11 w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-blue-100
                                text-blue-600
                                dark:bg-blue-950/50
                                dark:text-blue-400
                              "
                        >
                          <FaUser />
                        </motion.div>

                        <div className="min-w-0">
                          <p
                            className="
                                font-semibold
                                text-slate-800
                                dark:text-white
                              "
                          >
                            {complaint.userName || "RentEase User"}
                          </p>

                          <p
                            className="
                                truncate
                                text-sm
                                text-slate-500
                                dark:text-slate-400
                              "
                          >
                            {complaint.userEmail || "No email"}
                          </p>
                        </div>
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
                        className={`
                              flex shrink-0
                              items-center gap-2
                              rounded-full
                              px-3 py-1.5
                              text-xs font-semibold
                              ${status.className}
                            `}
                      >
                        {status.icon}

                        {status.label}
                      </motion.span>
                    </div>

                    {/* USER ROLE */}

                    <div
                      className="
                          mt-5
                          flex flex-wrap
                          items-center gap-2
                        "
                    >
                      <span
                        className="
                            rounded-full
                            bg-slate-100
                            px-3 py-1
                            text-xs font-medium
                            text-slate-600
                            dark:bg-slate-800
                            dark:text-slate-300
                          "
                      >
                        {getRoleLabel(complaint.userRole)}
                      </span>

                      {complaint.category && (
                        <span
                          className="
                              rounded-full
                              bg-blue-50
                              px-3 py-1
                              text-xs font-medium
                              text-blue-600
                              dark:bg-blue-950/40
                              dark:text-blue-400
                            "
                        >
                          {complaint.category}
                        </span>
                      )}
                    </div>

                    {/* SUBJECT */}

                    <h3
                      className="
                          mt-5
                          text-lg font-bold
                          text-slate-900
                          dark:text-white
                        "
                    >
                      {complaint.subject}
                    </h3>

                    {/* MESSAGE PREVIEW */}

                    <p
                      className="
                          mt-2
                          line-clamp-3
                          text-sm
                          leading-6
                          text-slate-500
                          dark:text-slate-400
                        "
                    >
                      {complaint.details}
                    </p>

                    {/* FOOTER */}

                    <div
                      className="
                          mt-5
                          flex items-center
                          justify-between
                          border-t
                          border-slate-100
                          pt-4
                          dark:border-slate-800
                        "
                    >
                      <span
                        className="
                            text-xs
                            text-slate-400
                            dark:text-slate-500
                          "
                      >
                        {formatDate(complaint.createdAt)}
                      </span>

                      <motion.span
                        whileHover={{
                          x: 3,
                        }}
                        className="
                              flex items-center
                              gap-2
                              text-sm font-semibold
                              text-blue-600
                              dark:text-blue-400
                            "
                      >
                        <FaReply />
                        View & Reply
                      </motion.span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            DETAIL / REPLY MODAL
        ================================================= */}

        <AnimatePresence>
          {selectedComplaint && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="
                fixed inset-0 z-[100]
                flex items-center justify-center
                bg-black/50
                p-4
                backdrop-blur-sm
                dark:bg-black/70
              "
              onClick={closeComplaint}
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
                  w-full max-w-3xl
                  overflow-y-auto
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  shadow-2xl
                  dark:border-slate-700
                  dark:bg-slate-900
                "
              >
                {/* MODAL HEADER */}

                <div
                  className="
                  sticky top-0 z-10
                  flex items-center
                  justify-between
                  border-b
                  border-slate-200
                  bg-white
                  px-6 py-5
                  dark:border-slate-700
                  dark:bg-slate-900
                "
                >
                  <div>
                    <h2
                      className="
                      text-xl font-bold
                      text-slate-900
                      dark:text-white
                    "
                    >
                      Support Request
                    </h2>

                    <p
                      className="
                      mt-1
                      text-sm
                      text-slate-500
                      dark:text-slate-400
                    "
                    >
                      Review and respond to the user's request.
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    onClick={closeComplaint}
                    whileHover={{
                      scale: 1.1,
                      rotate: 90,
                    }}
                    whileTap={{
                      scale: 0.9,
                    }}
                    className="
                      rounded-lg
                      p-2
                      text-slate-500
                      hover:bg-slate-100
                      hover:text-slate-800
                      dark:text-slate-400
                      dark:hover:bg-slate-800
                      dark:hover:text-white
                    "
                  >
                    <FaTimes />
                  </motion.button>
                </div>

                {/* MODAL CONTENT */}

                <div className="space-y-6 p-6">
                  {/* USER */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.05,
                    }}
                    className="
                      rounded-xl
                      bg-slate-50
                      p-5
                      dark:bg-slate-800
                    "
                  >
                    <div
                      className="
                      flex items-center gap-3
                    "
                    >
                      <div
                        className="
                        flex h-12 w-12
                        items-center
                        justify-center
                        rounded-full
                        bg-blue-100
                        text-blue-600
                        dark:bg-blue-950/50
                        dark:text-blue-400
                      "
                      >
                        <FaUser />
                      </div>

                      <div>
                        <p
                          className="
                          font-semibold
                          text-slate-800
                          dark:text-white
                        "
                        >
                          {selectedComplaint.userName || "RentEase User"}
                        </p>

                        <p
                          className="
                          text-sm
                          text-slate-500
                          dark:text-slate-400
                        "
                        >
                          {selectedComplaint.userEmail || "No email"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                      mt-4
                      flex flex-wrap gap-2
                    "
                    >
                      <span
                        className="
                        rounded-full
                        bg-white
                        px-3 py-1
                        text-xs font-medium
                        text-slate-600
                        dark:bg-slate-700
                        dark:text-slate-300
                      "
                      >
                        {getRoleLabel(selectedComplaint.userRole)}
                      </span>

                      {selectedComplaint.category && (
                        <span
                          className="
                          rounded-full
                          bg-blue-100
                          px-3 py-1
                          text-xs font-medium
                          text-blue-700
                          dark:bg-blue-950/50
                          dark:text-blue-400
                        "
                        >
                          {selectedComplaint.category}
                        </span>
                      )}
                    </div>
                  </motion.div>

                  {/* SUBJECT */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.1,
                    }}
                  >
                    <p
                      className="
                      text-sm font-semibold
                      text-slate-500
                      dark:text-slate-400
                    "
                    >
                      Subject
                    </p>

                    <h3
                      className="
                      mt-1
                      text-2xl font-bold
                      text-slate-900
                      dark:text-white
                    "
                    >
                      {selectedComplaint.subject}
                    </h3>

                    <p
                      className="
                      mt-2
                      text-xs
                      text-slate-400
                      dark:text-slate-500
                    "
                    >
                      Submitted {formatDate(selectedComplaint.createdAt)}
                    </p>
                  </motion.div>

                  {/* ORIGINAL MESSAGE */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.15,
                    }}
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      p-5
                      dark:border-slate-700
                    "
                  >
                    <p
                      className="
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                    >
                      User's Complaint
                    </p>

                    <p
                      className="
                      mt-3
                      whitespace-pre-wrap
                      leading-7
                      text-slate-600
                      dark:text-slate-300
                    "
                    >
                      {selectedComplaint.details}
                    </p>
                  </motion.div>

                  {/* EXISTING REPLY */}

                  <AnimatePresence>
                    {selectedComplaint.adminReply && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          y: -10,
                        }}
                        className="
                          overflow-hidden
                          rounded-xl
                          border
                          border-blue-200
                          bg-blue-50
                          p-5
                          dark:border-blue-900/50
                          dark:bg-blue-950/30
                        "
                      >
                        <div
                          className="
                          flex items-center
                          gap-2
                          text-blue-700
                          dark:text-blue-400
                        "
                        >
                          <FaReply />

                          <p className="font-semibold">Previous Admin Reply</p>
                        </div>

                        <p
                          className="
                          mt-3
                          whitespace-pre-wrap
                          leading-7
                          text-blue-900
                          dark:text-blue-200
                        "
                        >
                          {selectedComplaint.adminReply}
                        </p>

                        {selectedComplaint.repliedAt && (
                          <p
                            className="
                            mt-3
                            text-xs
                            text-blue-600
                            dark:text-blue-400
                          "
                          >
                            Replied {formatDate(selectedComplaint.repliedAt)}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* STATUS */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.2,
                    }}
                  >
                    <label
                      className="
                      mb-2 block
                      font-semibold
                      text-slate-800
                      dark:text-white
                    "
                    >
                      Complaint Status
                    </label>

                    <select
                      value={selectedComplaint.status || "pending"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={processing}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        p-3
                        text-slate-700
                        outline-none
                        transition-colors
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-100
                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-slate-200
                        dark:focus:border-blue-400
                        dark:focus:ring-blue-950/50
                      "
                    >
                      <option value="pending">Pending</option>

                      <option value="in-progress">In Progress</option>

                      <option value="resolved">Resolved</option>

                      <option value="rejected">Rejected</option>
                    </select>
                  </motion.div>

                  {/* REPLY */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.25,
                    }}
                  >
                    <label
                      className="
                      mb-2 block
                      font-semibold
                      text-slate-800
                      dark:text-white
                    "
                    >
                      Reply to User
                    </label>

                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows="6"
                      placeholder="Write your response to the user..."
                      className="
                        w-full
                        resize-none
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        p-4
                        text-slate-700
                        outline-none
                        transition-colors
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-100
                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-slate-200
                        dark:placeholder:text-slate-500
                        dark:focus:border-blue-400
                        dark:focus:ring-blue-950/50
                      "
                    />
                  </motion.div>

                  {/* SEND */}

                  <div
                    className="
                    flex justify-end
                  "
                  >
                    <motion.button
                      type="button"
                      onClick={handleReply}
                      disabled={processing || !reply.trim()}
                      whileHover={{
                        scale: 1.03,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      className="
                        flex items-center
                        gap-2
                        rounded-xl
                        bg-blue-600
                        px-7 py-3
                        font-semibold
                        text-white
                        transition-colors
                        hover:bg-blue-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <FaEnvelope />

                      {processing ? "Sending..." : "Send Reply"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}

export default AdminComplaints;
