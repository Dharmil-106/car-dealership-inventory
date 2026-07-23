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

## Frontend 

### Prompt : 1

Set up a React frontend in /frontend using Vite, with Tailwind CSS configured. I want:

npm create vite@latest . -- --template react as the base
Tailwind installed and configured (tailwind.config.js, index.css with directives)
React Router installed and set up with routes: / (Dashboard), /login, /register — placeholder components for each for now, just enough to confirm routing works
A src/api/api.js file with a configured base URL (http://localhost:5000/api) using fetch, ready for auth/vehicle functions to be added next
Basic folder structure: src/components/, src/pages/, src/context/, src/api/

Keep this step minimal — just scaffolding and routing working, no real UI yet.

### Prompt : 2

Here's the context for this session: [paste full api-reference.md], and the design direction: [paste full design-brief.md]

Now build authentication for the frontend:

src/context/AuthContext.jsx — React context providing { user, token, login, register, logout }. On login/register success, store the token and user object in state (and in-memory only — no localStorage needed for now unless you want persistence across refreshes, in which case use localStorage carefully and read it on app load). Provide a loading/error state for UI feedback.
src/api/api.js — add loginUser(email, password) and registerUser(email, password) functions that call the backend per the API reference, handling both success and error responses (the API returns { error: "..." } on failure).
src/pages/Login.jsx and src/pages/Register.jsx — real forms now (not placeholders), styled per the design brief (centered, single column, clear labels, emerald primary button). Show validation/error messages inline if the API returns an error. On successful login, redirect to / (dashboard).
Update the nav/header (wherever it lives) to show Login/Register links when logged out, and the user's email + a Logout button when logged in.

Keep it functional first — styling should follow the design brief but don't over-polish yet, we'll do a dedicated styling pass later if needed.

### Prompt : 3

Continuing with the same API reference and design brief context from before. Now build the main dashboard:

src/api/api.js — add:
getAllVehicles() → calls GET /api/vehicles
searchVehicles(filters) → calls GET /api/vehicles/search with query params built from a filters object ({ make, model, category, minPrice, maxPrice }, only including keys that have values)
src/components/VehicleCard.jsx — displays one vehicle per the design brief: make + model (bold), category (small badge/pill), price (prominent, emerald), quantity/stock badge (emerald "In Stock" if > 0, red/gray "Out of Stock" if 0). Purchase button placeholder for now (disabled if quantity is 0) — full purchase logic comes in the next step, for now just render the button in the correct enabled/disabled state.
src/components/SearchFilters.jsx — a filter bar/form with inputs for make, model, category, min price, max price, and a "Search" button (and a "Clear filters" option). On submit, triggers the search.
src/pages/Dashboard.jsx — on mount, fetches all vehicles via getAllVehicles() and displays them in a responsive card grid (per design brief: 1 col mobile, 2–3 tablet, 4 desktop). Include the SearchFilters component above the grid — submitting filters calls searchVehicles() instead and re-renders the grid with results. Handle loading state (simple spinner/skeleton) and empty state ("No vehicles match your filters").

This should work for both logged-in and logged-out users, since browsing is public per the API reference.

### Prompt : 4

Continuing with the same context. Now wire up the purchase functionality:

src/api/api.js — add purchaseVehicle(vehicleId, token) → calls POST /api/vehicles/:id/purchase with the Authorization: Bearer <token> header (per the API reference, this requires any logged-in user, not admin-only).
In VehicleCard.jsx, wire the Purchase button:
If the user is not logged in (check via AuthContext), clicking Purchase should redirect to /login instead of calling the API (can't purchase without an account).
If logged in, clicking Purchase calls purchaseVehicle(). On success, update that vehicle's quantity in the UI immediately (no full page refetch needed) — decrement by 1, and disable the button if it hits 0.
On failure (e.g. someone else bought the last one between page load and click, returning the "out of stock" error), show an inline error message on the card and update the button to disabled/Out of Stock state.
Show a brief loading state on the button while the request is in flight (disable it, maybe a small spinner) to prevent double-clicks/double-purchases.

Keep the state update local to the Dashboard's vehicle list (e.g. update the array in state) rather than refetching the whole list from the server on every purchase — better UX, avoids unnecessary requests.

### Prompt : 5

Continuing with the context above (API reference, design brief, and existing app structure). Now build admin-only vehicle management:

src/api/api.js — add createVehicle(data, token), updateVehicle(id, data, token), deleteVehicle(id, token), restockVehicle(id, amount, token) — all calling their respective endpoints per the API reference with the Bearer token.
src/components/VehicleForm.jsx — a reusable form for both creating and editing a vehicle (make, model, category, price, quantity fields), styled per the design brief. Takes an optional existingVehicle prop — if provided, pre-fills the form for editing; if not, it's a blank create form. Calls createVehicle or updateVehicle accordingly on submit, shows validation/error messages inline.
In VehicleCard.jsx — conditionally show Edit, Delete, and Restock controls only if the logged-in user's role is "admin" (check via AuthContext). Delete should confirm before actually deleting (simple confirm dialog is fine). Restock can be a small inline form/button that prompts for an amount and calls restockVehicle.
Add a way to trigger "Add New Vehicle" (e.g. a button on the Dashboard, visible only to admins, opening VehicleForm in create mode — a modal or a separate route/page, your choice, whichever is simpler to wire).
All of these actions should update the local vehicle list state immediately on success (add/update/remove the relevant vehicle) rather than requiring a full page refetch.

Since these are all admin-only actions, also handle the case where a non-admin somehow triggers one anyway (shouldn't be possible via UI, but the backend will reject with 403 — show that error gracefully if it ever happens).
