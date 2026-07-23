const BASE_URL = "http://localhost:5000/api";

/**
 * Wrapper around fetch with base URL, JSON headers, and auth token.
 * All API functions will use this as their foundation.
 */
async function request(endpoint, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = { method, headers };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

// ── Auth API ────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Returns { token, user: { id, email, role } }
 */
export async function loginUser(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

/**
 * POST /api/auth/register
 * Returns { id, email, role }
 */
export async function registerUser(email, password) {
  return request("/auth/register", {
    method: "POST",
    body: { email, password },
  });
}

// ── Vehicle API ─────────────────────────────────────────────────────

/**
 * GET /api/vehicles
 * Returns array of all vehicles (public, no token needed).
 */
export async function getAllVehicles() {
  return request("/vehicles");
}

/**
 * GET /api/vehicles/search?make=...&model=...&category=...&minPrice=...&maxPrice=...
 * Only includes query params that have truthy values.
 */
export async function searchVehicles(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "" && value !== undefined && value !== null) {
      params.append(key, value);
    }
  }
  const qs = params.toString();
  return request(`/vehicles/search${qs ? `?${qs}` : ""}`);
}

/**
 * POST /api/vehicles/:id/purchase
 * Requires: valid token (any logged-in user).
 * Returns { id, quantity } on success.
 */
export async function purchaseVehicle(vehicleId, token) {
  return request(`/vehicles/${vehicleId}/purchase`, {
    method: "POST",
    token,
  });
}

export default request;
