# DNS Response Validation & Diagnostic System

A clean project layout with one backend and one frontend folder.

## Folder structure

```text
DNS-Response-Validation-Clean/
├── backend/
│   ├── src/server.js
│   ├── src/routes/
│   ├── src/services/
│   ├── src/models/
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    ├── package.json
    └── .env.example
```

## Run locally (Windows PowerShell)

Terminal 1 — backend:

```powershell
cd backend
npm install
Copy-Item .env.example .env
# Edit backend/.env and add your MongoDB Atlas URI and CLIENT_URL
npm run dev
```

Terminal 2 — frontend:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open the Vite URL printed in the frontend terminal (usually http://localhost:5173).

## Backend environment (`backend/.env`)

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER_HOST/dnsDiagnosticDB?retryWrites=true&w=majority
```

Replace the placeholders with your own Atlas database user, password, and cluster host. URL-encode special characters in the password. Never commit `.env` or share its contents.

## Frontend environment (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
```

## Fresh Render deployment

Create a new Web Service connected to the GitHub repository containing this project. Set:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Add Render environment variables:

- `MONGODB_URI`: your complete MongoDB Atlas URI
- `CLIENT_URL`: your deployed Vercel frontend origin, with no trailing slash
- `NODE_ENV`: `production`

Render provides `PORT` automatically. Do not add `VITE_API_URL` to Render.

## Fresh Vercel deployment

Import the same repository and set:

- Root Directory: `frontend`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Add this Vercel environment variable:

- `VITE_API_URL`: your Render backend base URL, for example `https://your-service.onrender.com` (no `/api` suffix)

After deploying Vercel, copy its exact production URL into Render's `CLIENT_URL`, then redeploy the Render service if you changed that variable.

## Health check

Open `https://YOUR-RENDER-SERVICE.onrender.com/api/health`.

Expected fields include `status: "ok"`, `api: "online"`, and `database: "connected"` once Atlas has connected.

## API endpoints

- `GET /api/health`
- `POST /api/dns/query` with JSON `{ "domain": "example.com", "recordType": "A" }`
- `GET /api/history`

Supported DNS record types: A, AAAA, MX, NS, TXT, CNAME.

## MongoDB Atlas checklist

1. Confirm the Atlas database user has read/write access.
2. Confirm the password in `MONGODB_URI` is current and URL-encoded if needed.
3. Add the appropriate Render network access rule in Atlas. A temporary `0.0.0.0/0` rule permits access from anywhere; use only with a strong password and tighten it when possible.
4. Keep the database name `dnsDiagnosticDB`.

## Important

This app uses the host machine's configured DNS resolver through Node's `dns/promises`. It is not a raw DNS packet analyzer and does not perform DNSSEC verification.
