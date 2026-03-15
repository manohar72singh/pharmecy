import { useState, useEffect, useRef } from "react";
import { useToast } from "../../context/ToastContext";
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
  const showToast = useToast();

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

  // ── Load profile + addresses ──────────────────────
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

  // ── Update Profile ────────────────────────────────
  const handleInfoSave = async () => {
    if (!infoForm.name) return showMsg("error", "Name zaroori hai.");
    setSaving(true);
    try {
      const { data } = await userService.updateProfile(infoForm);
      setProfile({ ...profile, ...data.data });
      // localStorage update
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, name: infoForm.name }),
      );
      showMsg("success", "Profile update ho gaya! ✅");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  // ── Upload Photo ──────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      return showMsg("error", "Photo 2MB se chhoti honi chahiye.");
    const formData = new FormData();
    formData.append("photo", file);
    setPhotoLoading(true);
    try {
      const { data } = await userService.uploadPhoto(formData);
      setProfile({ ...profile, profile_image: data.data.profile_image });
      showMsg("success", "Photo upload ho gayi! ✅");
    } catch (err) {
      showMsg("error", "Photo upload failed.", err);
    } finally {
      setPhotoLoading(false);
    }
  };

  // ── Change Password ───────────────────────────────
  const handlePassChange = async () => {
    const { old_password, new_password, confirm_password } = passForm;
    if (!old_password || !new_password || !confirm_password)
      return showMsg("error", "Sabhi fields fill karo.");
    if (new_password.length < 6)
      return showMsg("error", "New password 6+ characters ka hona chahiye.");
    if (new_password !== confirm_password)
      return showMsg(
        "error",
        "New password aur confirm password match nahi karte.",
      );
    setSaving(true);
    try {
      await userService.changePassword({ old_password, new_password });
      setPassForm({ old_password: "", new_password: "", confirm_password: "" });
      showMsg("success", "Password change ho gaya! ✅");
    } catch (err) {
      showMsg(
        "error",
        err.response?.data?.message || "Password change failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Address ────────────────────────────────
  const handleDeleteAddr = async (id) => {
    try {
      await addressService.remove(id);
      setAddresses(addresses.filter((a) => a.id !== id));
      showMsg("success", "Address delete ho gaya.");
    } catch (err) {
      showMsg("error", "Delete failed.", err);
    }
  };

  // ── Set Default Address ───────────────────────────
  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefault(id);
      setAddresses(
        addresses.map((a) => ({ ...a, is_default: a.id === id ? 1 : 0 })),
      );
    } catch (err) {
      showMsg("error", "Failed.", err);
    }
  };

  // ── Logout ────────────────────────────────────────
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
          <p className="text-gray-500 text-sm">Profile load ho raha hai...</p>
        </div>
      </div>
    );

  const avatarText = profile?.name?.charAt(0)?.toUpperCase() || "U";
  const photoUrl = profile?.profile_image
    ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}/uploads/profiles/${profile.profile_image}`
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Avatar Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              {/* Photo */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #065f46, #059669)",
                    }}
                  >
                    {avatarText}
                  </div>
                )}
                {/* Upload button */}
                <button
                  onClick={() => photoRef.current?.click()}
                  disabled={photoLoading}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-emerald-400 flex items-center justify-center text-sm shadow-md hover:bg-emerald-50 transition"
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

              <h2 className="font-black text-gray-900 text-lg">
                {profile?.name}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">{profile?.phone}</p>
              {profile?.email && (
                <p className="text-xs text-gray-400">{profile?.email}</p>
              )}

              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                ✅ Verified Account
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Member since{" "}
                {new Date(profile?.created_at).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Nav Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
                  <span className="text-base">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <Link
                to="/orders"
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition border-b border-gray-50"
              >
                <span>📦</span> My Orders
              </Link>
              <Link
                to="/cart"
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition border-b border-gray-50"
              >
                <span>🛒</span> My Cart
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 transition text-left"
              >
                <span>🚪</span> Logout
              </button>
            </div>
          </div>

          {/* ── RIGHT CONTENT ── */}
          <div className="lg:col-span-3">
            {/* ── TAB: Personal Info ── */}
            {tab === "info" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-black text-gray-900 mb-6">
                  👤 Personal Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:border-emerald-400 focus:bg-white transition"
                    />
                  </div>

                  {/* Phone — readonly */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={profile?.phone || ""}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Phone number change nahi ho sakta.
                    </p>
                  </div>

                  {/* Email */}
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
                    />
                  </div>

                  {/* DOB */}
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={infoForm.gender}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, gender: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-emerald-400 transition"
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
                  className="mt-6 px-8 py-3 rounded-xl text-white font-bold text-sm transition flex items-center gap-2"
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
                    "💾 Save Changes"
                  )}
                </button>
              </div>
            )}

            {/* ── TAB: Addresses ── */}
            {tab === "addresses" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black text-gray-900">
                      📍 Saved Addresses
                    </h2>
                    {!showNewAddr && (
                      <button
                        onClick={() => setShowNewAddr(true)}
                        className="text-xs font-bold text-white px-4 py-2 rounded-xl transition"
                        style={{
                          background:
                            "linear-gradient(135deg, #065f46, #059669)",
                        }}
                      >
                        + Add New
                      </button>
                    )}
                  </div>

                  {addresses.length === 0 && !showNewAddr ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-3">📍</div>
                      <p className="text-gray-500 font-semibold mb-2">
                        Koi address nahi hai
                      </p>
                      <button
                        onClick={() => setShowNewAddr(true)}
                        className="text-sm font-bold text-emerald-600 hover:underline"
                      >
                        + Pehla address add karo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`rounded-2xl border-2 p-4 transition ${
                            addr.is_default
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-gray-100 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-gray-900 text-sm">
                                  {addr.full_name}
                                </p>
                                {addr.is_default === 1 && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                    Default
                                  </span>
                                )}
                              </div>
                              {addr.phone && (
                                <p className="text-xs text-gray-500 mb-1">
                                  {addr.phone}
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                {addr.address_line1}
                                {addr.address_line2
                                  ? `, ${addr.address_line2}`
                                  : ""}
                              </p>
                              <p className="text-sm text-gray-600">
                                {addr.city}, {addr.state} — {addr.pincode}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              {addr.is_default !== 1 && (
                                <button
                                  onClick={() => handleSetDefault(addr.id)}
                                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAddr(addr.id)}
                                className="text-xs font-bold text-red-400 hover:text-red-600 transition"
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

                {/* AddressForm — neeche show hoga */}
                {showNewAddr && (
                  <AddressForm
                    onSave={(saved, allAddrs) => {
                      setAddresses(allAddrs);
                      setShowNewAddr(false);
                      showMsg("success", "Address add ho gaya! ✅");
                    }}
                    onCancel={() => setShowNewAddr(false)}
                    showCancel={true}
                  />
                )}
              </div>
            )}

            {/* ── TAB: Change Password ── */}
            {tab === "password" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-black text-gray-900 mb-6">
                  🔒 Change Password
                </h2>
                <div className="max-w-md space-y-4">
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
                          className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPass({
                              ...showPass,
                              [f.passKey]: !showPass[f.passKey],
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg transition"
                        >
                          {showPass[f.passKey] ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {f.key === "confirm_password" &&
                        passForm.new_password &&
                        passForm.confirm_password && (
                          <p
                            className={`text-xs mt-1 font-semibold ${
                              passForm.new_password ===
                              passForm.confirm_password
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {passForm.new_password === passForm.confirm_password
                              ? "✓ Match ho raha hai"
                              : "✗ Match nahi ho raha"}
                          </p>
                        )}
                    </div>
                  ))}

                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                    💡 Password kam se kam 6 characters ka hona chahiye.
                  </div>

                  <button
                    onClick={handlePassChange}
                    disabled={saving}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm transition flex items-center justify-center gap-2"
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
                        Changing...
                      </>
                    ) : (
                      "🔒 Change Password"
                    )}
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
