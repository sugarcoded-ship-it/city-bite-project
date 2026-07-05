# ADR 002: Scope Reduction Decisions for MVP Delivery

**Status:** Accepted (ADR 002-B partially superseded by ADR 002-D below)

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