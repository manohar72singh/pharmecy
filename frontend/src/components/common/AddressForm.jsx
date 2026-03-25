import { useState } from "react";
import { useToast } from "../../context/Toastcontext";
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

export default function AddressForm({ onSave, onCancel, showCancel = true }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { showToast } = useToast();
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
      return setError("Full name, address, city, and pincode are required.");
    if (form.pincode.length !== 6)
      return setError("Pincode must be exactly 6 digits.");

    setSaving(true);
    try {
      const addRes = await addressService.add(form);
      const newId = addRes.data?.data?.id || addRes.data?.id;

      const res = await addressService.getAll();
      const allAddrs = res.data?.data || res.data || [];
      const saved = allAddrs.find((a) => a.id === newId) || allAddrs[0];

      showToast("Address saved successfully! 📍", "success");
      onSave?.(saved, allAddrs);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save address. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">📍 Add New Address</h3>
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
            placeholder="Enter your full name"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                       focus:outline-none focus:border-emerald-400 focus:bg-white transition"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Phone Number
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
            placeholder="House/Flat no., Street, Locality"
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
            placeholder="Area, Landmark"
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
            placeholder="e.g. Noida"
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
              <option key={s} value={s}>
                {s}
              </option>
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
            Set as default address
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
          "💾 Save Address"
        )}
      </button>
    </div>
  );
}
