const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = require("../src/app");
const User = require("../src/models/User");
const Vehicle = require("../src/models/Vehicle");

let mongoServer;
let adminToken;
let customerToken;

const TEST_SECRET = "test-jwt-secret";

const validVehicle = {
  make: "Toyota",
  model: "Camry",
  category: "Sedan",
  price: 25000,
  quantity: 5,
};

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create an admin user directly in the DB (bypasses register's default-to-customer)
  const hashedPassword = await bcrypt.hash("AdminPass123", 10);
  const admin = await User.create({
    email: "admin@test.com",
    password: hashedPassword,
    role: "admin",
  });
  adminToken = jwt.sign({ id: admin._id, role: "admin" }, TEST_SECRET, {
    expiresIn: "1h",
  });

  // Create a customer user via the register endpoint
  const customerRes = await request(app)
    .post("/api/auth/register")
    .send({ email: "customer@test.com", password: "CustPass123" });
  customerToken = jwt.sign(
    { id: customerRes.body.id, role: "customer" },
    TEST_SECRET,
    { expiresIn: "1h" }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /api/vehicles", () => {
  it("allows admin to create a vehicle → 201 with all fields", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(validVehicle);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.make).toBe("Toyota");
    expect(res.body.model).toBe("Camry");
    expect(res.body.category).toBe("Sedan");
    expect(res.body.price).toBe(25000);
    expect(res.body.quantity).toBe(5);
  });

  it("rejects when a required field is missing (no make) → 400", async () => {
    const { make, ...noMake } = validVehicle;

    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(noMake);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("rejects customer role → 403", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${customerToken}`)
      .send(validVehicle);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Admin access required" });
  });

  it("rejects request with no token → 401", async () => {
    const res = await request(app).post("/api/vehicles").send(validVehicle);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("rejects negative price → 400", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...validVehicle, price: -100 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("rejects negative quantity → 400", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...validVehicle, quantity: -3 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("GET /api/vehicles", () => {
  afterEach(async () => {
    await Vehicle.deleteMany({});
  });

  it("returns 200 with an empty array when no vehicles exist", async () => {
    const res = await request(app).get("/api/vehicles");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 200 with all seeded vehicles and their fields", async () => {
    const vehicles = [
      { make: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 5 },
      { make: "Honda", model: "CR-V", category: "SUV", price: 32000, quantity: 3 },
      { make: "Ford", model: "Mustang", category: "Sports", price: 45000, quantity: 2 },
    ];
    await Vehicle.insertMany(vehicles);

    const res = await request(app).get("/api/vehicles");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toHaveProperty("_id");
    expect(res.body[0]).toHaveProperty("make");
    expect(res.body[0]).toHaveProperty("model");
    expect(res.body[0]).toHaveProperty("category");
    expect(res.body[0]).toHaveProperty("price");
    expect(res.body[0]).toHaveProperty("quantity");

    const makes = res.body.map((v) => v.make);
    expect(makes).toContain("Toyota");
    expect(makes).toContain("Honda");
    expect(makes).toContain("Ford");
  });

  it("is public — no token required, still returns 200", async () => {
    await Vehicle.create({ make: "BMW", model: "X5", category: "SUV", price: 60000, quantity: 1 });

    const res = await request(app).get("/api/vehicles");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].make).toBe("BMW");
  });
});
