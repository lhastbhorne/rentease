import { useEffect, useState } from "react";
import {
  FaBell,
  FaCheck,
  FaTrash,
} from "react-icons/fa";

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

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  async function loadNotifications() {
    if (!user?.uid) {
      return;
    }

    try {
      setLoading(true);

      const data =
        await getMyNotifications(
          user.uid
        );

      setNotifications(data);
    } catch (error) {
      console.error(
        "Error loading notifications:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [user?.uid]);

  async function handleRead(notification) {
    try {
      if (!notification.read) {
        await markNotificationAsRead(
          notification.id
        );
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function handleReadAll() {
    try {
      await markAllNotificationsAsRead(
        user.uid
      );

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          read: true,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNotification(id);

      setNotifications((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (error) {
      console.error(error);
    }
  }

  const unreadCount =
    notifications.filter(
      (item) => !item.read
    ).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">

        {/* Header */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Notifications
            </h1>

            <p className="mt-2 text-slate-500">
              Stay updated about your RentEase activities.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleReadAll}
              className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              Mark all as read
            </button>
          )}

        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading notifications...
            </p>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          notifications.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

              <FaBell className="mx-auto text-5xl text-slate-300" />

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                No Notifications
              </h2>

              <p className="mt-2 text-slate-500">
                You don't have any notifications yet.
              </p>

            </div>
          )}

        {/* Notifications */}

        {!loading &&
          notifications.length > 0 && (
            <div className="space-y-4">

              {notifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-2xl border p-5 shadow-sm transition ${
                      notification.read
                        ? "border-slate-100 bg-white"
                        : "border-blue-100 bg-blue-50"
                    }`}
                  >

                    <div className="flex gap-4">

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                          notification.read
                            ? "bg-slate-100 text-slate-500"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        <FaBell />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                          <div>
                            <h3 className="font-bold text-slate-800">
                              {
                                notification.title
                              }
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {
                                notification.message
                              }
                            </p>
                          </div>

                          {!notification.read && (
                            <span className="w-fit rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                              New
                            </span>
                          )}

                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">

                          {!notification.read && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRead(
                                  notification
                                )
                              }
                              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                            >
                              <FaCheck />
                              Mark as read
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                notification.id
                              )
                            }
                            className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:underline"
                          >
                            <FaTrash />
                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

      </div>
    </DashboardLayout>
  );
}

export default Notifications;