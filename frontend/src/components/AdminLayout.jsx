import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Layout for Admin Panel.
 * Dark sidebar (bg-gray-900) + Light main content area (bg-gray-50).
 */
export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Overview", href: "/admin" },
    { label: "Manage Vehicles", href: "/admin" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Dark Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-800 bg-gray-900 text-gray-300">
        {/* Branding */}
        <div className="flex items-center gap-3 border-b border-gray-800 px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white">
            K
          </div>
          <div>
            <h1 className="font-semibold text-white">Kata Admin</h1>
            <p className="text-xs text-gray-400">Inventory Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Admin Menu
          </p>
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.href && idx === 0;
            return (
              <Link
                key={idx}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Quick Links
            </p>
            <Link
              to="/"
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <span>← Back to Dashboard</span>
            </Link>
          </div>
        </nav>

        {/* User Footer */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-emerald-400">Admin Account</p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-gray-700 px-2.5 py-1 text-xs text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
}
