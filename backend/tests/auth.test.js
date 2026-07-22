const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const User = require("../src/models/User");

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret";
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

describe("POST /api/auth/login", () => {
  const validUser = { email: "test@example.com", password: "Password123" };

  // Pre-register a user before each login test
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(validUser);
  });

  it("returns 200 with a JWT token and user object on valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send(validUser);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
    // JWT has 3 dot-separated base64 segments
    expect(res.body.token.split(".")).toHaveLength(3);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.body.user.role).toBe("customer");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "WrongPassword" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Invalid email or password" });
  });

  it("returns 401 for non-existent email — same generic error, no email leak", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "Password123" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Invalid email or password" });
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "Password123" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
