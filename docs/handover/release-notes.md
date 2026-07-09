# Release Notes

Each section corresponds to a sprint. Dates reflect the sprint meeting or review date.

---

## Sprint 1 — 19 May 2026

### Added
- Initialized project repository and defined core tech stack (React/TypeScript, Kotlin/Spring Boot, PostgreSQL, Keycloak, Docker/NGINX)
- Lo-fi UI prototype in Figma covering: Customer menu, Login/Signup, Customer Order & Order Status, Staff Order Status pages
- Login and Signup flow with password hashing and basic authentication
- C4 architecture diagram (context and container levels)
- Completed ERD diagram for the full database schema
- Draft implementation of staff centralized order inbox (Issue #13)
- Initial project repository setup (Issue #14)

### Changed
- Nothing changed — initial release

### Fixed
- Nothing fixed — initial release

---

## Sprint 2 — 5–11 June 2026

### Added
- Full database implementation: all tables and relationships created in PostgreSQL, measurement unit enum added, transaction-related ERD refined
- Authentication system finalized: login and signup fully functional, password hashing secured
- Monorepo structure established; frontend and backend housed in a single Git repository
- Docker Compose and NGINX configured for the local development environment
- `.env.example` templates added for project root and frontend
- Example `apiClient` added to frontend to standardize API calls
- Open/Close Shop feature on Owner Dashboard — owners can toggle restaurant availability
- Mock analytics dashboard on Owner Dashboard (placeholder data pending backend connection)

### Changed
- ADR 001 updated to reflect monorepo strategy (previously described as monolithic architecture)
- `vite.config.ts` updated to support hot-reload through NGINX proxy
- Switched from separate frontend/backend repositories to a unified monorepo

### Fixed
- Fixed indentation error in `docker-compose.yml`
- Fixed incorrect variable type (`val` → `var`) for `ManyToOne` column in backend entity

---

## Sprint 3 — 14–26 June 2026

### Added
- **Staff Stock Management (Issue #44):** Full-stack implementation — backend `StockController.kt` with inventory add/deduct logic, frontend UI with category filtering and new item creation
- **Customer Menu Page (Issues #7, #8, #45):** Full-stack customer menu with category grouping, item availability display, cart interaction, and UI/UX redesign for menu navigation
- **Owner Dashboard (Issue #50):** Full-stack owner dashboard overview layout and frontend structure
- **Menu Configuration Management:** Full-stack menu item management for staff/owner (add, update, toggle availability)
- **Owner Staff Page (Issue #51):** Owner can view staff list, create new staff accounts, and manage existing staff
- **Owner Staff Detail Page:** Core functional logic for viewing and editing individual staff details
- **Customer Order History (Issue #52):** `OrderHistory.tsx` frontend component with CSS modules; `OrderHistoryService.kt` backend service; `OrderHistoryResponse` and `OrderDetailItemResponse` DTOs; custom queries in `OrderRepository`, `OrderDetailRepository`, and `OrderItemSelectionRepository`
- **Order Summary page:** Backend functionality for displaying order summary including address customization and payment method selection
- **Refund Credits backend:** Backend infrastructure for handling refund credit records
- Global task bar/navbar integrated across all application views
- All frontend routes mapped for Customer, Staff, and Owner pages

### Changed
- Frontend replaced query-based search parameters with dynamic route paths for cleaner navigation
- Frontend pages connected to real backend database infrastructure (previously using static/mock data in several views)
- Backlog items updated to reflect actual implementation tasks

### Fixed
- Resolved merge conflicts between `customer-order-history` branch and `cart-summarize` branch
- Refactored `StockController.kt` to fix stock calculation mismatches between route payloads and backend logic

---

## Sprint 4 — 27 June – 5 July 2026

### Added
- **Pending Order Page** (in progress as of 27 June 2026 — assigned to Suppapoo, due 30 June 2026)
- Cross-feature peer pairing and support to accelerate remaining delivery

### Changed
- Owner Dashboard: finalized full-stack connection, replaced mock data with live backend queries where available
- Customer Menu Page: completed and polished end-to-end
- Owner Staff Detail Page: functional logic complete; UI styling in progress (assigned to Chawinthorn, due 30 June 2026)
- General frontend UI decoration and layout polish across pages (assigned to Pakawun, due 29 June 2026)
- Remaining backend core feature logic being finalized (assigned to Natthakul, due 1 July 2026)

### Fixed
- Refined order flow edge cases and data validation discrepancies between newly mapped routes and backend responses

---

## Sprint 4 (continued) / Final Week — 1–5 July 2026

### Added
- **Staff pending order management (Issue #64):** Full claim → complete → cancel lifecycle implemented in `StaffOrderService.kt` and the Staff Dashboard UI, closing out the Pending Order Page item carried over from earlier in Sprint 4.
- **Automatic stock deduction and restoration (Issue #64, #44):** Accepting an order now deducts required ingredients via `MenuRecipeRepository` / `OptionIngredientRepository`; canceling an in-progress order restores that stock. Orders are auto-canceled if required stock is insufficient. This reinstates a feature originally deferred by ADR 002-B — recorded in new ADR 002-D.
- **Refund credit ledger (Issue #49):** `RefundCreditController` / `RefundCreditService` implemented (`/balance`, `/add`, `/use`). Canceling an in-progress order credits the customer's balance, redeemable at a future checkout. Also recorded in ADR 002-D.
- **Cancel button for in-progress orders (Issue #76, PR #79):** Added to the Staff Dashboard for the assigned staff member, restoring previously deducted stock on cancellation.
- **Staff account creation (Issue #69):** Owner can create new staff accounts with dual persistence into the application database and Keycloak.
- **Staff stock management UI overhaul (Issue #48):** Rebuilt as a table view with a stock bar and manual quantity adjustment.
- **Staff profile page (Issue #77):** Staff can view and edit their own account info; new shared top nav applied across all staff-side pages.
- **Customer profile page (Issue #73):** Customers can view/edit account info; added 10-digit phone number validation.
- **Order Summary / Done page (Issue #65, #66):** Order summary with address customization, mock QR code, and a completion page shown after checkout.
- **Delete menu item feature (Issue #44).**

### Fixed
- **Selected options and special requests not shown to staff (Issue #76):** Cart now passes selected option-choice IDs through to checkout so staff can see exactly what was picked; special requests were previously saved as `null` due to a mapping bug.
- **`NoSuchElementException` in `StaffService.isInactive` (Issue #76).**
- **Inactive staff access to active orders (Issue #64).**
- Order-state-change endpoints corrected to return `201 Created`.
- Resolved several merge conflicts and route/DTO mismatches surfaced while wiring the pending-order, stock, and order-summary features together in parallel.

### Documentation
- Product brief, architecture page, and known-issues.md updated to match the above (stock deduction and refund credit moved from "out of scope" to "in scope"); see ADR 002-D.

---

## Final Delivery — 6–9 July 2026

### Added
- **Order tracking with reference number (ADR 002-E):** Each `Order` now carries a customer-facing `reference_number` generated at submission, shown as a receipt/lookup label. The Customer Web App's Order Tracking Page (`OrderTracking.tsx`, route `/track/:orderId`) polls every 30 seconds for the order's status.
- **ETA estimation (ADR 002-E):** A new authenticated endpoint `GET /api/customer/orders/{orderId}/eta` (ownership-checked against the requesting customer's JWT subject) returns a prep-time-plus-travel-time window, not a location. `OrderETAService` adds a flat 15-minute prep-time constant to a Google Routes API (`travelMode: TWO_WHEELER`) travel-time estimate from a hardcoded store location to the customer's geocoded address, plus a 10-minute buffer. `GeocodingService` populates that address's latitude/longitude via the Google Geocoding API when it's saved or edited. If geocoding failed or no API key is configured, the endpoint returns "unavailable" instead of erroring.
- **Delivery hand-off, self-claim, no new role (ADR 002-E):** No new entity or role was added. Any `STAFF`/`OWNER` user can claim an in-preparation order for delivery (the same claim pattern already used to accept a pending order), which advances it straight to On Delivery — there is no "Ready" status in between. Only that same staff member can later mark it Delivered; anyone else is rejected with a 403. No location is reported by any device.

### Changed
- Customer Web App's Order Tracking Page now shows a 4-step progress bar — Pending / In Preparation / On Delivery / Delivered — plus an ETA card (time range and prep/travel-minutes breakdown), instead of surfacing status only via the staff dashboard. There is no map or live location anywhere in the system.

### Documentation
- Product brief, architecture page, known-issues.md, risk-list.md, and user_stories_team03.md updated to reflect order tracking/ETA/delivery hand-off moving from "in progress / out of scope" to fully in scope and active (ADR 002-E), and to correct an earlier documentation error that described the customer as an unauthenticated guest — customers have always had a self-registered `CUSTOMER` account (ADR 002-C). A second pass on 2026-07-09 further corrected these same docs, which had incorrectly described a Leaflet/OpenStreetMap live-rider-location map, a recipe-based ETA, and a manager-assigned (rather than self-claimed) delivery hand-off with a "Ready" status — none of which was ever built.

---

## Deferred / Out of Scope (recorded in ADR 002)

The following items remain descoped to protect delivery of the core order flow:

- **Stripe payment integration** — deferred entirely; orders are placed without real payment processing (ADR 002-A)
- **Financial records and reporting** — database schema exists but no service or API is connected, aside from the narrow `RefundCredit` ledger (ADR 002-B, ADR 002-D)
- **Staff scheduling (LeaveDay)** — schema entity exists but no UI or API planned for this version
- **Route optimization and delivery batching** — a delivering staff member carries one active delivery at a time; no turn-by-turn navigation or dispatch optimization (ADR 002-E)