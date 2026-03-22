# ICCS 372 Repository Template

This repository provides a starting point for team projects in the **ICCS 372 – Software Engineering (Practical Agile Delivery)** course. It defines the folder structure, documentation templates, and workflow files that every team should use. By standardising the layout, the course makes it easier for instructors to grade deliverables and for teams to collaborate effectively.

---

## Overview

After you create your own project repository from this template (via the **Use this template** button on GitHub or by copying its contents), fill out each document with information specific to your chosen scenario.

The goal is to maintain a clear, traceable record of your:

* project brief
* backlog
* design decisions
* risks
* quality practices
* handover artifacts

The `.github` folder contains issue and pull‑request templates to ensure disciplined workflows, while the CI configuration provides a placeholder for your continuous integration pipeline.

---

## File Structure

```plaintext
.
├── .github
│   ├── ISSUE_TEMPLATE
│   │   └── user_story.md          # Issue template for creating user stories
│   ├── pull_request_template.md  # Checklist for pull requests
│   └── workflows
│       └── ci.yml                # Placeholder CI workflow
└── docs
    ├── architecture
    │   ├── architecture-page.md  # High-level architecture overview
    │   └── adrs
    │       └── adr-template.md   # Template for Architecture Decision Records (ADRs)
    ├── brief
    │   └── project-brief.md      # Project brief (formerly called product brief)
    ├── handover
    │   ├── runbook.md            # Operational guide for running the system
    │   ├── known-issues.md       # List of known defects and limitations
    │   └── release-notes.md      # Notes on features and fixes per release/iteration
    └── planning
        ├── definition-of-done.md # Team’s Definition of Done checklist
        ├── risk-list.md          # Identified risks and mitigation strategies
        └── user-stories.md       # Backlog of user stories with acceptance criteria

README.md (this file)
```

---

## How to Use This Template

1. **Create your repository**
   In your GitHub organisation, click **Use this template** and create a new repository for your team project (e.g. `team1-clinic`).

2. **Populate the project brief**
   Edit `docs/brief/project-brief.md` to describe your project’s problem statement, target users, scope (in and out), success criteria and assumptions. Throughout this course, we refer to this as the *project brief*.

3. **Build your backlog**
   Use `docs/planning/user-stories.md` as a living backlog. Write your user stories in the recommended format:

   > As a…, I want…, so that…

   Include acceptance criteria, priority and estimates. Link each story to its GitHub issue.

4. **Define your quality bar**
   In `docs/planning/definition-of-done.md`, record the criteria that must be met before any work is considered done (e.g. code reviewed, CI passes, tests added, documentation updated).

5. **Identify risks**
   Document technical or process risks in `docs/planning/risk-list.md` and update it during retrospectives.

6. **Capture architecture and decisions**
   Sketch your system in `docs/architecture/architecture-page.md`, using a C4-lite or UML-lite diagram and text. For each significant design decision, create an ADR file in `docs/architecture/adrs/` using `adr-template.md` as a starting point.

7. **Maintain the handover pack**
   Throughout the project, keep the runbook, known issues and release notes up to date under `docs/handover/`. This collection of documents will form your handover pack in Week 9.

8. **Use disciplined workflows**
   Create an issue for each story, branch off `main`, open a pull request using the template in `.github/pull_request_template.md`, and ensure your CI workflow (`.github/workflows/ci.yml`) runs successfully before merging. Update the backlog and documentation as you go.

---

## Notes on Naming

The original course specification referred to a *product brief*. In this template, the document is named `project-brief.md` to emphasise that you are defining the scope of your project rather than marketing a product.

If you see references to *product brief* in older materials, treat them as synonymous with *project brief*.

---

## Contributing to the Template

If you discover improvements that could help other teams (e.g. clearer templates, better CI commands), please suggest changes to the instructor.

However, do **not** modify this template directly in your project repo; instead, customise your copies while keeping the folder structure intact for grading.

---

## Final Note

This template aims to support a disciplined, lightweight engineering process. By following the structure and guidelines provided here, your team will produce the artifacts required by the course and make it easy for graders to assess your work.
