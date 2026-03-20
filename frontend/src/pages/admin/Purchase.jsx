import { useState, useEffect } from "react";
import api from "../../services/api";
import Pagination from "../../components/common/Pagination";

export default function AdminPurchase() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/purchase?page=${page}&limit=${LIMIT}`,
      );
      setOrders(data.data.orders);
      setTotal(data.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {total === 0 && !loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-black text-gray-800 mb-2">
              No purchase orders found
            </h3>
            <p className="text-gray-400 text-sm">
              Purchase orders from suppliers will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {[
                    "PO Number",
                    "Supplier Name",
                    "Issued By",
                    "Total Amount",
                    "Status",
                    "Creation Date",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? [...Array(6)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  : orders.map((o) => (
                      <tr
                        key={o.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-gray-900">
                          PO-{o.id}
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-medium">
                          {o.supplier_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {o.created_by_name || "—"}
                        </td>
                        <td className="px-4 py-3 font-black text-emerald-600">
                          ₹{parseFloat(o.total_amount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            {o.status || "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {o.created_at
                            ? new Date(o.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-4 border-t border-gray-50 bg-gray-50/30">
          <Pagination
            page={page}
            total={total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
