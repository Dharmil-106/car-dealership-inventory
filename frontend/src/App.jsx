import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal nav for route testing */}
      <nav className="flex items-center gap-6 border-b border-gray-200 bg-white px-6 py-3">
        <Link to="/" className="font-semibold text-gray-900">
          AutoHaus
        </Link>
        <Link to="/" className="text-sm text-gray-600 hover:text-emerald-600">
          Dashboard
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm text-gray-600 hover:text-emerald-600"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm text-gray-600 hover:text-emerald-600"
          >
            Register
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
