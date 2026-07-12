# Individual Contribution Log — Week 9-10

**Name:** Natthakul Yikusung

**Student ID:** 6680972

**Team:** 3

**Week / Date Range:** June 13, 2026 – June 26, 2026


## 1. What I planned to do this week

* Collaborate with the team to understand layout structures and system integration flows for Sprint 3.
* Design, build, and configure the layout screens for the Owner Dashboard and Menu Configuration views.
* Support development of the main Customer Menu Page, matching alignment, background colors, and navbar interactions across views.



## 2. What I actually did

* **Owner Dashboard & Menu Configuration:** Designed and structured the visual layout for the Owner Dashboard views and menu configurations, focusing on keeping the design clear and accessible for administrators managing items.
* **Customer Menu Page UI Development:** Built and styled aspects of the primary Customer Menu page layout, working closely with the team to ensure color schemes (like the `#f0f2f7` background) and fixed capsule-shaped top navigation structures flow seamlessly across views.
* **Route Tracking & Peer Assistance:** Collaborated alongside teammates to walk through application navigation bounds, aligning my frontend component boundaries with existing route pathways.

### Evidence:
- **Issue(s):** 
    - Issue #7: Customer browses categorized menu
    - Issue #8: Customer adds customized items to cart
    - Issue #45: UI/UX Redesign: Menu Navigation and Item Availability
  - Issue #50: Implement owner dashboard overview page

- **Commit(s):**
  - `31c1396 - Issue #50; feat: create new repositories to prepare for starting owner dashboard`
  - `4a17b65 - Issue #45; style: improve CustomerHome UI layout and fix cart scroll tracking`

## 3. Blockers / Problems

* **Frontend State & Architecture Misunderstanding:** Experienced major difficulties due to ongoing misunderstandings of how frontend component architectures operate (e.g., tracking state changes across files, handling properties between fixed navbars and view components, and understanding asynchronous updates). Translating static visual mockups into functional, reactive React views took me significantly more time.
* **How did I respond?**
* Spent extra time studying the project's existing frontend patterns and CSS module setups. I actively sought help from my teammates, reviewing how they connected elements and pair-programming to trace layout styles until the margins, colors, and headers aligned properly.

## 4. Short Reflection

* Working on the Owner Dashboard and Customer Menu page taught me how critical full-stack synergy is. Translating designs into real code exposed gaps in my understanding of React layouts and state rendering, but stepping through visual bugs with my team helped clarify how data maps onto components. I learned that clear styling contracts, systematic spacing rules, and communicating front-end boundaries early are essential to keeping project layouts clean.

## 5. What I plan or have been assigned to do next week?

* **UI Consistency & Layout Refinement:** Review and polish user interface layouts across pages, specifically double-checking styling alignments, margins under headers, and responsive behaviors.
* **Integration Support:** Help team members test page components to verify that user actions on the front-end map cleanly onto our system states without rendering artifacts.