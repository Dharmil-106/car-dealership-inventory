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

export default request;
