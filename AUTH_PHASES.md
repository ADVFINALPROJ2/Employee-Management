# Auth Implementation Phases

## Phase 1: Login

Status: implemented.

Scope:
- Accept email and password.
- Find an active employee account.
- Validate the password.
- Return a bearer token and basic user payload.
- Store the issued token in the `Session` table.

## Phase 2: Guards

Goal: protect backend routes with the login token.

Tasks:
- Implement `JwtAuthGuard`.
- Verify bearer tokens from the `Authorization` header.
- Check token expiry.
- Confirm the token exists in the `Session` table.
- Attach the authenticated employee to the request.
- Add role checks for admin-only endpoints where needed.
- Apply guards to employee, attendance, leave, grievance, dashboard, and user routes.

Expected result:
- Unauthenticated requests get `401 Unauthorized`.
- Authenticated users can access allowed routes.
- Employees cannot access admin-only routes.

## Phase 3: Forgot Password

Goal: allow employees to reset a forgotten password safely.

Tasks:
- Add `forgot-password` endpoint.
- Add `reset-password` endpoint.
- Generate short-lived reset tokens.
- Store reset tokens hashed, not plain text.
- Send reset links by email or log them only in development.
- Add password reset DTO validation.
- Add frontend reset-password page when the backend flow is ready.

Expected result:
- User can request a reset link by email.
- Reset links expire.
- Password changes invalidate the reset token.
- The response does not reveal whether an email exists.

## Phase 4: Missing Pieces And Hardening

Goal: finish anything required before treating auth as production-ready.

Checklist:
- Add seed data for a first admin user.
- Replace plain-password support with hashed passwords only.
- Ensure employee creation hashes passwords.
- Require `JWT_SECRET` in production.
- Add logout/session revocation endpoint.
- Add refresh or re-login behavior after token expiry.
- Clean old expired sessions periodically.
- Add rate limiting for login and forgot-password requests.
- Add end-to-end tests for login, guards, and password reset.
- Confirm frontend redirects and error messages match backend behavior.
