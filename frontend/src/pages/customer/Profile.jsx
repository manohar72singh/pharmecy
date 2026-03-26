import { useState, useEffect, useRef } from "react";
import { useToast } from "../../context/Toastcontext";
import { Link, useNavigate } from "react-router-dom";
import userService from "../../services/userServices";
import addressService from "../../services/addressService";
import AddressForm from "../../components/common/AddressForm";

const TABS = [
  { key: "info", label: "Personal Info", icon: "👤" },
  { key: "addresses", label: "My Addresses", icon: "📍" },
  { key: "password", label: "Change Password", icon: "🔒" },
];

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

export default function Profile() {
  const navigate = useNavigate();
  const photoRef = useRef();
  const { showToast } = useToast();

  const [tab, setTab] = useState("info");
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [showNewAddr, setShowNewAddr] = useState(false);

  const [infoForm, setInfoForm] = useState({
    name: "",
    email: "",
    date_of_birth: "",
    gender: "",
  });
  const [passForm, setPassForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPass, setShowPass] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await userService.getProfile();
        const p = data.data;
        setProfile(p);
        setInfoForm({
          name: p.name || "",
          email: p.email || "",
          date_of_birth: p.date_of_birth ? p.date_of_birth.slice(0, 10) : "",
          gender: p.gender
            ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1).toLowerCase()
            : "",
        });
        const addrRes = await addressService.getAll();
        setAddresses(addrRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const showMsg = (type, text) => showToast(text, type);

  const handleInfoSave = async () => {
    if (!infoForm.name) return showMsg("error", "Name is required.");
    setSaving(true);
    try {
      const { data } = await userService.updateProfile(infoForm);
      setProfile({ ...profile, ...data.data });
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, name: infoForm.name }),
      );
      showMsg("success", "Profile updated successfully! ✅");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      return showMsg("error", "Image size must be less than 2MB.");
    const formData = new FormData();
    formData.append("photo", file);
    setPhotoLoading(true);
    try {
      const { data } = await userService.uploadPhoto(formData);
      setProfile({ ...profile, profile_image: data.data.profile_image });
      showMsg("success", "Photo uploaded successfully! ✅");
    } catch (err) {
      showMsg("error", "Photo upload failed.", err);
    } finally {
      setPhotoLoading(false);
    }
  };

  const handlePassChange = async () => {
    const { old_password, new_password, confirm_password } = passForm;
    if (!old_password || !new_password || !confirm_password)
      return showMsg("error", "Please fill in all fields.");
    if (new_password.length < 6)
      return showMsg("error", "New password must be at least 6 characters.");
    if (new_password !== confirm_password)
      return showMsg(
        "error",
        "New password and confirm password do not match.",
      );
    setSaving(true);
    try {
      await userService.changePassword({ old_password, new_password });
      setPassForm({ old_password: "", new_password: "", confirm_password: "" });
      showMsg("success", "Password changed successfully! ✅");
    } catch (err) {
      showMsg(
        "error",
        err.response?.data?.message || "Password change failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddr = async (id) => {
    try {
      await addressService.remove(id);
      setAddresses(addresses.filter((a) => a.id !== id));
      showMsg("success", "Address deleted successfully.");
    } catch (err) {
      showMsg("error", "Delete failed.", err);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefault(id);
      setAddresses(
        addresses.map((a) => ({ ...a, is_default: a.id === id ? 1 : 0 })),
      );
    } catch (err) {
      showMsg("error", "Failed to set default address.", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your profile...</p>
        </div>
      </div>
    );

  const avatarText = profile?.name?.charAt(0)?.toUpperCase() || "U";
  const photoUrl = profile?.profile_image
    ? `${import.meta.env.VITE_API_URL}/uploads/profiles/${profile.profile_image}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-emerald-600 transition">
              Home
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">My Profile</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 text-center">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #065f46, #059669)",
                    }}
                  >
                    {avatarText}
                  </div>
                )}
                <button
                  onClick={() => photoRef.current?.click()}
                  disabled={photoLoading}
                  className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-emerald-400 flex items-center justify-center text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition"
                >
                  {photoLoading ? "⏳" : "📷"}
                </button>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <h2 className="font-black text-gray-900 text-base sm:text-lg">
                {profile?.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                {profile?.phone}
              </p>
              {profile?.email && (
                <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                  {profile?.email}
                </p>
              )}

              <div className="mt-2 sm:mt-3 inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-600">
                ✅ Verified
              </div>

              <p className="text-[10px] sm:text-xs text-gray-400 mt-2 sm:mt-3">
                Member since{" "}
                {new Date(profile?.created_at).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Tabs - Mobile Horizontal Scroll */}
            <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                    tab === t.key
                      ? "text-white shadow-lg"
                      : "bg-white text-gray-600 border border-gray-100"
                  }`}
                  style={
                    tab === t.key
                      ? {
                          background:
                            "linear-gradient(135deg, #065f46, #059669)",
                        }
                      : {}
                  }
                >
                  <span className="text-sm">{t.icon}</span>
                  <span className="whitespace-nowrap">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Tabs - Desktop Vertical */}
            <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {TABS.map((t, idx) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold transition text-left ${
                    tab === t.key
                      ? "text-emerald-700 bg-emerald-50 border-r-4 border-emerald-500"
                      : "text-gray-600 hover:bg-gray-50"
                  } ${idx < TABS.length - 1 ? "border-b border-gray-50" : ""}`}
                >
                  <span className="text-base flex-shrink-0">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden">
              <Link
                to="/orders"
                className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition border-b border-gray-50"
              >
                <span className="flex-shrink-0">📦</span> <span>My Orders</span>
              </Link>
              <Link
                to="/cart"
                className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition border-b border-gray-50"
              >
                <span className="flex-shrink-0">🛒</span> <span>My Cart</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-red-500 hover:bg-red-50 transition text-left"
              >
                <span className="flex-shrink-0">🚪</span> <span>Logout</span>
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-3">
            {tab === "info" && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-black text-gray-900 mb-4 sm:mb-6">
                  👤 Personal Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={infoForm.name}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, name: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:border-emerald-400 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={profile?.phone || ""}
                        readOnly
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-100 bg-gray-100 text-xs sm:text-sm text-gray-500 cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-gray-400 bg-gray-200 px-1.5 sm:px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                      Cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={infoForm.email}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, email: e.target.value })
                      }
                      placeholder="email@example.com"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={infoForm.date_of_birth}
                      onChange={(e) =>
                        setInfoForm({
                          ...infoForm,
                          date_of_birth: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={infoForm.gender}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, gender: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 transition"
                    >
                      <option value="">Select gender</option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleInfoSave}
                  disabled={saving}
                  className="mt-4 sm:mt-6 w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
                  style={{
                    background: saving
                      ? "#6ee7b7"
                      : "linear-gradient(135deg, #065f46, #059669)",
                  }}
                >
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
              </div>
            )}

            {tab === "addresses" && (
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-black text-gray-900">
                      📍 Saved Addresses
                    </h2>
                    {!showNewAddr && (
                      <button
                        onClick={() => setShowNewAddr(true)}
                        className="text-xs font-bold text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition whitespace-nowrap"
                        style={{
                          background:
                            "linear-gradient(135deg, #065f46, #059669)",
                        }}
                      >
                        + Add
                      </button>
                    )}
                  </div>

                  {addresses.length === 0 && !showNewAddr ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="text-4xl sm:text-5xl mb-3">📍</div>
                      <p className="text-gray-500 font-semibold mb-2 text-sm">
                        No addresses found
                      </p>
                      <button
                        onClick={() => setShowNewAddr(true)}
                        className="text-xs sm:text-sm font-bold text-emerald-600 hover:underline"
                      >
                        + Add your first address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 sm:space-y-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 transition ${
                            addr.is_default
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-gray-100 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 sm:gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                                  {addr.full_name}
                                </p>
                                {addr.is_default === 1 && (
                                  <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                                {addr.phone}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {addr.address_line1}
                                {addr.address_line2
                                  ? `, ${addr.address_line2}`
                                  : ""}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {addr.city}, {addr.state} — {addr.pincode}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1.5 sm:gap-2 flex-shrink-0">
                              {addr.is_default !== 1 && (
                                <button
                                  onClick={() => handleSetDefault(addr.id)}
                                  className="text-[10px] sm:text-xs font-bold text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap"
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAddr(addr.id)}
                                className="text-[10px] sm:text-xs font-bold text-red-400 hover:text-red-600 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {showNewAddr && (
                  <AddressForm
                    onSave={(saved, allAddrs) => {
                      setAddresses(allAddrs);
                      setShowNewAddr(false);
                    }}
                    onCancel={() => setShowNewAddr(false)}
                    showCancel={true}
                  />
                )}
              </div>
            )}

            {tab === "password" && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-black text-gray-900 mb-4 sm:mb-6">
                  🔒 Change Password
                </h2>
                <div className="max-w-md space-y-3 sm:space-y-4">
                  {[
                    {
                      key: "old_password",
                      label: "Current Password",
                      passKey: "old",
                    },
                    {
                      key: "new_password",
                      label: "New Password",
                      passKey: "new",
                    },
                    {
                      key: "confirm_password",
                      label: "Confirm Password",
                      passKey: "confirm",
                    },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">
                        {f.label}
                      </label>
                      <div className="relative">
                        <input
                          type={showPass[f.passKey] ? "text" : "password"}
                          value={passForm[f.key]}
                          onChange={(e) =>
                            setPassForm({
                              ...passForm,
                              [f.key]: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-11 sm:pr-12 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPass({
                              ...showPass,
                              [f.passKey]: !showPass[f.passKey],
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base sm:text-lg transition"
                        >
                          {showPass[f.passKey] ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {f.key === "confirm_password" &&
                        passForm.new_password &&
                        passForm.confirm_password && (
                          <p
                            className={`text-[10px] sm:text-xs mt-1 font-semibold ${passForm.new_password === passForm.confirm_password ? "text-green-500" : "text-red-500"}`}
                          >
                            {passForm.new_password === passForm.confirm_password
                              ? "✓ Passwords match"
                              : "✗ Passwords do not match"}
                          </p>
                        )}
                    </div>
                  ))}

                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 sm:p-3 text-[10px] sm:text-xs text-amber-700">
                    💡 Password must be at least 6 characters long.
                  </div>

                  <button
                    onClick={handlePassChange}
                    disabled={saving}
                    className="w-full py-2.5 sm:py-3 rounded-xl text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
                    style={{
                      background: saving
                        ? "#6ee7b7"
                        : "linear-gradient(135deg, #065f46, #059669)",
                    }}
                  >
                    {saving ? "Changing..." : "🔒 Change Password"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
