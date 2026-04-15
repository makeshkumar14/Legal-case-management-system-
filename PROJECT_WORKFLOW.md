# Legal Case Management System Workflow

## 1. Project Shape

This project has 2 main parts:

- `backend/`: Flask API, JWT auth, MySQL models, role-based business logic
- `src/`: React + Vite frontend with separate dashboards for `public`, `advocate`, and `court`

The app is role-driven:

- `public` means client / citizen
- `advocate` means lawyer
- `court` means court admin / registry side

## 2. Startup Flow

### Backend

Entry point:

- `backend/app.py`

What it does:

- loads config
- initializes `db`, `JWT`, `CORS`, `Mail`, `Bcrypt`
- registers all route blueprints
- exposes `/api/health`

Main backend blueprints:

- `backend/routes/auth.py`
- `backend/routes/cases.py`
- `backend/routes/hearings.py`
- `backend/routes/documents.py`
- `backend/routes/tasks.py`
- `backend/routes/notes.py`
- `backend/routes/notifications.py`
- `backend/routes/messages.py`
- `backend/routes/courtrooms.py`
- `backend/routes/analytics.py`

### Frontend

Entry point:

- `src/main.jsx`
- `src/App.jsx`

What it does:

- mounts React app
- wraps app in theme/auth/toast providers
- defines role-based routes
- uses `DashboardLayout` for logged-in users

## 3. Authentication Flow

Frontend auth state:

- `src/context/AuthContext.jsx`

API auth layer:

- `src/services/api.js`

Backend auth endpoints:

- `POST /api/auth/citizen/register`
- `POST /api/auth/citizen/send-otp`
- `POST /api/auth/citizen/verify-otp`
- `POST /api/auth/advocate/login`
- `POST /api/auth/admin/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

Login rules:

- citizen logs in with Aadhaar + OTP
- advocate logs in with Bar Council ID + password
- court logs in with Admin ID + password

After login:

- JWT token is stored in `localStorage`
- user object is stored in `localStorage`
- `api.js` attaches the token to protected requests
- invalid auth is cleared automatically and the UI returns to `/login`

## 4. Frontend Layout Flow

Main layout files:

- `src/layouts/DashboardLayout.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/layout/Navbar.jsx`

How navigation works:

- `Sidebar` holds role-specific menu items
- `Navbar` handles global search, notifications, and profile actions
- `App.jsx` maps each sidebar path to a real page

This was one of the main fixes:

- many sidebar options existed visually, but some of them previously routed back to dashboards or static pages
- now those routes point to working screens

## 5. Shared Data Layer

Important frontend service file:

- `src/services/api.js`

This file is the contract between the frontend and backend. It now exposes:

- `casesAPI`
- `tasksAPI`
- `documentsAPI`
- `hearingsAPI`
- `notificationsAPI`
- `notesAPI`
- `messagesAPI`
- `analyticsAPI`
- `courtroomsAPI`

It also emits sync events so pages can refresh after mutations without full reloads.

Helpful shared UI/data files:

- `src/utils/legalData.js`
- `src/utils/roleTheme.js`
- `src/components/shared/Modal.jsx`

## 6. Role Workflows

### Public / Client Workflow

Main pages:

- `src/pages/public/PublicDashboard.jsx`
- `src/pages/public/AdvancedSearchPage.jsx`
- `src/pages/shared/CaseWorkspacePage.jsx`
- `src/pages/shared/CaseDetailPage.jsx`
- `src/pages/shared/NotificationCenter.jsx`
- `src/pages/shared/MessagingPage.jsx`
- `src/pages/shared/ProfilePage.jsx`

Typical public flow:

1. Login with Aadhaar + OTP
2. Land on public dashboard
3. Use `My Cases` to see cases linked to the logged-in petitioner
4. Use `Search Case` to search accessible cases
5. Open case detail to view hearings, notes, documents, and timeline
6. Read notifications and send messages
7. Update profile from settings

### Advocate Workflow

Main pages:

- `src/pages/advocate/AdvocateDashboard.jsx`
- `src/pages/shared/CaseWorkspacePage.jsx`
- `src/pages/shared/CaseDetailPage.jsx`
- `src/pages/advocate/DocumentManagement.jsx`
- `src/pages/advocate/AdvocateCalendarPage.jsx`
- `src/pages/advocate/CaseNotesPage.jsx`
- `src/pages/advocate/TaskBoardPage.jsx`
- `src/pages/advocate/AdvocatePerformance.jsx`
- `src/pages/shared/MessagingPage.jsx`
- `src/pages/shared/NotificationCenter.jsx`

Typical advocate flow:

1. Login with Bar Council ID + password
2. Review assigned matters from dashboard or case list
3. Open a case and inspect detail tabs
4. Upload or verify documents
5. Manage hearings from calendar view
6. Maintain legal diary notes
7. Track work items in task board
8. Review performance summary
9. Use messages and notifications for coordination

### Court Workflow

Main pages:

- `src/pages/court/CourtDashboard.jsx`
- `src/pages/shared/CaseWorkspacePage.jsx`
- `src/pages/shared/CaseDetailPage.jsx`
- `src/pages/court/HearingScheduler.jsx`
- `src/pages/court/CourtRoomBoard.jsx`
- `src/pages/court/AdvocateDirectoryPage.jsx`
- `src/pages/court/ReportsPage.jsx`
- `src/pages/court/QRCodeCenter.jsx`
- `src/pages/shared/MessagingPage.jsx`
- `src/pages/shared/NotificationCenter.jsx`

Typical court flow:

1. Login with Admin ID + password
2. Review dashboard analytics and recent cases
3. Create or update cases
4. Manage hearing schedule
5. Update courtroom statuses
6. Review advocate directory
7. Use reports and CSV export for analytics
8. Generate or scan QR codes for case lookup
9. Use notifications and messages for operational updates

## 7. Backend Data Workflow

Core models:

- `backend/models/user.py`
- `backend/models/case.py`
- `backend/models/document.py`
- `backend/models/task.py`
- `backend/models/case_note.py`
- `backend/models/notification.py`
- `backend/models/message.py`
- `backend/models/courtroom.py`
- `backend/models/otp.py`

Important behavior:

- cases are the center of the system
- hearings, documents, notes, tasks, notifications, and messages all connect back to users or cases
- court actions can trigger notifications
- case updates can create hearing records and timeline entries

Useful backend improvement included in this round:

- case detail, search, and QR lookup now respect role-based access rules more cleanly

## 8. Main Improvements Added

Functional pages added or fixed:

- client `My Cases`
- client `Search Case`
- client `Notifications`
- client `Messages`
- advocate `Task Board`
- advocate `Legal Diary`
- advocate `Documents`
- advocate `Calendar`
- court `Hearings`
- court `Court Rooms`
- court `Advocates`
- court `Reports`
- court `QR Center`
- shared `Case Detail`
- shared `Profile`

Navigation improvements:

- all sidebar items now point to working pages
- navbar search routes correctly by role
- notification dropdown is live
- settings/profile navigation works

Backend compatibility improvements:

- notes, tasks, documents, and notifications now expose `databaseId` for update/delete flows
- messages include a usable sent timestamp

## 9. How Case Data Moves

Simple end-to-end example:

1. User logs in
2. JWT is saved in frontend auth context
3. Frontend page calls `casesAPI.list()` or `casesAPI.get(id)`
4. Flask route checks user identity from JWT
5. Backend returns only role-allowed case data
6. UI renders dashboard, list, or detail screen
7. When a case is updated, related screens can refresh from live API data

## 10. Best Files To Read First

If you want to understand the project quickly, read in this order:

1. `PROJECT_WORKFLOW.md`
2. `backend/app.py`
3. `backend/routes/auth.py`
4. `backend/routes/cases.py`
5. `src/App.jsx`
6. `src/services/api.js`
7. `src/components/layout/Sidebar.jsx`
8. `src/components/layout/Navbar.jsx`
9. one dashboard per role
10. `src/pages/shared/CaseDetailPage.jsx`

## 11. Run Commands

Backend:

```powershell
cd "c:\Users\MAKESH\OneDrive\Desktop\MAX(project)\Legal case management system\backend"
.\venv\Scripts\activate
python app.py
```

Frontend:

```powershell
cd "c:\Users\MAKESH\OneDrive\Desktop\MAX(project)\Legal case management system"
npm run dev
```

Open:

- frontend: `http://localhost:5173`
- backend health: `http://127.0.0.1:5000/api/health`
