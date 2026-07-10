# Individual Contribution Log — Sprint 4 (Week 10)

**Name:** Suppapoo Ekpipattana
**Team:** 3
**Week / Date Range:** Week 10 / June 12, 2026 – June 25, 2026

## 1. What I planned to do this week
- Finalize the integration of the Customer Order History feature, ensuring seamless routing and integration into the main application layout.
- Design and implement Staff pending order management on the backend and frontend Staff Dashboard.
- Handle active vs. inactive staff access controls properly.

## 2. What I actually did
- **Order History Finalization (#52, #59, #61):**
  - Integrated the order history successfully into the main branch, resolving final conflicts and ensuring the UI component behaves as expected.
- **Staff Order Management (#64, #68):**
  - Implemented the staff pending order management feature.
  - Refactored order state change endpoints to return `201 Created` and improved status mapping between backend and frontend.
  - Improved UI state handling on the Staff Dashboard and resolved formatting for the staff `displayName`.
  - Added edge-case handling to restrict inactive staff access to active orders.
  - Resolved frontend lint errors and backend compilation issues regarding repository imports.

### Evidence:
- **Issue(s):** #52, #59, #61, #64, #68
- **Branch(es):** `customer-order-history`, `staff-pending-order`
- **Commit(s):**
  - `Issue #64; feature: Implement staff pending order management`
  - `Issue #64; refactor: improve status mapping and UI state handling`
  - `Issue #64; fix(auth): handle inactive staff access to active orders`
  - `Merge pull request #68 from MUIC-ICCS-372-SE/staff-pending-order`
  - `Merge pull request #61 from MUIC-ICCS-372-SE/customer-order-history`

## 3. Blockers / Problems
- Mapping the various order statuses (`PENDING`, `IN_PROGRESS`, etc.) accurately to the UI states required extensive refactoring. 
- Ensuring that inactive staff were gracefully denied access to modify active orders required tight coordination with the auth and security layer.

## 4. Short Reflection
- Getting the initial staff pending order flow working was a major step forward for the backend logic and frontend real-time state. It forced me to think closely about how data is transformed for the dashboard vs. the database.

## 5. What I plan or have been assigned to do next week?
- Set up Cloudflare R2 bucket for image hosting.
- Implement profile and menu image uploads.
- Fix any remaining staff order flow bugs, such as special requests and canceling in-progress orders.
