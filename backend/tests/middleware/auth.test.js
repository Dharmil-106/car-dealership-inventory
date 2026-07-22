const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

// Middleware under test — does not exist yet
const authMiddleware = require("../../src/middleware/auth");

// Build a tiny Express app with a protected test route
const app = express();
app.use(express.json());
app.get("/api/test-protected", authMiddleware, (_req, res) => {
  res.json({ message: "success" });
});

const TEST_SECRET = "test-jwt-secret";

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

describe("Auth middleware", () => {
  it("allows request with a valid Bearer token and returns 200", async () => {
    const token = jwt.sign({ id: "user123", role: "customer" }, TEST_SECRET, {
      expiresIn: "1h",
    });

    const res = await request(app)
      .get("/api/test-protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "success" });
  });

  it("rejects request with no Authorization header → 401", async () => {
    const res = await request(app).get("/api/test-protected");

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("rejects request with an invalid/malformed token → 401", async () => {
    const res = await request(app)
      .get("/api/test-protected")
      .set("Authorization", "Bearer not.a.real.token");

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Invalid token" });
  });

  it("rejects request with an expired token → 401", async () => {
    const expiredToken = jwt.sign(
      { id: "user123", role: "customer" },
      TEST_SECRET,
      { expiresIn: "0s" } // expires immediately
    );

    // Small delay to ensure the token is expired
    await new Promise((resolve) => setTimeout(resolve, 10));

    const res = await request(app)
      .get("/api/test-protected")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Invalid token" });
  });
});
