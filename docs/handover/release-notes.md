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

## Deferred / Out of Scope (recorded in ADR 002)

The following items were descoped during Sprint 3 to protect delivery of the core order flow:

- **Stripe payment integration** — deferred entirely; orders are placed without real payment processing (ADR 002-A)
- **Automatic stock deduction** — excluded; staff manually toggle menu item availability (ADR 002-B)
- **Financial records and reporting** — database schema exists but no service or API is connected (ADR 002-B)
- **Customer accounts and order history persistence** — customers order as guests only
- **Staff scheduling (LeaveDay)** — schema entity exists but no UI or API planned for this version