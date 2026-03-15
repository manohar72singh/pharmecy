import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import couponService from "../../services/couponservice";

const TYPE_CONFIG = {
  percentage: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  flat: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
};

const CATEGORY_OFFERS = [
  {
    icon: "💊",
    label: "Medicines",
    discount: "Up to 20% off",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: "🩺",
    label: "Healthcare",
    discount: "Up to 15% off",
    color: "from-blue-400 to-indigo-500",
  },
  {
    icon: "🧴",
    label: "Personal Care",
    discount: "Up to 25% off",
    color: "from-pink-400 to-rose-500",
  },
  {
    icon: "💪",
    label: "Vitamins",
    discount: "Up to 30% off",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: "👶",
    label: "Baby Care",
    discount: "Up to 10% off",
    color: "from-purple-400 to-violet-500",
  },
  {
    icon: "❤️",
    label: "Heart & BP",
    discount: "Up to 18% off",
    color: "from-red-400 to-rose-500",
  },
];

export default function Offers() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    couponService
      .getAll()
      .then((res) => setCoupons(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
  };

  const getDaysLeft = (until) => {
    const diff = Math.ceil(
      (new Date(until) - new Date()) / (1000 * 60 * 60 * 24),
    );
    if (diff <= 0) return { text: "Expired", color: "text-red-500" };
    if (diff <= 3) return { text: `${diff}d left`, color: "text-red-500" };
    if (diff <= 7) return { text: `${diff}d left`, color: "text-amber-500" };
    return { text: `${diff}d left`, color: "text-gray-400" };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero Banner ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #065f46 0%, #059669 50%, #0d9488 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-6xl"
              style={{
                top: `${Math.random() * 80}%`,
                left: `${i * 13}%`,
                opacity: 0.3,
              }}
            >
              {["💊", "🎁", "✨", "💰", "🛒", "⚡", "🎉", "💊"][i]}
            </div>
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-emerald-200 text-sm font-bold uppercase tracking-widest mb-2">
            🎉 Special Deals
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Aaj ke Best Offers
          </h1>
          <p className="text-emerald-100 text-base mb-6">
            Medicines pe zabardast bachat — coupons copy karo aur checkout pe
            apply karo!
          </p>
          <Link
            to="/medicines"
            className="inline-block bg-white font-black text-emerald-700 px-8 py-3 rounded-2xl text-sm shadow-lg hover:shadow-xl transition"
          >
            Shop Now →
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* ── Flash Sale Banner ── */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
        >
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-pink-200 mb-1">
                ⚡ Flash Sale
              </p>
              <h2 className="text-2xl font-black mb-1">
                Free Delivery on All Orders!
              </h2>
              <p className="text-pink-100 text-sm">
                Code: <strong>MEDIFREE</strong> use karo — aaj sirf!
              </p>
            </div>
            <button
              onClick={() => handleCopy("MEDIFREE")}
              className="flex-shrink-0 bg-white text-purple-700 font-black px-6 py-3 rounded-2xl text-sm hover:bg-pink-50 transition shadow-lg"
            >
              {copied === "MEDIFREE" ? "✅ Copied!" : "📋 Copy Code"}
            </button>
          </div>
        </div>

        {/* ── Coupon Cards ── */}
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-4">
            🏷️ Available Coupons
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                  <div className="h-6 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map((coupon) => {
                const cfg =
                  TYPE_CONFIG[coupon.discount_type] || TYPE_CONFIG.flat;
                const days = getDaysLeft(coupon.valid_until);
                const isCopied = copied === coupon.code;
                return (
                  <div
                    key={coupon.id}
                    className={`bg-white rounded-2xl border-2 ${cfg.border} overflow-hidden
                                hover:shadow-lg transition-all group`}
                  >
                    {/* Top Strip */}
                    <div
                      className={`${cfg.bg} px-5 py-3 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {coupon.discount_type === "percentage" ? "🏷️" : "💰"}
                        </span>
                        <div>
                          <p className={`font-black text-lg ${cfg.color}`}>
                            {coupon.discount_type === "percentage"
                              ? `${coupon.discount_value}% OFF`
                              : `₹${coupon.discount_value} OFF`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-4">
                      <h3 className="font-black text-gray-900 text-base mb-1">
                        {coupon.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                        {coupon.description}
                      </p>

                      {/* Code + Copy */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex-1 border-2 border-dashed ${cfg.border} ${cfg.bg}
                                        px-4 py-2 rounded-xl`}
                        >
                          <p
                            className={`font-black text-base tracking-widest ${cfg.color}`}
                          >
                            {coupon.code}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-1.5
                            ${
                              isCopied
                                ? "bg-green-500 text-white"
                                : `${cfg.bg} ${cfg.color} hover:opacity-80`
                            }`}
                        >
                          {isCopied ? "✅ Copied!" : "📋 Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Category Offers ── */}
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-4">
            📂 Category Wise Offers
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORY_OFFERS.map((cat, i) => (
              <Link
                key={i}
                to="/medicines"
                className={`bg-gradient-to-br ${cat.color} rounded-2xl p-5 text-white
                            hover:scale-105 transition-transform shadow-md`}
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="font-black text-sm">{cat.label}</p>
                <p className="text-xs opacity-90 font-semibold mt-0.5">
                  {cat.discount}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── How to Use ── */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6">
          <h2 className="text-lg font-black text-gray-900 mb-5">
            💡 Coupon Kaise Use Karein?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                icon: "🛒",
                title: "Cart Bharo",
                desc: "Apni medicines cart mein add karo",
              },
              {
                step: "2",
                icon: "📋",
                title: "Code Copy Karo",
                desc: "Upar se coupon code copy karo",
              },
              {
                step: "3",
                icon: "✅",
                title: "Checkout Pe Apply",
                desc: "Checkout mein coupon field mein paste karo",
              },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center
                                justify-center font-black text-sm flex-shrink-0"
                >
                  {s.step}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {s.icon} {s.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
