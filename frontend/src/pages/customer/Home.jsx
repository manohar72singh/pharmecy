import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import medicineService from "../../services/medicineService";
import MedicineCard from "../../components/medicine/MedicineCard";

// ── Category icons map ────────────────────────────────
const CAT_ICONS = {
  medicines: {
    icon: "💊",
    color: "bg-blue-50   text-blue-600   border-blue-100",
  },
  healthcare: {
    icon: "🩺",
    color: "bg-rose-50   text-rose-600   border-rose-100",
  },
  "personal-care": {
    icon: "🧴",
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  "vitamins-supplements": {
    icon: "💪",
    color: "bg-orange-50 text-orange-600 border-orange-100",
  },
  "baby-care": {
    icon: "👶",
    color: "bg-pink-50   text-pink-600   border-pink-100",
  },
  "diabetic-care": {
    icon: "🩸",
    color: "bg-red-50    text-red-600    border-red-100",
  },
  surgical: {
    icon: "🩹",
    color: "bg-teal-50   text-teal-600   border-teal-100",
  },
  ayurvedic: {
    icon: "🌿",
    color: "bg-green-50  text-green-600  border-green-100",
  },
};
const DEFAULT_CAT = {
  icon: "🏥",
  color: "bg-gray-50 text-gray-600 border-gray-100",
};

// ── Skeleton Loader ───────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-36 bg-gray-100" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-4 bg-gray-100 rounded w-1/3 mt-2" />
      <div className="h-8 bg-gray-100 rounded-xl mt-2" />
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
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO ──────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #34d399, transparent)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #6ee7b7, transparent)",
            transform: "translate(-30%, 30%)",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background:
              "linear-gradient(90deg, transparent, #fbbf24, #f59e0b, #fbbf24, transparent)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative">
          <div className="max-w-2xl">
            <span
              className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide"
              style={{
                background: "rgba(251,191,36,0.2)",
                color: "#fbbf24",
                border: "1px solid rgba(251,191,36,0.3)",
              }}
            >
              🏆 India's #1 Trusted Pharmacy
            </span>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
              Medicines Delivered
              <br />
              <span style={{ color: "#fbbf24" }}>at Your Doorstep</span>
            </h1>
            <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
              Genuine medicines, fast delivery, expert care — sab kuch ek jagah.
            </p>
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines, brands..."
                className="flex-1 pl-5 pr-4 py-4 rounded-2xl text-gray-800 text-sm font-medium focus:outline-none shadow-lg"
              />
              <button
                type="submit"
                className="font-bold px-6 py-4 rounded-2xl shadow-lg transition whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  color: "#064e3b",
                }}
              >
                Search 🔍
              </button>
            </form>
            <div className="flex flex-wrap gap-2 mt-4">
              {["Paracetamol", "Vitamin D", "Diabetes", "Blood Pressure"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      (window.location.href = `/medicines?search=${tag}`)
                    }
                    className="text-xs px-3 py-1.5 rounded-full transition"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      color: "#d1fae5",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {tag}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-white/10">
            {[
              { val: "10,000+", label: "Medicines" },
              { val: "2 Hours", label: "Express Delivery" },
              { val: "100%", label: "Genuine Products" },
              { val: "4.9 ★", label: "Customer Rating" },
            ].map((s) => (
              <div key={s.label}>
                <div
                  className="text-2xl font-black"
                  style={{ color: "#fbbf24" }}
                >
                  {s.val}
                </div>
                <div className="text-xs text-emerald-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFERS ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              emoji: "🎉",
              title: "FIRST15",
              sub: "First order 15% off",
              color: "from-orange-500 to-orange-600",
            },
            {
              emoji: "🚚",
              title: "FREEDEL",
              sub: "Free delivery on ₹299+",
              color: "from-emerald-600 to-teal-600",
            },
            {
              emoji: "💊",
              title: "VITA20",
              sub: "20% off on vitamins",
              color: "from-blue-500 to-blue-600",
            },
          ].map((o) => (
            <div
              key={o.title}
              className={`bg-gradient-to-r ${o.color} text-white rounded-2xl p-4 flex items-center gap-4 shadow-md hover:shadow-lg transition cursor-pointer`}
            >
              <span className="text-4xl">{o.emoji}</span>
              <div>
                <div className="font-black text-lg">{o.sub}</div>
                <div className="text-xs mt-1 bg-white/20 inline-block px-2 py-0.5 rounded-full font-mono font-bold">
                  {o.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              Shop by Category
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Find what you need quickly
            </p>
          </div>
          <Link
            to="/medicines"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            View All →
          </Link>
        </div>
        {loadingCat ? (
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 rounded-2xl h-20"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {categories.map((cat) => {
              const meta = CAT_ICONS[cat.slug] || DEFAULT_CAT;
              return (
                <Link
                  key={cat.id}
                  to={`/medicines?category=${cat.slug}`}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${meta.color} hover:shadow-md transition-all hover:-translate-y-1 text-center group`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {meta.icon}
                  </span>
                  <span className="text-[11px] font-semibold leading-tight">
                    {cat.name}
                  </span>
                  <span className="text-[9px] opacity-60">
                    {cat.medicine_count} items
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── PRESCRIPTION BANNER ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div
          className="rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{
            background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
            border: "1px solid #bfdbfe",
          }}
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              📋
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">
                Have a Prescription?
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Upload karein aur hum aapka order prepare karenge.
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                {[
                  "✓ 100% Genuine",
                  "✓ Expert Verification",
                  "✓ Fast Processing",
                ].map((f) => (
                  <span key={f} className="text-xs text-blue-600 font-semibold">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Link
            to="/prescription"
            className="flex-shrink-0 text-white font-bold px-6 py-3 rounded-xl transition shadow-md"
            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
          >
            Upload Now →
          </Link>
        </div>
      </section>

      {/* ── FEATURED MEDICINES ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              Popular Medicines
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Most ordered by our customers
            </p>
          </div>
          <Link
            to="/medicines"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            View All →
          </Link>
        </div>
        {loadingMed ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : medicines.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">💊</div>
            <p className="font-semibold">Koi medicine nahi mili</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {medicines.map((med) => (
              <MedicineCard key={med.id} med={med} />
            ))}
          </div>
        )}
      </section>

      {/* ── SUBSCRIPTION BANNER ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div
          className="rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #064e3b, #059669)" }}
        >
          <div>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide"
              style={{ background: "rgba(251,191,36,0.25)", color: "#fbbf24" }}
            >
              🔁 Auto-Refill
            </span>
            <h3 className="text-2xl font-black mt-3">
              Never Run Out of Medicines
            </h3>
            <p className="text-emerald-100 mt-2 text-sm max-w-md">
              Subscribe to auto-refill aur har mahine medicines paayein — up to
              15% extra discount!
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {[
                "Weekly — 5% off",
                "Monthly — 10% off",
                "Quarterly — 15% off",
              ].map((plan) => (
                <div
                  key={plan}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  {plan}
                </div>
              ))}
            </div>
          </div>
          <Link
            to="/subscription"
            className="flex-shrink-0 font-black px-8 py-4 rounded-2xl transition shadow-lg text-sm"
            style={{
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: "#064e3b",
            }}
          >
            Subscribe Now →
          </Link>
        </div>
      </section>

      {/* ── WHY CHOOSE US ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-8">
          Why Choose MediShop?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              icon: "✅",
              title: "100% Genuine",
              desc: "Verified distributors se direct",
            },
            {
              icon: "🚚",
              title: "Fast Delivery",
              desc: "Same-day delivery within city",
            },
            {
              icon: "💰",
              title: "Best Prices",
              desc: "Up to 25% off on all medicines",
            },
            {
              icon: "🔒",
              title: "Secure & Safe",
              desc: "Fully encrypted & protected",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:shadow-md transition"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                {f.title}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
