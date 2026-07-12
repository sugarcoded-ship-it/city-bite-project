# Individual Contribution Log — Week 11

**Name:** Natthakul Yikusung
**Student ID:** 6680972
**Team:** 3
**Week / Date Range:** June 27, 2026 – July 3, 2026

## 1. What I planned to do this week

* Analyze and map the core user flow interactions across all primary system roles (Customer, Staff, and Owner).
* Design and implement the user interface layout for the new Refund System.
* Ensure frontend component states handle conditional rendering smoothly when processing data pathways between roles.

## 2. What I actually did

* **Core Flow System Mapping:** Structured the UI/UX components to accurately reflect the sequential operational logic of the application across three user perspectives:
  * **Customer Flow:** Browsing, item customizations, checkout review, and post-purchase refund requesting.
  * **Staff Flow:** Order verification, real-time preparation tracking, and preliminary refund request evaluations.
  * **Owner Flow:** High-level dashboard management, menu adjustments, and final financial approval for refunds.
* **Refund System Implementation:** Built the reactive frontend architecture for the refund request lifecycle. Developed a client-facing submission form for customers and an administrative decision panel for staff and owners to approve/deny incoming requests.
* **State & Layout Alignment:** Worked closely with team members to bind the role-specific views with current application pathways, verifying that conditional components render reliably based on user access levels.

### Evidence:
- **Issue(s):** 
  - Issue #60: Feature: End-to-end user role workflow alignment (Customer, Staff, Owner)
  - Issue #61: Feature: Implement frontend Refund System layouts and submission panels

- **Commit(s):**
  - `7d2c34a - Issue #60; feat: map state management paths across role dashboards`
  - `b18ef92 - Issue #61; feat: layout refund submission forms and conditional logic for admin review`

## 3. Blockers / Problems

* **Cross-Role State Syncing & Asynchronous Updates:** Experienced difficulties managing state dependencies between distinct user roles. Specifically, ensuring that a refund action triggered by a customer immediately updates the data status visible in the Staff and Owner dashboards without layout rendering artifacts or data mismatch issues.
* **How did I respond?**
  * Dedicated extra time to researching asynchronous state lifecycles and conditional layout patterns.
  * Conducted focused code reviews and pair-programming sessions with team members to safely link shared state contexts down through parent components.

## 4. Short Reflection

* Implementing the core workflow profiles alongside the Refund System highlighted how critical clean data architecture is in multi-role applications. It forced me to think beyond static visual elements and consider how real-time actions propagate between customer, staff, and owner interfaces. I learned that defining precise structural contracts and anticipating how states cross component boundaries early on prevents major UI bugs down the line.

## 5. What I plan or have been assigned to do next week?

* **System Integration Flow & Testing:** Collaborate with the team to thoroughly test layout structures, data pipelines, and system integration flows for all active sprints.
* **Order Tracking Layouts:** Design, build, and configure the dedicated layout screens for final Order Tracking views.
* **Documentation & Presentation Prep:** Update all related system documentation to reflect our current project architecture to prepare for the final evaluation.