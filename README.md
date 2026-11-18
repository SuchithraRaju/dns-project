# DNS Response Validation & Diagnostic System

A web-based application for performing DNS queries, validating DNS responses, identifying DNS errors, and viewing diagnostic information.

## Live Project

Frontend Application (Vercel):https://dns-project.vercel.app/
Backend API (Render): https://dns-project-68xp.onrender.com/
Backend Health Check: https://dns-project-68xp.onrender.com/api/health

## Project Overview

The DNS Response Validation & Diagnostic System helps users perform DNS lookups and understand the responses returned by the DNS resolver.

Users can enter a domain name, select a DNS record type, and view the corresponding DNS response and diagnostic information.

## Folder Structure

```text
DNS-Response-Validation-Clean/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── services/
│   │   └── models/
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    ├── package.json
    └── .env.example
```

## Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML
- CSS
- Axios

### Backend
- Node.js
- Express.js
- DNS Promises API

### Database
- MongoDB Atlas

### Deployment and Version Control
- Vercel – Frontend deployment
- Render – Backend deployment
- Git and GitHub – Version control

## Key Features

- DNS query execution
- Support for multiple DNS record types
- DNS response validation
- Identification of NXDOMAIN and NODATA conditions
- Diagnostic result display
- DNS query history
- Backend and database health monitoring

## Supported DNS Record Types

| Record | Description |
|---|---|
| A | IPv4 Address |
| AAAA | IPv6 Address |
| MX | Mail Exchange |
| NS | Name Server |
| TXT | Text Record |
| CNAME | Canonical Name |

## Run Locally (Windows PowerShell)

### Backend Setup

Open the first terminal:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` and configure your MongoDB Atlas connection string.

Start the backend:

```powershell
npm run dev
```

### Frontend Setup

Open a second terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

Configure `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```powershell
npm run dev
```

Open the Vite URL printed in the terminal, usually:

http://localhost:5173

## Backend Environment Configuration

Configure `backend/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER_HOST/dnsDiagnosticDB?retryWrites=true&w=majority
```

Replace the placeholders with your own MongoDB Atlas database username, password, and cluster host.

URL-encode special characters in the password.

**Important:** Never commit `.env` files or expose database credentials.

## Frontend Environment Configuration

Configure `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Deployment

### Frontend – Vercel

- Platform: Vercel
- Framework: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:

```env
VITE_API_URL=https://dns-project-68xp.onrender.com
```

Live Frontend:

https://dns-project.vercel.app/

### Backend – Render

- Platform: Render
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
CLIENT_URL=https://dns-project.vercel.app
NODE_ENV=production
```

Live Backend:

https://dns-project-68xp.onrender.com/

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend and database health check |
| POST | `/api/dns/query` | Perform DNS lookup |
| GET | `/api/history` | Retrieve query history |

Example DNS query request:

```json
{
  "domain": "example.com",
  "recordType": "A"
}
```

## MongoDB Atlas Configuration

1. Configure a MongoDB Atlas database user with read/write permissions.
2. Add the MongoDB connection string to the backend environment variables.
3. Configure the appropriate network access rules.
4. Use the database name `dnsDiagnosticDB`.
5. Keep database credentials private.

## Health Check

Visit:

https://dns-project-68xp.onrender.com/api/health

The expected response includes:

- `status: "ok"`
- `api: "online"`
- `database: "connected"` when the database connection is successful.

## Important Technical Note

This application uses the host machine's configured DNS resolver through Node.js `dns/promises`.

It is not a raw DNS packet analyzer and does not perform DNSSEC verification.

## Author

**SuchithraRaju**

GitHub: https://github.com/SuchithraRaju

## Project Links

- Live Application: https://dns-project.vercel.app/
- Backend API: https://dns-project-68xp.onrender.com/
- GitHub Repository: https://github.com/SuchithraRaju/dns-project
