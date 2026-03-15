import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import subscriptionService from "../../services/subscriptionService";
import cartService from "../../services/cartService";
import addressService from "../../services/addressService";
import MedicineImage from "../../components/common/MedicineImage";

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: "✅",
    bg: "bg-emerald-50",
    color: "text-emerald-600",
    border: "border-emerald-200",
  },
  paused: {
    label: "Paused",
    icon: "⏸️",
    bg: "bg-amber-50",
    color: "text-amber-600",
    border: "border-amber-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: "❌",
    bg: "bg-red-50",
    color: "text-red-500",
    border: "border-red-200",
  },
};

const FREQ_LABELS = {
  weekly: { label: "Har Hafte", days: 7, icon: "📅" },
  biweekly: { label: "Har 2 Hafte", days: 14, icon: "📆" },
  monthly: { label: "Har Mahine", days: 30, icon: "🗓️" },
  quarterly: { label: "Har 3 Mahine", days: 90, icon: "📋" },
};

// ── Confirm Modal ─────────────────────────────────────
const ConfirmModal = ({
  title,
  msg,
  onConfirm,
  onCancel,
  confirmLabel = "Haan",
  danger = false,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.5)" }}
  >
    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
      <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{msg}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition"
        >
          Nahi
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition
            ${danger ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ── Create Subscription Modal ─────────────────────────
const CreateModal = ({ plans, addresses, onClose, onCreated }) => {
  const [step, setStep] = useState(1);
  const [planId, setPlanId] = useState("");
  const [addrId, setAddrId] = useState("");
  const [paymentMode, setPaymentMode] = useState("cod");
  const [cartItems, setCartItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // DB se cart fetch karo
  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem("token");
    const loadCart = async () => {
      try {
        if (isLoggedIn) {
          const { data } = await cartService.getCart();
          const items = data.data.items || [];
          setCartItems(items.map((i) => ({ ...i, selected: true })));
        } else {
          const stored = JSON.parse(localStorage.getItem("cart") || "[]");
          setCartItems(stored.map((i) => ({ ...i, selected: true })));
        }
      } catch {
        const stored = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartItems(stored.map((i) => ({ ...i, selected: true })));
      }
    };
    loadCart();
    if (addresses.length)
      setAddrId(addresses.find((a) => a.is_default)?.id || addresses[0].id);
  }, [addresses]);

  const selectedItems = cartItems.filter((i) => i.selected);
  const selectedPlan = plans.find((p) => p.id === parseInt(planId));

  const handleCreate = async () => {
    if (!planId) return setError("Plan select karo.");
    if (!addrId) return setError("Address select karo.");
    if (!selectedItems.length)
      return setError("Kam se kam ek medicine select karo.");
    setSaving(true);
    try {
      const { data } = await subscriptionService.create({
        plan_id: parseInt(planId),
        address_id: parseInt(addrId),
        payment_mode: paymentMode,
        items: selectedItems.map((i) => ({
          medicine_id: i.medicine_id,
          quantity: i.quantity,
        })),
      });
      onCreated(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Create failed.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
        >
          <h2 className="text-white font-black text-lg">
            🔄 Naya Subscription
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: "70vh" }}>
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl mb-4">
              ⚠️ {error}
            </div>
          )}

          {/* Step 1 — Plan */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black mr-2">
                1
              </span>
              Plan Choose Karo
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setPlanId(plan.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition ${
                    parseInt(planId) === plan.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <p className="font-black text-gray-900 text-sm">
                    {plan.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {FREQ_LABELS[plan.frequency]?.icon}{" "}
                    {FREQ_LABELS[plan.frequency]?.label}
                  </p>
                  {parseFloat(plan.discount_percent) > 0 && (
                    <p className="text-xs font-bold text-emerald-600 mt-1">
                      {plan.discount_percent}% discount 🎉
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Medicines from cart */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black mr-2">
                2
              </span>
              Medicines Select Karo
            </h3>
            {cartItems.length === 0 ? (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
                ⚠️ Cart mein koi medicine nahi hai.{" "}
                <Link
                  to="/medicines"
                  className="font-bold underline"
                  onClick={onClose}
                >
                  Medicines add karo
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      item.selected
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                    onClick={() => {
                      const updated = [...cartItems];
                      updated[idx].selected = !updated[idx].selected;
                      setCartItems(updated);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.selected}
                      readOnly
                      className="w-4 h-4 accent-emerald-500 flex-shrink-0"
                    />
                    <div className="w-10 h-10 rounded-xl bg-white flex-shrink-0 overflow-hidden">
                      <MedicineImage
                        src={item.image_url}
                        alt={item.name}
                        categorySlug={item.category_slug}
                        size="sm"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 3 — Address */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black mr-2">
                3
              </span>
              Delivery Address
            </h3>
            {addresses.length === 0 ? (
              <p className="text-sm text-red-500">
                Pehle address add karo (Profile → Addresses)
              </p>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                      parseInt(addrId) === addr.id
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-gray-100 hover:border-emerald-200"
                    }`}
                    onClick={() => setAddrId(addr.id)}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={parseInt(addrId) === addr.id}
                        readOnly
                        className="w-4 h-4 accent-emerald-500"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {addr.full_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {addr.address_line1}, {addr.city}
                        </p>
                      </div>
                      {addr.is_default === 1 && (
                        <span className="ml-auto text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 4 — Payment */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black mr-2">
                4
              </span>
              Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "cod", icon: "💵", label: "Cash on Delivery" },
                { id: "online", icon: "💳", label: "Online Payment" },
                { id: "upi", icon: "📱", label: "UPI" },
                { id: "wallet", icon: "👛", label: "Wallet" },
              ].map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMode(pm.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition ${
                    paymentMode === pm.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <span className="text-xl">{pm.icon}</span>
                  <span className="text-xs font-bold text-gray-800">
                    {pm.label}
                  </span>
                </button>
              ))}
            </div>
            {paymentMode === "cod" && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-2">
                💵 Pehli delivery pe cash ready rakhein
              </p>
            )}
          </div>

          {/* Summary */}
          {selectedPlan && selectedItems.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                Summary
              </p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-bold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequency</span>
                  <span className="font-bold">
                    {FREQ_LABELS[selectedPlan.frequency]?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medicines</span>
                  <span className="font-bold">
                    {selectedItems.length} items
                  </span>
                </div>
                {parseFloat(selectedPlan.discount_percent) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span>{selectedPlan.discount_percent}% off 🎉</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl font-black text-white text-sm transition flex items-center justify-center gap-2"
            style={{
              background: saving
                ? "#6ee7b7"
                : "linear-gradient(135deg, #065f46, #059669)",
            }}
          >
            {saving ? (
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
                Creating...
              </>
            ) : (
              "✅ Subscription Create Karo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────
export default function Subscription() {
  const [subs, setSubs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [modal, setModal] = useState(null);
  const [acting, setActing] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [expandedId, setExpandedId] = useState(null);

  const loadAll = async () => {
    try {
      const [subsRes, plansRes, addrsRes] = await Promise.all([
        subscriptionService.getAll(),
        subscriptionService.getPlans(),
        addressService.getAll(),
      ]);
      setSubs(subsRes.data.data || []);
      setPlans(plansRes.data.data || []);
      setAddresses(addrsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  const handleToggle = async (id) => {
    setActing(true);
    try {
      const { data } = await subscriptionService.toggle(id);
      setSubs((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: data.data.status } : s)),
      );
      showMsg("success", data.message);
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed.");
    } finally {
      setActing(false);
      setModal(null);
    }
  };

  const handleCancel = async (id) => {
    setActing(true);
    try {
      await subscriptionService.cancel(id);
      setSubs((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "cancelled" } : s)),
      );
      showMsg("success", "Subscription cancel ho gayi.");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed.");
    } finally {
      setActing(false);
      setModal(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Load ho raha hai...</p>
        </div>
      </div>
    );

  const activeSubs = subs.filter((s) => s.status === "active");
  const pausedSubs = subs.filter((s) => s.status === "paused");
  const cancelledSubs = subs.filter((s) => s.status === "cancelled");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      {showCreate && (
        <CreateModal
          plans={plans}
          addresses={addresses}
          onClose={() => setShowCreate(false)}
          onCreated={(orderData) => {
            setShowCreate(false);
            setLoading(true);
            loadAll();
            if (orderData?.payment_mode === "cod") {
              showMsg(
                "success",
                `Subscription create ho gayi! 🎉 Order #${orderData.order_number} placed — delivery pe ₹${orderData.total_amount} cash dena hoga.`,
              );
            } else {
              showMsg(
                "success",
                `Subscription create ho gayi! 🎉 Pehla order #${orderData.order_number} placed — ₹${orderData.total_amount}`,
              );
            }
          }}
        />
      )}
      {modal?.type === "pause" && (
        <ConfirmModal
          title={
            subs.find((s) => s.id === modal.id)?.status === "active"
              ? "Pause Karein?"
              : "Resume Karein?"
          }
          msg={
            subs.find((s) => s.id === modal.id)?.status === "active"
              ? "Delivery temporarily rok jaayegi."
              : "Agle cycle se delivery shuru hogi."
          }
          confirmLabel={
            subs.find((s) => s.id === modal.id)?.status === "active"
              ? "Pause Karo"
              : "Resume Karo"
          }
          onConfirm={() => handleToggle(modal.id)}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "cancel" && (
        <ConfirmModal
          title="Cancel Karein?"
          danger
          msg="Cancel hone ke baad wapas activate nahi hogi. Naya subscription banana padega."
          confirmLabel="Haan, Cancel"
          onConfirm={() => handleCancel(modal.id)}
          onCancel={() => setModal(null)}
        />
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-emerald-600 transition">
              Home
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">My Subscriptions</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast */}
        {msg.text && (
          <div
            className={`mb-5 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold ${
              msg.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              My Subscriptions
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {activeSubs.length} active
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="text-sm font-bold text-white px-4 py-2.5 rounded-xl transition"
            style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
          >
            + Naya Subscribe
          </button>
        </div>

        {/* Plans Banner */}
        {plans.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:border-emerald-200 hover:shadow-sm transition"
              >
                <p className="text-xl mb-1">
                  {FREQ_LABELS[plan.frequency]?.icon || "📅"}
                </p>
                <p className="font-black text-gray-900 text-sm">{plan.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {FREQ_LABELS[plan.frequency]?.label}
                </p>
                {parseFloat(plan.discount_percent) > 0 && (
                  <p className="text-xs font-bold text-emerald-600 mt-1">
                    {plan.discount_percent}% off
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {subs.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center mb-6">
            <div className="text-6xl mb-4">🔄</div>
            <h3 className="text-lg font-black text-gray-800 mb-2">
              Koi subscription nahi hai
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Auto-refill enable karo — medicines khud ghar aayengi!
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-block text-white font-bold px-6 py-3 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #065f46, #059669)",
              }}
            >
              Pehla Subscription Banao →
            </button>
          </div>
        )}

        {/* Subscription Groups */}
        {[
          { label: "✅ Active", list: activeSubs },
          { label: "⏸️ Paused", list: pausedSubs },
          { label: "❌ Cancelled", list: cancelledSubs },
        ].map(
          (group) =>
            group.list.length > 0 && (
              <div key={group.label} className="mb-8">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  {group.label} ({group.list.length})
                </h2>
                <div className="space-y-4">
                  {group.list.map((sub) => {
                    const statusCfg = STATUS_CONFIG[sub.status];
                    const freqCfg =
                      FREQ_LABELS[sub.frequency] || FREQ_LABELS.monthly;
                    const daysLeft = Math.ceil(
                      (new Date(sub.next_delivery_date) - new Date()) /
                        (1000 * 60 * 60 * 24),
                    );
                    const isExpanded = expandedId === sub.id;

                    return (
                      <div
                        key={sub.id}
                        className={`bg-white rounded-2xl border-2 ${statusCfg.border} overflow-hidden transition-all`}
                      >
                        {/* Header Strip */}
                        <div
                          className={`${statusCfg.bg} px-5 py-2.5 flex items-center justify-between`}
                        >
                          <span
                            className={`text-xs font-bold ${statusCfg.color} flex items-center gap-1.5`}
                          >
                            {statusCfg.icon} {statusCfg.label}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 font-semibold">
                              {freqCfg.icon} {sub.plan_name} · {freqCfg.label}
                            </span>
                            {parseFloat(sub.discount_percent) > 0 && (
                              <span className="text-xs font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full">
                                {sub.discount_percent}% off
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-5">
                          {/* Medicines list */}
                          <div className="space-y-3 mb-4">
                            {(sub.items || []).map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3"
                              >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex-shrink-0 overflow-hidden">
                                  <MedicineImage
                                    src={item.image_url}
                                    alt={item.medicine_name}
                                    categorySlug={item.category_slug}
                                    size="sm"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900 text-sm truncate">
                                    {item.medicine_name}
                                  </p>
                                  {item.brand && (
                                    <p className="text-xs text-gray-400">
                                      {item.brand}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-sm font-black text-gray-900">
                                    ×{item.quantity}
                                  </p>
                                  {item.unit_price && (
                                    <p className="text-xs text-emerald-600 font-semibold">
                                      ₹
                                      {(
                                        parseFloat(item.unit_price) *
                                        item.quantity
                                      ).toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Next Delivery */}
                          {sub.status !== "cancelled" && (
                            <div
                              className={`rounded-xl px-4 py-3 flex items-center justify-between mb-4 ${
                                daysLeft <= 2
                                  ? "bg-amber-50 border border-amber-100"
                                  : "bg-gray-50"
                              }`}
                            >
                              <div>
                                <p className="text-xs text-gray-500 font-semibold">
                                  Next Delivery
                                </p>
                                <p
                                  className={`text-sm font-black ${daysLeft <= 2 ? "text-amber-600" : "text-gray-900"}`}
                                >
                                  {new Date(
                                    sub.next_delivery_date,
                                  ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}{" "}
                                  <span className="font-normal text-gray-400 text-xs">
                                    (
                                    {daysLeft > 0
                                      ? `${daysLeft} din mein`
                                      : "Aaj!"}
                                    )
                                  </span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  Deliver to
                                </p>
                                <p className="text-xs font-bold text-gray-700">
                                  {sub.city}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {sub.status !== "cancelled" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  setModal({ type: "pause", id: sub.id })
                                }
                                disabled={acting}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition ${
                                  sub.status === "active"
                                    ? "border-amber-300 text-amber-600 hover:bg-amber-50"
                                    : "border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                                }`}
                              >
                                {sub.status === "active"
                                  ? "⏸️ Pause"
                                  : "▶️ Resume"}
                              </button>
                              <button
                                onClick={() =>
                                  setModal({ type: "cancel", id: sub.id })
                                }
                                disabled={acting}
                                className="flex-1 py-2.5 rounded-xl font-bold text-sm border-2 border-red-200 text-red-500 hover:bg-red-50 transition"
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
        )}
      </div>
    </div>
  );
}
