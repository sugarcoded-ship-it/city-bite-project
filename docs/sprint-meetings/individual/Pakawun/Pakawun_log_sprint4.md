# Individual Contribution Log — Week 11

**Name:** Pakawun Jindawat
**Student ID:** 6681453
**Team:** 3
**Week / Date Range:** June 27, 2026 – July 3, 2026

## 1. What I planned to do this week

* Implement the Customer's Refund Credit system and the associated staff order-cancellation flow.
* Refine backend controllers and troubleshoot existing bugs within the stock management module.
* Conduct system integration flow testing and ensure correct API responses for frontend updates.

## 2. What I actually did

* **Refund Credit ("Points") System Implementation:** Built the logic to handle order cancellations by staff, ensuring the customer is refunded the full order total directly to a `refund_credit` wallet where 1 point equals 1 baht.
* **Customer UI Updates:** Added a real-time credit-balance badge to the `CustomerTopNav` component, which fetches data directly from the `GET /api/customer/credits/balance` endpoint.
* **Stock Management Refactoring:** Switched the `StockCategory.name` mapping from a custom `@Convert` converter to `@Enumerated(EnumType.STRING)` to properly align the database values, entities, and CHECK constraints. 



### Evidence:
- **Issue(s):** 
  - Issue #49: Customer's Refund Credit

- **Commit(s):**
  - `a365ea1 - Issue #49; fix: fixing the refunded credit to the customer logic`
  - `a44630c - Issue #49; feat: Implement refunded credit system on order cancellation`

## 3. Blockers / Problems

* **Database & Entity Mapping Conflicts:** Encountered issues where the custom `@Convert` converter for stock categories was not aligning properly with database constraints and entity values during transactions.
* **Null Pointer Exceptions on Staff Lookups:** The system was throwing errors when attempting to verify the inactive status of a staff member if their record was completely missing from the database.
* **How did I respond?**
  * Removed the custom converter entirely and implemented `@Enumerated(EnumType.STRING)` to securely enforce the constraints at the JPA level.

## 4. Short Reflection

* Building the refund pipeline required a deep dive into linking backend transaction safety with seamless frontend UI updates. Troubleshooting the stock category constraints and standardizing our controller responses with `ResponseEntity` reinforced the importance of strict data typing and clear HTTP communication across the full stack.

## 5. What I plan or have been assigned to do next week?

* **Final System Polish & QA:** Run comprehensive end-to-end tests across the finalized CityBite application to ensure all edge cases for orders and refunds are caught.
* **Documentation:** Finalize the project README, runbooks, and Architectural Decision Records (ADRs) required for the term project submission.
* **Presentation Prep:** Collaborate with Team 03 to prepare the final demo and presentation slides detailing our core architecture and workflows.