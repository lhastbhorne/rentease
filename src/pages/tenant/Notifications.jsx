import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaEnvelope,
  FaHome,
  FaTrash,
  FaClipboardList,
} from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../firebase/notificationService";

function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ==========================================
  // LOAD NOTIFICATIONS
  // ==========================================

  async function loadNotifications() {
    if (!user?.uid) return;

    try {
      setLoading(true);

      const data = await getUserNotifications(user.uid);

      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [user?.uid]);

  // ==========================================
  // OPEN NOTIFICATION
  // ==========================================

  async function handleNotificationClick(notification) {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item,
          ),
        );
      }

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error("Error opening notification:", error);
    }
  }

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  async function handleMarkAllRead() {
    if (!user?.uid) return;

    try {
      await markAllNotificationsAsRead(user.uid);

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
    } catch (error) {
      console.error("Error marking notifications:", error);
    }
  }

  // ==========================================
  // DELETE NOTIFICATION
  // ==========================================

  async function handleDelete(notificationId) {
    try {
      setDeletingId(notificationId);

      await deleteNotification(notificationId);

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId),
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    } finally {
      setDeletingId(null);
    }
  }

  // ==========================================
  // GET NOTIFICATION ICON
  // ==========================================

  function getIcon(type) {
    switch (type) {
      case "complaint":
        return <FaClipboardList className="text-blue-600 dark:text-blue-400" />;

      case "approved":
        return <FaCheckCircle className="text-green-600 dark:text-green-400" />;

      case "rejected":
        return <FaTimesCircle className="text-red-600 dark:text-red-400" />;

      case "message":
        return <FaEnvelope className="text-purple-600 dark:text-purple-400" />;

      case "property":
        return <FaHome className="text-blue-600 dark:text-blue-400" />;

      default:
        return <FaBell className="text-slate-500 dark:text-slate-400" />;
    }
  }

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(timestamp) {
    if (!timestamp?.toDate) {
      return "";
    }

    return timestamp.toDate().toLocaleString();
  }

  // ==========================================
  // UNREAD COUNT
  // ==========================================

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-5xl"
      >
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl"
            >
              Notifications
            </motion.h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              Stay updated on your applications, properties and messages.
            </p>
          </div>

          {/* Unread Count + Mark All */}

          {unreadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                {unreadCount} unread
              </span>

              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleMarkAllRead}
                className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10 sm:px-5"
              >
                Mark all as read
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* ================================= */}
        {/* LOADING */}
        {/* ================================= */}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />

            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading notifications...
            </p>
          </motion.div>
        )}

        {/* ================================= */}
        {/* EMPTY */}
        {/* ================================= */}

        {!loading && notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 200,
              }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
            >
              <FaBell className="text-2xl text-slate-400 dark:text-slate-500" />
            </motion.div>

            <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              No Notifications
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              You're all caught up. New updates will appear here.
            </p>
          </motion.div>
        )}

        {/* ================================= */}
        {/* NOTIFICATIONS */}
        {/* ================================= */}

        {!loading && notifications.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: 30,
                    height: 0,
                    marginBottom: 0,
                  }}
                  transition={{ duration: 0.25 }}
                  className={`group flex gap-3 rounded-2xl border p-4 shadow-sm transition-all duration-300 sm:gap-4 sm:p-5 ${
                    notification.read
                      ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                      : "border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/5"
                  }`}
                >
                  {/* ================================= */}
                  {/* ICON */}
                  {/* ================================= */}

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-sm transition-colors sm:h-12 sm:w-12 ${
                      notification.read
                        ? "bg-slate-100 dark:bg-slate-800"
                        : "bg-white dark:bg-slate-900"
                    }`}
                    aria-label="Open notification"
                  >
                    {getIcon(notification.type)}
                  </motion.button>

                  {/* ================================= */}
                  {/* CONTENT */}
                  {/* ================================= */}

                  <button
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className={`text-sm font-semibold sm:text-base ${
                          notification.read
                            ? "text-slate-800 dark:text-slate-200"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {notification.title}
                      </h3>

                      {!notification.read && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400"
                        />
                      )}
                    </div>

                    <p
                      className={`mt-1 text-sm leading-6 ${
                        notification.read
                          ? "text-slate-500 dark:text-slate-400"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 sm:text-sm">
                      {formatDate(notification.createdAt)}
                    </p>
                  </button>

                  {/* ================================= */}
                  {/* DELETE */}
                  {/* ================================= */}

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(notification.id)}
                    disabled={deletingId === notification.id}
                    className="self-start rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    title="Delete notification"
                    aria-label="Delete notification"
                  >
                    {deletingId === notification.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-red-500 dark:border-slate-600 dark:border-t-red-400" />
                    ) : (
                      <FaTrash size={14} />
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

export default Notifications;
