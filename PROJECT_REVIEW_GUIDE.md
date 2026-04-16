# Legal Case Management System - Review Guide

## 1. What This Project Is

This is a full-stack Legal Case Management System built to help three main users:

- `Citizen/Public user`: track their case, view hearings, and receive updates.
- `Advocate`: manage assigned cases, evidence, notes, tasks, calendar, and messages.
- `Court admin`: register cases, schedule hearings, manage courtrooms, monitor analytics, and generate reports.

The project uses:

- `Frontend`: React + Vite + Tailwind
- `Backend`: Flask + SQLAlchemy
- `Database`: MySQL
- `Authentication`: JWT + OTP/password login flows

## 2. High-Level Architecture

The flow is:

1. `frontend/src/` shows the UI and handles routing.
2. `frontend/src/services/api.js` sends requests from frontend to backend.
3. `backend/routes/` contains API endpoints and business logic.
4. `backend/models/` defines database tables and object relationships.
5. `backend/utils/exporters.py` generates CSV/PDF/report outputs.
6. MySQL stores users, cases, hearings, documents, messages, notes, tasks, and notifications.

## 3. Project Structure Split

This project is best explained in three parts:

### Frontend

These files belong to the React application:

```text
Frontend
|-- frontend/
|   |-- index.html
|   |-- package.json
|   |-- package-lock.json
|   |-- vite.config.js
|   |-- eslint.config.js
|   |-- public/
|   |-- src/
|   |-- dist/             generated build output
|   `-- node_modules/     installed npm packages
```

### Backend

These files belong to the Flask application:

```text
Backend
|-- backend/
|   |-- app.py
|   |-- config.py
|   |-- requirements.txt
|   |-- schema.sql
|   |-- models/
|   |-- routes/
|   |-- utils/
|   |-- seed.py
|   |-- seed_large.py
|   |-- seed_review_data.py
|   |-- verify_review_flow.py
|   |-- uploads/      runtime uploaded files
|   |-- venv/         local Python environment
```

### Support and Documentation

These are not part of the main runtime flow, but they support the project:

```text
Support / Docs
|-- scripts/
|-- report_assets/
|-- .vscode/
|-- README.md
|-- PROJECT_WORKFLOW.md
|-- project_review.txt
|-- Project_Report.txt
|-- build_check.txt
|-- build_err.txt
|-- Legal_Case_Management_DBMS_Report.docx
```

## ######################################### 4. Frontend Top-Level Files

These files are inside the `frontend/` folder:

- `frontend/index.html`: Main HTML shell used by Vite to mount the React app.
  Why we use it: every React/Vite app needs a browser entry page with a `root` element.

- `frontend/package.json`: Defines frontend dependencies and scripts like `dev`, `build`, `lint`, and `preview`.
  Why we use it: npm reads this file to install packages and run the project.

- `frontend/package-lock.json`: Exact dependency lock file for consistent installs.
  Why we use it: keeps the same package versions across machines.

- `frontend/vite.config.js`: Configures Vite with React and Tailwind support.
  Why we use it: Vite needs this to run the frontend development server and production build.

- `frontend/eslint.config.js`: Linting rules for JavaScript and React.
  Why we use it: helps catch code-quality issues early.

## 5. Frontend Structure

### Frontend Tree

```text
Frontend
|-- frontend/
|   |-- index.html
|   |-- package.json
|   |-- package-lock.json
|   |-- vite.config.js
|   |-- eslint.config.js
|   |-- public/
|   |   `-- vite.svg
|   `-- src/
|       |-- main.jsx
|       |-- App.jsx
|       |-- App.css
|       |-- index.css
|       |-- assets/
|       |-- components/
|       |   |-- layout/
|       |   `-- shared/
|       |-- context/
|       |-- data/
|       |-- layouts/
|       |-- pages/
|       |   |-- auth/
|       |   |-- public/
|       |   |-- shared/
|       |   |-- advocate/
|       |   `-- court/
|       |-- services/
|       `-- utils/
```

### Core Entry Files

All `src/...` paths below are relative to the `frontend/` folder.

- `src/main.jsx`: React entry point that renders `<App />`.
  Why we use it: starts the frontend application.

- `src/App.jsx`: Main router and access-control file; wraps the app with theme, auth, and toast providers.
  Why we use it: central place for route definitions and protected navigation.

- `src/index.css`: Global styles, theme variables, animations, FullCalendar styling, and shared UI polish.
  Why we use it: applies app-wide styles once.

- `src/App.css`: Mostly leftover default Vite starter CSS.
  Why we use it: legacy styling file from project bootstrap.

### Context

- `src/context/AuthContext.jsx`: Stores logged-in user and token in local storage, and exposes login/logout helpers.
  Why we use it: shares authentication state across the app.

- `src/context/ThemeContext.jsx`: Theme abstraction for light/dark behavior, currently fixed to light mode.
  Why we use it: keeps theming logic centralized even if the design changes later.

### Services

- `src/services/api.js`: Central API client for auth, cases, documents, hearings, notes, tasks, messages, analytics, notifications, and courtrooms.
  Why we use it: keeps backend communication in one reusable file instead of scattering fetch logic everywhere.

### Layout

- `src/layouts/DashboardLayout.jsx`: Shared authenticated page shell with sidebar, navbar, and content outlet.
  Why we use it: avoids repeating layout code on every dashboard page.

### Components - Layout

- `src/components/layout/Sidebar.jsx`: Role-based sidebar menu for citizen, advocate, and court users.
  Why we use it: changes navigation based on user role.

- `src/components/layout/Navbar.jsx`: Top bar with breadcrumbs, search, notifications, and profile/logout menu.
  Why we use it: gives global navigation and quick actions.

### Components - Shared

- `src/components/shared/Toast.jsx`: Reusable toast notification system.
  Why we use it: shows success/error/info feedback to users.

- `src/components/shared/Modal.jsx`: Reusable modal and confirm-dialog component.
  Why we use it: standardizes dialog behavior across pages.

- `src/components/shared/StatusBadge.jsx`: Styled status labels for cases, priorities, and document states.
  Why we use it: keeps status colors and labels consistent.

- `src/components/shared/Timeline.jsx`: Timeline view for case events.
  Why we use it: presents chronological case history clearly.

- `src/components/shared/QRCodeViewer.jsx`: Displays a generated QR code.
  Why we use it: helps share case/report links quickly.

- `src/components/shared/QRCodeScanner.jsx`: Scans QR codes using camera access.
  Why we use it: lets users retrieve case data through QR scanning.

- `src/components/shared/AnimatedCard.jsx`: Shared animated content card wrapper.
  Why we use it: gives consistent motion and card styling.

- `src/components/shared/CountdownTimer.jsx`: Live countdown for upcoming hearings.
  Why we use it: highlights urgency and upcoming deadlines.

- `src/components/shared/ChatBot.jsx`: Demo chatbot with predefined response behavior.
  Why we use it: adds assistant-style help for the interface.

- `src/components/shared/LoadingSkeleton.jsx`: Placeholder loading UI.
  Why we use it: improves perceived performance while data loads.

### Pages - Auth

- `src/pages/auth/LoginPage.jsx`: Login page for citizen OTP login, advocate password login, and court admin login.
  Why we use it: supports all role-based authentication methods in one screen.

- `src/pages/auth/SignupPage.jsx`: Registration page for citizen and advocate accounts.
  Why we use it: allows new users to onboard into the system.

### Pages - Public

- `src/pages/public/PublicDashboard.jsx`: Citizen dashboard showing cases, stats, notifications, upcoming hearing, timeline, and QR features.
  Why we use it: gives the public user a self-service case tracking view.

- `src/pages/public/AdvancedSearchPage.jsx`: Search/filter page for finding cases quickly.
  Why we use it: makes case discovery easier with filters.

### Pages - Shared

- `src/pages/shared/CaseWorkspacePage.jsx`: Common case-list page reused across roles.
  Why we use it: reduces duplicate code for case browsing and filtering.

- `src/pages/shared/CaseDetailPage.jsx`: Detailed case page with tabs for overview, hearings, documents, timeline, and notes.
  Why we use it: acts as the main in-depth case workspace.

- `src/pages/shared/NotificationCenter.jsx`: Full notification inbox page.
  Why we use it: users can read, filter, and manage updates.

- `src/pages/shared/MessagingPage.jsx`: User-to-user message interface.
  Why we use it: supports communication inside the platform.

- `src/pages/shared/ProfilePage.jsx`: User profile, preferences, and security screen.
  Why we use it: lets users manage their own account settings.

### Pages - Advocate

- `src/pages/advocate/AdvocateDashboard.jsx`: Main advocate overview page with stats, cases, tasks, evidence, calendar, and notifications.
  Why we use it: gives advocates a daily work dashboard.

- `src/pages/advocate/DocumentManagement.jsx`: Upload, view, edit, verify, download, and delete case documents.
  Why we use it: manages legal evidence and attachments.

- `src/pages/advocate/CaseNotesPage.jsx`: Case-wise notes management page.
  Why we use it: helps advocates keep legal strategy and observations.

- `src/pages/advocate/TaskBoardPage.jsx`: Task board with status columns like to-do, in-progress, and done.
  Why we use it: tracks advocate work items visually.

- `src/pages/advocate/AdvocateCalendarPage.jsx`: Calendar view of hearings and schedule items.
  Why we use it: helps advocates manage upcoming court dates.

- `src/pages/advocate/AdvocatePerformance.jsx`: Advocate analytics and performance charts.
  Why we use it: shows reporting metrics like workload and outcomes.

### Pages - Court

- `src/pages/court/CourtDashboard.jsx`: Main court admin panel for case registration, status updates, dashboard stats, exports, and quick actions.
  Why we use it: central operational screen for court staff.

- `src/pages/court/HearingScheduler.jsx`: Hearing CRUD page with room scheduling and availability checks.
  Why we use it: manages hearing planning without room conflicts.

- `src/pages/court/CourtRoomBoard.jsx`: Courtroom board that tracks room usage/status.
  Why we use it: helps monitor live room availability.

- `src/pages/court/AdvocateDirectoryPage.jsx`: Searchable advocate directory.
  Why we use it: court users can view available advocates and related information.

- `src/pages/court/ReportsPage.jsx`: Reporting and analytics page with charts and exports.
  Why we use it: gives management-level insight into cases and performance.

- `src/pages/court/QRCodeCenter.jsx`: QR generation and QR scan lookup center.
  Why we use it: provides quick report sharing and case retrieval.

### Utilities and Data

- `src/utils/roleTheme.js`: Role-based color/theme helpers.
  Why we use it: keeps role-specific styling consistent.

- `src/utils/legalData.js`: Shared formatting and normalization helpers for legal/case data.
  Why we use it: avoids repeating data transformation code.

- `src/utils/fileActions.js`: Browser helpers for opening/downloading files.
  Why we use it: standardizes file behavior in the frontend.

- `src/data/mockData.js`: Static mock sample data used during earlier UI development or fallback demos.
  Why we use it: useful for prototyping before live APIs are ready.

- `src/assets/react.svg`: Default starter asset from Vite/React template.
  Why we use it: leftover template asset, not core business logic.

## 6. Backend Structure

### Backend Tree

```text
backend/
|-- app.py
|-- config.py
|-- requirements.txt
|-- schema.sql
|-- seed.py
|-- seed_large.py
|-- seed_review_data.py
|-- verify_review_flow.py
|-- test_api.py
|-- schema_audit.py
|-- check_users.py
|-- get_advocate_creds.py
|-- list_citizens.py
|-- models/
|   |-- __init__.py
|   |-- user.py
|   |-- case.py
|   |-- document.py
|   |-- task.py
|   |-- case_note.py
|   |-- notification.py
|   |-- message.py
|   |-- courtroom.py
|   `-- otp.py
|-- routes/
|   |-- __init__.py
|   |-- auth.py
|   |-- cases.py
|   |-- hearings.py
|   |-- documents.py
|   |-- tasks.py
|   |-- notes.py
|   |-- notifications.py
|   |-- messages.py
|   |-- courtrooms.py
|   `-- analytics.py
|-- utils/
|   |-- __init__.py
|   `-- exporters.py
|-- uploads/
|-- venv/
```

### Backend Core

- `backend/app.py`: Main Flask application entry point; initializes extensions, registers routes, creates tables, and exposes health check.
  Why we use it: starts the backend server and wires everything together.

- `backend/config.py`: Central configuration for database, JWT, email, uploads, and CORS.
  Why we use it: keeps environment-specific settings organized in one place.

- `backend/requirements.txt`: Python dependency list for the backend.
  Why we use it: installs Flask and related backend libraries.

- `backend/schema.sql`: SQL script to create the database and tables manually.
  Why we use it: useful for initial schema setup or database review.

### Models

- `backend/models/__init__.py`: Creates the shared SQLAlchemy `db` object.
  Why we use it: all models need the same database instance.

- `backend/models/user.py`: User model for citizen, advocate, and court admin roles.
  Why we use it: stores login and profile data.

- `backend/models/case.py`: Defines `Case`, `Hearing`, and `CaseTimeline`.
  Why we use it: these are the core legal workflow entities.

- `backend/models/document.py`: Document/evidence metadata model.
  Why we use it: tracks uploaded files linked to cases.

- `backend/models/task.py`: Advocate task model.
  Why we use it: stores task-board items.

- `backend/models/case_note.py`: Private case note model.
  Why we use it: stores advocate notes by case.

- `backend/models/notification.py`: Notification model.
  Why we use it: stores system alerts and reminders.

- `backend/models/message.py`: Message/chat model.
  Why we use it: supports in-app communication.

- `backend/models/courtroom.py`: Courtroom model with room status information.
  Why we use it: tracks courtroom availability and occupancy.

- `backend/models/otp.py`: OTP code storage and verification model.
  Why we use it: enables secure OTP login for citizens.

### Routes

- `backend/routes/__init__.py`: Package marker for route modules.
  Why we use it: makes the folder importable as a Python package.

- `backend/routes/auth.py`: Registration, login, OTP, and profile endpoints.
  Why we use it: handles authentication and user identity workflows.

- `backend/routes/cases.py`: Main case APIs for CRUD, filters, role-based visibility, status changes, exports, and QR/report access.
  Why we use it: this is the core business logic of the system.

- `backend/routes/hearings.py`: Hearing create/read/update/delete and calendar APIs.
  Why we use it: manages hearing schedules and case hearing sync.

- `backend/routes/documents.py`: Document upload and management endpoints.
  Why we use it: connects file storage with case evidence records.

- `backend/routes/tasks.py`: Task CRUD endpoints.
  Why we use it: powers the advocate task board.

- `backend/routes/notes.py`: Note CRUD endpoints.
  Why we use it: powers advocate case notes.

- `backend/routes/notifications.py`: Notification APIs and email helper endpoints.
  Why we use it: handles alert delivery and management.

- `backend/routes/messages.py`: Contact list, conversations, and send-message endpoints.
  Why we use it: powers internal chat.

- `backend/routes/courtrooms.py`: Courtroom list, status, and availability endpoints.
  Why we use it: powers room allocation and board views.

- `backend/routes/analytics.py`: Dashboard and reporting endpoints.
  Why we use it: provides aggregated statistics for reports and charts.

### Utilities

- `backend/utils/__init__.py`: Package marker for utility modules.
  Why we use it: allows clean utility imports.

- `backend/utils/exporters.py`: Generates CSV export data, simple PDF content, report text, and signed share tokens.
  Why we use it: isolates report/export logic from API route code.

### Seed, Verification, and Helper Scripts

- `backend/seed.py`: Resets and seeds the database with demo data.
  Why we use it: quick setup for development and demos.

- `backend/seed_large.py`: Seeds a larger dataset with many cases and users.
  Why we use it: better for testing dashboards, pagination, and analytics under richer data.

- `backend/seed_review_data.py`: Safe review-oriented seeding script with stable demo credentials.
  Why we use it: best script to run before a project review or viva.

- `backend/verify_review_flow.py`: Automated check of the main review/demo flows.
  Why we use it: confirms login and role-based case workflows before presentation.

- `backend/test_api.py`: Small script for manual API smoke testing.
  Why we use it: quick backend verification during development.

- `backend/schema_audit.py`: Compares SQLAlchemy models against the actual database schema.
  Why we use it: detects schema mismatches early.

- `backend/check_users.py`: Prints users from the database.
  Why we use it: quick developer inspection utility.

- `backend/get_advocate_creds.py`: Prints advocate credentials/details for demo or testing.
  Why we use it: helps retrieve login information quickly.

- `backend/list_citizens.py`: Prints citizen user details.
  Why we use it: helps inspect public-user records for demos/testing.

### Backend Support/Generated Files

- `backend/creds.txt`: Stored credentials output text.
  Why we use it: convenience artifact for manual review/testing.

- `backend/creds_utf8.txt`: UTF-8 version of credentials output.
  Why we use it: same purpose as above with clean encoding.

- `backend/backend_log.txt`: Backend runtime/debug log.
  Why we use it: troubleshooting reference, not application logic.

- `backend/test_out.txt`: Output file from `test_api.py`.
  Why we use it: saved test result artifact.

## 7. Support and Documentation Files

- `README.md`: Basic project setup, run steps, and demo credentials.
  Why we use it: onboarding and execution guide.

- `PROJECT_WORKFLOW.md`: Internal explanation of module flow and role-based system behavior.
  Why we use it: gives a quick architecture overview for maintainers and reviewers.

- `project_review.txt`: Large review-oriented writeup of features, tables, APIs, and structure.
  Why we use it: presentation and viva preparation material.

- `Project_Report.txt`: Shorter project summary/report text.
  Why we use it: compact documentation for explanation or submission notes.

- `build_check.txt`: Stored output from a successful frontend build.
  Why we use it: proof that the frontend compiled successfully.

- `build_err.txt`: Stored output from an earlier frontend build error.
  Why we use it: debugging record of a past issue.

- `Legal_Case_Management_DBMS_Report.docx`: Final generated project report document.
  Why we use it: academic/project documentation artifact.

- `scripts/generate_lcms_report.py`: Script that generates the project report document and diagrams.
  Why we use it: automates academic/project documentation generation.

- `report_assets/fig_3_1_er_diagram.png`: ER diagram image.
  Why we use it: database design explanation in the report.

- `report_assets/fig_3_2_use_case.png`: Use-case diagram image.
  Why we use it: explains actor interactions in the report.

- `report_assets/fig_3_3_architecture.png`: Architecture diagram image.
  Why we use it: explains system design visually.

- `report_assets/fig_5_1_dashboards.png`: Dashboard screenshots/image.
  Why we use it: visual proof of implemented UI.

- `report_assets/fig_5_2_workflow.png`: Workflow image.
  Why we use it: shows process flow in the report.

- `.vscode/launch.json`: VS Code debug launch configuration.
  Why we use it: developer convenience for debugging in the IDE.

- `frontend/dist/`: Generated production build output.
  Why we use it: deployable frontend files after running `npm run build`.

- `frontend/node_modules/`: Installed frontend libraries.
  Why we use it: contains all npm dependencies required by the frontend.

- `backend/venv/`: Python virtual environment.
  Why we use it: isolated Python packages for backend execution.

- `backend/uploads/`: Uploaded evidence/documents folder.
  Why we use it: runtime storage for user-uploaded files.

## 8. Best Files to Mention in Review

If your reviewer asks for the most important files, mention these first:

- `frontend/src/App.jsx`: routing and role-based access
- `frontend/src/services/api.js`: frontend-backend integration layer
- `backend/app.py`: backend startup and blueprint registration
- `backend/routes/cases.py`: core case management business logic
- `backend/models/case.py`: main legal data model
- `backend/routes/hearings.py`: hearing scheduling logic
- `backend/routes/documents.py`: evidence/document workflow
- `backend/routes/analytics.py`: dashboards and reports
- `backend/seed_review_data.py`: review/demo data preparation
- `backend/verify_review_flow.py`: review-day verification script

## 9. One-Minute Review Explanation

You can say this in your review:

"This project is a role-based Legal Case Management System built with React on the frontend and Flask with MySQL on the backend. The `frontend/src` folder contains the user interface, routing, dashboards, and reusable components. The frontend communicates with the backend through `frontend/src/services/api.js`. On the backend, `app.py` starts Flask, `routes/` contains business APIs like cases, hearings, documents, and analytics, and `models/` defines the database entities. We use separate dashboards for citizens, advocates, and court admins so each role sees only the features they need. We also added OTP login for citizens, evidence upload, hearing scheduling, messaging, notifications, analytics, and QR-based case/report access." 
