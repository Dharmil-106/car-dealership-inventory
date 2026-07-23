import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../api/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "autohaus_token";
const USER_KEY = "autohaus_user";

/**
 * Reads stored auth from localStorage on mount.
 * Provides { user, token, login, register, logout, loading, error }.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        // Corrupt data — clear it
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  function persist(token, user) {
    setToken(token);
    setUser(user);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);
      // API returns { token, user: { id, name, email, role } }
      persist(data.token, data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(name, email, password) {
    setLoading(true);
    setError(null);
    try {
      // Register returns { id, name, email, role } — no token, so auto-login after
      const registeredUser = await registerUser(name, email, password);
      const data = await loginUser(email, password);
      const userWithDetails = { ...registeredUser, ...data.user };
      persist(data.token, userWithDetails);
      return userWithDetails;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function clearError() {
    setError(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading, error, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume auth context.
 * Throws if used outside AuthProvider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
