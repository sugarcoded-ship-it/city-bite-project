# Individual Contribution Log — Week 4

Name: Chawinthorn Kittivacharaphong
Team: 3
Week / Date Range: 4 / 5/11/2026 - 5/17/2026

## 1. What I planned to do this week
- Initialize frontend and backend repositories.
- Set up Dockerfile environments for both repositories.
- Set up docker-compose to run both frontend and backend together.
- Configure NGINX as a reverse proxy.

## 2. What I actually did
- **Initialized Repositories:** Successfully set up both the frontend and backend codebases.
- **Docker Setup:** Created the Dockerfile environments for building and compiling the project.

- **Commit(s):** *chore(infra): setup Docker for frontend, backend, NGINX, and database* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/e3192f48457816ab61b8c6c5cdc55d2c78a2d203)

## 3. Blockers / Problems

- We don't yet know which specific dependencies the project needs because feature development hasn't started. I decided to hold off on adding dependencies. We will identify and add them during the next sprint once actual project work begins.
- This was my first time setting up a project with Docker, so I faced many problem. It take a lot of time to learn Docker fundamentals (thanks to Nanu and Pa for the help!). Through research and troubleshooting, I eventually figured out the correct database setup.

## 4. Short Reflection
- This week, I gained experience with Docker and learned how containerization improves our development workflow. By writing Dockerfiles, I saw how Docker simplifies building and compiling the project into isolated, consistent environments. Furthermore, using docker-compose up was a huge quality-of-life improvement, allowing us to spin up the frontend, backend, and database simultaneously without tedious manual steps. Finally, I learned a critical security practice: sensitive database credentials and configuration data must be kept out of version control and never pushed to the Git repository.

## 5. What I plan or have been assigned to do next week?
- Design the ER (Entity-Relationship) Diagram for the project database.
- Research and make an architectural decision between Argon2 and JWT for our authentication/security implementation.
