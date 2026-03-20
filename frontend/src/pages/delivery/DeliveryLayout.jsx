import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV = [
  { to: "/delivery", icon: "⚡", label: "Dashboard" },
  { to: "/delivery/orders", icon: "📦", label: "Orders" },
  { to: "/delivery/history", icon: "📜", label: "History" },
];

export default function DeliveryLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getInitials = (name = "") => {
    const p = name.trim().split(" ");
    return p.length >= 2
      ? (p[0][0] + p[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f0fdf4" }}
    >
      {/* ── TOP HEADER ── */}
      <header
        className="sticky top-0 z-40 shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          {/* Logo */}
          <Link
            to="/delivery"
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              }}
            >
              <span className="font-black text-sm" style={{ color: "#064e3b" }}>
                Rx
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="font-black text-white text-sm leading-none">
                MediShop
              </p>
              <p
                className="text-[10px] font-semibold"
                style={{ color: "#6ee7b7" }}
              >
                Delivery
              </p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1 ml-2">
            {NAV.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? "bg-white/20 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:block">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  color: "#064e3b",
                }}
              >
                {getInitials(user?.name || "DB")}
              </div>
              <div className="hidden sm:block">
                <p className="text-white text-xs font-bold leading-none">
                  {user?.name?.split(" ")[0]}
                </p>
                <p
                  className="text-[10px] font-semibold"
                  style={{ color: "#6ee7b7" }}
                >
                  Delivery Boy
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition text-base"
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* ── PAGE CONTENT ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 sm:pb-6">
        {children}
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 shadow-2xl">
        <div className="flex">
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex-1 flex flex-col items-center py-3 text-[10px] font-bold transition-all ${
                  active ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                <span className="text-xl mb-0.5">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
