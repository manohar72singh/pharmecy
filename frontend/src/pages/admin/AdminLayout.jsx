import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const MENU = [
  { to: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/admin/orders", icon: "📦", label: "Orders" },
  { to: "/admin/medicines", icon: "💊", label: "Medicines" },
  { to: "/admin/stock", icon: "🏪", label: "Stock" },
  { to: "/admin/prescriptions", icon: "📋", label: "Prescriptions" },
  { to: "/admin/users", icon: "👥", label: "Users" },
  { to: "/admin/suppliers", icon: "🏭", label: "Suppliers" },
  { to: "/admin/purchase", icon: "🛒", label: "Purchase" },
  { to: "/admin/delivery", icon: "🚴", label: "Delivery" },
  { to: "/admin/coupons", icon: "🏷️", label: "Coupons" },
  { to: "/admin/subscriptions", icon: "🔁", label: "Subscriptions" },
  { to: "/admin/reports", icon: "📈", label: "Reports" },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("cartCoupon");
    localStorage.removeItem("wishlistIds");
    navigate("/login");
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const currentPage = MENU.find((m) => m.to === location.pathname);

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* ── Dark Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 h-screen
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
          >
            <span className="font-black text-base" style={{ color: "#064e3b" }}>
              Rx
            </span>
          </div>
          <div>
            <p className="font-black text-white text-base leading-none">
              MediShop
            </p>
            <p
              className="text-xs font-semibold mt-0.5"
              style={{ color: "#34d399" }}
            >
              Admin Panel
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-white/50 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {MENU.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
                style={
                  active
                    ? {
                        background: "linear-gradient(135deg, #059669, #0d9488)",
                      }
                    : {}
                }
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-xs"
              style={{
                background: "linear-gradient(135deg, #059669, #0d9488)",
              }}
            >
              {getInitials(user?.name || "A")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs capitalize" style={{ color: "#34d399" }}>
                {user?.role}
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white hover:bg-white/10 transition mb-1"
          >
            <span>🏠</span> View Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Right Side ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top Bar ── */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Page Title */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentPage?.icon || "⚙️"}</span>
            <h1 className="text-lg font-black text-gray-900">
              {currentPage?.label || "Admin"}
            </h1>
          </div>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 ml-2">
            <span>Admin</span>
            <span>›</span>
            <span className="text-gray-600 font-semibold">
              {currentPage?.label || "Dashboard"}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Date */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
            <span>📅</span>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-gray-100 transition">
            <span className="text-xl">🔔</span>
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #059669, #0d9488)",
              }}
            >
              {getInitials(user?.name || "A")}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-gray-900 leading-none">
                {user?.name?.split(" ")[0]}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
