# Definition of Done v1

A backlog item can be moved to Done only if:

1. Acceptance criteria are met.
2. Work is linked to a GitHub issue.
3. Code changes are made through a pull request.
4. At least one teammate reviews the pull request.
5. CI passes, if code was changed.
6. Minimal tests or checks exist, if relevant.
7. Documentation is updated if behavior, setup, or usage changed.
8. Any new environment variables or local setup steps are added to the README.md file.
9. UI/Frontend changes have been manually reviewed and approved by a teammate before merging.
10. Functionality is carefully tested in a local environment before merging, especially for critical features or bug fixes.

---

## How We Use This DoD

Before moving any issue to Done on our project board, the issue owner checks the specific acceptance criteria and confirms that the general DoD items above are satisfied. 

For code changes, the reviewer will verify the DoD checklist inside the Pull Request template before approving and merging the PR into the main branch.

---

## Handling Non-Code Items

Non-code issues must meet the following criteria before being marked as Done:
- The deliverable has been reviewed and approved by at least one other teammate.
- The issue has a clear, visible output attached or shown to the GitHub issue (e.g., a screenshot, a document, or a link to the relevant work).
