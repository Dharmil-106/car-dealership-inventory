const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = require("../src/app");
const User = require("../src/models/User");
const Vehicle = require("../src/models/Vehicle");
const Purchase = require("../src/models/Purchase");

let mongoServer;
let adminToken;
let customer1Token;
let customer1Id;
let customer2Token;
let customer2Id;
let vehicleId;

const TEST_SECRET = "test-jwt-secret";

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Vehicle.deleteMany({});
  await Purchase.deleteMany({});

  const hashedPassword = await bcrypt.hash("Pass123!", 10);

  // Admin user
  const admin = await User.create({
    name: "Admin User",
    email: "admin@test.com",
    password: hashedPassword,
    role: "admin",
  });
  adminToken = jwt.sign({ id: admin._id, role: "admin" }, TEST_SECRET, {
    expiresIn: "1h",
  });

  // Customer 1
  const customer1 = await User.create({
    name: "Alice Smith",
    email: "alice@test.com",
    password: hashedPassword,
    role: "customer",
  });
  customer1Id = customer1._id.toString();
  customer1Token = jwt.sign({ id: customer1._id, role: "customer" }, TEST_SECRET, {
    expiresIn: "1h",
  });

  // Customer 2
  const customer2 = await User.create({
    name: "Bob Jones",
    email: "bob@test.com",
    password: hashedPassword,
    role: "customer",
  });
  customer2Id = customer2._id.toString();
  customer2Token = jwt.sign({ id: customer2._id, role: "customer" }, TEST_SECRET, {
    expiresIn: "1h",
  });

  // Sample vehicle
  const vehicle = await Vehicle.create({
    make: "Honda",
    model: "Civic",
    category: "Sedan",
    price: 22000,
    quantity: 2,
  });
  vehicleId = vehicle._id.toString();
});

describe("Purchase Tracking on POST /api/vehicles/:id/purchase", () => {
  it("creates a Purchase record with correct user and snapshot data on successful purchase", async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${customer1Token}`);

    expect(res.statusCode).toBe(200);

    const purchases = await Purchase.find({ user: customer1Id });
    expect(purchases).toHaveLength(1);
    expect(purchases[0].user.toString()).toBe(customer1Id);
    expect(purchases[0].vehicleId.toString()).toBe(vehicleId);
    expect(purchases[0].make).toBe("Honda");
    expect(purchases[0].model).toBe("Civic");
    expect(purchases[0].category).toBe("Sedan");
    expect(purchases[0].price).toBe(22000);
  });

  it("does NOT create a Purchase record when vehicle is out of stock", async () => {
    await Vehicle.findByIdAndUpdate(vehicleId, { quantity: 0 });

    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${customer1Token}`);

    expect(res.statusCode).toBe(400);

    const purchases = await Purchase.find({});
    expect(purchases).toHaveLength(0);
  });

  it("does NOT create a Purchase record when admin attempts purchase", async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(403);

    const purchases = await Purchase.find({});
    expect(purchases).toHaveLength(0);
  });
});

describe("GET /api/purchases", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/purchases");
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("customer sees only their own purchases", async () => {
    // Customer 1 buys vehicle
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${customer1Token}`);

    // Customer 2 buys vehicle
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${customer2Token}`);

    // Customer 1 fetches history
    const res1 = await request(app)
      .get("/api/purchases")
      .set("Authorization", `Bearer ${customer1Token}`);

    expect(res1.statusCode).toBe(200);
    expect(res1.body).toHaveLength(1);
    expect(res1.body[0].make).toBe("Honda");
    expect(res1.body[0].model).toBe("Civic");
    expect(res1.body[0]).toHaveProperty("id");

    // Customer 2 fetches history
    const res2 = await request(app)
      .get("/api/purchases")
      .set("Authorization", `Bearer ${customer2Token}`);

    expect(res2.statusCode).toBe(200);
    expect(res2.body).toHaveLength(1);
  });
});

describe("GET /api/purchases/all", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/purchases/all");
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("returns 403 for non-admin customer role", async () => {
    const res = await request(app)
      .get("/api/purchases/all")
      .set("Authorization", `Bearer ${customer1Token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Admin access required" });
  });

  it("admin sees all purchases with populated buyer name and email", async () => {
    // Customer 1 buys
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${customer1Token}`);

    // Customer 2 buys
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${customer2Token}`);

    const res = await request(app)
      .get("/api/purchases/all")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);

    const buyers = res.body.map((p) => p.user);
    const buyerEmails = buyers.map((b) => b.email);
    expect(buyerEmails).toContain("alice@test.com");
    expect(buyerEmails).toContain("bob@test.com");

    const alice = buyers.find((b) => b.email === "alice@test.com");
    expect(alice.name).toBe("Alice Smith");
  });
});
