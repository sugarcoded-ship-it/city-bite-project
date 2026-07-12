# Individual Contribution Log — Week 12

**Name:** Pakawun Jindawat

**Student ID:** 6681453

**Team:** 3

**Week / Date Range:** July 4, 2026 – July 10, 2026


## 1. What I planned to do this week

* Finalize the system polish and run comprehensive end-to-end tests across the CityBite application.
* Complete all required project documentation, including the README, runbooks, and Architectural Decision Records (ADRs).
* Collaborate with the team to design presentation slides and prepare the environment for a flawless live demo.

## 2. What I actually did

* **Presentation Preparation:** Co-authored the final slide deck, focusing on visualizing our core architecture, the multi-role user flow (Customer, Staff, Owner), and the technical challenges we overcame regarding state management and backend entity constraints.

* **Live Demo Configuration:** Set up and stabilized a staging environment specifically for the final evaluation. Generated a database seeding script to pre-populate test accounts, stock items, and active orders to smoothly demonstrate the end-to-end checkout and refund credit pipeline.

* **System QA:** Conducted final walkthroughs of the application with team members to ensure all edge cases for the order cancellation and refund points system were handled gracefully without UI artifacting.

## 3. Blockers / Problems

* **Live Demo Data State:** We needed a way to ensure the live demo environment had reliable data states without risking unexpected crashes or data missing during the actual presentation showcase (e.g., trying to cancel an order when no orders exist).
* **How did I respond?**
  * Wrote a dedicated SQL seed script to reset the database to a known "golden" state right before the presentation. This guaranteed that the refund points system and stock management could be demonstrated flawlessly in real-time.

## 4. Short Reflection

* Preparing for the presentation and live demo shifted my perspective from building the application to actually "selling" and explaining it. Distilling our complex backend architectures, like the custom converters versus enum constraints, into digestible talking points for the evaluation was challenging but highly rewarding. It served as a great capstone to see the entire CityBite project come together seamlessly.

## 5. What I plan or have been assigned to do next week?

* Project is closed