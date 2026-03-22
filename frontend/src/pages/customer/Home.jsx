import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import medicineService from "../../services/medicineService";
import MedicineCard from "../../components/medicine/MedicineCard";
import CustomerReviews from "../../components/common/CustomerReviews";
import WhyChooseUs from "../../components/common/WhyChooseUs";

// ── Category icons map ────────────────────────────────
const CAT_ICONS = {
  medicines: {
    icon: "💊",
    color:
      "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 hover:shadow-blue-100",
  },
  healthcare: {
    icon: "🩺",
    color:
      "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 border-rose-200 hover:border-rose-300 hover:shadow-rose-100",
  },
  "personal-care": {
    icon: "🧴",
    color:
      "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 border-purple-200 hover:border-purple-300 hover:shadow-purple-100",
  },
  "vitamins-supplements": {
    icon: "💪",
    color:
      "bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 border-orange-200 hover:border-orange-300 hover:shadow-orange-100",
  },
  "baby-care": {
    icon: "👶",
    color:
      "bg-gradient-to-br from-pink-50 to-pink-100 text-pink-700 border-pink-200 hover:border-pink-300 hover:shadow-pink-100",
  },
  "diabetic-care": {
    icon: "🩸",
    color:
      "bg-gradient-to-br from-red-50 to-red-100 text-red-700 border-red-200 hover:border-red-300 hover:shadow-red-100",
  },
  surgical: {
    icon: "🩹",
    color:
      "bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 border-teal-200 hover:border-teal-300 hover:shadow-teal-100",
  },
  ayurvedic: {
    icon: "🌿",
    color:
      "bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-200 hover:border-green-300 hover:shadow-green-100",
  },
};
const DEFAULT_CAT = {
  icon: "🏥",
  color:
    "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300",
};

// ── Skeleton Loader ───────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse shadow-sm">
    <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded w-3/4" />
      <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded w-1/2" />
      <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded w-1/3 mt-2" />
      <div className="h-8 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl mt-2" />
    </div>
  </div>
);

// ── Main Home ─────────────────────────────────────────
export default function Home() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingMed, setLoadingMed] = useState(true);
  const [loadingCat, setLoadingCat] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    medicineService
      .getFeatured()
      .then(({ data }) => setMedicines(data.data || []))
      .catch(console.error)
      .finally(() => setLoadingMed(false));

    medicineService
      .getCategories()
      .then(({ data }) => setCategories(data.data || []))
      .catch(console.error)
      .finally(() => setLoadingCat(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim())
      window.location.href = `/medicines?search=${searchQuery}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* ── HERO ──────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(135deg, #065f46 0%, #047857 40%, #059669 100%)",
        }}
      >
        {/* Animated background blobs */}
        <div
          className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 rounded-full opacity-20 animate-pulse"
          style={{
            background: "radial-gradient(circle, #34d399, transparent)",
            transform: "translate(30%, -30%)",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #6ee7b7, transparent)",
            transform: "translate(-30%, 30%)",
            animation: "pulse 5s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-56 h-56 sm:w-80 sm:h-80 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #10b981, transparent)",
            transform: "translate(-50%, -50%)",
            animation: "pulse 6s ease-in-out infinite",
          }}
        />

        {/* Premium top border */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{
            background:
              "linear-gradient(90deg, transparent, #fbbf24, #f59e0b, #fbbf24, transparent)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 relative">
          <div className="max-w-2xl">
            <span
              className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4 uppercase tracking-wider shadow-lg backdrop-blur-sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.25))",
                color: "#fef3c7",
                border: "1.5px solid rgba(251,191,36,0.4)",
                boxShadow: "0 4px 12px rgba(251,191,36,0.2)",
              }}
            >
              🏆 India's #1 Trusted Pharmacy
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-3 sm:mb-4 tracking-tight">
              Medicines Delivered
              <br />
              <span
                className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 bg-clip-text text-transparent"
                style={{
                  textShadow: "0 2px 20px rgba(251,191,36,0.3)",
                }}
              >
                at Your Doorstep
              </span>
            </h1>
            <p className="text-emerald-50 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed font-medium">
              Genuine medicines, fast delivery, expert care — all in one place.
            </p>
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2 max-w-lg"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicines, brands..."
                  className="w-full pl-4 sm:pl-5 pr-4 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-gray-800 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300/50 shadow-xl transition-all placeholder:text-gray-400 border-2 border-transparent hover:border-amber-200"
                  style={{
                    background: "linear-gradient(to bottom, #ffffff, #fefce8)",
                  }}
                />
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-200/20 to-emerald-200/20 -z-10 blur-xl" />
              </div>
              <button
                type="submit"
                className="font-black px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl transition-all w-full sm:w-auto hover:scale-105 active:scale-95 hover:shadow-2xl border-2 border-amber-400/30"
                style={{
                  background:
                    "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
                  color: "#064e3b",
                  boxShadow:
                    "0 8px 24px rgba(251,191,36,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
                }}
              >
                Search 🔍
              </button>
            </form>
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
              {["Paracetamol", "Vitamin D", "Diabetes", "Blood Pressure"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      (window.location.href = `/medicines?search=${tag}`)
                    }
                    className="text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all font-semibold hover:scale-105 active:scale-95 backdrop-blur-sm border"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "#d1fae5",
                      border: "1.5px solid rgba(255,255,255,0.25)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {tag}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-8 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/20">
            {[
              { val: "10,000+", label: "Medicines" },
              { val: "2 Hours", label: "Express Delivery" },
              { val: "100%", label: "Genuine Products" },
              { val: "4.9 ★", label: "Customer Rating" },
            ].map((s) => (
              <div key={s.label} className="group cursor-default">
                <div
                  className="text-xl sm:text-2xl font-black transition-transform group-hover:scale-110"
                  style={{ color: "#fde68a" }}
                >
                  {s.val}
                </div>
                <div className="text-[11px] sm:text-xs text-emerald-100 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFERS ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              emoji: "🎉",
              title: "FIRST15",
              sub: "15% off on first order",
              color: "from-orange-500 via-orange-600 to-orange-700",
              shadow: "shadow-orange-500/30",
            },
            {
              emoji: "🚚",
              title: "FREEDEL",
              sub: "Free delivery on ₹299+",
              color: "from-emerald-600 via-teal-600 to-emerald-700",
              shadow: "shadow-emerald-500/30",
            },
            {
              emoji: "💊",
              title: "VITA20",
              sub: "20% off on vitamins",
              color: "from-blue-500 via-blue-600 to-blue-700",
              shadow: "shadow-blue-500/30",
            },
          ].map((o) => (
            <div
              key={o.title}
              className={`bg-gradient-to-r ${o.color} text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-xl hover:shadow-2xl ${o.shadow} transition-all cursor-pointer hover:scale-105 active:scale-95 border border-white/20`}
            >
              <span className="text-3xl sm:text-4xl drop-shadow-lg">
                {o.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm sm:text-lg tracking-tight">
                  {o.sub}
                </div>
                <div className="text-[10px] sm:text-xs mt-1.5 bg-white/30 inline-block px-3 py-1 rounded-full font-mono font-black backdrop-blur-sm border border-white/40 shadow-sm">
                  {o.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-medium">
              Find what you need quickly
            </p>
          </div>
          <Link
            to="/medicines"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 whitespace-nowrap transition-all hover:translate-x-1 flex items-center gap-1"
          >
            View All <span className="text-base">→</span>
          </Link>
        </div>
        {loadingCat ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl h-16 sm:h-20 border border-gray-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
            {categories.map((cat) => {
              const meta = CAT_ICONS[cat.slug] || DEFAULT_CAT;
              return (
                <Link
                  key={cat.id}
                  to={`/medicines?category=${cat.slug}`}
                  className={`flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 ${meta.color} hover:shadow-lg transition-all hover:-translate-y-1 text-center group active:scale-95`}
                >
                  <span className="text-xl sm:text-2xl group-hover:scale-125 transition-transform drop-shadow-sm">
                    {meta.icon}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                  <span className="text-[8px] sm:text-[9px] opacity-70 font-semibold">
                    {cat.medicine_count} items
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── PRESCRIPTION BANNER ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <div
          className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 shadow-xl border-2 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)",
            borderColor: "#93c5fd",
          }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-sky-200/30 rounded-full blur-3xl" />

          <div className="flex items-start sm:items-center gap-3 sm:gap-5 w-full sm:w-auto relative z-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-lg border-2 border-blue-300/50">
              📋
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                Have a Prescription?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
                Upload it here and we will prepare your order.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-2.5">
                {[
                  "✓ 100% Genuine",
                  "✓ Expert Verification",
                  "✓ Fast Processing",
                ].map((f) => (
                  <span
                    key={f}
                    className="text-[10px] sm:text-xs text-blue-700 font-bold bg-blue-50/80 px-2 py-0.5 rounded-full border border-blue-200"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Link
            to="/prescription"
            className="flex-shrink-0 w-full sm:w-auto text-center text-white font-black px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-xl transition-all shadow-lg text-sm hover:scale-105 active:scale-95 border-2 border-blue-700/20 relative z-10"
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8, #1e40af)",
              boxShadow:
                "0 8px 20px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            Upload Now →
          </Link>
        </div>
      </section>

      {/* ── FEATURED MEDICINES ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Popular Medicines
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-medium">
              Most ordered by our customers
            </p>
          </div>
          <Link
            to="/medicines"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 whitespace-nowrap transition-all hover:translate-x-1 flex items-center gap-1"
          >
            View All <span className="text-base">→</span>
          </Link>
        </div>
        {loadingMed ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : medicines.length === 0 ? (
          <div className="text-center py-12 sm:py-16 text-gray-400 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-4xl sm:text-5xl mb-3">💊</div>
            <p className="font-bold text-sm sm:text-base text-gray-600">
              No medicines found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {medicines.map((med) => (
              <MedicineCard key={med.id} med={med} />
            ))}
          </div>
        )}
      </section>

      {/* ── SUBSCRIPTION BANNER ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <div
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 shadow-2xl border-2 border-emerald-700/30 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)",
          }}
        >
          <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl" />

          <div className="w-full sm:w-auto relative z-10">
            <span
              className="text-[10px] sm:text-xs font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full uppercase tracking-wider inline-block shadow-lg border backdrop-blur-sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.3), rgba(245,158,11,0.3))",
                color: "#fef3c7",
                borderColor: "rgba(251,191,36,0.5)",
              }}
            >
              🔁 Auto-Refill
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-3 tracking-tight">
              Never Run Out of Medicines
            </h3>
            <p className="text-emerald-50 mt-2 text-xs sm:text-sm max-w-md font-medium leading-relaxed">
              Subscribe to auto-refill and get medicines delivered every month —
              with up to 15% extra discount!
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
              {[
                "Weekly — 5% off",
                "Monthly — 10% off",
                "Quarterly — 15% off",
              ].map((plan) => (
                <div
                  key={plan}
                  className="text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm border border-white/30 shadow-md"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  {plan}
                </div>
              ))}
            </div>
          </div>
          <Link
            to="/subscription"
            className="flex-shrink-0 w-full sm:w-auto text-center font-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl transition-all shadow-xl text-xs sm:text-sm hover:scale-105 active:scale-95 border-2 border-amber-400/40 relative z-10"
            style={{
              background: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
              color: "#064e3b",
              boxShadow:
                "0 10px 25px rgba(251,191,36,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            Subscribe Now →
          </Link>
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS (Component) ─────────────── */}
      <CustomerReviews />

      {/* ── WHY CHOOSE US (Component) ────────────────── */}
      <WhyChooseUs />
    </div>
  );
}
