import { useState, useEffect } from "react";
import deliveryService from "../../services/deliveryService";
import Pagination from "../../components/common/Pagination";

const PAYMENT_ICONS = { cod: "💵", online: "💳", upi: "📱", wallet: "👛" };

export default function DeliveryHistory() {
  const [history, setHistory] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [h, e] = await Promise.all([
          deliveryService.getHistory(page),
          deliveryService.getEarnings(),
        ]);
        setHistory(h.data.data?.history || []);
        setTotal(h.data.data?.total || 0);
        setEarnings(e.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return (
    <div>
      {/* Header Banner */}
      <div
        className="rounded-3xl p-5 mb-5 shadow-md"
        style={{ background: "linear-gradient(135deg,#064e3b,#065f46)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-black text-xl">
              📜 Delivery History
            </h1>
            <p className="text-emerald-300 text-xs mt-0.5">
              {earnings?.total || 0} total deliveries
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            🏆
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Today", value: earnings?.today || 0 },
            { label: "This Week", value: earnings?.this_week || 0 },
            { label: "This Month", value: earnings?.this_month || 0 },
            { label: "Total", value: earnings?.total || 0 },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center py-2.5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <p className="text-white font-black text-lg leading-none">
                {s.value}
              </p>
              <p className="text-emerald-300 text-[10px] font-semibold mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 text-center py-20 shadow-sm">
          <div className="text-6xl mb-4">📜</div>
          <h3 className="text-lg font-black text-gray-800 mb-2">
            No history yet
          </h3>
          <p className="text-gray-400 text-sm">
            Complete your first delivery to see your history here.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.assignment_id}
                className="bg-white rounded-3xl border border-gray-100 hover:border-green-300 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-2xl flex items-center justify-center text-base"
                      style={{
                        background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
                      }}
                    >
                      ✅
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">
                        #{item.order_number}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(item.delivered_at).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                    🎉 Delivered
                  </span>
                </div>
                <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-base">👤</span>
                      <div>
                        <p className="text-xs text-gray-400">Customer</p>
                        <p className="font-bold text-gray-900 text-sm">
                          {item.user_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">📍</span>
                      <div>
                        <p className="text-xs text-gray-400">Location</p>
                        <p className="font-bold text-gray-900 text-sm">
                          {item.city} — {item.pincode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">
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
                    ₹{parseFloat(item.total_amount).toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Pagination
              page={page}
              total={total}
              limit={LIMIT}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
