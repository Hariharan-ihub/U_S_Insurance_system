# HealthGuard Insurance Portal

A premium, responsive, and secure React + TypeScript Single Page Application (SPA) designed for modern health insurance portals. Built with Vite, styled using Tailwind CSS, and fully integrated with backend **n8n Workbench** workflows for authentication, PHI data retrieval, and session verification.

---

## 🚀 Key Architectural Highlights

- **Dynamic Hashing Resolution**: Implements a zero-exposure client-side password hashing flow supporting both **Argon2id** (via WebAssembly `hash-wasm`) and **PBKDF2-SHA512** (via browser `WebCrypto`).
- **Hybrid Proxy System**: Features a local Vite development server middleware (`localBackendPlugin`) which acts as both a mock MongoDB server and a gateway proxy to the live n8n Workbench environment.
- **Dedicated Page Endpoints**: Decoupled page data lookups (Policy, Claims, Billing) to support real-time data fetching from database collections instead of dashboard-level payload bundling.
- **Secure Chat Authentication**: Generates signed user tokens to authorize embeddable chat iframe conversations automatically.

---

## 🛠️ Workbench (n8n) Workflows & API Specification

The portal communicates with the n8n Workbench API endpoints over HTTPS. In `live` proxy mode, the local Vite dev server proxies request paths starting with `/webhook/` to the live gateway at `https://api.agents.snsihub.ai`.

### 1. Authentication Workflows (Opaque Gateway)

#### 🔑 Member Login Workflow (`WF-1`)
- **Endpoint**: `/webhook/auth/opaque/login`
- **Method**: `POST`
- **Description**: Authenticates a member by verifying their email and hashed credentials.
- **Dynamic Hashing Flow**:
  1. The client queries the local `/webhook/auth/salt?email=...` endpoint to retrieve the user's salt and hashing algorithm details (memory, iterations, parallelism).
  2. The client computes the matching hash (Argon2id encoded string or `salt_hex:hash_hex` PBKDF2 string) in the browser.
  3. The client submits the computed hash inside the `password` payload.
  4. The n8n code node runs a direct equality check (`receivedHash === storedHash`) to validate the credentials.
- **Payload**:
  ```json
  {
    "email": "member@email.com",
    "password": "$argon2id$v=19$m=19456,t=2,p=1$salt$hash"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "access_token": "acc_...",
    "refresh_token": "ref_...",
    "user_token": "JWT_...",
    "expires_in": 900,
    "member": {
      "member_id": "uuid-...",
      "first_name": "David",
      "last_name": "Jones",
      "email": "member@email.com"
    }
  }
  ```

#### 🔄 Token Refresh Workflow (`WF-2`)
- **Endpoint**: `/webhook/auth/refresh`
- **Method**: `POST`
- **Description**: Reissues a fresh Access Token using a valid Refresh Token.
- **Payload**:
  ```json
  {
    "refresh_token": "ref_..."
  }
  ```

#### 🚪 Logout Workflow (`WF-3`)
- **Endpoint**: `/webhook/auth/logout`
- **Method**: `POST`
- **Description**: Destroys the current active session in the database.
- **Payload**:
  ```json
  {
    "session_id": "sess_...",
    "access_token": "acc_..."
  }
  ```

#### 🛡️ Session Verification Workflow (`WF-4`)
- **Endpoint**: `/webhook/auth/verify`
- **Method**: `POST`
- **Description**: Validates the active Access Token and returns the refreshed profile context of the member.
- **Payload**:
  ```json
  {
    "access_token": "acc_..."
  }
  ```

---

### 2. Member & PHI Data Workflows (`WF-5`)

All protected requests require an `Authorization: Bearer <access_token>` header.

#### 📊 Dashboard Workflow (`WF-5a`)
- **Endpoint**: `/webhook/member/dashboard`
- **Method**: `POST`
- **Description**: Aggregates metadata for policies, billing invoice progress, and recent claims into a single dashboard payload.

#### 📜 Policy Details Workflow (`WF-5b`)
- **Endpoint**: `/webhook/member/policy`
- **Method**: `POST`
- **Description**: Retrieves full policy, plan tier, effective dates, and deductible/out-of-pocket accumulators.

#### 📑 Claims History Workflow (`WF-5c`)
- **Endpoint**: `/webhook/member/claims`
- **Method**: `POST`
- **Description**: Retrieves the complete claims list, sorted by date, including providers, statuses, and billed amounts.

#### 💳 Billing & Transactions Workflow (`WF-5d`)
- **Endpoint**: `/webhook/member/billing`
- **Method**: `POST`
- **Description**: Retrieves invoice billing status, premium details, automatic payments preferences, and historical transactions.

#### 💬 Chat Session Context Workflow (`WF-Session`)
- **Endpoint**: `/webhook/session`
- **Method**: `POST`
- **Description**: Fetches or clears the conversation chat context array in the database.
- **Payload**:
  ```json
  {
    "session_id": "sess_...",
    "action": "clear" // optional, clears chat log
  }
  ```

---

## 🗄️ Database & Mock Credentials

The application connects to a MongoDB Atlas cluster. For local development, testing, and debugging purposes, **all 1,000 member accounts in the database have their passwords set to their own email address** (e.g. `brandon.white@icloud.com` uses password `brandon.white@icloud.com`).

---

## 🛠️ Environment Configuration (`.env`)

Create a `.env` file in the root directory:

```env
# Proxy Mode: 'local' (uses local MongoDB mock) or 'live' (proxies requests to live n8n)
VITE_PROXY_MODE=live

# Port settings
PORT=5173

# Live Connection Credentials (local mock proxy lookup only)
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
DATABASE_NAME=insurance_records
VITE_INTEGRATION_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 💻 Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build Production Bundle
```bash
npm run build
```
The compiled files will be output to the `dist/` directory, optimized and ready to deploy as a static asset bundle.
