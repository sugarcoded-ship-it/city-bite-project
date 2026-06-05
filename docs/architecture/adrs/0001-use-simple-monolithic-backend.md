# ADR 001: Adoption of a Monorepo Strategy

## Status
Accepted

## Context
Our team is developing the CityBite Bangkok digital food ordering system from scratch with a limited timeline. We need to determine the best source-control and structural approach to deliver a functional MVP (Minimum Viable Product) quickly.

## Decision
We have decided to adopt a **Monorepo** strategy for our MVP, housing our decoupled React frontend and Spring Boot backend layers within a single Git codebase.

## Alternatives Considered
* **Polyrepo (Multiple Repositories):** We considered splitting the frontend and backend into two entirely separate Git repositories to allow for independent versioning. However, this would introduce additional complexity in tracking cross-stack features, managing local environments, and orchestrating PRs that our small team cannot support within the current project timeline.

## Reasoning
Given our need for speed and our small team size, a Monorepo allows us to maintain a single source of truth, simplify local Docker orchestration, and focus our energy on building features rather than managing cross-repository dependencies and communication. A developer can implement a full-stack feature in a single Pull Request.

## Consequences
### Positive
* Faster initial development cycle and simplified onboarding.
* Synchronized full-stack Pull Requests.
* Zero local CORS configuration required due to unified Nginx proxying.

### Negative / Tradeoffs
* If the project grows significantly in the future, the repository size will grow.
* CI/CD pipelines will require more complex configuration to only trigger builds for the directories (frontend vs. backend) that actually changed, rather than running every test on every push.

## Related Backlog Items
* Set up an initial project repository.
* Configure base development environment (Docker/Nginx).
* Define core project modules and base application structure.