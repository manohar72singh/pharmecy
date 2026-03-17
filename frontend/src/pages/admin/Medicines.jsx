import { useState, useEffect } from "react";
import api from "../../services/api";
import Pagination from "../../components/common/Pagination";
import MedicineImage from "../../components/common/MedicineImage";

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const LIMIT = 10;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/medicines?page=${page}&limit=${LIMIT}&search=${search}`,
      );
      setMedicines(data.data.medicines);
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

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/admin/medicines/${id}/toggle`);
      setMedicines((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, is_active: m.is_active ? 0 : 1 } : m,
        ),
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine, brand..."
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
          />
          <button
            className="px-4 py-2 rounded-xl text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "Medicine",
                  "Category",
                  "Stock",
                  "Price",
                  "Rx",
                  "Status",
                  "Action",
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
                ? [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : medicines.map((med) => (
                    <tr key={med.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 overflow-hidden flex-shrink-0">
                            <MedicineImage
                              src={med.image_url}
                              alt={med.name}
                              size="sm"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {med.name}
                            </p>
                            <p className="text-xs text-gray-400">{med.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {med.category_name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold ${parseInt(med.total_stock) <= 10 ? "text-red-500" : "text-gray-700"}`}
                        >
                          {med.total_stock} units
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">
                        ₹{parseFloat(med.min_price || 0).toFixed(0)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${med.requires_prescription ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}
                        >
                          {med.requires_prescription ? "Rx" : "OTC"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${med.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                        >
                          {med.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(med.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${med.is_active ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                        >
                          {med.is_active ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
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
