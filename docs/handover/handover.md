# Final Handover

**Team:** Team 03

**Project Name:** CityBite Bangkok — Digital Ordering System

**Repository Link:** https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03

**Presentation Slides:** https://canva.link/2j4fvxabuu2xu0a

---

## 1. Product Summary

This project is a web-based ordering and order-management system for CityBite Bangkok, a single-location restaurant. It is built for two groups of users: **customers**, who currently place orders through a mix of walk-ins, phone calls, and chat messages, and **restaurant staff/owner**, who currently have to mentally reconcile those orders across channels. The system gives both sides a single shared view of order state: customers browse the menu, customize and submit an order as a guest, and track its status using a reference number; staff log in through Keycloak to manage a live order inbox, advance orders through their preparation lifecycle, and manage menu and stock availability. It is not intended to be a full commercial platform — it is the smallest system that makes the ordering process accurate, visible, and manageable for one restaurant location.

---

## 2. Delivered Features

**Customer-facing**
* Browse the menu grouped by category, with available items shown before unavailable ones.
* Customize eligible items using predefined option groups (e.g., spice level, add-ons).
* Add, adjust, and remove items in a cart with a running total.
* Submit an order as a guest (name, phone number, special requests) and receive an order reference number.
* Track order status (Pending → In Kitchen → Ready) using the reference number.
* Orders cannot be submitted while the store is marked closed.

**Staff-facing (authenticated via Keycloak, `STAFF` role)**
* Live order inbox sorted by submission time, with full order detail (items, selected options, special requests).
* Claim, complete, or cancel an order, advancing it through Pending → In Kitchen → Ready.
* Toggle individual menu items available/unavailable; add, update, and delete menu items.
* Toggle the store's open/closed state.
* View, add, and adjust stock quantities by category, in a table view with a stock bar.
* View and edit their own staff profile.

**Owner-facing (authenticated via Keycloak, `OWNER` role)**
* Everything staff can do, plus:
* View, create, and manage staff accounts (dual persistence into the application database and Keycloak) and view individual staff details.

**Automatic stock deduction and refund credit (added in the final sprint, ADR 002-D)**
* Accepting an order automatically deducts the required ingredients (via menu recipes and option-ingredient mappings) from stock; an order is auto-canceled if stock is insufficient.
* Canceling an in-progress order restores the deducted stock and credits the customer's refund-credit balance (a store-credit ledger, redeemable at a future checkout — not a real payment refund).

---

## 3. Main User Workflow

The core end-to-end workflow the MVP is built around is:

1. Customer opens the web app and browses the menu, organized by category, with available items shown first.
2. Customer selects items, chooses options, and adds them to the cart.
3. Customer checks out as a guest, providing name, phone number, and any special requests.
4. System saves the order and returns an order reference number.
5. The same order appears immediately in the staff order inbox, sorted by submission time — no manual transfer or re-entry.
6. Staff open the order to see full details (items, options, special requests), claim it, and the system deducts the required stock automatically.
7. Staff advance the order through Pending → In Kitchen → Ready, or cancel it (which restores stock and credits the customer).
8. Customer checks their order status at any time using the reference number, without contacting the restaurant.

---

## 4. Changes From Original Plan

* **Completed as planned:** Core order flow (menu browsing, cart, guest checkout, order reference tracking), staff order inbox and lifecycle management, menu availability management, Keycloak-based staff/owner authentication, and the monorepo/Docker development setup (ADR 001) all shipped as originally scoped.
* **Reduced/removed:** Stripe (PromptPay/card) payment integration was deferred entirely (ADR 002-A) — orders are recorded without any real financial transaction, and payment happens offline. Delivery and rider tracking, real-time delivery maps, financial reporting/revenue dashboards, customer accounts and persisted order history, staff scheduling (`LeaveDay`), and promotions/discounts were all descoped and are not part of the delivered system, even though some of these appeared in early planning documents and the original C4 diagram.
* **Changed:** ADR 001 originally described a monolithic backend but was updated mid-project to reflect the monorepo strategy actually adopted (a single Git repository housing the decoupled React frontend and Spring Boot backend, not a single monolithic service).
* **Postponed, then reinstated (ADR 002-D):** Automatic, recipe-based stock deduction and a refund-credit ledger were originally excluded in ADR 002-B because the order-placement flow and payment processing were not stable enough yet. Once the order flow stabilized in the final sprint, the team found time to build both after all: accepting an order now automatically deducts required ingredients (and restores them on cancellation), and canceling an in-progress order credits the customer's refund-credit balance. This superseded part of ADR 002-B; everything else in that ADR (no Stripe integration, no financial-record reporting/dashboard, no low-stock alerts or purchasing workflow) remains deferred.
* **Why:** Changes were driven by a three-week implementation window for a six-person student team still building familiarity with Kotlin/Spring Boot and React/TypeScript. The team treated the in-scope list in the product brief as a hard boundary and prioritized the core order-intake and staff-review workflow over payment processing, delivery logistics, and advanced owner analytics, which do not directly address the case brief's core complaint (orders getting lost or miscommunicated across channels).

---

## 5. Known Issues and Limitations

* **No automated test coverage for order status transitions and stock deduction.** The backend has only the default Spring Boot context-load test; the frontend has no test files and no `test` script. The riskiest logic in the system (claim/complete/cancel, stock deduct/restore, refund credit) has no regression safety net — this must be manually re-tested before each merge and before any future release.
* **Database/menu structure misalignment.** The current database design and menu structure are not fully aligned in places, discovered during Order History implementation; some data does not flow end-to-end as originally intended. This was not re-verified in the most recent documentation pass and should be re-checked if order/menu work continues.
* **Docker Compose service startup order is not guaranteed.** If the backend starts before PostgreSQL is ready, Spring Boot can crash on startup. The short-term workaround is `docker compose restart backend`; a proper `depends_on` health check has not been added.
* **`.env` files are not committed.** Required environment variables (DB credentials, Keycloak URLs, frontend API base URL) are gitignored, so a new developer or environment missing these values will see silent failures rather than clear errors. `.env.example` templates exist and must be filled in manually.
* **Keycloak realm import is not fully automatic in all cases.** The realm auto-imports on first container boot (`--import-realm`), but if the `keycloak_data` volume already exists without the realm (e.g., partially wiped), manual import via the Admin Console is still required.
* **Stock deduction depends on recipe data being correctly maintained.** A menu item with no `Menu_Recipe` / `Option_Ingredients` rows mapped will deduct no stock on order acceptance, silently falling back to manual availability toggling.
* **No payment processing.** Customers place orders without any financial transaction; payment is handled entirely offline between customer and staff (by design, ADR 002-A).
* **No financial reporting.** `Financial_Record`, `Payment_Transaction`, and `Payment_Method` exist in the database schema but are not connected to any service or API. The `Refund_Credit` ledger is a narrow exception — it tracks store credit only, not real money.
* **No customer accounts or persisted order history.** Customers order as guests; an order reference number is the only way to retrieve order status, and there is no login or loyalty system.
* **Staff scheduling is not implemented.** The `LeaveDay` entity exists in the schema, but no UI or API was planned or built for this version.
* **The original C4 diagram is out of date.** It still shows the early-stage design, including a Stripe payment gateway and rider/delivery components that were later descoped; the architecture page text is the authoritative description of the system as built, and the diagram is scheduled to be redrawn to match ADR 002 / ADR 002-D.
* **The system has been tested against local/sample data only**, using the Docker Compose development environment; it has not been deployed or load-tested in a production-like environment.

---

## 6. How To Run Or Inspect The System

Full setup and run instructions are available in:

```
docs/handover/runbook.md
```

Important notes:
* **Required software:** Docker Desktop (latest stable) and Docker Compose v2 (bundled with Docker Desktop), plus Git to clone the repository. No local installation of Java, Node.js, or PostgreSQL is required — everything runs inside Docker containers.
* **Required environment variables:** Copy `.env.example` to `.env` in `codes/` (database credentials, Keycloak URLs/realm/client, admin credentials, ports) and `frontend/restaurant/.env.example` to `frontend/restaurant/.env` (API URL, Keycloak URL, realm, client ID). See the runbook for the full variable list.
* **Standard run (production-like, NGINX on port 80):**
  ```bash
  cd codes
  docker compose -f docker-compose.db.yml -f docker-compose.yml up --build
  ```
* **Local development (hot reload, exposed ports 5173/8080):**
  ```bash
  cd codes
  docker compose -f docker-compose.db.yml -f docker-compose-local.yml up --build
  ```
* **Keycloak realm:** Imported automatically from `codes/realm-config.json` on first boot. If missing after a volume wipe, import manually via `http://localhost/auth/admin`.
* **Test account / sample data:** No self-registration flow exists for staff or owner accounts; they are created through the Keycloak Admin Console (Users → Add user → set credentials → assign `STAFF` or `OWNER` role mapping), as described in the runbook's "Routine Tasks" section.

---

## 7. Testing and Evidence

The team tested:
* The full order lifecycle manually — place order as a guest → order appears in staff inbox → staff claims/advances/cancels it → stock deducts or restores → refund credit applies on cancellation → customer sees the matching status via reference number.
* Staff and owner login through Keycloak, including verifying that the `Authorization: Bearer <token>` header is attached to protected `/api/` requests (diagnosed via browser DevTools Network tab per the runbook's troubleshooting section).
* Stock addition and deduction with boundary values (zero, negative, very large quantities) after `StockController.kt` was refactored to fix calculation mismatches.
* Data validation between mapped frontend routes and backend response shapes, cross-referencing backend DTOs against frontend TypeScript interfaces, after mismatches were found in cart option-selection and special-request fields.
* Menu configuration, owner dashboard, and order history views to confirm they were reading from the live backend rather than mock/placeholder data.

---

## 8. Important Project Artifacts

* **Product Brief:** `docs/brief/product_brief_v05_team03.md`
* **Team Charter:** `docs/team-charter.md`
* **User Stories:** `docs/planning/user_stories_team03.md`
* **Backlog / Project Board:** https://github.com/orgs/MUIC-ICCS-372-SE/projects/7
* **Architecture Page:** `docs/architecture/architecture-page-team3.md`
* **ADRs:** `docs/architecture/adrs/` (ADR 001 — monorepo strategy; ADR 002 — scope reduction decisions, A–D)
* **Definition of Done:** `docs/planning/definition-of-done.md`
* **Risk List:** `docs/planning/risk-list.md`
* **Known Issues:** `docs/handover/known-issues.md`
* **Release Notes:** `docs/handover/release-notes.md`
* **Runbook:** `docs/handover/runbook.md`
* **README:** `README.md`
* **Final Presentation Slides:** https://canva.link/2j4fvxabuu2xu0a
* **Repository:** https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03

---

## 9. Recommended Next Steps

* Add automated test coverage for the highest-risk logic first: order status transitions (claim/complete/cancel), stock deduction/restoration, and the refund-credit ledger, since these currently rely entirely on manual regression testing.
* Reconcile the database schema and menu structure fully against the active API DTOs to close out the open "database and menu structure misalignment" issue, particularly around Order History.
* Add a `depends_on` health check for the database service in `docker-compose.yml` to remove the manual backend-restart workaround on startup ordering.
* Build a real payment integration (e.g., Stripe Thailand / PromptPay) to replace the current offline-payment model, now that the core order and stock-deduction flow is stable.
* Connect `Financial_Record` to real order and payment data so the owner can access actual revenue and reporting, rather than the current unconnected schema.
* Add low-stock alerts and a reordering/purchasing workflow on top of the existing recipe-based stock deduction.
* Introduce customer accounts and persisted order history so customers are not limited to guest checkout and a single reference number.
* Redraw the C4 diagram to reflect the system as actually built (no Stripe, no delivery/rider module, with automatic stock deduction and refund credit included), replacing the early-stage diagram still referenced on the architecture page.
* Prepare a deployment pipeline (currently Docker Compose is local/demo-only) and conduct a security review before any real production or commercial use.

---

## 10. Final Status

The product is currently a working course project prototype for a single-location restaurant ordering and order-management system. The main end-to-end workflow — a customer browsing the menu, customizing and submitting a guest order, and staff receiving, accepting (with automatic stock deduction), and progressing that order through to completion or cancellation (with stock restoration and refund credit) — is functional and has been manually verified. Payment processing, financial reporting, delivery/rider management, and customer accounts remain out of scope by design. The system is suitable for demonstration and further development, but it would need automated test coverage, a resolved database/menu alignment issue, a production deployment pipeline, and a security review before it could be used for real commercial operations.