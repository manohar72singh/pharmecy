import { useState, useEffect } from "react";
import Pagination from "../../components/common/Pagination";
import { Link } from "react-router-dom";
import api from "../../services/api";

const StatCard = ({ icon, label, value, sub, color, to }) => (
  <Link
    to={to || "#"}
    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-emerald-200 transition group"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-semibold">{label}</p>
        <p className={`text-3xl font-black mt-1 ${color || "text-gray-900"}`}>
          {value ?? "—"}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className="text-3xl opacity-80">{icon}</div>
    </div>
  </Link>
);

const ORDER_STATUS_COLORS = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-purple-100 text-purple-700",
  processing: "bg-cyan-100 text-cyan-700",
  packed: "bg-orange-100 text-orange-700",
  out_for_delivery: "bg-teal-100 text-teal-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersPage, setOrdersPage] = useState(1);
  const ORDERS_PER_PAGE = 5;

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get("/admin/dashboard/stats"),
          api.get("/admin/dashboard/recent-orders"),
        ]);
        setStats(statsRes.data.data);
        setRecentOrders(ordersRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="📦"
          label="Total Orders"
          value={stats?.total_orders}
          color="text-blue-600"
          to="/admin/orders"
          sub="All time"
        />
        <StatCard
          icon="💰"
          label="Today's Revenue"
          value={`₹${parseFloat(stats?.today_revenue || 0).toFixed(0)}`}
          color="text-emerald-600"
          sub="Today"
        />
        <StatCard
          icon="👥"
          label="Total Users"
          value={stats?.total_users}
          color="text-purple-600"
          to="/admin/users"
          sub="Registered"
        />
        <StatCard
          icon="💊"
          label="Total Medicines"
          value={stats?.total_medicines}
          color="text-amber-600"
          to="/admin/medicines"
          sub="In catalog"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="⏳"
          label="Pending Orders"
          value={stats?.pending_orders}
          color="text-amber-600"
          to="/admin/orders"
          sub="Need attention"
        />
        <StatCard
          icon="📋"
          label="Pending Rx"
          value={stats?.pending_rx}
          color="text-red-500"
          to="/admin/prescriptions"
          sub="Awaiting review"
        />
        <StatCard
          icon="⚠️"
          label="Low Stock"
          value={stats?.low_stock}
          color="text-red-500"
          to="/admin/stock"
          sub="Below threshold"
        />
        <StatCard
          icon="🔁"
          label="Active Subscriptions"
          value={stats?.active_subscriptions}
          color="text-indigo-600"
          to="/admin/subscriptions"
          sub="Auto-refill"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">📦 Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              View All →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Koi order nahi
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {recentOrders
                  .slice(
                    (ordersPage - 1) * ORDERS_PER_PAGE,
                    ordersPage * ORDERS_PER_PAGE,
                  )
                  .map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">
                          #{order.order_number}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.user_name} ·{" "}
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN",
                          )}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${ORDER_STATUS_COLORS[order.order_status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {order.order_status}
                      </span>
                      <p className="text-sm font-black text-emerald-600 flex-shrink-0">
                        ₹{parseFloat(order.total_amount).toFixed(0)}
                      </p>
                    </div>
                  ))}
              </div>
              <div className="px-5 pb-3">
                <Pagination
                  page={ordersPage}
                  total={recentOrders.length}
                  limit={ORDERS_PER_PAGE}
                  onPageChange={setOrdersPage}
                />
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                to: "/admin/orders",
                icon: "📦",
                label: "Manage Orders",
                color: "bg-blue-50 text-blue-700",
              },
              {
                to: "/admin/prescriptions",
                icon: "📋",
                label: "Review Rx",
                color: "bg-amber-50 text-amber-700",
              },
              {
                to: "/admin/medicines",
                icon: "💊",
                label: "Add Medicine",
                color: "bg-emerald-50 text-emerald-700",
              },
              {
                to: "/admin/stock",
                icon: "🏪",
                label: "Update Stock",
                color: "bg-purple-50 text-purple-700",
              },
              {
                to: "/admin/coupons",
                icon: "🏷️",
                label: "Add Coupon",
                color: "bg-pink-50 text-pink-700",
              },
              {
                to: "/admin/delivery",
                icon: "🚴",
                label: "Assign Delivery",
                color: "bg-teal-50 text-teal-700",
              },
              {
                to: "/admin/users",
                icon: "👥",
                label: "Manage Users",
                color: "bg-indigo-50 text-indigo-700",
              },
              {
                to: "/admin/reports",
                icon: "📈",
                label: "View Reports",
                color: "bg-orange-50 text-orange-700",
              },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition hover:shadow-sm ${a.color}`}
              >
                <span>{a.icon}</span> {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">📅 Today's Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Orders Today",
              value: stats?.today_orders,
              icon: "📦",
              color: "text-blue-600",
            },
            {
              label: "Revenue Today",
              value: `₹${parseFloat(stats?.today_revenue || 0).toFixed(0)}`,
              icon: "💰",
              color: "text-emerald-600",
            },
            {
              label: "New Users",
              value: stats?.today_users,
              icon: "👤",
              color: "text-purple-600",
            },
            {
              label: "Delivered",
              value: stats?.today_delivered,
              icon: "✅",
              color: "text-green-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center bg-gray-50 rounded-xl p-4"
            >
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.value ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
