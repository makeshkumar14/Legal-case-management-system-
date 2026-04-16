# Legal Case Management System

Full-stack legal case management platform with role-based access for citizens, advocates, and court admins.

## Tech Stack

- Frontend: React + Vite
- Backend: Flask + SQLAlchemy + JWT
- Database: MySQL

## Project Structure

- `frontend/` - React frontend
- `backend/` - Flask backend API and models

## Quick Start

### 1) Backend

From `backend`:

```bash
venv\Scripts\activate
venv\Scripts\python.exe app.py
```

Backend runs on `http://127.0.0.1:5000`.

### 2) Frontend

From `frontend`:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Review Demo Data (Important)

To ensure enough mock data is available for review, run this from `backend`:

```bash
venv\Scripts\python.exe seed_review_data.py
```

This seed is **non-destructive** and will:

- ensure demo users for all roles exist
- ensure at least 20+ cases exist (current setup reaches 40)
- keep login credentials stable for review

Optional verification:

```bash
venv\Scripts\python.exe verify_review_flow.py
```

This checks login + role-based case visibility + status update propagation.

## Demo Login Credentials

### Citizen (OTP login)

- Aadhaar: `123456789012`
- Flow:
  - send OTP from login page
  - use displayed demo OTP to verify

### Advocate

- Bar Council ID: `BCI/MAH/2019/4521`
- Password: `password123`

### Court Admin

- Admin ID: `ADMIN001`
- Password: `admin123`

## Review Checklist

- login with all three roles
- citizen can view own case list and status
- advocate can view assigned cases
- court can view all cases and update status
- updated case status is visible to citizen
