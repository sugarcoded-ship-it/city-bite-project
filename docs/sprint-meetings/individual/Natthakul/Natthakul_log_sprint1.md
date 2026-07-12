# Individual Contribution Log — Week 4

Name: Natthakul Yikusungb \
Team: 3 \
Week / Date Range: 4 / 5/11/2026 - 5/17/2026

## 1. What I planned to do this week
- Coordinate team meetings to prepare for the Project Kick-off and Implementation Readiness presentation.
- Finalize the system design and technical direction with the team.
- Write the Architecture Decision Record (ADR) to document and justify our choices for the tech stack (React, Kotlin, Spring Boot, PostgreSQL, Stripe).

## 2. What I actually did
- **Coordinated the Kick-off Presentation:** Organized the team to create the presentation outline, split the speaking roles evenly among all 6 members, and managed the time limits so we stay within the 20-25 minute goal.
- **Created the Architecture Decision Record (ADR):** Wrote the formal ADR detailing why we chose a web-based React frontend, a Kotlin/Spring Boot backend container, and PostgreSQL. I also documented our external service choice (Stripe Thailand) for secure payments. 
- **Evidence:**
  - **Issue(s):** #1 (Write ADR for Tech Stack), #2 (Coordinate Kick-off Presentation)
  - **Pull Request(s):** PR #1 (Added `ADR_01_TechStack.md` to repository docs)
  - **Commit(s):** `feat: add initial architecture decision record for core stack`
  - **Document(s):** `ADR_01_TechStack.md`, `Team03_Architecture_Page_v1.pdf`
  - **Meeting notes / other evidence:** Led the weekly team sync on [Date]; notes are in our team Notion/Discord.
  - **Collaboration:** I worked closely with the whole team to agree on the tech stack. I also helped everyone review their presentation scripts to ensure smooth handoffs.

## 3. Blockers / Problems
- **What blocked me?** It was difficult to schedule a time when all 6 members could meet to practice the presentation. Also, making sure everyone agreed on the backend language took some extra discussion.
- **How did I respond?** I set up an asynchronous poll to find the best overlapping schedule for the team. For the tech stack, I facilitated a vote after listing the pros and cons of Kotlin vs. other languages, which I then recorded in the ADR.

## 4. Short Reflection
This week, I learned that being a coordinator requires a careful balance of technical planning and team management. Writing the ADR taught me how to formally justify our engineering choices, like why we need Spring Boot for backend stability. I also learned that structuring a presentation for six people is challenging; it requires clear handoffs and strict time management so the client doesn't get bored. Overall, aligning the team's vision on what makes our MVP valuable was a great learning experience in leadership.

## 5. What I plan or have been assigned to do next week?
- Set up the main project task board (Jira/GitHub Projects) and map out Sprint 1 tasks.
- Initialize the GitHub repositories (frontend and backend) with proper branch protection rules.
- Help the team set up the PostgreSQL database schema.
- Coordinate the first official Sprint Planning meeting.