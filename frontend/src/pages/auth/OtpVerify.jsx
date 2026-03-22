import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/authService";

export default function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || "";
  const receivedOtp = location.state?.otp || ""; // OTP from register response

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(30);
  const [verified, setVerified] = useState(false);
  const [showOtp, setShowOtp] = useState(true); //  Toggle to show/hide OTP
  const inputs = useRef([]);

  //  Auto-fill OTP if received from registration
  useEffect(() => {
    if (receivedOtp && receivedOtp.length === 6) {
      setOtp(receivedOtp.split(""));
      setSuccess(` Your OTP is: ${receivedOtp}`);
    }
  }, [receivedOtp]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  // Redirect if no phone
  useEffect(() => {
    if (!phone) navigate("/register");
  }, [phone, navigate]);

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    setError("");
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpStr = otp.join("");
    if (otpStr.length < 6) return setError("Please enter a 6-digit OTP.");
    setLoading(true);
    try {
      const { data } = await authService.verifyOtp({ phone, otp: otpStr });
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      setVerified(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const { data } = await authService.resendOtp({ phone });

      // Get new OTP from response
      const newOtp = data?.data?.otp || "";
      if (newOtp) {
        setOtp(newOtp.split(""));
        setSuccess(` New OTP sent: ${newOtp}`);
      } else {
        setSuccess("OTP resent successfully!");
      }

      setTimer(30);
      setError("");
      inputs.current[0]?.focus();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const filled = otp.filter(Boolean).length;

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
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background:
              "linear-gradient(90deg, transparent, #fbbf24, #f59e0b, #fbbf24, transparent)",
          }}
        />

        <div className="relative z-10 w-full max-w-sm">
          {/* Logo */}
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

          {/* OTP illustration */}
          <div className="flex items-center justify-center mb-8">
            <div
              className="w-32 h-32 rounded-3xl flex items-center justify-center text-7xl shadow-2xl"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              📱
            </div>
          </div>

          <h2 className="text-white font-black text-3xl leading-tight mb-3">
            Almost Done!
            <br />
            <span style={{ color: "#fbbf24" }}>Verify Your Phone</span>
          </h2>
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "#a7f3d0" }}
          >
            An OTP has been sent to{" "}
            <strong className="text-white">+91 {phone}</strong>. Please enter
            the code to complete your verification.
          </p>

          {/* OTP Display Box (Development Mode) */}
          {receivedOtp && showOtp && (
            <div
              className="mb-6 p-4 rounded-2xl border-2 border-dashed"
              style={{
                background: "rgba(251,191,36,0.15)",
                borderColor: "#fbbf24",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#fbbf24" }}
                >
                  🔓 Development Mode
                </span>
                <button
                  onClick={() => setShowOtp(!showOtp)}
                  className="text-xs text-white hover:text-yellow-300 transition"
                >
                  {showOtp ? "Hide" : "Show"}
                </button>
              </div>
              <div className="text-center">
                <p className="text-xs text-white mb-2">Your OTP Code:</p>
                <div
                  className="text-3xl font-black tracking-widest"
                  style={{ color: "#fbbf24" }}
                >
                  {receivedOtp}
                </div>
              </div>
            </div>
          )}

          {/* Steps */}
          <div className="space-y-3">
            {[
              { step: "1", text: "Check your phone for SMS", done: true },
              { step: "2", text: "Enter the 6-digit OTP", done: filled === 6 },
              { step: "3", text: "Verify and secure account", done: verified },
            ].map((s) => (
              <div
                key={s.step}
                className="flex items-center gap-4 rounded-2xl p-4"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 transition-all`}
                  style={{
                    background: s.done
                      ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                      : "rgba(255,255,255,0.15)",
                    color: s.done ? "#064e3b" : "#fff",
                  }}
                >
                  {s.done ? "✓" : s.step}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: s.done ? "#d1fae5" : "#6ee7b7" }}
                >
                  {s.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE — OTP Form ── */}
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

          {/* Success State */}
          {verified ? (
            <div className="text-center py-10">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl"
                style={{
                  background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                  boxShadow: "0 8px 32px rgba(5,150,105,0.2)",
                }}
              >
                ✅
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                Verified! 🎉
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Your account has been successfully created. Redirecting to
                home...
              </p>
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="mb-8">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5"
                  style={{
                    background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                  }}
                >
                  🔐
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-1">
                  OTP Verification
                </h2>
                <p className="text-gray-400 text-sm">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-bold text-gray-700">+91 {phone}</span>
                </p>
              </div>

              {/* OTP Display (Mobile View - Development Mode) */}
              {receivedOtp && (
                <div
                  className="lg:hidden mb-5 p-4 rounded-2xl border-2 border-dashed text-center"
                  style={{
                    background: "rgba(251,191,36,0.05)",
                    borderColor: "#fbbf24",
                  }}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-2">
                    🔓 Dev Mode - Your OTP
                  </span>
                  <div className="text-2xl font-black tracking-widest text-amber-600">
                    {receivedOtp}
                  </div>
                </div>
              )}

              {/* Error / Success */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl mb-5">
                  <span>⚠️</span> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm px-4 py-3 rounded-2xl mb-5">
                  <span>✅</span> {success}
                </div>
              )}

              {/* OTP Boxes */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-4">
                  Enter 6-Digit OTP
                </label>
                <div
                  className="flex gap-3 justify-between"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e.target.value, idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      className="w-12 h-14 text-center text-xl font-black rounded-2xl border-2 transition-all duration-200 focus:outline-none"
                      style={{
                        borderColor: error
                          ? "#ef4444"
                          : digit
                            ? "#059669"
                            : "#e5e7eb",
                        background: digit ? "#f0fdf4" : "#f9fafb",
                        color: "#064e3b",
                        boxShadow: digit
                          ? "0 0 0 3px rgba(5,150,105,0.1)"
                          : "none",
                      }}
                    />
                  ))}
                </div>

                {/* Progress dots */}
                <div className="flex items-center gap-2 mt-4">
                  {otp.map((d, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all duration-200"
                      style={{ background: d ? "#059669" : "#e5e7eb" }}
                    />
                  ))}
                  <span className="text-xs text-gray-400 ml-2">{filled}/6</span>
                </div>
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={loading || filled < 6}
                className="w-full text-white font-black py-4 rounded-2xl transition-all duration-200 text-sm flex items-center justify-center gap-2 mb-5"
                style={{
                  background:
                    filled < 6
                      ? "#d1fae5"
                      : loading
                        ? "#6ee7b7"
                        : "linear-gradient(135deg, #065f46, #059669)",
                  boxShadow:
                    filled === 6 && !loading
                      ? "0 8px 24px rgba(5,150,105,0.35)"
                      : "none",
                  cursor: filled < 6 ? "not-allowed" : "pointer",
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
                    Verifying...
                  </>
                ) : (
                  "Verify OTP ✓"
                )}
              </button>

              {/* Resend */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Didn't receive the OTP?
                </p>
                {timer > 0 ? (
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#059669" }}
                  >
                    Resend available in{" "}
                    <span className="font-black">{timer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-sm font-bold transition"
                    style={{ color: "#059669" }}
                  >
                    {resending ? "Sending..." : "🔄 Resend OTP"}
                  </button>
                )}
              </div>

              {/* Navigation links */}
              <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-2">
                <Link
                  to="/register"
                  className="text-xs text-gray-400 hover:text-emerald-600 transition block"
                >
                  ← Incorrect number? Change it here
                </Link>
                <Link
                  to="/"
                  className="text-xs text-gray-400 hover:text-emerald-600 transition block"
                >
                  ← Back to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
