# ADR 002: Scope Reduction Decisions for MVP Delivery

**Status:** Accepted (ADR 002-B partially superseded by ADR 002-D and ADR 002-E below; ADR 002-E's technical description corrected 2026-07-09 — see note under that section)

---

## ADR 002-A: Defer Stripe Payment Integration

### Context

The original architecture page described Stripe Thailand as a required external dependency for processing customer payments via PromptPay and credit cards. The backend already contains database entities for `PaymentTransaction`, `PaymentMethod`, `RefundCredit`, and `FinancialRecord`, and the Product Brief listed payment as explicitly out of scope. Despite this contradiction, early architecture diagrams included Stripe in the main order placement flow, making it appear to be a required component.

With three weeks of implementation time remaining and the core order submission and staff review workflow not yet complete, integrating an asynchronous third-party payment API would consume time the team does not have. Stripe's webhook-based flow requires idempotent backend handlers, retry logic, and a checkout redirect cycle — none of which are built yet.

### Decision

Stripe payment integration is **deferred entirely** from the current implementation scope. Customers will submit orders without real-time payment processing. The checkout flow will record an order and contact details, but no financial transaction will be initiated or verified.

### Alternatives Considered

- **Keep Stripe, implement a simplified checkout session only:** Still requires webhook handling and Stripe dashboard configuration. Too many moving parts for the remaining timeline.
- **Simulate payment with a mock flag:** Adds fake complexity without demonstrating a real feature. Rejected in favour of simply not building the payment step.

### Consequences

**Positive**
- Removes a significant infrastructural dependency that would have blocked the core order submission flow.
- Allows the team to focus on the end-to-end ordering workflow: menu display → cart → order submission → staff review → status update.
- Existing payment-related database entities remain and do not need to be deleted; they are simply unused in the current implementation.

**Negative / Tradeoffs**
- The system cannot process real payments, which means the MVP cannot be used for actual commercial operations.
- The product brief's out-of-scope statement and the architecture page must both be updated to make this deferral explicit rather than implied.

---

## ADR 002-B: Exclude Stock Management and Financial Records from Active Implementation

### Context

The database schema includes a `Stocks` domain (with `Stock`, `StockCategory`, `MenuRecipe`, and `OptionIngredients` tables) and a financial domain (`FinancialRecord`, `RefundCredit`, `RefundCreditLog`). These tables were designed to support automatic ingredient deduction when an order is placed and store-level accounting. Both features appeared in the original data model overview.

However, no API endpoints, service layer, or frontend UI has been planned or started for either domain. Implementing automatic stock deduction requires the order placement flow to be stable first. Implementing financial records requires payment processing to be active. Neither prerequisite is currently met, and building these features within the remaining timeline is not realistic.

### Decision

Stock management and financial record features are **excluded from the active implementation scope**. The database tables for these domains will remain in the schema but will not be connected to any service logic or API endpoint. Staff will manually manage ingredient availability by toggling menu item status (`available` / `unavailable`) directly, which is already planned as a core staff dashboard feature.

### Alternatives Considered

- **Remove the tables from the schema:** Would require a migration and might break foreign key relationships. The tables are not harmful to leave in place and may be useful in a future version.
- **Build a minimal stock toggle (e.g., "low stock" flag only):** Adds partial complexity without delivering a complete feature. Rejected as it gives a false impression of a working stock system.

### Consequences

**Positive**
- Removes two non-essential domains from the implementation backlog.
- Staff's need to mark items as unavailable is still met via the menu status toggle, which is simpler and already in scope.
- Team effort is redirected to completing the customer ordering flow and staff order management dashboard.

**Negative / Tradeoffs**
- The system has no automatic way to detect or prevent orders containing items whose ingredients have run out; staff must manually mark items unavailable.
- The gap between the existing database schema and the active implementation scope must be clearly noted in architecture documentation to avoid confusion.

---

## ADR 002-C: Retain Keycloak for Authentication and Role Management

### Context

During Sprint 2 and Sprint 3, the team discussed whether to replace Keycloak with a fully custom authentication system using local password hashing and session management. Sprint 3 notes describe a working login and signup flow with password hashing finalized. At the same time, the existing codebase retains `keycloak.ts` on the frontend and `KeycloakRoleConverter.kt` on the backend, and a `realm-config.json` Keycloak configuration file exists in the project root.

The question was whether to commit fully to a custom JWT-based auth system or continue with Keycloak as the identity provider. A custom system would eliminate the Keycloak dependency but would require building token issuance, validation, and role-based access control from scratch — work that would duplicate what Keycloak already provides.

### Decision

The team will **retain Keycloak** as the identity provider. The frontend will continue using the Keycloak JS adapter, and the backend will continue validating Keycloak-issued JWTs using `KeycloakRoleConverter`. The existing realm configuration will be used to manage the `CUSTOMER`, `STAFF`, and `OWNER` roles. Custom password hashing logic that was built during Sprint 2 is considered part of Keycloak's internal configuration, not a replacement system.

### Alternatives Considered

- **Replace Keycloak with a custom Spring Security + JWT implementation:** Would give the team full control over the auth flow but requires building token signing, refresh token handling, and role extraction from scratch. The time cost is not justified given that Keycloak already handles this.
- **Remove all role-based access and use a single shared session:** Eliminates complexity but makes the staff dashboard accessible to customers. Not acceptable from a basic security and usability standpoint.

### Consequences

**Positive**
- Role-based routing between the `CustomerHome`, `StaffHome`, and `OwnerHome` pages remains supported without custom logic.
- Auth responsibilities stay with a dedicated, maintained system rather than hand-rolled code.
- No breaking changes to the existing backend security configuration or frontend adapter.

**Negative / Tradeoffs**
- Keycloak must be running as a separate Docker service during development and in any demo environment, adding infrastructure overhead.
- Team members unfamiliar with Keycloak realm configuration may find it harder to debug auth issues compared to a simpler custom system.

---

## ADR 002-D: Reinstate Automatic Stock Deduction and a Narrow Refund-Credit Ledger (Supersedes part of 002-B)

### Context

ADR 002-B (above) deferred both automatic ingredient deduction and any financial/refund feature, on the basis that neither prerequisite workflow (stable order placement, active payment processing) was ready as of Sprint 3.

By the end of Sprint 4 (Issues #44 and #49, merged 2026-07-01 through 2026-07-05), the team found time to build both features after all, ahead of the original estimate:

- **Automatic stock deduction** is implemented in `StaffOrderService.validateAndDeductStock()`. When staff accept a pending order, the service resolves each order line's ingredient requirements via `MenuRecipeRepository` (menu item → stock) and `OptionIngredientRepository` (selected option choice → stock), checks each required `Stock` row has sufficient `amount`, and deducts it. If stock is insufficient, the order is automatically canceled (`OrderCancellationService.cancelDueToInsufficientStock`). Canceling an `IN_PROGRESS` order restores the previously deducted stock (`restoreStock()`).
- **`RefundCreditController`** exposes `/balance`, `/add`, and `/use` endpoints backed by `RefundCreditService`. When staff cancel an in-progress order, the customer's refund-credit balance is credited; the balance can be spent toward a future order at checkout. This is a store-credit ledger scoped to order cancellations — it is not a payment gateway integration and does not touch real money.

### Decision

ADR 002-B's exclusion is **superseded for these two specific features only**:

- Automatic, recipe-based stock deduction/restoration tied to the order lifecycle is now **in scope and active** (not merely "staff manually toggle availability" as originally decided). The manual availability toggle described in ADR 002-B remains available as a secondary/manual control staff can still use for items whose stock isn't modeled in the recipe system.
- A narrow, order-cancellation-triggered `RefundCredit` ledger is **in scope and active**.

Everything else in ADR 002-B remains unchanged and still deferred:
- No Stripe or other payment-gateway integration (ADR 002-A still applies).
- No `FinancialRecord` reporting/dashboard — the table exists but is not connected to any service or API.
- No low-stock alerts, supplier reordering, or purchasing workflow — deduction only decrements existing `Stock.amount`.

### Consequences

**Positive**
- Staff no longer need to manually catch every ingredient shortfall — the system prevents an order from being accepted when required stock is insufficient, directly addressing the case brief's "item was unavailable but still requested" problem.
- The refund-credit flow gives customers a concrete, checkable outcome when staff cancel their order, rather than an informal offline refund.

**Negative / Tradeoffs**
- The product brief, architecture page, and known-issues gap table (all written against the original ADR 002-B) understated what was actually built and needed a documentation-sync pass (this ADR, plus the linked doc updates) to stay accurate.
- Stock deduction depends on `MenuRecipe` / `OptionIngredient` data being correctly populated per menu item; a menu item with no recipe rows mapped will deduct nothing, silently falling back to the manual-toggle behavior ADR 002-B originally assumed for everything.

---

## ADR 002-E: Reinstate Order Tracking, ETA, and Delivery Handoff (Supersedes the remaining delivery/ETA exclusion in ADR 002)

### Context

The original product brief and architecture page listed three related items as out of scope: a customer-facing order-tracking page with live status, an estimated-time (ETA) calculation, and any delivery hand-off/rider tracking. Order status was, for most of Sprint 4, only visible from the staff dashboard, and the case brief's "customer has no reliable way to know when their order will be ready" problem was only half-solved. (Note: earlier drafts of this ADR and related docs incorrectly described the customer side as an unauthenticated guest flow — customers have always authenticated via Keycloak's `CUSTOMER` role, per ADR 002-C. That was a documentation inconsistency, not a design decision, and is corrected here and in the linked docs.)

Once the core order lifecycle (Pending → In Preparation → On Delivery → Delivered, with no intermediate "Ready" step) and stock deduction (ADR 002-D) stabilized, the team had a reliable state machine to build an ETA estimate and a delivery hand-off step on top of, and completed both before final delivery — without introducing a new account type and without building any location-tracking infrastructure. Delivery is handled by existing `STAFF`-role employees claiming an order, not a separate rider role, app, or manager-assignment flow.

### Decision

The exclusions for order tracking, ETA, and delivery hand-off are **superseded**; all three are now **in scope and implemented**, in a simpler form than originally planned:

- **Reference-number tracking:** Each `Order` is issued a short, customer-facing reference number at submission, shown as a receipt/lookup label. The Customer Web App's Order Tracking Page (`OrderTracking.tsx`, route `/track/:orderId`, gated behind `ProtectedRoute` for `CUSTOMER`/`STAFF`/`OWNER`) polls for the order's current status every 30 seconds and renders it as a 4-step progress bar: Pending / In Preparation / On Delivery / Delivered.
- **ETA (prep time + travel time, not live tracking):** The authenticated endpoint `GET /api/customer/orders/{orderId}/eta` (ownership-checked against the requesting customer's JWT subject) returns a time window, not a location. `OrderETAService` starts from a hardcoded store latitude/longitude, adds a **flat 15-minute prep-time constant** (not per-item or recipe-based), calls the **Google Routes API** (`travelMode: TWO_WHEELER`) for travel time from the store to the customer's address, and adds a 10-minute buffer. The tracking page shows this as a time range plus a prep/travel-minutes breakdown.
- **Geocoding (Google):** `GeocodingService` calls the **Google Geocoding API** when a customer address is saved or edited (`AddressService`), storing latitude/longitude on the `Address` entity. If geocoding failed, or no Google Maps API key is configured, the ETA endpoint degrades gracefully to an "unavailable" response with an explanatory message rather than erroring.
- **Delivery hand-off (self-claim, no new role, no location reporting):** No `RIDER` Keycloak role, no `Delivery_Assignment` entity, and no location-reporting mechanism were built. Instead, any `STAFF`/`OWNER` user can click "Deliver" on an in-preparation order — the same claim pattern already used to accept a pending order — which sets that order's assigned staff member and advances it directly to **On Delivery** (there is no "Ready" status in between). Only that same staff member can later mark the order **Delivered**; the backend checks the caller's UUID against the order's assigned staff and returns 403 otherwise. No coordinates are ever collected, stored, or displayed.

### Alternatives Considered

- **Leave tracking staff-only and ship ETA/delivery as a documented future backlog item:** This was the position through most of Sprint 4, but it did not address the case brief's core complaint. Rejected once time allowed for a full implementation.
- **A public, unauthenticated tracking endpoint keyed only by reference number:** Considered, since the reference number is already customer-facing. Rejected because customers already have an authenticated account (ADR 002-C) — reusing that session to scope the ETA lookup to "orders belonging to this logged-in customer" is simpler and more secure than a second, unauthenticated lookup path, and stays consistent with how order history already works.
- **Introduce a dedicated `RIDER` Keycloak role and separate rider app:** Considered, but rejected — the restaurant does not have a distinct rider workforce separate from its staff, so a new role/account type and a second lightweight app would have added onboarding and infrastructure overhead without a matching real-world need. Delivery hand-off was layered onto the existing `STAFF` role as a self-claim instead.
- **Manager assigns a specific staff member to a delivery:** Considered, but rejected in favor of a simpler self-claim model (whichever `STAFF`/`OWNER` user is available claims the delivery themselves) — consistent with how pending orders are already claimed, and avoiding the need for a manager-facing assignment UI.
- **Live GPS-based rider location on a map:** Considered, but rejected — it would require building a location-reporting mechanism on staff devices (none exists) and a map-rendering surface on the customer side, for a workforce that is just staff carrying their own phone, not a dedicated delivery fleet. An ETA window was judged sufficient for the case brief's actual complaint ("when will my order be ready"), without that additional infrastructure.
- **Recipe-based per-item ETA with live kitchen queue depth:** Considered, matching how stock deduction already uses `Menu_Recipe` data, but rejected for this first ETA implementation in favor of a simpler flat 15-minute prep constant plus Google-estimated travel time — a possible future refinement, not what was built.
- **Free/open-source mapping (Leaflet + OpenStreetMap tiles):** Considered for consistency with the project's general preference for open-source infrastructure (see ADR 002-C on Keycloak), but rejected because no map is rendered at all — ETA needed a travel-time *number* from the Google Routes API, not map tiles, so an open-source tile provider wouldn't have replaced the actual dependency being used.

### Consequences

**Positive**
- Directly resolves the case brief's "customer has no reliable way to know whether their order was received or when it will be ready" complaint end-to-end, without requiring a phone call to staff.
- Keeps a single, consistent authentication model for all customer-facing order endpoints (history, reorder, and now ETA) rather than mixing authenticated and public paths.
- Reuses the existing order-status state machine and `STAFF` role rather than introducing a parallel tracking system, a new account type, or new location-reporting infrastructure.
- Simpler to operate than the originally-planned design: no location-reporting client code, no map-rendering surface, and no assignment UI to build or maintain.

**Negative / Tradeoffs**
- ETA is a flat 15-minute prep constant plus a Google-estimated travel time and a 10-minute buffer — not a recipe-based per-item estimate and not a live-kitchen-load model — so it can drift from actual ready time, especially for large or unusually complex orders.
- Introduces a paid, keyed external dependency (Google Maps Platform: Geocoding + Routes APIs) where the rest of the stack favors free/open-source infrastructure (Keycloak). The `GOOGLE_MAPS_API_KEY` is currently hardcoded in `docker-compose-local.yml` — a secret-hygiene issue tracked separately in `docs/handover/known-issues.md`.
- Delivery hand-off is a claim, not an assignment: any `STAFF`/`OWNER` user can claim any in-preparation order for delivery, so the system cannot express "a manager chose this specific employee" — it can only show who currently holds the claim.
- There is no location tracking of any kind — not live GPS, not even a static delivery-address map — so the customer sees a status and an ETA window, but never "where is my order right now."