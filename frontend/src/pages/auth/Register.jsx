import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password)
      return setError("Please fill in all required fields.");
    if (form.phone.length !== 10)
      return setError("Phone number must be 10 digits.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    setLoading(true);
    try {
      const response = await authService.register({
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
      });

      const otpFromBackend = response?.data?.data?.otp || "";

      console.log("📦 Registration Response:", response.data);
      console.log("🔢 OTP Received:", otpFromBackend);

      navigate("/verify-otp", {
        state: {
          phone: form.phone,
          otp: otpFromBackend,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = "#059669";
    e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.1)";
    e.target.style.background = "#fff";
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = "#e5e7eb";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-3 sm:p-4"
      style={{
        background:
          "linear-gradient(135deg, #064e3b 0%, #065f46 30%, #047857 60%, #059669 100%)",
      }}
    >
      {/* Decorative Elements */}
      <div
        className="absolute top-0 left-0 w-48 sm:w-64 lg:w-96 h-48 sm:h-64 lg:h-96 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #34d399, transparent)",
          transform: "translate(-30%, -30%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-56 sm:w-80 lg:w-[32rem] h-56 sm:h-80 lg:h-[32rem] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #6ee7b7, transparent)",
          transform: "translate(25%, 25%)",
        }}
      />
      <div
        className="absolute top-1/2 right-0 w-40 sm:w-56 lg:w-72 h-40 sm:h-56 lg:h-72 rounded-full opacity-5"
        style={{
          background: "radial-gradient(circle, #a7f3d0, transparent)",
          transform: "translate(40%, -50%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, #fbbf24, #f59e0b, #fbbf24, transparent)",
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-center">
          {/* Left Side - Branding (hidden on mobile) */}
          <div className="hidden lg:block text-center lg:text-left px-4 sm:px-6 lg:px-0">
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-5 lg:mb-6">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  boxShadow: "0 8px 32px rgba(251,191,36,0.4)",
                }}
              >
                <span
                  className="font-black text-xl sm:text-2xl lg:text-3xl"
                  style={{ color: "#064e3b" }}
                >
                  Rx
                </span>
              </div>
              <div>
                <div className="font-black text-xl sm:text-2xl lg:text-3xl text-white tracking-tight">
                  MediShop
                </div>
                <div
                  className="text-xs sm:text-sm font-semibold tracking-widest uppercase"
                  style={{ color: "#6ee7b7" }}
                >
                  Premium Pharmacy
                </div>
              </div>
            </div>

            <h2 className="text-white font-black text-2xl sm:text-3xl lg:text-4xl leading-tight mb-3 lg:mb-4">
              Join 50,000+
              <br />
              <span style={{ color: "#fbbf24" }}>Happy Customers</span>
            </h2>

            <p
              className="text-sm sm:text-base leading-relaxed mb-5 lg:mb-6"
              style={{ color: "#a7f3d0" }}
            >
              Create a free account to get exclusive discounts, fast delivery,
              and 24/7 support.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
              {[
                {
                  icon: "🎁",
                  title: "Welcome Bonus",
                  sub: "15% off first order",
                },
                {
                  icon: "📋",
                  title: "Prescription Safe",
                  sub: "Digital storage",
                },
                {
                  icon: "🔔",
                  title: "Refill Reminders",
                  sub: "Never miss medicine",
                },
                { icon: "💳", title: "Easy Returns", sub: "7-day returns" },
              ].map((b, i) => (
                <div
                  key={i}
                  className="rounded-xl sm:rounded-2xl p-3 sm:p-4"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div className="text-xl sm:text-2xl mb-1">{b.icon}</div>
                  <div className="font-black text-white text-base sm:text-lg leading-none">
                    {b.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#6ee7b7" }}>
                    {b.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-7 lg:p-8 w-full max-w-md mx-auto">
            <div className="mb-3">
              <h2 className="text-2xl font-black text-center text-gray-900 mb-1">
                Create Account
              </h2>
              <p className="text-green-600  text-center text-sm">
                Register for free — it only takes a minute
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-xl mb-3">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="space-y-2.5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    👤
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:bg-white transition"
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Phone Number <span className="text-red-400">*</span>
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
                    className="w-full pl-20 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:bg-white transition"
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  OTP will be sent to this number
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Email{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    ✉️
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:bg-white transition"
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none transition"
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg transition"
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                {form.password && (
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all"
                        style={{
                          background:
                            form.password.length >= i * 2
                              ? form.password.length < 4
                                ? "#ef4444"
                                : form.password.length < 7
                                  ? "#f59e0b"
                                  : "#059669"
                              : "#e5e7eb",
                        }}
                      />
                    ))}
                    <span
                      className="text-[11px] ml-2"
                      style={{
                        color:
                          form.password.length < 4
                            ? "#ef4444"
                            : form.password.length < 7
                              ? "#f59e0b"
                              : "#059669",
                      }}
                    >
                      {form.password.length < 4
                        ? "Weak"
                        : form.password.length < 7
                          ? "Fair"
                          : "Strong"}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConf ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none transition"
                    style={{
                      borderColor:
                        form.confirmPassword &&
                        form.confirmPassword !== form.password
                          ? "#ef4444"
                          : "",
                    }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConf(!showConf)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg transition"
                  >
                    {showConf ? "🙈" : "👁️"}
                  </button>
                  {form.confirmPassword &&
                    form.password === form.confirmPassword && (
                      <span className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500 text-sm">
                        ✓
                      </span>
                    )}
                </div>
              </div>

              {/* Register Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full text-white font-black py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-lg"
                style={{
                  background: loading
                    ? "#6ee7b7"
                    : "linear-gradient(135deg, #065f46, #059669)",
                  boxShadow: loading
                    ? "none"
                    : "0 8px 24px rgba(5,150,105,0.35)",
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
                    Registering...
                  </>
                ) : (
                  "Create Account →"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">
                  Already have an account?
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Login Link */}
              <Link
                to="/login"
                className="w-full flex items-center justify-center font-bold py-3 rounded-xl transition-all duration-200 text-sm border-2"
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
                Login to Existing Account
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
              {["🔒 Secure Login", "✅ Verified Pharmacy", "🏥 Licensed"].map(
                (b) => (
                  <span key={b} className="text-xs text-gray-400 font-medium">
                    {b}
                  </span>
                ),
              )}
            </div>

            <p className="text-center mt-3">
              <Link
                to="/"
                className="text-xs text-gray-400 hover:text-emerald-600 transition"
              >
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
