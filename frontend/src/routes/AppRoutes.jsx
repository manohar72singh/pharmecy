import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import CartToast from "../components/common/CartToast";

// ── Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import OtpVerify from "../pages/auth/OtpVerify";

// ── Customer Pages
import Home from "../pages/customer/Home";
import MedicineList from "../pages/customer/MedicineList";
import MedicineDetail from "../pages/customer/MedicineDetail";
import Cart from "../pages/customer/Cart";
import Checkout from "../pages/customer/Checkout";
import Orders from "../pages/customer/Orders";
import OrderDetail from "../pages/customer/OrderDetail";
import Prescription from "../pages/customer/Prescription";
import Subscription from "../pages/customer/Subscription";
import Profile from "../pages/customer/Profile";

// ── Admin Pages
import Dashboard from "../pages/admin/Dashboard";
import AdminMedicines from "../pages/admin/Medicines";
import AdminStock from "../pages/admin/Stock";
import AdminOrders from "../pages/admin/Orders";
import AdminPrescriptions from "../pages/admin/Prescriptions";
import AdminUsers from "../pages/admin/Users";
import AdminSuppliers from "../pages/admin/Suppliers";
import AdminPurchase from "../pages/admin/Purchase";
import AdminDelivery from "../pages/admin/Delivery";
import AdminSubscriptions from "../pages/admin/Subscriptions";
import AdminReports from "../pages/admin/Reports";
import AdminCoupons from "../pages/admin/Coupons";

// ── Protected Route Helper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;
  return children;
};

// ── Layout — sirf Navbar, CartToast nahi (neeche globally hai)
const Layout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

export default function AppRoutes() {
  return (
    <>
      {/* ✅ FIX: CartToast Routes ke BAHAR — kabhi re-mount nahi hoga */}
      <CartToast />

      <Routes>
        {/* ── Public Routes ──────────────────────────── */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/medicines"
          element={
            <Layout>
              <MedicineList />
            </Layout>
          }
        />
        <Route
          path="/medicines/:id"
          element={
            <Layout>
              <MedicineDetail />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <Layout>
              <OtpVerify />
            </Layout>
          }
        />
        <Route
          path="/cart"
          element={
            <Layout>
              <Cart />
            </Layout>
          }
        />

        {/* ── Customer Protected Routes ───────────────── */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Layout>
                <Checkout />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Layout>
                <Orders />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Layout>
                <OrderDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Layout>
                <Prescription />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Layout>
                <Subscription />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ── Admin Protected Routes ──────────────────── */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "super_admin", "pharmacist"]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/medicines"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "super_admin", "pharmacist"]}
            >
              <AdminMedicines />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stock"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "super_admin", "pharmacist"]}
            >
              <AdminStock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "super_admin", "pharmacist"]}
            >
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/prescriptions"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "super_admin", "pharmacist"]}
            >
              <AdminPrescriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/suppliers"
          element={
            <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AdminSuppliers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/purchase"
          element={
            <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AdminPurchase />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/delivery"
          element={
            <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AdminDelivery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subscriptions"
          element={
            <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AdminSubscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/coupons"
          element={
            <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AdminCoupons />
            </ProtectedRoute>
          }
        />

        {/* ── 404 ────────────────────────────────────── */}
        <Route
          path="*"
          element={
            <Layout>
              <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <div className="text-6xl">😕</div>
                <h1 className="text-2xl font-bold text-gray-800">
                  404 - Page Not Found
                </h1>
                <a
                  href="/"
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  Go Home
                </a>
              </div>
            </Layout>
          }
        />
      </Routes>
    </>
  );
}
