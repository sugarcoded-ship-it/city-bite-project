what # Known Issues

Add new issues as they are discovered. Each should include a short description, the user or system impact, suggested workaround or mitigation, and current status (Open / In Progress / Closed).

---

## Functional Issues

| Issue | Impact | Workaround | Status |
|-------|--------|------------|--------|
| **Pending Order page is incomplete** — The staff-facing Pending Order management page was still in active development as of Sprint 4 (due 30 June 2026). Staff cannot fully manage pending orders from the dashboard UI. | High — Core staff workflow is partially broken. Staff cannot advance all order states from the UI. | Manage order state directly in the database while the page is completed. | In Progress |
| **Database and menu structure misalignment** — The current database design and menu structure are not fully aligned, causing the data to not map cleanly onto the intended customer journey. Discovered during Order History implementation. | High — Makes ordering flow difficult to implement and navigate correctly. Some data does not flow end-to-end as designed. | Review and reconcile the ERD against the active API DTOs before implementing new order-related features. | Open |
| **Order History feature uses mock data on the frontend** — `OrderHistory.tsx` was built and backend services were implemented, but the full integration between frontend and live backend data was not confirmed complete as of Sprint 3. | Medium — Customers may see placeholder data instead of their real order history. | Verify that `OrderHistoryService.kt` is correctly wired to the frontend API client and that auth tokens are passed on the request. | In Progress |
| **Data validation discrepancies between mapped routes and backend responses** — Frontend routes were mapped to backend endpoints, but field name or type mismatches were found between the actual backend response shapes and what the frontend expects. Identified in Sprint 4. | Medium — Causes runtime errors or blank UI states when data does not match the expected shape. | Cross-reference each endpoint's response DTO (Kotlin) against the TypeScript interface consuming it. Fix mismatches in the DTO or the frontend type definition. | In Progress |
| **Stock calculation edge cases in Staff Stock Management (Issue #44)** — During implementation, stock addition and deduction calculations did not align correctly with expected route payloads in some edge cases. `StockController.kt` was refactored to address this. | Medium — Incorrect stock quantities could be recorded if edge-case inputs are not validated. | Test stock addition and deduction with boundary values (zero, negative, very large quantities) after every schema change. | In Progress |
| **Owner analytics dashboard uses mock data** — The Owner Dashboard analytics components display placeholder/simulated data because the real backend order and financial data sources were not yet available when the components were built. | Medium — Owner sees fake metrics that do not reflect real order volume or revenue. | Do not use the analytics section for real operational decisions. Connect components to live backend endpoints before going live. | Open |
| **Owner staff detail page missing UI decoration** — The functional logic for the Owner staff detail page is implemented, but the visual layout and CSS styling are incomplete as of Sprint 4. | Low — Page is functional but visually unfinished; may appear broken or confusing during demo. | Use the page for data operations only. UI polish is assigned to Chawinthorn (due 30 June 2026). | In Progress |

---

## Authentication & Security Issues

| Issue | Impact | Workaround | Status |
|-------|--------|------------|--------|
| **Keycloak JWT may not be attached on all protected routes** — If the frontend `apiClient` does not include the Keycloak `Authorization: Bearer <token>` header on staff or owner API calls, those endpoints return 401 Unauthorized. This was an identified integration risk and may not be resolved on all routes. | High — Staff dashboard features are completely inaccessible if the token is not forwarded correctly. | Inspect the browser network tab to confirm the Authorization header is present on staff API requests. If missing, ensure the Keycloak adapter's `getToken()` call is wired into the shared `apiClient`. | Open |
| **Keycloak realm must be manually imported on fresh environments** — The system has no automatic realm provisioning. If Keycloak starts with an empty database (e.g., after a volume wipe), the realm configuration must be manually imported from `realm-config.json` or all staff/owner logins will fail. | High — Staff and owner cannot log in at all without the correct Keycloak realm in place. | Import the realm via the Keycloak Admin Console (`/admin`) using `realm-config.json` from the project root. Document this step in the runbook. | Open |

---

## Infrastructure & Environment Issues

| Issue | Impact | Workaround | Status |
|-------|--------|------------|--------|
| **Docker Compose service startup order not guaranteed** — If the backend starts before PostgreSQL is fully ready, the Spring Boot application may fail to connect to the database and crash on startup. | High — Entire backend is unavailable until services are restarted in the correct order. | Add `depends_on` with `condition: service_healthy` and a PostgreSQL health check to `docker-compose.yml`. As a short-term fix, restart the backend container after the database is ready: `docker compose restart backend`. | Open |
| **`.env` files not committed — missing values cause silent failures** — Required environment variables (database credentials, Keycloak URL, frontend API base URL) are defined in `.env` files that are gitignored. A new developer missing these values will see API calls fail silently or the app fail to start without a clear error message. | Medium — New team members or demo environments may be broken without obvious error messages. | Follow the `.env.example` templates in the project root and `codes/frontend/restaurant/`. Ensure all required keys are filled in before starting the stack. | Open |

---

## Out-of-Scope Known Gaps (by Design)

These are not bugs — they are deliberate scope decisions recorded in ADR 002. They are listed here so that anyone operating the system understands the current boundaries.

| Gap | Impact | ADR Reference |
|-----|--------|---------------|
| **No payment processing** — Customers can place orders without any financial transaction. No Stripe integration is active. | The system cannot be used for real commercial operations without a payment step. | ADR 002-A |
| **No automatic stock deduction** — When an order is placed, ingredient inventory is not automatically reduced. Staff must manually toggle items to unavailable when ingredients run out. | Customers may be able to order unavailable items if staff do not update the menu in time. | ADR 002-B |
| **Financial records and reporting not implemented** — Database tables for `FinancialRecord`, `RefundCredit`, and `RefundCreditLog` exist in the schema but are not connected to any service or API. | Owner cannot view revenue, process refunds, or generate financial reports. | ADR 002-B |
| **No customer accounts or order history persistence** — Customers submit orders as guests. Order reference numbers are the only way to retrieve order status; there is no login, saved history, or loyalty system. | Customers who lose their reference number have no way to look up their order. | Product Brief (out of scope) |
| **Staff scheduling (LeaveDay) not implemented** — The `LeaveDay` entity exists in the database schema but no scheduling UI or API is planned for this version. | Owner cannot manage staff leave or schedules through the system. | Product Brief (out of scope) |