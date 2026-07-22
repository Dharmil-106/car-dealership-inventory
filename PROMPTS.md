# AI Prompt Log

## Backend

### Prompt: 1

I'm building a Node.js + Express backend (plain JavaScript, not TypeScript) for a car dealership inventory API, using MongoDB with Mongoose. Set up the initial project in /backend:

package.json with dependencies: express, mongoose, dotenv, bcrypt, jsonwebtoken, cors, and devDependencies: jest, supertest, nodemon
src/config/db.js — connects to MongoDB using MONGO_URI from .env, with a clear error if connection fails
src/app.js — Express app setup (cors, json body parsing), exported (not started here, so tests can import it)
src/server.js — imports app.js and db.js, connects to DB, then starts the server on process.env.PORT
.env.example with MONGO_URI, JWT_SECRET, PORT
A test in tests/server.test.js using Jest + Supertest that hits a basic health-check route (GET /api/health returning {status: "ok"}) to confirm the app boots correctly

Follow TDD: show me the failing test first, then the implementation that makes it pass. Keep it clean — no logic beyond setup in this step.

### Prompt: 2

Add user registration to the backend. Following TDD (failing test first, then implementation):

Create src/models/User.js — a Mongoose schema with:
email: String, required, unique, lowercase
password: String, required (will store a bcrypt hash, never plain text)
role: String, enum ["customer", "admin"], default "customer"
timestamps: true
Create src/controllers/authController.js with a register function:
Validates email + password are present
Checks if email already exists → if so, return 400 with { error: "Email already registered" }
Hashes the password with bcrypt before saving
Ignores any role field the client sends — always defaults to "customer" (never let a client self-assign admin)
On success, returns 201 with { id, email, role } — never return the password, even hashed
Create src/routes/authRoutes.js with POST /api/auth/register wired to that controller, and mount it in app.js under /api/auth
Write tests in tests/auth.test.js covering: successful registration, duplicate email rejection, missing email/password rejection, and confirming password is hashed (not stored in plain text) and never present in the response.

Show me the failing tests first, then the implementation.

### Prompt : 3A

Add login functionality to the backend. For now, only write the test file — do NOT implement the login logic yet, I want to see it fail first.

Create tests in tests/auth.test.js (add to the existing file) for POST /api/auth/login, covering:

Successful login with correct email/password returns 200 with { token, user: { id, email, role } } — token should be a valid JWT string, user object must NOT include the password
Wrong password returns 401 with { error: "Invalid email or password" }
Non-existent email returns 401 with the same generic error (don't reveal whether the email exists — that's a security best practice, avoids leaking which emails are registered)
Missing email or password returns 400

Don't create the login route, controller, or any JWT logic yet — I just want the failing tests.

### Prompt : 3B

Now implement POST /api/auth/login to make the tests in tests/auth.test.js pass:

Add a login function to src/controllers/authController.js: finds user by email, compares password with bcrypt, generates a JWT (signed with process.env.JWT_SECRET, containing user id and role, expiring in 24h), returns { token, user: { id, email, role } }
Wire POST /api/auth/login in src/routes/authRoutes.js
Don't modify the tests — make the implementation match what they expect

### Prompt : 4A

Add a middleware that protects routes by requiring a valid JWT. For now, only write the test — do NOT implement the middleware yet.

Create tests/middleware/auth.test.js. Since this middleware doesn't have a real protected route to test against yet, create a temporary test route inside the test file itself: GET /api/test-protected that just returns { message: "success" } if the middleware lets the request through.

Cover these cases:

Request with a valid token in Authorization: Bearer <token> header → passes through, returns 200
Request with no Authorization header → 401 with { error: "No token provided" }
Request with an invalid/malformed token → 401 with { error: "Invalid token" }
Request with an expired token → 401 with { error: "Invalid token" }

Don't create src/middleware/auth.js yet — just the failing tests.

### Prompt : 4B

Now implement src/middleware/auth.js to make the tests in tests/middleware/auth.test.js pass:

Reads the Authorization header, expects format Bearer <token>
If missing, respond 401 { error: "No token provided" }
Verifies the token using process.env.JWT_SECRET
If invalid or expired, respond 401 { error: "Invalid token" }
If valid, attach the decoded payload (containing user id and role) to req.user, then call next()

Don't modify the tests — make the implementation match what they expect.

### Prompt : 5A

Add a middleware that restricts routes to admin users only. For now, only write the test — do NOT implement the middleware yet.

Create tests/middleware/admin.test.js. Like the auth middleware test, create a temporary test route inside the test file: mount it behind both the existing auth middleware and the new admin middleware, e.g. GET /api/test-admin, returning { message: "success" } if both pass.

Cover these cases:

Request with a valid token where role: "admin" → passes through, returns 200
Request with a valid token where role: "customer" → 403 with { error: "Admin access required" }
Request with no token at all → should still be blocked by the existing auth middleware (401), confirming the two middlewares compose correctly

Don't create src/middleware/admin.js yet — just the failing tests.

### Prompt : 5B

Now implement src/middleware/admin.js to make the tests in tests/middleware/admin.test.js pass:

Assumes it runs after the auth middleware, so req.user is already set
Checks req.user.role === "admin"
If not, respond 403 { error: "Admin access required" }
If yes, call next()

Don't modify the tests — make the implementation match what they expect.

### Prompt : 6A

Add the ability for admins to add vehicles to inventory. For now, only write the model and tests — do NOT implement the controller/route logic yet.

Create src/models/Vehicle.js — a Mongoose schema with:
make: String, required
model: String, required
category: String, required
price: Number, required, min 0
quantity: Number, required, min 0, default 0
timestamps: true
Create tests/vehicle.test.js covering POST /api/vehicles:
Admin with valid token + valid vehicle data → 201, returns created vehicle with all fields
Admin with missing required field (e.g. no make) → 400 validation error
Non-admin (customer role) with valid token → 403 { error: "Admin access required" }
No token at all → 401
Negative price or negative quantity → 400

You'll need to register/login a test admin user and a test customer user in the test setup to get valid tokens for each case (an admin user can be created directly via the User model in the test, bypassing the registration endpoint's default-to-customer behavior, since this is a controlled test environment).

Don't create the controller or route yet — just the model and failing tests.

### Prompt : 6B

Now implement POST /api/vehicles to make the tests in tests/vehicle.test.js pass:

Create src/controllers/vehicleController.js with a createVehicle function
Create src/routes/vehicleRoutes.js, mount POST /api/vehicles behind both authMiddleware and adminMiddleware
Mount the vehicle routes in app.js under /api/vehicles
Rely on the Mongoose schema for validation (required fields, min 0) — return 400 with the validation error message if it fails

Don't modify the tests — make the implementation match what they expect.

### Prompt : 7A

Add the ability to view all vehicles. For now, only write the test — do NOT implement yet.

Add to tests/vehicle.test.js, covering GET /api/vehicles:

No token at all → still returns 200 with the full list (this route is public, per our earlier decision to let anyone browse)
Returns an array of vehicle objects with all fields (make, model, category, price, quantity, id)
Empty database → returns 200 with an empty array []
Seed 2–3 vehicles in the test before the "returns list" case, and confirm the response includes all of them

Don't create the controller/route logic yet — just the failing tests.

### Prompt : 7B

Now implement GET /api/vehicles to make the tests pass:

Add a getAllVehicles function to src/controllers/vehicleController.js
Wire GET /api/vehicles in src/routes/vehicleRoutes.js — no middleware, this route is public
Returns all vehicles from the database as a JSON array

Don't modify the tests — make the implementation match what they expect.

### Prompt : 8A

Add search/filter functionality for vehicles. For now, only write the test — do NOT implement yet.

Add to tests/vehicle.test.js, covering GET /api/vehicles/search:

Seed 4–5 vehicles with varying make, model, category, and price before these tests
?make=Toyota → returns only Toyota vehicles
?category=SUV → returns only SUVs
?minPrice=20000&maxPrice=30000 → returns only vehicles in that price range
Combined filters, e.g. ?make=Toyota&category=Sedan → returns only vehicles matching both
No query params at all → returns all vehicles (same as GET /api/vehicles)
No matches → returns 200 with an empty array []
This route is public, no token required

Don't create the controller/route logic yet — just the failing tests.

### Prompt : 8B

Now implement GET /api/vehicles/search to make the tests pass:

Add a searchVehicles function to src/controllers/vehicleController.js — reads make, model, category, minPrice, maxPrice from req.query, builds a Mongoose filter object dynamically (only include a field in the filter if it was actually provided in the query), and queries the database
Wire GET /api/vehicles/search in src/routes/vehicleRoutes.js — public, no middleware
Important: this route must be registered BEFORE any future GET /api/vehicles/:id route (if one gets added later), otherwise Express would try to match "search" as an :id value

Don't modify the tests — make the implementation match what they expect.

### Prompt : 9A

Add the ability for admins to update a vehicle's details. For now, only write the test — do NOT implement yet.

Add to tests/vehicle.test.js, covering PUT /api/vehicles/:id:

Admin with valid token, updating one field (e.g. price) → 200, returns updated vehicle with that field changed and others unchanged
Admin with valid token, updating multiple fields at once → 200, all specified fields updated
Non-admin (customer role) with valid token → 403
No token → 401
Valid admin token but non-existent vehicle id → 404 { error: "Vehicle not found" }
Invalid update value (e.g. negative price) → 400

Don't create the controller/route logic yet — just the failing tests.

### Prompt : 9B

Now implement PUT /api/vehicles/:id to make the tests pass:

Add an updateVehicle function to src/controllers/vehicleController.js — finds the vehicle by id, updates only the fields provided in the request body, runs schema validation on the update (use runValidators: true if using findByIdAndUpdate), returns 404 if not found
Wire PUT /api/vehicles/:id in src/routes/vehicleRoutes.js, behind both authMiddleware and adminMiddleware

Don't modify the tests — make the implementation match what they expect.

### Prompt : 10A

Add the ability for admins to delete a vehicle. For now, only write the test — do NOT implement yet.

Add to tests/vehicle.test.js, covering DELETE /api/vehicles/:id:

Admin with valid token, existing vehicle id → 200 { message: "Vehicle deleted" }, and confirm the vehicle is actually gone (e.g. a follow-up GET /api/vehicles no longer includes it)
Non-admin (customer role) with valid token → 403
No token → 401
Valid admin token but non-existent vehicle id → 404 { error: "Vehicle not found" }

Don't create the controller/route logic yet — just the failing tests.

### Prompt : 10B

Now implement DELETE /api/vehicles/:id to make the tests pass:

Add a deleteVehicle function to src/controllers/vehicleController.js — finds and deletes the vehicle by id, returns 404 if not found, otherwise 200 with a confirmation message
Wire DELETE /api/vehicles/:id in src/routes/vehicleRoutes.js, behind both authMiddleware and adminMiddleware

Don't modify the tests — make the implementation match what they expect.

### Prompt : 11A

Add the ability for a logged-in user to purchase a vehicle (decreasing quantity by 1). For now, only write the test — do NOT implement yet.

Add to tests/vehicle.test.js, covering POST /api/vehicles/:id/purchase:

Any logged-in user (customer role is fine, doesn't need to be admin) with valid token, vehicle has quantity > 0 → 200, returns { id, quantity } with quantity decreased by exactly 1
Vehicle has quantity === 0 → 400 { error: "Vehicle out of stock" }, quantity stays at 0 (doesn't go negative)
No token → 401
Valid token but non-existent vehicle id → 404 { error: "Vehicle not found" }

Don't create the controller/route logic yet — just the failing tests.

### Prompt : 11B

Now implement POST /api/vehicles/:id/purchase to make the tests pass:

Add a purchaseVehicle function to src/controllers/vehicleController.js — finds the vehicle by id (404 if not found), checks quantity > 0 before decrementing (return 400 "Vehicle out of stock" if quantity is already 0), decreases quantity by 1, saves, returns { id, quantity }
Wire POST /api/vehicles/:id/purchase in src/routes/vehicleRoutes.js, behind authMiddleware only (any logged-in user, not admin-restricted)

Don't modify the tests — make the implementation match what they expect.

### Prompt : 12A

Add the ability for admins to restock a vehicle (increasing quantity). For now, only write the test — do NOT implement yet.

Add to tests/vehicle.test.js, covering POST /api/vehicles/:id/restock:

Admin with valid token, body { amount: 5 } → 200, returns { id, quantity } with quantity increased by 5
Non-admin (customer role) with valid token → 403
No token → 401
Admin token but missing/invalid amount (e.g. 0, negative, or non-numeric) → 400 { error: "Amount must be a positive number" }
Admin token but non-existent vehicle id → 404 { error: "Vehicle not found" }

Don't create the controller/route logic yet — just the failing tests.

### Prompt : 12B

Now implement POST /api/vehicles/:id/restock to make the tests pass:

Add a restockVehicle function to src/controllers/vehicleController.js — validates amount is a positive number (400 if not), finds vehicle by id (404 if not found), increases quantity by amount, saves, returns { id, quantity }
Wire POST /api/vehicles/:id/restock in src/routes/vehicleRoutes.js, behind both authMiddleware and adminMiddleware

Don't modify the tests — make the implementation match what they expect.