const request = require("supertest");
const app = require("../src/app");

describe("Server Routes", () => {
  describe("GET /", () => {
    it("returns 200 with API status message", async () => {
      const res = await request(app).get("/");

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Car Dealership Inventory API");
    });
  });

  describe("GET /api/health", () => {
    it('returns 200 with { status: "ok" }', async () => {
      const res = await request(app).get("/api/health");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });
  });
});
