import { useEffect, useState } from "react";
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

  async function handleNotificationClick(notification) {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, read: true }
              : item,
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

  async function handleDelete(notificationId) {
    try {
      await deleteNotification(notificationId);

      setNotifications((prev) =>
        prev.filter(
          (notification) => notification.id !== notificationId,
        ),
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }

  function getIcon(type) {
    switch (type) {
      case "complaint":
  return (
    <FaClipboardList className="text-blue-600" />
  );
      case "approved":
        return <FaCheckCircle className="text-green-600" />;

      case "rejected":
        return <FaTimesCircle className="text-red-600" />;

      case "message":
        return <FaEnvelope className="text-purple-600" />;

      case "property":
        return <FaHome className="text-blue-600" />;

      default:
        return <FaBell className="text-slate-500" />;
    }
  }

  function formatDate(timestamp) {
    if (!timestamp?.toDate) {
      return "";
    }

    return timestamp.toDate().toLocaleString();
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Notifications
            </h1>

            <p className="mt-2 text-slate-500">
              Stay updated on your applications, properties and messages.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="rounded-lg border border-blue-600 px-5 py-2 font-semibold text-blue-600 hover:bg-blue-50"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-slate-500">
              Loading notifications...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && notifications.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <FaBell className="text-2xl text-slate-400" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-800">
              No Notifications
            </h2>

            <p className="mt-2 text-slate-500">
              You're all caught up. New updates will appear here.
            </p>
          </div>
        )}

        {/* Notifications */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex gap-4 rounded-2xl border p-5 shadow-sm transition ${
                  notification.read
                    ? "border-slate-200 bg-white"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                {/* Icon */}
                <button
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
                >
                  {getIcon(notification.type)}
                </button>

                {/* Content */}
                <button
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-800">
                      {notification.title}
                    </h3>

                    {!notification.read && (
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                    )}
                  </div>

                  <p className="mt-1 text-slate-600">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    {formatDate(notification.createdAt)}
                  </p>
                </button>

                {/* Delete */}
                <button
                  onClick={() =>
                    handleDelete(notification.id)
                  }
                  className="self-start rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  title="Delete notification"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Notifications;