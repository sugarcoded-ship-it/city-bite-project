# Individual Contribution Log — Sprint 5 (Week 12)

**Name:** Suppapoo Ekpipattana
**Team:** 3
**Week / Date Range:** Week 12 / June 26, 2026 – July 9, 2026

## 1. What I planned to do this week
- Setup and integrate Cloudflare R2 for decentralized image hosting (menu items, user profiles).
- Fix remaining workflow bugs on the Staff Dashboard, particularly regarding in-progress cancellations and missing special requests.
- Wrap up final adjustments to the UI layouts and redundancy cleanups.
- Update handover documentation.

## 2. What I actually did
- **Cloudflare R2 Integration (#82, #83):**
  - Configured Cloudflare R2 bucket and environment variables.
  - Implemented image upload support for both menu item configuration and user profile pictures.
  - Updated the Staff list and detail views to render profile pictures.
  - Added an Order Box summary to the Owner Dashboard.
- **Staff Order Management Fixes & Refinements (#76, #84):**
  - Passed selected option choice IDs through the cart to checkout so staff can properly see customer selections.
  - Fixed a critical bug where special requests were being ignored and saved as null in `OrderDetail`.
  - Added support for canceling `IN_PROGRESS` orders directly from the frontend Staff Dashboard (assigned staff only), which also successfully restores previously deducted stock.
  - Refactored staff dashboard columns and order flow, cleaning up redundant DTOs.
  - Displayed assigned staff for delivered orders in the Order History layout.
- **Documentation:**
  - Updated handover documentation to reflect the completed staff leave management implementation.

### Evidence:
- **Issue(s):** #76, #82, #83, #84
- **Branch(es):** `r2-bucket`
- **Commit(s):**
  - `Issue #76; fix: staff order management issues - Pass selected option choice IDs...`
  - `Issue #82; feat: Setup Cloudflare R2 Bucket & Add Order Box to Owner Dashboard`
  - `Issue #82; feat: Add image upload to Cloudflare R2 for menu and profile`
  - `Merge pull request #83 from MUIC-ICCS-372-SE/r2-bucket`
  - `Issue #84; refactor: staff dashboard columns and flow of order, clean up redundant DTOs`
  - `Issue #none; docs: update handover documentation to reflect completed staff leave management implementation`

## 3. Blockers / Problems
- Implementing the stock restoration upon an order cancellation required careful verification to avoid race conditions or data inconsistency if the stock was concurrently modified elsewhere.
- Setting up Cloudflare R2 required configuring the proper CORS and authentication parameters, which was a new challenge for the team.

## 4. Short Reflection
- Completing the project by integrating a third-party bucket (Cloudflare R2) made the final product feel much more "production-ready". Tracing the entire order flow—from cart selection (with options and special requests) all the way through the staff dashboard and finally to cancellation/restoration—proved that our system architecture is robust.

## 5. What I plan or have been assigned to do next week?
- Project handover and final team presentations.
