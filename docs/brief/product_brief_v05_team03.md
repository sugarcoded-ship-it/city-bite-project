# TA 1.3 Product Brief v05 - Team 03

## Problem Statement
CityBite’s current ordering system is lacking clarity and consistency. It relies on multiple channels such as walk-ins, phone calls, and chat messages. This can be confusing for users and can lead to inaccurate orders, inconsistent menu information and unclear order status. As the demand grows the staff will have even more issues with the current system. However, a simple and clear digital system that helps to centralize ordering and all the necessary information and data for users will improve the efficiency of the business as a whole.

## Stakeholders and User Roles
* **Customer** – A person who orders the items and sees the list of available items on the menu along with the price, they interact with the real time tracker.
* **Staff** – A CityBite staff member who manages incoming orders, confirms details, and updates the status of food preparation. Staff are currently overwhelmed by scattered communication across phone and chat; they need one centralized place to verify exact order contents and customer requests.
* **Owner** – The business owner who wants to reduce operational costs slips. They care about having a clear overview of operations and ensuring the workflow remains stable even when the shop gets busy.

## User Needs
* **Immediate response:** When customers ask a question on their order or available items, they want an immediate response.
* **Status Information:** As customers want to know when their food will arrive and if it actually reaches the restaurant including estimated time arrival.
* Staff needs to quickly update order status, manage menus and be able to see all the orders at once to ensure clarity.
* The owner needs a more stable and professional operating process that reduces small mistakes and gives better visibility into the shop’s daily performance.

## MVP Scope / In-Scope Functionality
First MVP will be focusing on making a web-based food ordering system.

### Customer side:
* **Menu Display:** Group menu by category (e.g., Main, Sides, Drinks) and within each category available food/drink will be displayed at the top, while unavailable items will be displayed at the bottom.
* **Food/Drink Customization:** Let customers customize a specific dish to some extent such as no spice, add fried egg.
* **Store Operating Hours:** Show open/close time. During close time customers can’t add any item to the cart.
* **Shopping cart:** Keep track of the total dishes and price for customers and payment. Including their address details and contact details.
* **Status tracker:** Customer can see status (e.g., pending, in kitchen, on the way).
* **Estimated time arrival.**

### Staff side:
* **Food status update:** Separate into 3 main categories:
  * The availability of food (e.g., available, unavailable)
  * The order status (e.g., in kitchen, on the way)
  * Estimated delivery time
* **Order Inbox:** Tons of order (FCFS).
* **Order detail:** Summarize customer orders into bullet points if they have a special request (e.g., allergic to something) and the option we provide (e.g., extra fried egg, extra size, etc.).

## Out-of-Scope Functionality
* **Payment processing:** Can be very complex when orders have the pay on pickup/delivery option.
* **Full Delivery System:** No route optimization for a first version.
* **Advanced User accounts:** Allow guest ordering for now as this specific feature is not necessary for a first version.
* **Promotions/Discounts System:** Too complex for first version.

## Assumptions
* Customers have to access the smartphone and an internet connection to browse the menu and place the orders.
* The shop has at least one dedicated device (tablet, laptop,...) connect to the internet at the counter to monitor the staff dashboard.
* The menu size is manageable enough that staff can manually update item availability when the ingredient run out.
* Customers will provide accurate and valid contact information when submitting a guest order. 
* Staff will manually control when the digital ordering system is open or closed, or customers will only order during known business hours.
* Menu items is do not require highly complex, multi-level customization


## Constraints
* **Strict Scope Limits:** The business owner explicitly does not want a full commercial ordering platform, complex delivery logistics or an enterprise retail system. Solution must remain a lightweight MVP.
* **Time and Resources:** As a small student software engineering team, we are constrained by the academic timeline and current technical capacity.
* **Excluded Features:** To keep the project manageable, complex integrations like automated payment gateways or third-party delivery driver tracking should be excluded from the initial version.
* **Academics Deliverables:** Product specific documentation (Product Brief, design documents, handover materials) are required alongside the actual code.

## Risks
| Risk | Why it matters  | Possible mitigation strategies |
| :--- | :--- | :--- |
| Scope Creep | Adding non-essential features risks missing the project deadline. | Strictly build the MVP and defer extras to a backlog.
| Poor Staff Adoption | Staff will abandon complex systems during busy store rushes. | Build a simple, low-click interface tested with the staff.
| Data Synchronization Failures | Slow status updates will digitize their current menu confusion. | Use real-time syncing and add instant "sold out" toggles. |
| Over-engineering | Complex architectures slow down development and make handovers difficult. | Use a simple, proven tech stack to ensure easy maintenance.
| Unfamiliar Technologies | Learning new tools mid-project causes major delays and bugs. | Choose familiar frameworks or allocate early time for learning. |

## Success Criteria / What Makes the MVP Valuable
These are the outcomes that prove the project was a success. The MVP is the smallest thing that solves the problem.
* **Centralization:** The orders now will be recorded in one page or one dashboard so the orders will not scatter across the chat and phone call which will help staff to handle it better.
* **Menu accuracy:** Staff only update the menu in one place for it to show to all customers.
* **Order restrictions:** The unavailable items will not be submitted as the system prevents it.
* **Inquiry load:** Reduction in phone call and message just to ask the question ”what when why how”.
* **Structured List:** Moving all informal chat and phone call data to structured order list form, reducing the misunderstanding.
* **Status visibility:** Offering the place to check for the status of the order prevents a ton of questions.
* **Customer feeling:** They get an immediate response on what is available, improving their experience.
* **Immediate use:** The business can actually use it immediately without a large IT team to manage it.

## Initial Technical Direction
Our current plan is to build a responsive web application that streamlines the ordering process for both customers and staff.

* **System type:** Web-based digital ordering and status tracking system.
* **Front end:** **React** to create a dynamic, real-time interface for menu browsing and order management.
* **Back end:** **Kotlin** (using Spring Boot or Ktor) to provide a robust, type-safe environment for handling order logic.
* **Database/storage:** **PostgreSQL** to reliably store structured data for the menu, customer orders, and status tracking.
* **Demo approach:** Local demonstration; simple hosted demo if time allows.
* **Version control:** GitHub repository with issues, pull requests, and basic CI.

These choices are not final. If the team changes a major technology choice later, we will record the reason in an ADR.