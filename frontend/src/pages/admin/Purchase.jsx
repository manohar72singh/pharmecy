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
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {total === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🛒</div>
            <p className="text-gray-500 font-semibold">
              Koi purchase order nahi hai
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Purchase orders suppliers se aate hain
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {[
                    "PO #",
                    "Supplier",
                    "Created By",
                    "Total",
                    "Status",
                    "Date",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase"
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
                        <td colSpan={6} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  : orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-gray-900">
                          PO-{o.id}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {o.supplier_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {o.created_by_name || "—"}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-600">
                          ₹{parseFloat(o.total_amount || 0).toFixed(0)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                            {o.status || "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {o.created_at
                            ? new Date(o.created_at).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 pb-4">
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
