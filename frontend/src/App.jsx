import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center gap-6 border-b border-gray-200 bg-white px-6 py-3">
        <Link to="/" className="font-semibold text-gray-900">
          Kata
        </Link>
        <Link to="/" className="text-sm text-gray-600 hover:text-emerald-600">
          Dashboard
        </Link>

        {user?.role === "admin" && (
          <Link
            to="/admin"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Admin Panel
          </Link>
        )}

        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.name || user.email}</span>
              {user.role === "admin" && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  Admin
                </span>
              )}
              <button
                onClick={logout}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-emerald-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
