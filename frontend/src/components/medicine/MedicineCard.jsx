import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MedicineImage from "../common/MedicineImage";
import cartService, { localCart } from "../../services/cartService";
import wishlistService from "../../services/wishlistService";
import { useToast } from "../../context/Toastcontext";

const ScheduleBadge = ({ code }) => {
  const colors = {
    OTC: "bg-green-100 text-green-700",
    H: "bg-yellow-100 text-yellow-700",
    H1: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors[code] || "bg-gray-100 text-gray-600"}`}
    >
      {code || "OTC"}
    </span>
  );
};

export default function MedicineCard({ med }) {
  const navigate = useNavigate();
  const { showCartToast } = useToast();
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [ripples, setRipples] = useState([]);

  const price = parseFloat(med.selling_price || 0);
  const mrp = parseFloat(med.mrp || 0);
  const discount = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  // Check if medicine is expired OR expiring in current month
  const isExpired = med.expiry_date
    ? (() => {
        const expiryDate = new Date(med.expiry_date);
        const today = new Date();

        // Check if already expired
        if (expiryDate < today) return true;

        // Check if expiring in current month and year
        if (
          expiryDate.getMonth() === today.getMonth() &&
          expiryDate.getFullYear() === today.getFullYear()
        ) {
          return true;
        }

        return false;
      })()
    : false;

  // Medicine is in stock only if quantity > 0 AND not expired
  const inStock = (med.available_quantity || 0) > 0 && !isExpired;

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const cached = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
    const medIdStr = med.id?.toString();
    if (cached.includes(medIdStr)) {
      setWishlisted(true);
    }
  }, [med.id]);

  // ── Add to Cart with Animation ───────────────────────────────────
  const addToCart = async (e) => {
    setCartError(null);

    // Double check for expired medicine
    if (isExpired) {
      setCartError("This medicine has expired");
      setTimeout(() => setCartError(null), 3000);
      return;
    }

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      x,
      y,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    try {
      if (isLoggedIn) {
        if (!med.batch_id) {
          setCartError("Stock unavailable. Please refresh.");
          return;
        }
        await cartService.addToCart({
          medicine_id: med.id,
          batch_id: med.batch_id,
          quantity: 1,
        });
      } else {
        localCart.add(med, 1);
      }
      showCartToast({ name: med.name, price: `₹${price.toFixed(2)}` });
      window.dispatchEvent(new Event("cartUpdated"));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Cart add error:", err);
      setCartError("Failed to add to cart. Please try again.");
      setTimeout(() => setCartError(null), 3000);
    }
  };

  // ── Toggle Wishlist ───────────────────────────────

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");

    // ✅ USER LOGGED IN
    if (token) {
      setWishLoading(true);
      try {
        const { data } = await wishlistService.toggle(med.id);
        const newState = data.data.wishlisted;
        setWishlisted(newState);

        let cached = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
        cached = cached.map((id) => id?.toString()).filter(Boolean);
        const medIdStr = med.id?.toString();

        if (newState) {
          const updated = [...new Set([...cached, medIdStr])];
          localStorage.setItem("wishlistIds", JSON.stringify(updated));
        } else {
          const updated = cached.filter((id) => id !== medIdStr);
          localStorage.setItem("wishlistIds", JSON.stringify(updated));
        }

        window.dispatchEvent(new Event("wishlistUpdated"));
      } catch (err) {
        console.error(err);
      } finally {
        setWishLoading(false);
      }
    }

    // ✅ GUEST USER
    else {
      let wishlist = JSON.parse(localStorage.getItem("wishlistIds") || "[]");

      const medIdStr = med.id?.toString();

      if (wishlist.includes(medIdStr)) {
        wishlist = wishlist.filter((id) => id !== medIdStr);
        setWishlisted(false);
      } else {
        wishlist.push(medIdStr);
        setWishlisted(true);
      }

      localStorage.setItem("wishlistIds", JSON.stringify(wishlist));

      window.dispatchEvent(new Event("wishlistUpdated"));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-200 group overflow-hidden">
      {/* ── Image ── */}
      <Link to={`/medicines/${med.id}`}>
        <div className="relative bg-gradient-to-br from-gray-50 to-emerald-50 h-36 flex items-center justify-center overflow-hidden">
          {med.image_url ? (
            <MedicineImage
              src={med.image_url}
              alt={med.name}
              categorySlug={med.category_slug}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              size="md"
            />
          ) : (
            <MedicineImage
              src={null}
              categorySlug={med.category_slug}
              size="md"
              className="group-hover:scale-110 transition-transform duration-200"
            />
          )}

          {discount > 0 && !isExpired && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discount}% OFF
            </span>
          )}
          <span className="absolute top-2 right-2">
            <ScheduleBadge code={med.schedule_code} />
          </span>
          {!inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* ── Details ── */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <Link to={`/medicines/${med.id}`} className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 hover:text-emerald-600 transition">
              {med.name}
            </h3>
          </Link>
          <button
            onClick={toggleWishlist}
            disabled={wishLoading}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-red-50 transition"
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <span
              className={`text-base transition ${wishLoading ? "opacity-50" : ""}`}
            >
              {wishlisted ? "❤️" : "🤍"}
            </span>
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-0.5">{med.brand}</p>
        <p className="text-xs text-gray-400">{med.pack_size}</p>

        {/* ── Price ── */}
        <div className="flex items-center gap-1.5 mt-2 mb-2 flex-wrap min-w-0">
          <span className="text-base font-black text-gray-900 whitespace-nowrap">
            ₹{price.toFixed(2)}
          </span>
          {mrp > price && (
            <span className="text-xs text-gray-400 line-through whitespace-nowrap">
              ₹{mrp.toFixed(2)}
            </span>
          )}
        </div>

        {med.requires_prescription ? (
          <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mb-2">
            📋 Rx Required
          </p>
        ) : (
          <p className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-lg mb-2">
            📋 Rx Not Required
          </p>
        )}

        {cartError && (
          <p className="text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded-lg mb-2">
            ⚠️ {cartError}
          </p>
        )}

        <button
          disabled={!inStock}
          onClick={addToCart}
          className={`relative overflow-hidden w-full py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
            !inStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : added
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:shadow-md hover:shadow-emerald-200"
          }`}
        >
          {/* Ripple Effect */}
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-white pointer-events-none animate-ripple"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: "20px",
                height: "20px",
                transform: "translate(-50%, -50%)",
                opacity: 0.6,
              }}
            />
          ))}

          {/* Success Particle Effect */}
          {added && (
            <>
              <span className="absolute top-1/2 left-1/4 -translate-y-1/2 text-xs animate-float-up">
                ✨
              </span>
              <span className="absolute top-1/2 right-1/4 -translate-y-1/2 text-xs animate-float-up-delayed">
                ✨
              </span>
            </>
          )}

          <span
            className={`relative z-10 flex items-center justify-center gap-1 ${added ? "animate-bounce-once" : ""}`}
          >
            {added ? (
              <>
                <span className="inline-block animate-check-mark">✓</span>
                <span>Added!</span>
              </>
            ) : (
              "Add to Cart"
            )}
          </span>
        </button>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(15);
            opacity: 0;
          }
        }

        @keyframes float-up {
          0% {
            transform: translate(-50%, -50%) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translateY(-30px);
            opacity: 0;
          }
        }

        @keyframes bounce-once {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes check-mark {
          0% {
            transform: scale(0) rotate(-45deg);
          }
          50% {
            transform: scale(1.2) rotate(0deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }

        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }

        .animate-float-up {
          animation: float-up 1s ease-out forwards;
        }

        .animate-float-up-delayed {
          animation: float-up 1s ease-out 0.1s forwards;
        }

        .animate-bounce-once {
          animation: bounce-once 0.4s ease-out;
        }

        .animate-check-mark {
          animation: check-mark 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
