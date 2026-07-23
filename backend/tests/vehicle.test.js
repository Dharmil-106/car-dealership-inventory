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
    name: "Admin User",
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
    .send({ name: "Customer User", email: "customer@test.com", password: "CustPass123" });
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
    expect(res.body).toHaveProperty("id");
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
  beforeEach(async () => {
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
    expect(res.body[0]).toHaveProperty("id");
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

describe("GET /api/vehicles/search", () => {
  beforeAll(async () => {
    await Vehicle.deleteMany({});
    await Vehicle.insertMany([
      { make: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 5 },
      { make: "Toyota", model: "RAV4", category: "SUV", price: 30000, quantity: 3 },
      { make: "Honda", model: "CR-V", category: "SUV", price: 32000, quantity: 4 },
      { make: "Ford", model: "Mustang", category: "Sports", price: 45000, quantity: 2 },
      { make: "BMW", model: "X5", category: "SUV", price: 60000, quantity: 1 },
    ]);
  });

  afterAll(async () => {
    await Vehicle.deleteMany({});
  });

  it("filters by make → ?make=Toyota returns only Toyotas", async () => {
    const res = await request(app).get("/api/vehicles/search?make=Toyota");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    res.body.forEach((v) => expect(v.make).toBe("Toyota"));
  });

  it("filters by category → ?category=SUV returns only SUVs", async () => {
    const res = await request(app).get("/api/vehicles/search?category=SUV");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(3);
    res.body.forEach((v) => expect(v.category).toBe("SUV"));
  });

  it("filters by price range → ?minPrice=20000&maxPrice=30000", async () => {
    const res = await request(app).get(
      "/api/vehicles/search?minPrice=20000&maxPrice=30000"
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    res.body.forEach((v) => {
      expect(v.price).toBeGreaterThanOrEqual(20000);
      expect(v.price).toBeLessThanOrEqual(30000);
    });
  });

  it("supports combined filters → ?make=Toyota&category=Sedan", async () => {
    const res = await request(app).get(
      "/api/vehicles/search?make=Toyota&category=Sedan"
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].model).toBe("Camry");
  });

  it("returns all vehicles when no query params are provided", async () => {
    const res = await request(app).get("/api/vehicles/search");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(5);
  });

  it("returns 200 with empty array when no vehicles match", async () => {
    const res = await request(app).get("/api/vehicles/search?make=Lamborghini");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("is public — no token required", async () => {
    const res = await request(app).get("/api/vehicles/search?category=Sports");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].make).toBe("Ford");
  });
});

describe("PUT /api/vehicles/:id", () => {
  let vehicleId;

  beforeEach(async () => {
    await Vehicle.deleteMany({});
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 5,
    });
    vehicleId = vehicle._id.toString();
  });

  it("admin updates one field (price) → 200, other fields unchanged", async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 27000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(27000);
    expect(res.body.make).toBe("Toyota");
    expect(res.body.model).toBe("Camry");
    expect(res.body.category).toBe("Sedan");
    expect(res.body.quantity).toBe(5);
  });

  it("admin updates multiple fields at once → 200", async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 28000, quantity: 10, category: "Luxury Sedan" });

    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(28000);
    expect(res.body.quantity).toBe(10);
    expect(res.body.category).toBe("Luxury Sedan");
    expect(res.body.make).toBe("Toyota");
  });

  it("rejects customer role → 403", async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ price: 30000 });

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Admin access required" });
  });

  it("rejects request with no token → 401", async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .send({ price: 30000 });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("returns 404 for non-existent vehicle id", async () => {
    const fakeId = "aaaaaaaaaaaaaaaaaaaaaaaa";
    const res = await request(app)
      .put(`/api/vehicles/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 30000 });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Vehicle not found" });
  });

  it("rejects invalid update value (negative price) → 400", async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: -5000 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("DELETE /api/vehicles/:id", () => {
  let vehicleId;

  beforeEach(async () => {
    await Vehicle.deleteMany({});
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 5,
    });
    vehicleId = vehicle._id.toString();
  });

  it("admin deletes a vehicle → 200, vehicle is gone", async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Vehicle deleted" });

    // Confirm it's actually gone
    const listRes = await request(app).get("/api/vehicles");
    const ids = listRes.body.map((v) => v._id);
    expect(ids).not.toContain(vehicleId);
  });

  it("rejects customer role → 403", async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Admin access required" });
  });

  it("rejects request with no token → 401", async () => {
    const res = await request(app).delete(`/api/vehicles/${vehicleId}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("returns 404 for non-existent vehicle id", async () => {
    const fakeId = "aaaaaaaaaaaaaaaaaaaaaaaa";
    const res = await request(app)
      .delete(`/api/vehicles/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Vehicle not found" });
  });
});

describe("POST /api/vehicles/:id/purchase", () => {
  let vehicleId;

  beforeEach(async () => {
    await Vehicle.deleteMany({});
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 3,
    });
    vehicleId = vehicle._id.toString();
  });

  it("logged-in user purchases a vehicle → 200, quantity decreased by 1", async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(vehicleId);
    expect(res.body.quantity).toBe(2);
  });

  it("rejects purchase when quantity is 0 → 400", async () => {
    await Vehicle.findByIdAndUpdate(vehicleId, { quantity: 0 });

    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Vehicle out of stock" });

    // Confirm quantity didn't go negative
    const vehicle = await Vehicle.findById(vehicleId);
    expect(vehicle.quantity).toBe(0);
  });

  it("rejects request with no token → 401", async () => {
    const res = await request(app).post(`/api/vehicles/${vehicleId}/purchase`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("returns 404 for non-existent vehicle id", async () => {
    const fakeId = "aaaaaaaaaaaaaaaaaaaaaaaa";
    const res = await request(app)
      .post(`/api/vehicles/${fakeId}/purchase`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Vehicle not found" });
  });
});

describe("POST /api/vehicles/:id/restock", () => {
  let vehicleId;

  beforeEach(async () => {
    await Vehicle.deleteMany({});
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 2,
    });
    vehicleId = vehicle._id.toString();
  });

  it("admin restocks a vehicle → 200, quantity increased by amount", async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amount: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(vehicleId);
    expect(res.body.quantity).toBe(7);
  });

  it("rejects customer role → 403", async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ amount: 5 });

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Admin access required" });
  });

  it("rejects request with no token → 401", async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .send({ amount: 5 });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("rejects zero amount → 400", async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amount: 0 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Amount must be a positive number" });
  });

  it("rejects negative amount → 400", async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amount: -3 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Amount must be a positive number" });
  });

  it("rejects missing amount → 400", async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Amount must be a positive number" });
  });

  it("returns 404 for non-existent vehicle id", async () => {
    const fakeId = "aaaaaaaaaaaaaaaaaaaaaaaa";
    const res = await request(app)
      .post(`/api/vehicles/${fakeId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amount: 5 });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Vehicle not found" });
  });
});
