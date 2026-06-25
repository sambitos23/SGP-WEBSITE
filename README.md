# SGP Website — Siliguri Government Polytechnic

A full-stack website for Siliguri Government Polytechnic featuring user authentication (signup/login) and a contact form, built with a static frontend and a serverless Node.js backend deployed on **Vercel** with **MongoDB Atlas** as the database.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [MongoDB Atlas Setup](#mongodb-atlas-setup)
5. [Local Development](#local-development)
6. [Deploying to Vercel](#deploying-to-vercel)
7. [Environment Variables](#environment-variables)
8. [API Endpoints](#api-endpoints)
9. [How It Works](#how-it-works)
10. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
SGP-WEBSITE/
├── api/
│   ├── contact.js        # Serverless function: POST /api/contact
│   ├── login.js          # Serverless function: POST /api/login
│   └── signup.js         # Serverless function: POST /api/signup
├── lib/
│   ├── Contact.js        # Mongoose Contact model
│   ├── User.js           # Mongoose User model
│   ├── cors.js           # CORS helper for serverless functions
│   └── mongodb.js        # MongoDB connection utility (cached for serverless)
├── images/               # Static images (logo, banner, about)
├── index.html            # Frontend (single page)
├── styles.css            # Frontend styles
├── script.js             # Frontend JavaScript (auth, contact form, UI)
├── dev-server.js         # Local development server (serves frontend + API)
├── vercel.json           # Vercel build & routing configuration
├── package.json          # Dependencies and scripts
├── .env.example          # Template for environment variables
├── .gitignore            # Files excluded from Git
└── README.md             # This file
```

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Vanilla HTML, CSS, JavaScript       |
| Backend   | Node.js (Vercel Serverless Functions) |
| Database  | MongoDB Atlas (cloud-hosted)        |
| ODM       | Mongoose 8.x                        |
| Hosting   | Vercel (frontend + backend)         |
| Security  | PBKDF2 password hashing (100k iterations, SHA-512) |

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** — [Download](https://git-scm.com/)
- A **MongoDB Atlas** account (free tier works) — [Sign up](https://www.mongodb.com/cloud/atlas/register)
- A **Vercel** account (free tier works) — [Sign up](https://vercel.com/signup)
- A **GitHub** account (to connect your repo to Vercel)

---

## MongoDB Atlas Setup

Follow these steps to create your free cloud database:

### Step 1: Create a Cluster

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Click **"Build a Database"** (or "Create" if you already have a project).
3. Choose **M0 Free Tier** (Shared).
4. Select a cloud provider and region close to your users (e.g., AWS Mumbai for India).
5. Name your cluster (e.g., `sgp-cluster`) and click **"Create Deployment"**.

### Step 2: Create a Database User

1. In the **Security → Database Access** section, click **"Add New Database User"**.
2. Choose **Password** authentication.
3. Set a username (e.g., `admin`) and a strong password.
4. Under "Database User Privileges", select **"Read and write to any database"**.
5. Click **"Add User"**.

> **Important:** Remember this username and password — you'll need them for the connection string.

### Step 3: Allow Network Access

1. Go to **Security → Network Access**.
2. Click **"Add IP Address"**.
3. Click **"Allow Access from Anywhere"** (sets it to `0.0.0.0/0`).
   - This is required for Vercel serverless functions since they use dynamic IPs.
4. Click **"Confirm"**.

### Step 4: Get Your Connection String

1. Go to **Database → Clusters** and click **"Connect"** on your cluster.
2. Choose **"Drivers"** (Node.js).
3. Copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster-hostname>/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with the credentials you set in Step 2.
5. Add a database name after the `/` (e.g., `sgp-website`):
   ```
   mongodb+srv://<username>:<password>@<cluster-hostname>/sgp-website?retryWrites=true&w=majority
   ```

This is your `MONGODB_URI`.

---

## Local Development

### Step 1: Clone and Install

```bash
git clone https://github.com/sambitos23/SGP-WEBSITE.git
cd SGP-WEBSITE
npm install
```

### Step 2: Set Up Environment Variables

```bash
cp .env.example .env
```

Open `.env` and paste your MongoDB Atlas connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-hostname>/sgp-website?retryWrites=true&w=majority
```

### Step 3: Run the Local Dev Server

```bash
npm run dev
```

This starts the local development server at `http://localhost:3000`. It serves both the frontend and the API endpoints from the same port — no CORS issues.

**Available locally:**
- Frontend: `http://localhost:3000`
- Signup API: `POST http://localhost:3000/api/signup`
- Login API: `POST http://localhost:3000/api/login`
- Contact API: `POST http://localhost:3000/api/contact`

---

## Deploying to Vercel

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: SGP website with MongoDB backend"
git branch -M main
git remote add origin https://github.com/sambitos23/SGP-WEBSITE.git
git push -u origin main
```

### Step 2: Import Project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Click **"Import Git Repository"** and select your GitHub repo.
3. Vercel will auto-detect the framework as "Other".
4. **Before deploying**, expand **"Environment Variables"** and add:

   | Key          | Value                                                                 |
   |--------------|-----------------------------------------------------------------------|
   | `MONGODB_URI` | Your Atlas connection string (from Step 4 of MongoDB Atlas Setup above) |

5. Click **"Deploy"**.

### Step 3: Verify Deployment

Once deployed, Vercel gives you a URL like `https://sgp-website.vercel.app`. Open it and test:

- The homepage loads with all content and images.
- Click "Log In / Sign Up" — create an account, then log in.
- Submit the contact form — message gets stored in MongoDB.
- Check MongoDB Atlas → Database → Browse Collections to see the data.

### Subsequent Deployments

Every push to `main` on GitHub will automatically trigger a new deployment on Vercel. No manual action needed.

---

## Environment Variables

| Variable     | Description                        | Required |
|--------------|------------------------------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string   | Yes      |

### Where to Set Them

- **Locally:** In a `.env` file (never commit this file).
- **On Vercel:** Project Settings → Environment Variables.

---

## API Endpoints

### POST `/api/signup`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created.",
  "user": { "name": "John Doe", "email": "john@example.com" }
}
```

**Error Responses:**
- `400` — Missing fields or password too short
- `409` — Email already registered
- `500` — Server error

---

### POST `/api/login`

Authenticates an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "user": { "name": "John Doe", "email": "john@example.com" }
}
```

**Error Responses:**
- `400` — Missing email or password
- `401` — Incorrect password
- `404` — No account with this email
- `500` — Server error

---

### POST `/api/contact`

Stores a contact form submission.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Admission Query",
  "message": "I would like to know about the admission process."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully! We will get back to you soon."
}
```

**Error Responses:**
- `400` — Missing required fields (name, email, or message)
- `500` — Server error

---

## How It Works

### Architecture

```
Browser (index.html + script.js)
    │
    │  fetch('/api/signup', { ... })
    │  fetch('/api/login', { ... })
    │  fetch('/api/contact', { ... })
    ▼
Vercel Edge Network
    │
    │  Routes /api/* to serverless functions
    │  Routes everything else to static files
    ▼
Serverless Functions (api/signup.js, api/login.js, api/contact.js)
    │
    │  Connects via lib/mongodb.js (cached connection)
    │  Uses lib/User.js and lib/Contact.js (Mongoose models)
    ▼
MongoDB Atlas (cloud database)
    ├── users collection       (signup/login data)
    └── contacts collection    (contact form submissions)
```

### Password Security

- Passwords are **never stored in plain text**.
- Each user gets a unique random **salt** (16 bytes).
- The password is hashed using **PBKDF2** with 100,000 iterations and SHA-512.
- On login, the same salt + algorithm is used to recompute the hash and compare.

### Serverless Connection Caching

Vercel serverless functions are stateless, but they can reuse "warm" containers. The `lib/mongodb.js` utility caches the Mongoose connection globally so that:
- First invocation: opens a new connection.
- Subsequent invocations (on the same warm container): reuses the existing connection.

This avoids the overhead of reconnecting to MongoDB on every single request.

### CORS Handling

The `lib/cors.js` utility sets the appropriate CORS headers and handles preflight `OPTIONS` requests. This ensures the API works correctly both locally and in production.

---

## MongoDB Collections

### `users` Collection

| Field        | Type   | Description                      |
|--------------|--------|----------------------------------|
| `name`       | String | User's full name                 |
| `email`      | String | User's email (unique, lowercase) |
| `salt`       | String | Random salt for password hashing |
| `passwordHash` | String | PBKDF2 hashed password         |
| `createdAt`  | Date   | Account creation timestamp       |
| `updatedAt`  | Date   | Last update timestamp            |

### `contacts` Collection

| Field     | Type   | Description                     |
|-----------|--------|---------------------------------|
| `name`    | String | Sender's full name              |
| `email`   | String | Sender's email                  |
| `subject` | String | Message subject (optional)      |
| `message` | String | Message content                 |
| `createdAt` | Date | Submission timestamp            |
| `updatedAt` | Date | Last update timestamp           |

---

## Troubleshooting

### "MONGODB_URI is not defined" error

- **Locally:** Make sure you have a `.env` file with the variable set.
- **On Vercel:** Go to Project Settings → Environment Variables and verify it's added.

### "MongoServerError: bad auth" / Connection refused

- Double-check your username and password in the connection string.
- Make sure you replaced `<password>` with the actual password (no angle brackets).
- Verify the database user has "Read and write to any database" permissions.

### "MongoNetworkError: connection timed out"

- Go to MongoDB Atlas → Network Access and ensure `0.0.0.0/0` is allowed.
- This is required because Vercel functions use dynamic IP addresses.

### "querySrv ENOTFOUND" error

- Your connection string has placeholder values. Replace the cluster URL with your actual Atlas cluster hostname.
- The correct hostname is visible in Atlas → Database → Connect → Drivers.

### CORS error in browser

- Make sure you're accessing the site via `http://localhost:3000` (not opening `index.html` directly as `file:///...`).
- The dev server serves frontend and API from the same port, eliminating CORS.
- On Vercel, everything is same-origin so CORS isn't an issue in production.

### Signup says "Account already exists" but you just created the DB

- The email check is case-insensitive. Try with a different email.
- Check MongoDB Atlas → Browse Collections to see existing documents.

### Frontend loads but API calls fail (404)

- Make sure `vercel.json` is in the project root.
- Verify the `api/` folder is at the project root (not nested inside another folder).
- Redeploy on Vercel if you recently added `vercel.json`.

### Local dev server not finding API routes

- Make sure you're running `npm run dev` (uses `dev-server.js`).
- Make sure `npm install` was run to install dependencies.

---

## License

This project is for educational purposes as part of Siliguri Government Polytechnic coursework.
