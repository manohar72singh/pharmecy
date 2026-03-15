import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import addressService from "../../services/addressService";

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// onSave(savedAddress, allAddresses) — parent ko naya address milega
// onCancel() — form band karo
export default function AddressForm({ onSave, onCancel, showCancel = true }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    full_name: user?.name || "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "Uttar Pradesh",
    pincode: "",
    is_default: false,
  });
  const showToast = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.address_line1 || !form.city || !form.pincode)
      return setError("Full name, address, city aur pincode zaroori hain.");
    if (form.pincode.length !== 6)
      return setError("Pincode 6 digits ka hona chahiye.");

    setSaving(true);
    try {
      const { data } = await addressService.add(form);
      const res = await addressService.getAll();
      const allAddrs = res.data.data || [];
      const saved = allAddrs.find((a) => a.id === data.data?.id) || allAddrs[0];
      showToast("Address save ho gaya! 📍", "success");
      onSave?.(saved, allAddrs);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Address save nahi hua, dobara try karo.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">📍 Naya Address Add Karein</h3>
        {showCancel && onCancel && (
          <button
            onClick={onCancel}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 transition"
          >
            ✕ Cancel
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2 rounded-xl mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={set}
            placeholder="Apna pura naam likhein"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                       focus:outline-none focus:border-emerald-400 focus:bg-white transition"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={set}
            placeholder="9876543210"
            maxLength={10}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                       focus:outline-none focus:border-emerald-400 focus:bg-white transition"
          />
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Pincode *
          </label>
          <input
            type="text"
            name="pincode"
            value={form.pincode}
            onChange={set}
            placeholder="110001"
            maxLength={6}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                       focus:outline-none focus:border-emerald-400 focus:bg-white transition"
          />
        </div>

        {/* Address Line 1 */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Address Line 1 *
          </label>
          <input
            type="text"
            name="address_line1"
            value={form.address_line1}
            onChange={set}
            placeholder="Ghar/flat no., gali, mohalla"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                       focus:outline-none focus:border-emerald-400 focus:bg-white transition"
          />
        </div>

        {/* Address Line 2 */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Address Line 2{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            name="address_line2"
            value={form.address_line2}
            onChange={set}
            placeholder="Area, landmark"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                       focus:outline-none focus:border-emerald-400 focus:bg-white transition"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={set}
            placeholder="Noida"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                       focus:outline-none focus:border-emerald-400 focus:bg-white transition"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            State *
          </label>
          <select
            name="state"
            value={form.state}
            onChange={set}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                       focus:outline-none focus:border-emerald-400 transition"
          >
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Default checkbox */}
        <div className="sm:col-span-2 flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            id="addr_default"
            name="is_default"
            checked={form.is_default}
            onChange={set}
            className="w-4 h-4 accent-emerald-500 cursor-pointer"
          />
          <label
            htmlFor="addr_default"
            className="text-sm text-gray-600 cursor-pointer select-none"
          >
            Is address ko default set karo
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="mt-4 w-full py-3 rounded-xl font-bold text-sm text-white
                   flex items-center justify-center gap-2 transition"
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
            Saving...
          </>
        ) : (
          "💾 Address Save Karo"
        )}
      </button>
    </div>
  );
}
