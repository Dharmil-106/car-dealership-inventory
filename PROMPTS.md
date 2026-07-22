# AI Prompt Log

## Backend

I'm building a Node.js + Express backend (plain JavaScript, not TypeScript) for a car dealership inventory API, using MongoDB with Mongoose. Set up the initial project in /backend:

package.json with dependencies: express, mongoose, dotenv, bcrypt, jsonwebtoken, cors, and devDependencies: jest, supertest, nodemon
src/config/db.js — connects to MongoDB using MONGO_URI from .env, with a clear error if connection fails
src/app.js — Express app setup (cors, json body parsing), exported (not started here, so tests can import it)
src/server.js — imports app.js and db.js, connects to DB, then starts the server on process.env.PORT
.env.example with MONGO_URI, JWT_SECRET, PORT
A test in tests/server.test.js using Jest + Supertest that hits a basic health-check route (GET /api/health returning {status: "ok"}) to confirm the app boots correctly

Follow TDD: show me the failing test first, then the implementation that makes it pass. Keep it clean — no logic beyond setup in this step.