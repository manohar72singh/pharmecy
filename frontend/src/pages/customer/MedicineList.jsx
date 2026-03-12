/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import medicineService from "../../services/medicineService";
import MedicineCard from "../../components/medicine/MedicineCard";

// ── Category icons ────────────────────────────────────
const CAT_ICONS = {
  medicines: "💊",
  healthcare: "🩺",
  "personal-care": "🧴",
  "vitamins-supplements": "💪",
  "baby-care": "👶",
  "diabetic-care": "🩸",
  surgical: "🩹",
  ayurvedic: "🌿",
};

// ── Skeleton ──────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-40 bg-gray-100" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-4 bg-gray-100 rounded w-1/3 mt-2" />
      <div className="h-8 bg-gray-100 rounded-xl mt-2" />
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────
export default function MedicineList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalAll, setTotalAll] = useState(0); // ← sirf "All" ka count
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "id";
  const LIMIT = 12;

  // ── Fetch total ALL medicines count (ek baar) ─────
  useEffect(() => {
    medicineService
      .getAll({ page: 1, limit: 1 }) // sirf count chahiye
      .then(({ data }) => setTotalAll(data.pagination?.total || 0))
      .catch(console.error);
  }, []); // ← empty dependency — sirf mount pe

  // ── Fetch filtered medicines ──────────────────────
  const fetchMedicines = useCallback(() => {
    setLoading(true);
    medicineService
      .getAll({ page, limit: LIMIT, search, category, sort })
      .then(({ data }) => {
        setMedicines(data.data || []);
        setTotal(data.pagination?.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, category, sort]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // ── Fetch categories ──────────────────────────────
  useEffect(() => {
    medicineService
      .getCategories()
      .then(({ data }) => setCategories(data.data || []))
      .catch(console.error);
  }, []);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    if (key !== "page") p.delete("page");
    setSearchParams(p);
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ───────────────────────────── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link to="/" className="hover:text-emerald-600">
              Home
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Medicines</span>
            {category && (
              <>
                <span>›</span>
                <span className="text-emerald-600 font-medium capitalize">
                  {category.replace(/-/g, " ")}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-black text-gray-900">
                {category
                  ? `${CAT_ICONS[category] || "🏥"} ${category.replace(/-/g, " ").toUpperCase()}`
                  : "All Medicines"}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {loading ? "Loading..." : `${total} medicines found`}
                {search && (
                  <span className="text-emerald-600 font-medium">
                    {" "}
                    for "{search}"
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
              >
                <option value="id">Latest</option>
                <option value="price">Price: Low to High</option>
                <option value="name">Name: A-Z</option>
              </select>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex items-center gap-2 text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white hover:bg-gray-50 transition"
              >
                <span>🔽</span> Filter
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              defaultValue={search}
              placeholder="Search medicines..."
              onKeyDown={(e) => {
                if (e.key === "Enter") setParam("search", e.target.value);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition"
            />
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition">
              Search
            </button>
            {(search || category) && (
              <button
                onClick={() => {
                  setSearchParams({});
                  setPage(1);
                }}
                className="border border-gray-200 text-gray-500 hover:bg-gray-100 px-3 py-2.5 rounded-xl text-sm transition"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* ── SIDEBAR ─────────────────────────────── */}
          <aside
            className={`
            ${sidebarOpen ? "block" : "hidden"} lg:block
            w-full lg:w-56 flex-shrink-0
            lg:static fixed inset-0 z-40 lg:z-auto
            bg-white lg:bg-transparent
          `}
          >
            <div
              className="lg:hidden fixed inset-0 bg-black/30 z-[-1]"
              onClick={() => setSidebarOpen(false)}
            />

            <div className="bg-white rounded-2xl border border-gray-100 p-4 relative lg:sticky lg:top-20 max-h-screen lg:max-h-[calc(100vh-6rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-900 text-sm">Categories</h3>
                <button
                  className="lg:hidden text-gray-400 hover:text-gray-600"
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </button>
              </div>

              {/* All Medicines — totalAll use karo */}
              <button
                onClick={() => {
                  setParam("category", "");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition mb-1
                  ${!category ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                🏥 All Medicines
                <span
                  className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full
                  ${!category ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  {totalAll}
                </span>
              </button>

              {/* Category wise — cat.medicine_count use karo */}
              {categories.map((cat) => {
                const isActive = category === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setParam("category", cat.slug);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition mb-1
                      ${isActive ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <span>{CAT_ICONS[cat.slug] || "🏥"}</span>
                    <span className="flex-1 text-left">{cat.name}</span>
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded-full
                      ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
                    >
                      {cat.medicine_count}
                    </span>
                  </button>
                );
              })}

              {/* Schedule filter */}
              <div className="border-t border-gray-100 mt-4 pt-4">
                <h3 className="font-black text-gray-900 text-sm mb-3">
                  Schedule Type
                </h3>
                {[
                  {
                    code: "",
                    label: "All",
                    color: "bg-gray-100 text-gray-600",
                  },
                  {
                    code: "OTC",
                    label: "OTC (No Rx)",
                    color: "bg-green-100 text-green-700",
                  },
                  {
                    code: "H",
                    label: "Schedule H",
                    color: "bg-yellow-100 text-yellow-700",
                  },
                  {
                    code: "H1",
                    label: "Schedule H1",
                    color: "bg-red-100 text-red-700",
                  },
                ].map((s) => (
                  <button
                    key={s.code}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition mb-1 text-left ${s.color} hover:opacity-80`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── MEDICINE GRID ───────────────────────── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <Skeleton key={i} />
                ))}
              </div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  Koi medicine nahi mili
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Search ya filter change karein
                </p>
                <button
                  onClick={() => {
                    setSearchParams({});
                    setPage(1);
                  }}
                  className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {medicines.map((med) => (
                    <MedicineCard key={med.id} med={med} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      ← Prev
                    </button>
                    {[...Array(totalPages)].map((_, i) => {
                      const p = i + 1;
                      if (
                        p === 1 ||
                        p === totalPages ||
                        (p >= page - 1 && p <= page + 1)
                      ) {
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-9 h-9 rounded-xl text-sm font-bold transition
                              ${p === page ? "bg-emerald-600 text-white shadow-md" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                          >
                            {p}
                          </button>
                        );
                      }
                      if (p === page - 2 || p === page + 2)
                        return (
                          <span key={p} className="text-gray-400">
                            ...
                          </span>
                        );
                      return null;
                    })}
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next →
                    </button>
                  </div>
                )}

                <p className="text-center text-xs text-gray-400 mt-3">
                  Showing {(page - 1) * LIMIT + 1}–
                  {Math.min(page * LIMIT, total)} of {total} medicines
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
