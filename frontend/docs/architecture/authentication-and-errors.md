# Authentication and errors

Authentication is shell infrastructure, not a business feature. Auth API/client/storage belongs in `app/data/network`; session context, hooks, and providers belong in `app/shell`; login and forbidden screens remain pages.

Route registry access metadata expresses permissions, not scattered role comparisons. The backend remains authoritative. Concurrent 401 responses converge on one centralized session-expiry transition.

Authentication failures are normalized before reaching UI. A login 401 is invalid credentials, a bootstrap 401 is an unauthenticated visitor, 403 is forbidden, 419/440 and authenticated-session 401 are expired sessions, missing responses and timeouts are connectivity failures, 5xx responses are server failures, and response-schema failures are malformed responses. Unknown failures use the safe server-failure message. Logout failure is its own outcome: authenticated state is retained and a global accessible alert confirms that sign-out did not complete.

Transport errors are normalized in `app/data/network`; Axios types do not leak into features or pages. Zod parsing failures log endpoint and operation context for developers while presenting safe localized feedback. Unexpected errors are not silently preprocessed or swallowed.

Queries render loading, empty, error, and success states without duplicate retry notifications. Mutations provide operation-appropriate feedback. A root error boundary handles render failures. The router owns explicit 403 and 404 pages.
