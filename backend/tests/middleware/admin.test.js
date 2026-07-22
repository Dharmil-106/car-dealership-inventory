const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../../src/middleware/auth");
// Admin middleware under test — does not exist yet
const adminMiddleware = require("../../src/middleware/admin");

// Build a tiny Express app with a route behind both middlewares
const app = express();
app.use(express.json());
app.get(
  "/api/test-admin",
  authMiddleware,
  adminMiddleware,
  (_req, res) => {
    res.json({ message: "success" });
  }
);

const TEST_SECRET = "test-jwt-secret";

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

describe("Admin middleware", () => {
  it("allows request when role is admin → 200", async () => {
    const token = jwt.sign({ id: "admin1", role: "admin" }, TEST_SECRET, {
      expiresIn: "1h",
    });

    const res = await request(app)
      .get("/api/test-admin")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "success" });
  });

  it("rejects request when role is customer → 403", async () => {
    const token = jwt.sign({ id: "user1", role: "customer" }, TEST_SECRET, {
      expiresIn: "1h",
    });

    const res = await request(app)
      .get("/api/test-admin")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Admin access required" });
  });

  it("rejects request with no token → 401 (blocked by auth middleware)", async () => {
    const res = await request(app).get("/api/test-admin");

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });
});
