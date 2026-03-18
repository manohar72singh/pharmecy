import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import deliveryService from "../../services/deliveryService";
import { useToast } from "../../context/ToastContext";

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, earningsRes, ordersRes] = await Promise.all([
          deliveryService.getProfile(),
          deliveryService.getEarnings(),
          deliveryService.getAssignedOrders(),
        ]);
        setProfile(profileRes.data.data);
        setEarnings(earningsRes.data.data);
        setOrders(ordersRes.data.data?.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const { data } = await deliveryService.toggleAvailability();
      setProfile((prev) => ({ ...prev, is_available: data.data.is_available }));
      showToast(data.message, "success");
    } catch (err) {
      showToast("Update failed.", "error", err);
    } finally {
      setToggling(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Dashboard load ho raha hai...</p>
        </div>
      </div>
    );

  const pendingOrders = orders.filter((o) => !o.otp_verified);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-900">
                👋 Namaste, {user?.name?.split(" ")[0]}!
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {profile?.vehicle_type || "Delivery Boy"} Dashboard
              </p>
            </div>
            {/* Online / Offline Toggle */}
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                profile?.is_available
                  ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-400"
                  : "bg-red-50 text-red-500 border-2 border-red-300"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  profile?.is_available ? "bg-emerald-500" : "bg-red-400"
                } ${toggling ? "" : "animate-pulse"}`}
              />
              {toggling
                ? "..."
                : profile?.is_available
                  ? "Online 🟢"
                  : "Offline 🔴"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Aaj",
              value: earnings?.today || 0,
              icon: "📅",
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Is Hafte",
              value: earnings?.this_week || 0,
              icon: "📆",
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            {
              label: "Is Mahine",
              value: earnings?.this_month || 0,
              icon: "🗓️",
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Total",
              value: earnings?.total || 0,
              icon: "🏆",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 p-4 text-center"
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center text-xl mx-auto mb-2`}
              >
                {stat.icon}
              </div>
              <p className={`text-2xl font-black ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {stat.label} Deliveries
              </p>
            </div>
          ))}
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-900">
              🚴 Pending Orders{" "}
              {pendingOrders.length > 0 && (
                <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                  {pendingOrders.length}
                </span>
              )}
            </h2>
            <Link
              to="/delivery/orders"
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Sab Dekho →
            </Link>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-gray-500 font-semibold">
                Koi pending order nahi hai!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">
                      #{order.order_number}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {order.user_name} • {order.city}, {order.pincode}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-emerald-600 text-sm">
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 uppercase">
                      {order.payment_mode}
                    </p>
                  </div>
                  <Link
                    to={`/delivery/orders/${order.id}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #065f46, #059669)",
                    }}
                  >
                    Deliver →
                  </Link>
                </div>
              ))}
              {pendingOrders.length > 3 && (
                <Link
                  to="/delivery/orders"
                  className="block text-center text-xs font-bold text-emerald-600 hover:underline pt-2"
                >
                  +{pendingOrders.length - 3} aur orders dekho
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/delivery/orders"
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-200 hover:shadow-md transition text-center"
          >
            <div className="text-4xl mb-2">📋</div>
            <p className="font-bold text-gray-900 text-sm">Assigned Orders</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {pendingOrders.length} pending
            </p>
          </Link>
          <Link
            to="/delivery/history"
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-200 hover:shadow-md transition text-center"
          >
            <div className="text-4xl mb-2">📜</div>
            <p className="font-bold text-gray-900 text-sm">History</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {earnings?.total || 0} delivered
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
