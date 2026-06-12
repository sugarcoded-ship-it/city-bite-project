# Individual Contribution Log — Week 7-8

Name: Chawinthorn Kittivacharaphong \
Team: 3 \
Week / Date Range: 7-8 / 5/29/2026 - 6/12/2026

## 1. What I planned to do this week
- Set up authentication system using Keycloak for our project. This involved configuring Keycloak to manage user authentication and authorization, and integrating it with our backend and frontend applications.
- Using token based authentication to secure our API endpoints and ensure that only authenticated users can access certain resources. This included implementing JWT (JSON Web Tokens) for secure communication between the frontend and backend.

## 2. What I actually did
- **Configure Keycloak:** Successfully set up Keycloak server and created a realm, client, and user roles to manage authentication for our project.
- **Choosing Hashing Algorithm:** After researching and evaluating different options, I decided to use Argon2 for password hashing in our authentication system. Argon2 is a modern and secure hashing algorithm that provides strong protection against brute-force attacks and is widely recommended for password hashing.
- **Integrate Keycloak with Backend:** Integrated Keycloak with our backend application to handle user authentication and authorization. This involved configuring the backend to validate JWT tokens issued by Keycloak and enforce access control based on user roles.
- **Integrate Keycloak with Frontend:** Integrated Keycloak with our frontend application to enable user login and secure access to protected routes. This included implementing a login flow that redirects users to the Keycloak login page and handles the authentication response to obtain JWT tokens for subsequent API requests.
- **Sync Authenticated User to Local Database:** Implemented functionality to sync authenticated Keycloak users to our local database on the home page. This allows us to maintain a record of users in our own database while still leveraging Keycloak for authentication.

- **Commit(s):** 
    - *Issue #27; chore: configure keycloak container and set up nginx reverse proxy* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/tree/6342eb064c3dfa5017c9bcee932430e33da728f8)\
    - *Issue #27; chore: add initial keycloak realm-config for team use*
    (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/tree/c09dedc127d83476449434c621df7dc49969ea50)
    - *Issue #27; feat: add WebSecurityConfig with Keycloak JWT and role converters* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/tree/ede85c9384acc7fc2bc5f2ad825312da0db0554e)
    - *Issue #27; feat: integrate working auth flow.* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/tree/e2482f1b60411d5955cbc89db036bb14cbad959a)
    - *Issue #27; feat: sync authenticated Keycloak user to local database on home page* (https://github.com/MUIC-ICCS-372-SE/software-engineering-term-project-team-03/commit/9e3e8c46f1cc8dd2af8422b7631c28488c9b59ca)

## 3. Blockers / Problems

- This is my first time using Keycloak, and I encountered several challenges in configuring it correctly to work with our applications. I had to spend a significant amount of time understanding the various components and how they interact with each other.
- Another Challenge I faced was deciding on the appropriate hashing algorithm for password security. After researching various options, I had to evaluate the trade-offs between different algorithms and ultimately chose Argon2 for its strong security features and resistance to brute-force attacks. This decision required careful consideration of our project's security requirements and the latest best practices in password hashing.
- To connect Keycloak with our backend and frontend applications, I had to navigate through complex configuration settings and ensure that the authentication flow was seamless. This involved troubleshooting issues related to token validation and session management, which required a deep understanding of both Keycloak and our application architecture.

## 4. Short Reflection
- This week, I have learned a lot about authentication systems (e.g. keycloak) and token-based authentication (e.g. JWT). I have gained experience in setting up and configuring Keycloak for user authentication and authorization, as well as integrating it with both backend and frontend applications. I have also learned about the importance of choosing a secure hashing algorithm for password storage and the benefits of using Argon2 for this purpose. Overall, this week has been a valuable learning experience in implementing secure authentication mechanisms for our project.

## 5. What I plan or have been assigned to do next week?
- Start working on assigned features for Owner and IT staff pages, such as creating new staff accounts and help with ordering management.
