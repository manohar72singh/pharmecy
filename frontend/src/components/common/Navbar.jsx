import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import cartService from "../../services/cartService";
import wishlistService from "../../services/wishlistService";

export const updateCartCount = () => {
  window.dispatchEvent(new Event("cartUpdated"));
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const refreshCart = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await cartService.getCart();
        setCartCount(res.data?.data?.count || 0);
      } catch {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartCount(cart.reduce((sum, i) => sum + (i.quantity || 1), 0));
      }
    } else {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((sum, i) => sum + (i.quantity || 1), 0));
    }
  };

  const refreshWishlist = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await wishlistService.getAll();
        setWishlistCount(res.data?.data?.length || 0);
      } catch {
        setWishlistCount(0);
      }
    } else {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : null);
    refreshCart();
    refreshWishlist();
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener("cartUpdated", refreshCart);
    return () => window.removeEventListener("cartUpdated", refreshCart);
  }, []);

  useEffect(() => {
    window.addEventListener("wishlistUpdated", refreshWishlist);
    return () => window.removeEventListener("wishlistUpdated", refreshWishlist);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("cartCoupon");
    localStorage.removeItem("wishlistIds");
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
    setProfileOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/medicines?search=${searchQuery}`;
    }
  };

  const role = user?.role || null;

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const AVATAR_COLORS = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-violet-500",
    "bg-orange-500",
    "bg-rose-500",
    "bg-teal-500",
  ];
  const avatarBg = user
    ? AVATAR_COLORS[user.name?.charCodeAt(0) % AVATAR_COLORS.length]
    : "bg-emerald-500";

  // Desktop dropdown items
  const customerMenuItems = [
    { to: "/profile", icon: "👤", label: "My Profile" },
    { to: "/orders", icon: "📦", label: "My Orders" },
    {
      to: "/wishlist",
      icon: "❤️",
      label: `My Wishlist${wishlistCount > 0 ? ` (${wishlistCount})` : ""}`,
    },
    { to: "/wallet", icon: "👛", label: "My Wallet" },
    { to: "/notifications", icon: "🔔", label: "Notifications" },
    { to: "/prescription", icon: "📋", label: "Prescriptions" },
    { to: "/subscription", icon: "🔁", label: "Subscriptions" },
    { to: "/offers", icon: "🏷️", label: "Offers & Coupons" },
    {
      to: "/cart",
      icon: "🛒",
      label: `My Cart${cartCount > 0 ? ` (${cartCount})` : ""}`,
    },
  ];

  // Mobile menu items
  const mobileMenuItems = [
    {
      to: "/cart",
      icon: "🛒",
      label: `My Cart${cartCount > 0 ? ` (${cartCount})` : ""}`,
    },
    { to: "/orders", icon: "📦", label: "My Orders" },
    {
      to: "/wishlist",
      icon: "❤️",
      label: `My Wishlist${wishlistCount > 0 ? ` (${wishlistCount})` : ""}`,
    },
    { to: "/wallet", icon: "👛", label: "My Wallet" },
    { to: "/notifications", icon: "🔔", label: "Notifications" },
    { to: "/prescription", icon: "📋", label: "Prescriptions" },
    { to: "/subscription", icon: "🔁", label: "Subscriptions" },
    { to: "/offers", icon: "🏷️", label: "Offers & Coupons" },
    { to: "/profile", icon: "👤", label: "My Profile" },
  ];

  const CATEGORIES = [
    { icon: "💊", label: "Medicines", slug: "medicines" },
    { icon: "🩺", label: "Healthcare", slug: "healthcare" },
    { icon: "🧴", label: "Personal Care", slug: "personal-care" },
    { icon: "💪", label: "Vitamins", slug: "vitamins-supplements" },
    { icon: "👶", label: "Baby Care", slug: "baby-care" },
    { icon: "🩸", label: "Diabetic Care", slug: "diabetic-care" },
    { icon: "🩹", label: "Surgical", slug: "surgical" },
    { icon: "🌿", label: "Ayurvedic", slug: "ayurvedic" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Top strip */}
      <div
        className="text-white text-[10px] leading-[12px] md:text-xs md:leading-4 py-1.5 text-center"
        style={{ background: "linear-gradient(90deg, #064e3b, #059669)" }}
      >
        🚚 Free delivery on orders above ₹299 &nbsp;|&nbsp; 📞 Helpline:
        9771157571
      </div>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow"
              style={{
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              }}
            >
              <span
                className="font-black text-base"
                style={{ color: "#064e3b" }}
              >
                Rx
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="text-gray-900 font-black text-lg leading-none">
                MediShop
              </div>
              <div
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: "#059669" }}
              >
                Online Pharmacy
              </div>
            </div>
          </Link>

          {/* Search — desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search medicines, brands..."
                className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <button
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: "#059669" }}
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* ── GUEST ── */}
            {!user && (
              <>
                <Link
                  to="/cart"
                  className="relative p-2 rounded-xl hover:bg-gray-100 transition group"
                >
                  <svg
                    className="w-6 h-6 text-gray-600 group-hover:text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-md"
                      style={{
                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      }}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/login"
                  className="hidden sm:block text-sm font-semibold text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white px-4 py-2 rounded-lg shadow-sm transition"
                  style={{ background: "#059669" }}
                >
                  Register
                </Link>
              </>
            )}

            {/* ── CUSTOMER ── */}
            {user && role === "customer" && (
              <>
                {/* Wishlist icon */}
                <Link
                  to="/wishlist"
                  className="hidden sm:flex relative p-2 rounded-xl hover:bg-gray-100 transition"
                  title="My Wishlist"
                >
                  <span className="text-xl">❤️</span>
                  {wishlistCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-md"
                      style={{
                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      }}
                    >
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Notifications icon */}
                <Link
                  to="/notifications"
                  className="hidden sm:flex relative p-2 rounded-xl hover:bg-gray-100 transition"
                  title="Notifications"
                >
                  <span className="text-xl">🔔</span>
                </Link>

                {/* Cart icon */}
                <Link
                  to="/cart"
                  className="relative p-2 rounded-xl hover:bg-gray-100 transition group"
                >
                  <svg
                    className="w-6 h-6 text-gray-600 group-hover:text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-md"
                      style={{
                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      }}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* Avatar + Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div
                      className={`w-9 h-9 rounded-full ${avatarBg} flex items-center justify-center shadow-sm flex-shrink-0`}
                    >
                      <span className="text-white font-black text-sm">
                        {getInitials(user.name)}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-semibold text-gray-800 leading-none">
                        {user.name?.split(" ")[0]}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        My Account
                      </div>
                    </div>
                    <svg
                      className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0`}
                          >
                            <span className="text-white font-black text-sm">
                              {getInitials(user.name)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-none">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {user.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                      {customerMenuItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                        >
                          <span className="text-base">{item.icon}</span>{" "}
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                        >
                          <span className="text-base">🚪</span> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── ADMIN ── */}
            {user &&
              (role === "admin" ||
                role === "super_admin" ||
                role === "pharmacist") && (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div
                      className={`w-9 h-9 rounded-full ${avatarBg} flex items-center justify-center shadow-sm`}
                    >
                      <span className="text-white font-black text-sm">
                        {getInitials(user.name)}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-semibold text-gray-800 leading-none">
                        {user.name?.split(" ")[0]}
                      </div>
                      <div
                        className="text-[10px] font-semibold mt-0.5"
                        style={{ color: "#059669" }}
                      >
                        {role}
                      </div>
                    </div>
                    <svg
                      className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center`}
                          >
                            <span className="text-white font-black text-sm">
                              {getInitials(user.name)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {user.name}
                            </p>
                            <p
                              className="text-xs font-semibold capitalize"
                              style={{ color: "#059669" }}
                            >
                              {role}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                      >
                        <span>📊</span> Dashboard
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                        >
                          <span>🚪</span> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {menuOpen ? (
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
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
              )}
            </button>
          </div>
        </div>

        {/* Category nav */}
        <div className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to={`/medicines?category=${cat.slug}`}
              className="whitespace-nowrap text-xs font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition flex items-center gap-1"
            >
              <span>{cat.icon}</span> {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search medicines..."
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value)
                  window.location.href = `/medicines?search=${e.target.value}`;
              }}
            />
          </div>

          {!user && (
            <div className="flex gap-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl border-2 border-emerald-600 text-emerald-600 font-bold text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl text-white font-bold text-sm"
                style={{ background: "#059669" }}
              >
                Register
              </Link>
            </div>
          )}

          {user && role === "customer" && (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                <div
                  className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white font-black text-sm">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.phone}</p>
                </div>
              </div>
              {mobileMenuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                >
                  <span>{item.icon}</span> {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition mt-1"
              >
                <span>🚪</span> Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
