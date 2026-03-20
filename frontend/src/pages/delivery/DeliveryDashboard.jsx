import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import deliveryService from "../../services/deliveryService";

export default function DeliveryDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [profile, setProfile] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [p, e, o] = await Promise.all([
          deliveryService.getProfile(),
          deliveryService.getEarnings(),
          deliveryService.getAssignedOrders(),
        ]);
        setProfile(p.data.data);
        setEarnings(e.data.data);
        setOrders(o.data.data?.orders || []);
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
      setMsg(data.message);
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-emerald-700 font-semibold text-sm">Loading...</p>
        </div>
      </div>
    );

  const pendingOrders = orders.filter((o) => !o.otp_verified);

  return (
    <div className="space-y-0">
      {/* Toast */}
      {msg && (
        <div
          className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl text-white text-sm font-bold shadow-xl"
          style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
        >
          {msg}
        </div>
      )}

      {/* Hero Banner */}
      <div
        className="rounded-3xl p-6 mb-6 relative overflow-hidden shadow-xl"
        style={{
          background:
            "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #059669 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #34d399, transparent)",
            transform: "translate(20%, -20%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #fbbf24, transparent)",
            transform: "translate(-20%, 20%)",
          }}
        />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-emerald-300 text-sm font-semibold mb-1">
              👋 Welcome Back,
            </p>
            <h1 className="text-white font-black text-2xl sm:text-3xl leading-tight">
              {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-emerald-400 text-xs mt-1 font-medium capitalize">
              🛵 {profile?.vehicle_type || "Delivery Executive"}
            </p>
          </div>

          {/* Online Toggle */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg ${
              profile?.is_available
                ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                : "bg-red-400/20 text-red-300 border border-red-400/40"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full animate-pulse ${profile?.is_available ? "bg-emerald-400" : "bg-red-400"}`}
            />
            {toggling ? "..." : profile?.is_available ? "Online" : "Offline"}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          {[
            { label: "Today", value: earnings?.today || 0 },
            { label: "This Week", value: earnings?.this_week || 0 },
            { label: "This Month", value: earnings?.this_month || 0 },
            { label: "Total", value: earnings?.total || 0 },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center rounded-2xl py-3"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <p className="text-white font-black text-xl leading-none">
                {s.value}
              </p>
              <p className="text-emerald-300 text-[10px] font-semibold mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Orders */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-gray-900 text-base">
              🚴 Pending Orders
            </h2>
            {pendingOrders.length > 0 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-red-500 text-white">
                {pendingOrders.length}
              </span>
            )}
          </div>
          <Link
            to="/delivery/orders"
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            View All →
          </Link>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-gray-500 font-bold text-sm">
              No pending orders!
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Take a break — waiting for the next order 😊
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pendingOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{
                    background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
                  }}
                >
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm">
                    #{order.order_number}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {order.user_name} • {order.city}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 mr-2">
                  <p className="font-black text-emerald-600 text-sm">
                    ₹{parseFloat(order.total_amount).toFixed(0)}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">
                    {order.payment_mode}
                  </p>
                </div>
                <Link
                  to={`/delivery/orders/${order.id}`}
                  className="px-3 py-2 rounded-xl text-xs font-black text-white flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#065f46,#059669)",
                  }}
                >
                  Deliver →
                </Link>
              </div>
            ))}
            {pendingOrders.length > 3 && (
              <div className="px-5 py-3 text-center">
                <Link
                  to="/delivery/orders"
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  +{pendingOrders.length - 3} more orders
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/delivery/orders"
          className="rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
        >
          <div className="absolute top-0 right-0 text-6xl opacity-10 leading-none">
            📦
          </div>
          <div className="text-3xl mb-3">📋</div>
          <p className="font-black text-white text-base">Orders</p>
          <p className="text-emerald-300 text-xs mt-0.5 font-semibold">
            {pendingOrders.length} active tasks
          </p>
        </Link>
        <Link
          to="/delivery/history"
          className="rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden bg-white border border-gray-100"
        >
          <div className="absolute top-0 right-0 text-6xl opacity-5 leading-none">
            📜
          </div>
          <div className="text-3xl mb-3">📜</div>
          <p className="font-black text-gray-900 text-base">History</p>
          <p className="text-gray-400 text-xs mt-0.5 font-semibold">
            {earnings?.total || 0} completed
          </p>
        </Link>
      </div>
    </div>
  );
}
