# Sprint Meeting Notes — Week 2

Team: 3
Date: 5/19/2026
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
* Basic UI Design Prototype (figma lofi)
    * Customer UI 
    * Login/Signup Page UI
    * Customer Order Page/Order Status
    * Staff Order Status and Order 
* Login and Signup
    * Authentication and Security
    * Password Hashing Using Advanced Algorithms
* C4 Architecture Design
* Completed the ERD diagram


Not completed:
* Other backlogs
* Database Design 

Problems / blockers:
* UI - Hard thinking about some tiny buttons like  what it need to direct to or pop up
* Communication during the workflow
*

## 3. Current Sprint Plan
**Sprint Goal:** Finalize the database implementation and continue backend infrastructure setup.

Complete remaining database tables and relationships
Refine transaction-related ERD design
Configure backend infrastructure and API integration
Test database schema implementation

## 4. Risks / Blockers (if any)
Communication and coordination between frontend and backend development
Uncertainty in transaction workflow requirements

## 5. Decisions Made (major decisions)
We decided to adopt a monorepo structure for project development.
We will use Docker and NGINX to standardize the development environment.
We will meet regularly to help team members learn the tools and workflow

## 6. Action Items 
| Fix indentation error in docker-compose | Tawancs | 6/5/2026 |
| Add .env.example templates for root and frontend | Tawancs | 6/5/2026 |
| Update vite.config.ts to support reloading through NGINX | Tawancs | 6/5/2026 |
| Add example apiClient for frontend | Tawancs | 6/5/2026 |
| Update ADR to use monorepo strategy instead of monolithic architecture | Tawancs | 6/5/2026 |
| Update weekly individual log for Week 7 Sprint 2 | Pluem Nattapas | 6/8/2026 |
| Add new tables to the existing database schema | Pluem Nattapas | 6/9/2026 |
| Fix incorrect column configurations and add measurement unit enum | Pluem Nattapas | 6/10/2026 |
| Fix incorrect variable type (val → var) for ManyToOne column|Pluem Nattapas|6/11/2026 |




## 7. Client Update Owner

The client was informed of the team's progress on the UI prototype, authentication system, architecture design, and database setup.

Feedback received focused on ensuring the ordering workflow remains simple for customers and staff. The team will continue refining the database design and transaction flow before the next client review.