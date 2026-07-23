const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  url = url.trim().replace(/\/$/, "");
  if (!url.endsWith("/api")) {
    url += "/api";
  }
  return url;
};

const BASE_URL = getBaseUrl();


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

  const contentType = res.headers.get("content-type");
  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Server returned ${res.status} (${res.statusText || "Not Found"})`);
    }
    data = text;
  }

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
 * Returns { id, name, email, role }
 */
export async function registerUser(name, email, password) {
  return request("/auth/register", {
    method: "POST",
    body: { name, email, password },
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

/**
 * POST /api/vehicles
 * Requires: valid token + role === "admin"
 * Request body: { make, model, category, price, quantity }
 * Returns created vehicle object.
 */
export async function createVehicle(data, token) {
  return request("/vehicles", {
    method: "POST",
    body: data,
    token,
  });
}

/**
 * PUT /api/vehicles/:id
 * Requires: valid token + role === "admin"
 * Request body: subset of { make, model, category, price, quantity }
 * Returns updated vehicle object.
 */
export async function updateVehicle(id, data, token) {
  return request(`/vehicles/${id}`, {
    method: "PUT",
    body: data,
    token,
  });
}

/**
 * DELETE /api/vehicles/:id
 * Requires: valid token + role === "admin"
 * Returns { message: "Vehicle deleted" }
 */
export async function deleteVehicle(id, token) {
  return request(`/vehicles/${id}`, {
    method: "DELETE",
    token,
  });
}

/**
 * POST /api/vehicles/:id/restock
 * Requires: valid token + role === "admin"
 * Request body: { amount }
 * Returns { id, quantity }
 */
export async function restockVehicle(id, amount, token) {
  return request(`/vehicles/${id}/restock`, {
    method: "POST",
    body: { amount: Number(amount) },
    token,
  });
}

// ── Purchase API ───────────────────────────────────────────────────

/**
 * GET /api/purchases
 * Requires: valid token
 * Returns array of purchases for the authenticated user.
 */
export async function getMyPurchases(token) {
  return request("/purchases", { token });
}

/**
 * GET /api/purchases/all
 * Requires: valid token + role === "admin"
 * Returns array of all purchases across all users with populated buyer information.
 */
export async function getAllPurchases(token) {
  return request("/purchases/all", { token });
}

export default request;
