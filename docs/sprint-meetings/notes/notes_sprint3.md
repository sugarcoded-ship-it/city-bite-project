concerns and problems:
Logic difficulties
Unfamiliar Coding Language# Sprint Meeting Notes — Week 3

Team: 3
Date: 6/14/2026
Attendees: Nattapas
Chawinthorn
Suppapoo
Natthakul
Pakawun
Matteo


## 1. Opening Check-in
- Member 1: Suppapoo 6681437
- Member 2: Natthakul 6680972
- Member 3: Pakawun 6681453
- Member 4: Chawinthorn 6681402
- Member 5: Matteo 6480996
- Member 6: Nattapas 6681399

## 2. Previous Work Review
Completed:
* Database implementation
    * All remaining tables and relationships added
    * Column configurations and measurement unit enum fixed
    * Transaction-related ERD design refined
* Authentication system
    * Login and Signup fully working
    * Password hashing and security finalized
* Backend infrastructure setup
    * Monorepo structure in place
    * Docker and NGINX configured for the development environment
    * `.env.example` templates and example apiClient added

Not completed:
* Other backlogs
* Middle fidelity workflow for customer, staff, and owner (still in progress)

Problems / blockers:
* Logic difficulties: Some of the business logic — especially around the ordering and transaction flow — is harder to translate into code than expected. There are several edge cases (e.g. order status changes, who can see or edit what) that we are still working out how to handle cleanly.
* Unfamiliar coding language: A few team members are still getting comfortable with the language and frameworks we are using on the backend and frontend. This slows down implementation because we sometimes have to stop and look up syntax or the "right way" to do something before we can move forward.

## 3. Current Sprint Plan
**Sprint Goal:** Start implementing the actual application code now that the database and authentication are complete, and add/update backlog items to match what we plan to build this sprint.

* Begin implementing core features on top of the finished database and auth
* Connect the frontend to the backend API for the main order flow
* Add and update backlog items so the board reflects the real implementation tasks
* Continue the middle fidelity workflow for customer, staff, and owner
* Write basic tests as features are implemented

## 4. Risks / Blockers (if any)
* Logic difficulties: Translating the order and transaction workflow into working code is taking longer than planned, and unclear requirements in some areas make it hard to know the "correct" behavior.
* Unfamiliar coding language: The learning curve with our tools and language is still affecting how fast we can implement features. We may need to pair up so people who are more comfortable can help the others.

## 5. Decisions Made (major decisions)
* Now that the database and authentication are complete, we will shift focus from setup to actual feature implementation.
* We will add and update backlog items so the board accurately reflects the implementation work for this sprint.
* We will pair up / meet regularly so members more familiar with the language can help the rest of the team get up to speed.

## 6. Action Items
| Action | Owner | Due Date |
|---|---|---|
| Review and update the backlog to reflect implementation tasks | Pakawun | 6/17/2026 |
| Implement core order flow on the backend | Natthakul | 6/20/2026 |
| Connect frontend to backend API for the order flow | Chawinthorn | 6/20/2026 |
| Continue middle fidelity workflow (customer, staff, owner) | Matteo | 6/21/2026 |
| Set up a short pairing session to share coding tips for our stack | Nattapas | 6/18/2026 |

## 7. Client Update Owner
Name: Pakawun and Nattapas
