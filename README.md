# Kata — Car Dealership Inventory System

A modern, full-stack Car Dealership Inventory & Management web application built with **Node.js, Express, MongoDB, React, Vite, and Tailwind CSS**. Features real-time vehicle browsing, dynamic multi-attribute filtering, customer purchasing with live inventory tracking, order history, and an admin portal for inventory management and metrics reporting.

---

## Table of Contents
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Admin Access Credentials](#admin-access-credentials)
- [Testing & Verification](#testing--verification)
- [AI-Assisted Development & Methodology](#ai-assisted-development--methodology)
- [API Reference](#api-reference)

---

## Features

### Customer Experience
- **Public Inventory Showcase:** Browse all available vehicles with real-time stock indicators, images, pricing, and category pills.
- **Dynamic Search & Filtering:** Filter vehicles instantly by Make, Model, Category, and Price Range (`minPrice` / `maxPrice`).
- **Seamless Auth:** Secure User Sign-up and Sign-in powered by JWT authentication and Bcrypt password hashing.
- **Vehicle Purchasing:** One-click vehicle purchase flow with modal confirmation, real-time stock decrement, and out-of-stock validation.
- **Customer Order History:** View a personal history of all purchased vehicles with purchase dates and prices paid.

### Admin Management Portal
- **Key Metrics Dashboard:** Real-time summary cards displaying Total Catalog Models, Total Inventory Value, Total Units in Stock, and Out of Stock alerts.
- **Inventory CRUD Operations:** Add new vehicle models, update vehicle specifications/pricing, and remove vehicles from inventory.
- **Stock Restocking:** Dedicated restocking tool to update physical vehicle inventory levels with immediate interface reflection.

---

## Screenshots

### 1. Public Inventory Dashboard
Browse the vehicle catalog with live stock status badges, dynamic category pills, and responsive card layouts.
![Public Inventory Dashboard](./screenshots/Screenshot%202026-07-23%20205754.png)

### 2. Vehicle Search & Dynamic Filtering
Filter vehicles by specific attributes such as Make, Model, Category, or Price boundaries.
![Filtered Vehicle Search](./screenshots/Screenshot%202026-07-23%20205807.png)

### 3. Customer Purchase Flow
Interactive modal confirmation dialog to finalize vehicle purchases securely.
![Purchase Confirmation Modal](./screenshots/Screenshot%202026-07-23%20205907.png)

### 4. Customer Order History ("My Purchases")
Personalized purchase summary listing purchased models, price paid, and transaction timestamp.
![My Purchases History](./screenshots/Screenshot%202026-07-23%20205918.png)

### 5. Admin Management Portal & Overview
Complete inventory overview with stock metrics, total inventory value calculation, and vehicle management table.
![Admin Overview Portal](./screenshots/Screenshot%202026-07-23%20205735.png)

### 6. Sign In Page
Clean, single-column sign-in form for existing users and administrators.
![Sign In Page](./screenshots/Screenshot%202026-07-23%20205825.png)

### 7. Registration Page
User account registration supporting instant customer account creation.
![Registration Page](./screenshots/Screenshot%202026-07-23%20205830.png)

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & Bcrypt password hashing
- **Testing:** Jest & Supertest (with `mongodb-memory-server` for isolated tests)

### Frontend
- **Framework:** React 19 (via Vite)
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **Icons:** Lucide React

---

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection string.

---

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `backend` folder based on `.env.example`:
   ```env
   MONGO_URI=mongodb://localhost:27017/car-dealership
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   ```

4. **Start the Backend Server:**
   - For development (with hot reloading via Nodemon):
     ```bash
     npm run dev
     ```
   - For standard production execution:
     ```bash
     npm start
     ```
   The backend server will run on `http://localhost:5000`.

5. **Run Backend Test Suite:**
   ```bash
   npm test
   ```

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   The frontend web application will run on `http://localhost:5173`.

---

### Admin Access Credentials

To log into the Admin Management Portal and access inventory management, metrics oversight, restocking, and vehicle CRUD controls, use the following credentials:

- **Email:** `john.doe@example.com`
- **Password:** `Password123`

---

## Testing & Verification

The backend is built following strict **Test-Driven Development (TDD)** principles. All endpoint contracts, security authorization boundaries, input validations, and stock mutation edge cases are thoroughly verified.

- 📄 View the full test suite log in **[test-report.md](./test-report.md)**

**Test Suite Summary:**
- **Total Test Suites:** 6 Passed (100%)
- **Total Tests:** 67 Passed (100%)
- **Coverage Areas:** User Auth, Vehicle Catalog, Search & Filtering, Admin Access Enforcement, Purchase Flow, Restocking logic, & Server Health.

---

## AI-Assisted Development & Methodology

This project was engineered using structured AI prompt iteration with **Antigravity AI (Gemini 3.6 Flash)** following a strict **TDD paired-prompt methodology**.

- 📄 View the complete prompt history log in **[PROMPTS.md](./PROMPTS.md)**

### Key AI Workflow Highlights:
1. **Red-Green-Refactor Cycle:** For every backend feature, a failing test assertion prompt (Prompt `XA`) was written first to lock down behavior, followed by an implementation prompt (Prompt `XB`) to fulfill the contract.
2. **Role-Based Security Enforcement:** AI prompts ensured middleware composition cleanly decoupled JWT verification (`auth.js`) from Admin permission checks (`admin.js`).
3. **Frontend Component Architecture:** UI development proceeded systematically across scaffolding, state management (`AuthContext`), catalog grids, search filter controls, and purchase flow integration.

---

## API Reference

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Public | Register a new customer account |
| `POST` | `/api/auth/login` | No | Public | Authenticate user and receive JWT |
| `GET` | `/api/vehicles` | No | Public | List all vehicles in inventory |
| `GET` | `/api/vehicles/search` | No | Public | Filter vehicles by make, category, price range |
| `POST` | `/api/vehicles/:id/purchase` | Yes | Customer/Admin | Purchase a vehicle (decrements quantity by 1) |
| `POST` | `/api/vehicles` | Yes | Admin | Create a new vehicle entry |
| `PUT` | `/api/vehicles/:id` | Yes | Admin | Update vehicle details |
| `DELETE` | `/api/vehicles/:id` | Yes | Admin | Delete a vehicle from inventory |
| `POST` | `/api/vehicles/:id/restock` | Yes | Admin | Restock vehicle quantity |