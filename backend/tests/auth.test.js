const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const User = require("../src/models/User");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("POST /api/auth/register", () => {
  const validUser = { email: "test@example.com", password: "Password123" };

  it("registers a new user and returns 201 with id, email, role", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("test@example.com");
    expect(res.body.role).toBe("customer");
    expect(res.body).not.toHaveProperty("password");
  });

  it("rejects duplicate email with 400", async () => {
    await request(app).post("/api/auth/register").send(validUser);
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Email already registered" });
  });

  it("rejects missing email with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ password: "Password123" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("rejects missing password with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("hashes the password — never stores plain text", async () => {
    await request(app).post("/api/auth/register").send(validUser);
    const user = await User.findOne({ email: validUser.email });

    expect(user.password).not.toBe(validUser.password);
    expect(user.password).toMatch(/^\$2[aby]?\$/); // bcrypt hash prefix
  });

  it("ignores role field from client — always defaults to customer", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, role: "admin" });

    expect(res.body.role).toBe("customer");
  });
});
