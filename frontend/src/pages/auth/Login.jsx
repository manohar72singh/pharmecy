import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/authService";
import { syncLocalCartToDB } from "../../services/cartService";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.phone || !form.password)
      return setError("Sabhi fields fill karo.");
    setLoading(true);
    try {
      const { data } = await authService.login(form);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      // ✅ FIX: Pehle guest cart ko DB mein sync karo
      await syncLocalCartToDB();

      // ✅ FIX: Sync ke BAAD event fire karo — ab Navbar DB se sahi count lega
      window.dispatchEvent(new Event("cartUpdated"));

      const role = data.data.user.role;
      if (role === "admin" || role === "super_admin" || role === "pharmacist") {
        navigate("/admin/dashboard");
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Phone ya password galat hai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT SIDE ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12"
        style={{
          background:
            "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #059669 100%)",
        }}
      >
        <div
          className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #34d399, transparent)",
            transform: "translate(-40%, -40%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #6ee7b7, transparent)",
            transform: "translate(30%, 30%)",
          }}
        />
        <div
          className="absolute top-1/2 right-0 w-64 h-64 rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, #a7f3d0, transparent)",
            transform: "translate(50%, -50%)",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background:
              "linear-gradient(90deg, transparent, #fbbf24, #f59e0b, #fbbf24, transparent)",
          }}
        />

        <div className="relative z-10 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                boxShadow: "0 8px 32px rgba(251,191,36,0.4)",
              }}
            >
              <span
                className="font-black text-2xl"
                style={{ color: "#064e3b" }}
              >
                Rx
              </span>
            </div>
            <div>
              <div className="font-black text-2xl text-white tracking-tight">
                MediShop
              </div>
              <div
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "#6ee7b7" }}
              >
                Premium Pharmacy
              </div>
            </div>
          </div>

          <h2 className="text-white font-black text-3xl leading-tight mb-3">
            India ki #1
            <br />
            <span style={{ color: "#fbbf24" }}>Online Pharmacy</span>
          </h2>
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "#a7f3d0" }}
          >
            Genuine medicines, expert care, aur fast delivery — sab kuch ek
            jagah.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: "💊", title: "10,000+", sub: "Medicines" },
              { icon: "🚀", title: "2 Hours", sub: "Express Delivery" },
              { icon: "✅", title: "100%", sub: "Genuine Products" },
              { icon: "🏆", title: "4.9 ★", sub: "Customer Rating" },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-4"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="font-black text-white text-lg leading-none">
                  {f.title}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#6ee7b7" }}>
                  {f.sub}
                </div>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(251,191,36,0.25)",
            }}
          >
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-sm" style={{ color: "#fbbf24" }}>
                  ★
                </span>
              ))}
            </div>
            <p
              className="text-sm leading-relaxed italic"
              style={{ color: "#d1fae5" }}
            >
              "Genuine medicines aur 2 ghante mein delivery — MediShop is
              amazing!"
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                style={{
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  color: "#064e3b",
                }}
              >
                RS
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Rahul Sharma</p>
                <p className="text-xs" style={{ color: "#6ee7b7" }}>
                  Delhi, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white relative">
        <div
          className="absolute top-0 left-0 right-0 h-1 lg:hidden"
          style={{
            background: "linear-gradient(90deg, #064e3b, #059669, #fbbf24)",
          }}
        />

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-3 justify-center"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                }}
              >
                <span
                  className="font-black text-xl"
                  style={{ color: "#064e3b" }}
                >
                  Rx
                </span>
              </div>
              <div className="text-left">
                <div className="font-black text-xl text-gray-900">MediShop</div>
                <div
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "#059669" }}
                >
                  Premium Pharmacy
                </div>
              </div>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-1">
              Welcome back! 👋
            </h2>
            <p className="text-gray-400 text-sm">
              Apne account mein login karein
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl mb-6">
              <span>⚠️</span> {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center gap-1.5">
                  <span className="text-base">🇮🇳</span>
                  <span className="text-sm font-bold text-gray-500">+91</span>
                  <div className="w-px h-4 bg-gray-200 ml-1" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full pl-20 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:bg-white transition"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#059669";
                    e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none transition"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#059669";
                    e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.1)";
                    e.target.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg transition"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-black py-4 rounded-2xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-lg"
              style={{
                background: loading
                  ? "#6ee7b7"
                  : "linear-gradient(135deg, #065f46, #059669)",
                boxShadow: loading ? "none" : "0 8px 24px rgba(5,150,105,0.35)",
              }}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login →"
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">
                New to MediShop?
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <Link
              to="/register"
              className="w-full flex items-center justify-center font-bold py-3.5 rounded-2xl transition-all duration-200 text-sm border-2"
              style={{ borderColor: "#059669", color: "#059669" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#059669";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#059669";
              }}
            >
              Create Free Account →
            </Link>
          </form>

          <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100">
            {["🔒 Secure Login", "✅ Verified Pharmacy", "🏥 Licensed"].map(
              (b) => (
                <span key={b} className="text-xs text-gray-400 font-medium">
                  {b}
                </span>
              ),
            )}
          </div>

          <p className="text-center mt-4">
            <Link
              to="/"
              className="text-xs text-gray-400 hover:text-emerald-600 transition"
            >
              ← Wapas Home pe jao
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
