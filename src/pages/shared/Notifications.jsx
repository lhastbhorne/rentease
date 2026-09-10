import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaCheck, FaTrash } from "react-icons/fa";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import { useAuth } from "../../contexts/AuthContext";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../firebase/notificationService";

function Notifications() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getMyNotifications(user.uid);

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

  /* ============================
     MARK ONE AS READ
  ============================ */

  async function handleRead(notification) {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                read: true,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  /* ============================
     MARK ALL AS READ
  ============================ */

  async function handleReadAll() {
    if (!user?.uid) return;

    try {
      await markAllNotificationsAsRead(user.uid);

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          read: true,
        })),
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  /* ============================
     DELETE
  ============================ */

  async function handleDelete(id) {
    try {
      await deleteNotification(id);

      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        {/* ============================
            HEADER
        ============================ */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 transition-colors duration-300 dark:text-white">
              Notifications
            </h1>

            <p className="mt-2 text-slate-500 transition-colors duration-300 dark:text-slate-400">
              Stay updated about your RentEase activities.
            </p>
          </div>

          {unreadCount > 0 && (
            <motion.button
              type="button"
              onClick={handleReadAll}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-fit rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition-all duration-200 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10"
            >
              Mark all as read
            </motion.button>
          )}
        </motion.div>

        {/* ============================
            UNREAD SUMMARY
        ============================ */}

        {!loading && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 dark:border-blue-500/20 dark:bg-blue-500/10"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <FaBell />
            </div>

            <div>
              <p className="font-semibold text-slate-800 dark:text-white">
                {unreadCount === 0
                  ? "You're all caught up"
                  : `${unreadCount} unread ${
                      unreadCount === 1 ? "notification" : "notifications"
                    }`}
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {unreadCount === 0
                  ? "You have no new notifications."
                  : "Review your latest RentEase updates below."}
              </p>
            </div>
          </motion.div>
        )}

        {/* ============================
            LOADING
        ============================ */}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex gap-4">
                  <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />

                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                    <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ============================
            EMPTY STATE
        ============================ */}

        {!loading && notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl text-slate-400 dark:bg-slate-800 dark:text-slate-500"
            >
              <FaBell />
            </motion.div>

            <h2 className="mt-6 text-xl font-bold text-slate-800 dark:text-white">
              No Notifications
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-500 dark:text-slate-400">
              You don't have any notifications yet. We'll let you know when
              something important happens.
            </p>
          </motion.div>
        )}

        {/* ============================
            NOTIFICATIONS
        ============================ */}

        {!loading && notifications.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    x: 40,
                    height: 0,
                    marginBottom: 0,
                  }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.04,
                  }}
                  className={`rounded-2xl border p-5 shadow-sm transition-colors duration-300 ${
                    notification.read
                      ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                      : "border-blue-100 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                        notification.read
                          ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          : "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                      }`}
                    >
                      <FaBell />
                    </motion.div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 transition-colors duration-300 dark:text-white">
                            {notification.title}
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-slate-600 transition-colors duration-300 dark:text-slate-300">
                            {notification.message}
                          </p>
                        </div>

                        {!notification.read && (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-fit shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white"
                          >
                            New
                          </motion.span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap gap-4">
                        {!notification.read && (
                          <motion.button
                            type="button"
                            onClick={() => handleRead(notification)}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <FaCheck />
                            Mark as read
                          </motion.button>
                        )}

                        <motion.button
                          type="button"
                          onClick={() => handleDelete(notification.id)}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-2 text-sm font-semibold text-red-500 transition-colors hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FaTrash />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Notifications;
