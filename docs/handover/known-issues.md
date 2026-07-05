# Known Issues

Add new issues as they are discovered. Each should include a short description, the user or system impact, suggested workaround or mitigation, and current status (Open / In Progress / Closed).

> **Updated 2026-07-05** against the final week's commits (Issues #44, #49, #64, #69, #73, #76, #77, PRs #68–#79). Several items below were reported during Sprint 4 (as of 27–30 June) and have since been closed; statuses were re-verified against the current code.

---

## Functional Issues

| Issue | Impact | Workaround | Status |
|-------|--------|------------|--------|
| **Pending Order page is incomplete** — The staff-facing Pending Order management page was still in active development as of Sprint 4 (due 30 June 2026). Staff cannot fully manage pending orders from the dashboard UI. | High — Core staff workflow is partially broken. Staff cannot advance all order states from the UI. | — | **Closed** — Implemented in Issue #64 (claim/complete/cancel order flow in `StaffOrderService.kt` and `StaffDashboard.tsx`) and refined in Issue #76 / PR #79 (selected options display, canceling in-progress orders). Verify end-to-end during final demo rehearsal. |
| **Database and menu structure misalignment** — The current database design and menu structure are not fully aligned, causing the data to not map cleanly onto the intended customer journey. Discovered during Order History implementation. | High — Makes ordering flow difficult to implement and navigate correctly. Some data does not flow end-to-end as designed. | Review and reconcile the ERD against the active API DTOs before implementing new order-related features. | Open — not re-verified in this pass; re-check before final submission if Order History/menu work continues. |
| **Order History feature uses mock data on the frontend** — `OrderHistory.tsx` was built and backend services were implemented, but the full integration between frontend and live backend data was not confirmed complete as of Sprint 3. | Medium — Customers may see placeholder data instead of their real order history. | — | **Closed** — `OrderHistory.tsx` now calls `apiClient` directly (`/customer/orders`, `/customer/orders/reorder/:id`); no mock data remains in the component. |
| **Data validation discrepancies between mapped routes and backend responses** — Frontend routes were mapped to backend endpoints, but field name or type mismatches were found between the actual backend response shapes and what the frontend expects. Identified in Sprint 4. | Medium — Causes runtime errors or blank UI states when data does not match the expected shape. | Cross-reference each endpoint's response DTO (Kotlin) against the TypeScript interface consuming it. Fix mismatches in the DTO or the frontend type definition. | **Mostly closed** — Issue #76 fixed the specific cases found (selected option IDs not passed through cart to checkout, special requests saved as null). Keep the workaround in mind for any new endpoint. |
| **Stock calculation edge cases in Staff Stock Management (Issue #44)** — During implementation, stock addition and deduction calculations did not align correctly with expected route payloads in some edge cases. `StockController.kt` was refactored to address this. | Medium — Incorrect stock quantities could be recorded if edge-case inputs are not validated. | Test stock addition and deduction with boundary values (zero, negative, very large quantities) after every schema change. | **Closed** — `StockController.kt` refactored and stock management UI rebuilt as a table view (Issue #48). Boundary-value testing is still recommended since no automated tests cover this (see new test-coverage issue below). |
| **Owner analytics dashboard uses mock data** — The Owner Dashboard analytics components display placeholder/simulated data because the real backend order and financial data sources were not yet available when the components were built. | Medium — Owner sees fake metrics that do not reflect real order volume or revenue. | — | **Closed** — `OwnerDashboard.tsx` and `MenuConfiguration.tsx` are wired to `apiClient`; no mock data remains. |
| **Owner staff detail page missing UI decoration** — The functional logic for the Owner staff detail page is implemented, but the visual layout and CSS styling are incomplete as of Sprint 4. | Low — Page is functional but visually unfinished; may appear broken or confusing during demo. | — | **Closed** — `StaffDetail.module.css` (253 lines) implemented; visually spot-check before demo. |
| **No automated test coverage for order status transitions and stock deduction** — Backend has only the default Spring Boot context-load test; frontend has no test files and no `test` script (`npm run test --if-present` in CI silently no-ops). | Medium/High — The riskiest logic in the system (claim/complete/cancel, stock deduct/restore, refund credit) has no regression safety net. | Manually re-test the full order lifecycle (place → claim → complete/cancel → stock/credit effects) before each merge and before the final demo. | Open — new item added in this pass. |

---

## Authentication & Security Issues

| Issue | Impact | Workaround | Status |
|-------|--------|------------|--------|
| **Keycloak JWT may not be attached on all protected routes** — If the frontend `apiClient` does not include the Keycloak `Authorization: Bearer <token>` header on staff or owner API calls, those endpoints return 401 Unauthorized. This was an identified integration risk and may not be resolved on all routes. | High — Staff dashboard features are completely inaccessible if the token is not forwarded correctly. | — | **Closed** — `api-client.ts` implements a global request interceptor that attaches `Authorization: Bearer <token>` (with refresh) on every request, and redirects to Keycloak login on session expiry. This applies to all routes using `apiClient`, not per-endpoint. |
| **Keycloak realm must be manually imported on fresh environments** — The system has no automatic realm provisioning. If Keycloak starts with an empty database (e.g., after a volume wipe), the realm configuration must be manually imported from `realm-config.json` or all staff/owner logins will fail. | High — Staff and owner cannot log in at all without the correct Keycloak realm in place. | Manual import via Admin Console is still the fallback if the Keycloak data volume is wiped. | **Mostly closed** — `docker-compose.yml` / `docker-compose-local.yml` start Keycloak with `--import-realm`, which auto-imports `realm-config.json` on first boot (documented in the runbook). Manual import is only needed if the `keycloak_data` volume already exists without the realm. |

---

## Infrastructure & Environment Issues

| Issue | Impact | Workaround | Status |
|-------|--------|------------|--------|
| **Docker Compose service startup order not guaranteed** — If the backend starts before PostgreSQL is fully ready, the Spring Boot application may fail to connect to the database and crash on startup. | High — Entire backend is unavailable until services are restarted in the correct order. | Add `depends_on` with `condition: service_healthy` and a PostgreSQL health check to `docker-compose.yml`. As a short-term fix, restart the backend container after the database is ready: `docker compose restart backend`. | Open |
| **`.env` files not committed — missing values cause silent failures** — Required environment variables (database credentials, Keycloak URL, frontend API base URL) are defined in `.env` files that are gitignored. A new developer missing these values will see API calls fail silently or the app fail to start without a clear error message. | Medium — New team members or demo environments may be broken without obvious error messages. | Follow the `.env.example` templates in the project root and `codes/frontend/restaurant/`. Ensure all required keys are filled in before starting the stack. | Open |

---

## Out-of-Scope Known Gaps (by Design)

These are not bugs — they are deliberate scope decisions recorded in ADR 002 (and ADR 002-D where noted). They are listed here so that anyone operating the system understands the current boundaries.

| Gap | Impact | ADR Reference |
|-----|--------|---------------|
| **No payment processing** — Customers can place orders without any financial transaction. No Stripe integration is active. | The system cannot be used for real commercial operations without a payment step. | ADR 002-A |
| ~~No automatic stock deduction~~ **Superseded — automatic stock deduction is implemented.** Accepting an order deducts required stock via `Menu_Recipe` / `Option_Ingredients`; canceling an in-progress order restores it. Still missing: low-stock alerts and reordering/purchasing workflows. | N/A — resolved. A menu item with no recipe rows mapped will still deduct nothing, so recipe data must be kept accurate. | ADR 002-D (supersedes ADR 002-B for this item) |
| **Financial records/reporting not implemented** — `FinancialRecord`, `PaymentTransaction`, and `PaymentMethod` exist in the schema but are not connected to any service or API. *(Exception: `RefundCredit` / `RefundCreditLog` — see next row.)* | Owner cannot view revenue, process gateway refunds, or generate financial reports. | ADR 002-B |
| **`RefundCredit` is a narrow store-credit ledger, not full refund processing** — Staff canceling an in-progress order credits the customer's `RefundCredit` balance (`/balance`, `/add`, `/use` endpoints), redeemable at a future checkout. No real money moves; this is bookkeeping only. | Owner still cannot process an actual monetary refund through the system — only track a credit balance. | ADR 002-D |
| **No customer accounts or order history persistence** — Customers submit orders as guests. Order reference numbers are the only way to retrieve order status; there is no login or loyalty system. | Customers who lose their reference number have no way to look up their order. | Product Brief (out of scope) |
| **Staff scheduling (LeaveDay) not implemented** — The `LeaveDay` entity exists in the database schema but no scheduling UI or API is planned for this version. | Owner cannot manage staff leave or schedules through the system. | Product Brief (out of scope) |