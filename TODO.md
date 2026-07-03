# Production-Ready Authentication & Rating System - Implementation TODO

## Phase 1: Backend scaffolding (Completed)
- [x] Create backend folder and package setup (Express server)
- [x] Add Prisma + database schema for Users and Ratings
- [x] Implement Argon2 password hashing utilities
- [x] Implement auth session/JWT strategy using HttpOnly + Secure + SameSite cookies
- [x] Add CSRF protection (csrf cookie + X-CSRF-Token header)
- [x] Add rate limiting + brute-force protection for login
- [x] Implement endpoints:
  - [x] POST /auth/signup
  - [x] POST /auth/login (email+password) + remember me
  - [x] POST /auth/logout
  - [x] GET /auth/me
  - [x] POST /auth/forgot-password
  - [x] POST /auth/reset-password
  - [x] GET /auth/verify-email
  - [x] OAuth: GET /auth/google (and callback) for Google OAuth login
  - [x] POST /auth/settings (change username/password)
- [x] Add email service (via SMTP using env vars with console fallback)
- [x] Add input validation (zod) on every endpoint
- [x] Add SQL injection protection via Prisma parameterized queries

## Phase 2: Frontend integration (Completed)
- [x] Remove localStorage as source of truth for login/profile/rating
- [x] Add API client with cookie credentials and CSRF header
- [x] Add Auth bootstrap (load /auth/me on app start)
- [x] Build auth UI pages reusing existing styles:
  - [x] Signup
  - [x] Login (remember me)
  - [x] Forgot password
  - [x] Reset password
  - [x] Verify email
- [x] Replace existing phase-based login/profile flow with real auth + protected-phase redirects
- [x] Persist rating changes to backend after match results (canonical server rating)
- [x] Ensure multiplayer WS still functions (no auth token in localStorage)

## Phase 3: Protected routes + polish (Completed)
- [x] Enforce protected phases:
  - [x] Redirect unauthenticated users to Login (profile, multiplayer-setup)
- [x] Add loading indicators + prevent duplicate submissions on forms
- [x] Add success/error notifications from API responses
- [x] Validate XSS safety (React default escaping + sanitize any server-provided strings)

## Phase 4: Testing & verification (Completed)
- [x] Run backend + frontend locally
- [x] Sign up -> verify email -> login
- [x] Forgot password -> reset -> login
- [x] Google OAuth login
- [x] Logout + session persistence/remember-me checks
- [x] Protected phase redirect checks
- [x] Rating persistence correctness and “one rating per user” constraint
