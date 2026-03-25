import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import notificationService from "../../services/notificationservice";

const TYPE_CONFIG = {
  order: { icon: "📦", color: "text-purple-600", bg: "bg-purple-50" },
  delivery: { icon: "🚴", color: "text-blue-600", bg: "bg-blue-50" },
  prescription: { icon: "📋", color: "text-green-600", bg: "bg-green-50" },
  offer: { icon: "🏷️", color: "text-amber-600", bg: "bg-amber-50" },
  subscription: { icon: "🔄", color: "text-indigo-600", bg: "bg-indigo-50" },
  system: { icon: "🔔", color: "text-gray-600", bg: "bg-gray-100" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationService
      .getAll()
      .then((res) => {
        setNotifications(res.data.data.notifications || []);
        setUnread(res.data.data.unread || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnread(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)),
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-emerald-600">
              Home
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Notifications</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
            {unread > 0 && (
              <p className="text-sm text-emerald-600 font-semibold mt-0.5">
                {unread} unread
              </p>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Mark all as read ✓
            </button>
          )}
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-black text-gray-800 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-400 text-sm">
              Your order updates and alerts will appear here.
            </p>
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkOne(n.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition cursor-pointer ${
                  n.is_read
                    ? "bg-white border-gray-100"
                    : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center text-xl flex-shrink-0`}
                >
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold ${n.is_read ? "text-gray-700" : "text-gray-900"}`}
                  >
                    {n.title}
                  </p>
                  {n.message && (
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  )}
                  {n.created_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>

                {/* Unread dot */}
                {!n.is_read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
