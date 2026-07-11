# Individual Contribution Log — Week 12

Name: Chawinthorn Kittivacharaphong \
Team: 3 \
Week / Date Range: 12 / 7/10/2026

## 1. What I planned to do this week
- Finish the remaining staff and owner-related features, especially staff creation, staff profile updates, and day off request work.

## 2. What I actually did
- **Staff Creation Features:** Implemented the staff creation flow with typed API responses and dual-entity persistence so new staff accounts could be created cleanly.
- **Staff Profile Features:** Built the staff profile UI with image upload handling and updated the backend/profile service so profile fields could be edited and synced properly.
- **Leave Request Features:** Added routes, endpoints, and frontend pages for staff leave requests and owner leave request management.
- **Cleanup and Fixes:** Fixed lint errors, route issues, import paths, and other small problems that came up while integrating the later features.

- **Commit(s):** 
    - *Issue #69; feat: implement staff creation with dual-entity persistence and Keycloak integration* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/1757065)
    - *Issue #69; feat: add staff creation functionality to staff list and integrate API POST request* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/e1fcb70)
    - *Issue #69; refactor: replace 'any' type annotations with explicit definitions* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/c3a34d7)
    - *Issue #69; fix: explicitly type apiClient response to match Staffs signature in .then* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/25196fa)
    - *Issue #89; feat: implement staff profile UI with image upload handling* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/871fdc5)
    - *Issue #89; feat: support updates to staff username, name, email, password, and profile* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/5cf54c6)
    - *Issue #89; refactor: generalize CustomerProfileService into ProfileService to support other roles* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/747d136)
    - *Issue #91; feat: add routes for StaffDayOffRequest and OwnerDayOffRequest in App.tsx* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/7023559)
    - *Issue #91; feat: implement staff leave request view for owner frontend* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/f000d16)
    - *Issue #91; feat: create endpoint for owners to manage staff leave day requests* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/c74e3e7)
    - *Issue #91; feat: implement staff leave day request page on frontend* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/b4c2bf5)
    - *Issue #91; feat: create endpoint for staff leave day requests* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/3b42fae)
    - *Issue #84; fix: Fix storeAddress customization to support geocode* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/dc7d581)
    - *Issue #25; fix: correct missed import paths from previous file move* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/563e0e5)
    - *Issue #25; fix: handle error in empty catch block to resolve build/lint failure* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/b42d163)
    - *Issue #25; fix: implement soft delete for menu items to prevent order constraint crashes* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/cabb8c2)

## 3. Blockers / Problems

- A few late-stage fixes were still needed while feature work was being merged, so I had to deal with lint errors and broken imports at the same time.
- The staff profile and leave request work also required checking several related files together, which made the implementation more time-consuming.

## 4. Short Reflection
- I became more confident working across backend and frontend changes, especially when a feature needed route updates, API work, and UI changes at the same time.

- I believe I have a better understanding of how to read and understand teammate code, which will help me in future projects.

- **MY MISTAKE**: I misunderstood the Agile documentation workflow and wrote my sprint notes retroactively after completing the tasks, rather than immediately following the planning meetings. This caused the following tracking errors in my past submissions:
  - **Sprint Offset:** The labeling of my sprint notes is shifted by +1 (e.g., what is labeled as "Sprint 1" is actually Sprint 2), with the exception of Sprint 5.
  - **Missing Documentation:** The initial Sprint 1 planning note was never created, because my very first document was already operating on the shifted timeline.
  - **Incorrect Date Ranges:** The dates recorded on my notes reflect the execution period (the weeks spent doing the work) rather than the actual date the planning meetings occurred. 
  - **Late Submission (Sprint 4):** My Sprint 4 notes were submitted late because I followed my flawed workflow and submitted them right before the Sprint 5 meeting, instead of immediately after the Sprint 4 meeting.

## 5. What I plan or have been assigned to do next week?
- No more assigned work for the next week as the project is closed.
