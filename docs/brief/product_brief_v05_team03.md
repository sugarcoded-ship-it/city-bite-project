# Product Brief v06 — Team 03 (Revised)

## Problem Statement

CityBite Bangkok currently has no dedicated digital ordering system. Orders arrive through a mix of walk-ins, phone calls, and chat messages, which means the same order may be recorded in three different places — or not recorded at all. This creates two concrete problems: staff must mentally reconcile incoming orders from multiple channels during peak hours, which leads to missed or incorrect items; and customers have no reliable way to know whether their order was received or when it will be ready, prompting follow-up calls that add further load to staff.

A single web-based system where customers submit orders and staff manage them from one shared dashboard eliminates the coordination overhead and gives both sides a consistent view of order state. The goal is not a full commercial platform — it is the smallest system that makes the ordering process accurate, visible, and manageable for a single-location restaurant.

---

## Stakeholders and User Roles

- **Customer** — A guest user who does not create an account. The customer browses the CityBite menu, adds items to a cart with optional customizations, submits an order along with their name and contact details, and uses an order reference number to check the preparation status of that order. Customers interact with the system entirely through the public-facing web application.

- **Staff** — An authenticated CityBite employee who logs in via Keycloak with the `STAFF` role. Staff use a dedicated dashboard to view all incoming orders in a single inbox (ordered by submission time), open individual orders to review full item details and special requests, advance each order through its preparation lifecycle (Pending → In Kitchen → Ready), and toggle individual menu items between available and unavailable when ingredients run out.

- **Owner** — An authenticated user with the `OWNER` Keycloak role. In the current MVP scope, the owner can log in and view the order and menu state in a read-only capacity. Advanced owner features — such as financial reporting, staff scheduling, and operational analytics — are out of scope for this version and deferred to a future release.

---

## User Needs

- **Customers** need a single place to see what is currently available, submit an order with any special requests, and check their order status without calling the restaurant. The system must make the ordering process self-contained so that a customer requires no assistance from staff to place or track an order.

- **Staff** need one consolidated inbox that presents all incoming orders in submission order, displays each order's complete contents including item options and customer notes, and allows them to advance an order through preparation stages with minimal steps. Staff should never need to consult a phone or chat app to find out what a customer ordered.

- **Owner** needs confidence that orders are being received and fulfilled consistently, and that the menu visible to customers reflects real availability at any point in time.

---

## MVP Scope / In-Scope Functionality

### Customer-facing

- **Menu display:** Menu items grouped by category (e.g., Mains, Sides, Drinks). Within each category, available items appear first; unavailable items are visually distinguished at the bottom. Item name, description, and price are shown.
- **Basic item customization:** Customers can select from predefined option groups on eligible items (e.g., spice level, add-on toppings). Options are presented as choices — no free-text ingredient editing.
- **Cart management:** Customers can add, adjust, and remove items before submitting. The cart displays a running total.
- **Order submission:** A checkout form collects the customer's name, phone number, and any order-level special requests. On submission, the system returns an order reference number.
- **Order status tracking:** Using their order reference number, a customer can view the current preparation status of their order: **Pending**, **In Kitchen**, or **Ready**.
- **Store open/closed state:** When the store is marked closed by staff, customers cannot submit new orders.

### Staff-facing (authentication required)

- **Order inbox:** A live view of all submitted orders, sorted by submission time (first-come, first-served). Each entry shows the order reference number, submission time, and current status.
- **Order detail view:** Full breakdown of a selected order — each item, its selected options, quantity, and any special requests from the customer.
- **Order status updates:** Staff can advance an order through the defined lifecycle: **Pending → In Kitchen → Ready**. Each transition is recorded with a timestamp.
- **Menu item availability toggle:** Staff can mark individual menu items as available or unavailable. Unavailable items cannot be added to a customer's cart and are displayed separately on the menu page.
- **Store open/closed control:** Staff can toggle the store's operational state to prevent new orders from being submitted outside of business hours.

---

## Out-of-Scope Functionality

- **Payment processing (Stripe or any gateway):** No financial transaction is initiated or verified by the system. Customers place orders without paying through the application. Payment on pickup or delivery is handled offline. This decision is recorded in ADR 002-A.
- **Automatic stock management and ingredient deduction:** No inventory tracking is active in the current implementation. Staff manage ingredient availability manually through the menu item toggle. This decision is recorded in ADR 002-B.
- **Financial records and reporting:** No revenue tracking, refund management, or financial dashboard is built. The corresponding database tables exist but are not connected to any service or API.
- **Estimated time of arrival (ETA):** Calculating a meaningful ETA requires kitchen load data, per-item preparation times, and delivery logistics — none of which are modeled in the active implementation. The tracking page shows status only.
- **Delivery and rider management:** No route optimization, rider assignment, or delivery tracking is included.
- **Customer accounts and order history:** Customers submit orders as guests. No login, saved preferences, or order history is provided.
- **Staff scheduling:** A `LeaveDay` entity exists in the database schema but no scheduling UI or API is planned for this version.
- **Promotions and discount system:** Coupon codes, loyalty points, and promotional pricing are not included.
- **Owner management features:** Financial dashboards, staff management tools, and analytics are deferred to a future version.

---

## Assumptions

- Customers access the system through a web browser on a smartphone or computer with an internet connection.
- The shop has at least one dedicated device (tablet or laptop) connected to the internet at the counter from which staff can monitor and manage the dashboard.
- Staff and the owner authenticate using Keycloak credentials provisioned in advance. There is no self-registration flow for staff accounts; accounts are created by configuring the Keycloak realm.
- Customers submit orders as guests and are responsible for providing accurate contact information. No verification of phone number or name is performed.
- Menu items require only single-level option selection (e.g., one choice from a group). Deeply nested or conditional customization is not needed.
- The menu is small enough that staff can realistically manage item availability by hand. The system does not need to detect low stock automatically.
- Staff will manually open and close the store's ordering window in the dashboard. The system does not enforce business hours automatically.

---

## Constraints

- **Scope lock:** The team will not add features beyond the in-scope list above. Any new ideas are added to a future backlog only. The deadline for implementation is the end of Week 10 (approximately July 5, 2026).
- **Team size and timeline:** This is a six-person student team with approximately three weeks of implementation time remaining. Technical capacity and familiarity with the stack (Kotlin/Spring Boot, React/TypeScript, Keycloak) limit how much can be built.
- **Infrastructure dependency:** Keycloak must be running as a Docker service in the development and demo environment. The system cannot authenticate staff or the owner without it.
- **No real payment handling:** The system must not attempt to process or store real payment data. This is both a scope constraint and a security boundary.
- **Academic deliverables:** Product documentation (this brief, architecture page, ADRs, sprint notes, handover materials) is required alongside working code and is part of the graded output.

---

## Risks

| Risk | Why it matters | Mitigation |
| :--- | :--- | :--- |
| Order flow business logic complexity | Edge cases in status transitions (who can update what, when) are a stated blocker as of Sprint 3. Unresolved logic leads to backend rework. | Resolve status transition rules explicitly before building the API. Document the allowed transitions and enforce them in the service layer. |
| Frontend–backend integration gaps | Frontend and backend have been built in parallel without a finalized API contract. Field mismatches at integration time cost significant debugging time. | Define and agree on request/response shapes for all five core endpoints at the start of Week 8, before implementation continues. |
| Unfamiliar frameworks slowing delivery | Several team members are still building comfort with Kotlin/Spring Boot and React. This directly reduces implementation speed. | Maintain the planned pairing sessions so more experienced members can unblock others quickly. |
| Keycloak JWT not passed correctly on protected routes | Staff API calls will return 401 errors if the frontend does not attach the Keycloak token to requests. Debugging auth issues mid-integration is time-consuming. | Implement and test the Authorization header attachment pattern on one endpoint first before connecting the full staff dashboard. |
| Scope creep under deadline pressure | Adding small "nice to have" features absorbs time that is already tight. | Treat the in-scope list above as a hard boundary. Any addition requires explicitly removing something of equivalent complexity. |

---

## Success Criteria

The MVP is successful if the following outcomes can be demonstrated end-to-end:

- A customer can open the web application, browse the menu organized by category, add items with option selections, submit an order as a guest, and receive an order reference number.
- A customer can use their reference number to view the current status of their order (Pending, In Kitchen, or Ready) without contacting the restaurant.
- A staff member can log in, see all submitted orders in a single inbox ordered by submission time, open any order to view its full details and special requests, and advance that order through each status stage.
- A staff member can mark a menu item as unavailable, and that item immediately becomes unorderable for customers browsing the menu.
- The same order submitted by a customer appears in the staff inbox without any manual transfer or transcription step.

---

## Confirmed Technical Direction

- **System type:** Web-based ordering and order management system, single-location.
- **Frontend:** React with TypeScript (Vite). Separate entry points for the customer-facing app and the staff/owner dashboard, with role-based routing via Keycloak.
- **Backend:** Kotlin with Spring Boot. RESTful API. JWT validation using Keycloak-issued tokens via `KeycloakRoleConverter`.
- **Database:** PostgreSQL. Schema is fully implemented and deployed.
- **Authentication:** Keycloak (open-source identity provider). Manages `STAFF` and `OWNER` roles. Customers are unauthenticated guests.
- **Development environment:** Docker Compose with NGINX reverse proxy. Defined in the monorepo (see ADR 001).
- **Version control:** GitHub monorepo with issues, pull requests, and CI.

Major technology decisions are recorded in the ADR documents under `docs/architecture/adrs/`.
