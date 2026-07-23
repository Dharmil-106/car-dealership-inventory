import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import MyPurchases from "./pages/MyPurchases";


function App() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo & Main Desktop Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              onClick={handleNavClick}
              className="flex items-center gap-2 font-bold text-gray-900 text-lg tracking-tight"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-base shadow-xs">
                K
              </span>
              <span>Kata</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "text-emerald-600 font-semibold"
                    : "text-gray-600 hover:text-emerald-600"
                }`}
              >
                Dashboard
              </Link>

              {user && user.role !== "admin" && (
                <Link
                  to="/my-purchases"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === "/my-purchases"
                      ? "text-emerald-600 font-semibold"
                      : "text-gray-600 hover:text-emerald-600"
                  }`}
                >
                  My Purchases
                </Link>
              )}

              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-600 hover:bg-emerald-100 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* Right Desktop Auth Actions */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {user ? (
              <>
                <span className="text-sm font-medium text-gray-700">
                  {user.name || user.email}
                </span>
                {user.role === "admin" && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    Admin
                  </span>
                )}
                <button
                  onClick={logout}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 shadow-xs transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-2 md:hidden">
            <Link
              to="/"
              onClick={handleNavClick}
              className={`block rounded-lg px-3 py-2 text-base font-medium ${
                location.pathname === "/"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Dashboard
            </Link>

            {user && user.role !== "admin" && (
              <Link
                to="/my-purchases"
                onClick={handleNavClick}
                className={`block rounded-lg px-3 py-2 text-base font-medium ${
                  location.pathname === "/my-purchases"
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                My Purchases
              </Link>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={handleNavClick}
                className="block rounded-lg bg-emerald-100 px-3 py-2 text-base font-semibold text-emerald-800"
              >
                Admin Panel
              </Link>
            )}

            <div className="border-t border-gray-100 pt-3">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-3 py-1">
                    <span className="text-sm font-semibold text-gray-800">
                      {user.name || user.email}
                    </span>
                    {user.role === "admin" && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      handleNavClick();
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={handleNavClick}
                    className="block text-center rounded-lg border border-gray-300 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleNavClick}
                    className="block text-center rounded-lg bg-emerald-600 py-2 text-base font-medium text-white hover:bg-emerald-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/my-purchases" element={<MyPurchases />} />
      </Routes>
    </div>
  );
}


export default App;
