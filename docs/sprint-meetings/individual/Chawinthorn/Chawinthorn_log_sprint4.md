# Individual Contribution Log — Week 11-12

Name: Chawinthorn Kittivacharaphong \
Team: 3 \
Week / Date Range: 11-12 / 6/20/2026 - 7/2/2026

## 1. What I planned to do this week
- Continue finishing Owner and Staff page work, especially staff list/detail features, route cleanup, and staff creation support.

## 2. What I actually did
- **Frontend Restructure:** Reworked the frontend into feature-based layers and removed duplicate files to keep the project structure easier to maintain.
- **Staff Creation Support:** Started the staff creation flow with dual-entity persistence and Keycloak integration so new staff accounts could be created correctly.

- **Commit(s):** 
    - *Issue #none; refactor: restructure frontend project to feature-based layers* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/0edd419)
    - *Issue #58; feat: implement database fetching and response for staff details* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/aea94db)
    - *Issue #58; feat: create staff detail component and configure routing* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/b733705)
    - *Issue #27; feat: implement frontend role guards for invalid and unauthorized roles* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/0b2c98a)
    - *Issue #27; refactor: update route paths based on roles excluding customer* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/748d92a)
    - *Issue #27; fix: add missing leading slashes to owner and staff detail routes* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/8563403)
    - *Issue #69; feat: implement staff creation with dual-entity persistence and Keycloak integration* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/1757065)

## 3. Blockers / Problems

- This is the first time I have worked to configure a keycloak integration for staff creation, so I had to spend a lot of time researching how to implement it correctly.
- Implementing frontend role guards required me to read and understand the exiting routing and what roles were allowed to access each route. I had to carefully check the existing code and make sure that the guards were implemented correctly to prevent unauthorized access.
- Some work also needed extra attention because lint and merge-conflict fixes were happening alongside feature changes.

## 4. Short Reflection
- Learning how to implement Keycloak integration for staff creation was a valuable experience, as it required me to research and understand the authentication and authorization process in depth. I also gained experience in implementing frontend role guards, which helped me understand how to secure routes and prevent unauthorized access. Overall, this week has been a great learning experience, and I feel more confident in my ability to work on complex features and integrations.

## 5. What I plan or have been assigned to do next week?
- Out scope feature for Owner and Staff pages, especially staff creation, staff profile updates, and day off request work.
