import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import deliveryService from "../../services/deliveryService";

const PAYMENT_ICONS = { cod: "💵", online: "💳", upi: "📱", wallet: "👛" };

export default function DeliveryHistory() {
  const [history, setHistory] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [historyRes, earningsRes] = await Promise.all([
          deliveryService.getHistory(page),
          deliveryService.getEarnings(),
        ]);
        setHistory(historyRes.data.data?.history || []);
        setEarnings(earningsRes.data.data);
        setTotalPages(
          Math.ceil(
            (historyRes.data.data?.total || 0) /
              (historyRes.data.data?.limit || 15),
          ),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">History load ho rahi hai...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/delivery" className="hover:text-emerald-600 transition">
              Dashboard
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Delivery History</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            📜 Delivery History
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {earnings?.total || 0} total deliveries
          </p>
        </div>

        {/* Stats */}
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
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Empty */}
        {history.length === 0 && (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">📜</div>
            <h3 className="text-lg font-black text-gray-800 mb-2">
              Koi history nahi hai abhi
            </h3>
            <p className="text-gray-400 text-sm">
              Delivery complete karo — history yahan dikhegi.
            </p>
          </div>
        )}

        {/* History List */}
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.assignment_id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-green-200 transition"
            >
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-black text-gray-900 text-sm">
                      #{item.order_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(item.delivered_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">
                    🎉 Delivered
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👤</span>
                    <div>
                      <p className="text-xs text-gray-400">Customer</p>
                      <p className="font-bold text-gray-900 text-sm">
                        {item.user_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="text-xs text-gray-400">Location</p>
                      <p className="font-bold text-gray-900 text-sm">
                        {item.city} — {item.pincode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {PAYMENT_ICONS[item.payment_mode] || "💳"}
                    </span>
                    <div>
                      <p className="text-xs text-gray-400">Payment</p>
                      <p className="font-bold text-gray-900 text-sm uppercase">
                        {item.payment_mode}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="font-black text-xl text-emerald-600">
                  ₹{parseFloat(item.total_amount).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 transition"
            >
              ← Pehle
            </button>
            <span className="text-sm font-bold text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 transition"
            >
              Aage →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
