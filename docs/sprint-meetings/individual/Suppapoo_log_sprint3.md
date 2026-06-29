# Individual Contribution Log — Sprint 3 (Week 9-10)

**Name:** Suppapoo
**Team:** 3
**Week / Date Range:** June 13, 2026 – June 26, 2026

## 1. What I planned to do this week
- Design and develop the Customer Order History feature to allow customers to view their past and active orders. (currently using mock data in frontend)
- Ensure the Order domain models align properly with my teammates working on related features (like Order Summary and Cart).

## 2. What I actually did
- **Frontend Development:** Created the `OrderHistory.tsx` React component with a clean UI (including CSS modules) that handles displaying order lists, statuses, addresses, and individual items.
- **Backend Services & DTOs:** Implemented `OrderHistoryService.kt` to securely fetch a user's past orders. Created the `OrderHistoryResponse` and `OrderDetailItemResponse` DTOs to structure the outgoing JSON payload.
- **Database Repositories:** Wrote specific query methods in `OrderRepository`, `OrderDetailRepository`, and `OrderItemSelectionRepository` to efficiently fetch and map order records and their associated customized selections.

### Evidence:
- **Issue(s):**
  - Issue #52
- **Branch:** `customer-order-history`
- **Commit(s):**
  - `Issue #52; WIP: orderhistory`
  - Resolved merge conflicts with `origin/cart-summarize`

## 3. Blockers / Problems
- **Database & Menu Structure Issues:** I discovered that the current database design and menu structure are not well-aligned and are breaking down under implementation. This makes the overall flow of the website very difficult to navigate and code, as the data doesn't map cleanly to the intended user journey.

## 4. Short Reflection
- This sprint highlighted how critical Git workflows and frequent branch syncing are when multiple developers touch the same domain models (like `Order`). Learning how to gracefully navigate merge conflicts without losing work was a huge milestone. Additionally, implementing the nested DTO mapping on the backend greatly improved my understanding of Kotlin collections and Spring Boot relationships.

## 5. What I plan or have been assigned to do next week?
- Finalize the integration of the Order History feature into the main application layout and routing.
- Perform end-to-end testing of the ordering flow (from cart to checkout to history) with the team.
- Staff pending order, order tracking page.
