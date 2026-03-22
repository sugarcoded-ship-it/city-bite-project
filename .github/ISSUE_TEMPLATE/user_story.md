```yaml
name: User Story
description: Create a new user story with acceptance criteria.
title: ""
labels: [story]
body:
  - type: markdown
    attributes:
      value: |
        Please complete all sections below.  Use the format defined in the course’s user story template.

  - type: textarea
    id: story
    attributes:
      label: Story
      description: "As a [user], I want [goal] so that [benefit]."
      placeholder: "As a customer, I want to book an appointment so that I can see a doctor at a convenient time."
    validations:
      required: true

  - type: textarea
    id: acceptance
    attributes:
      label: Acceptance Criteria
      description: List Given/When/Then statements.
      placeholder: |
        * **Given** I am a logged-in customer, **when** I view available times, **then** I see open slots for the current day.
        * **Given** I have selected a slot, **when** I confirm my booking, **then** I receive a confirmation message.
    validations:
      required: true

  - type: dropdown
    id: priority
    attributes:
      label: Priority
      options:
        - High
        - Medium
        - Low
    validations:
      required: true

  - type: textarea
    id: notes
    attributes:
      label: Notes / Dependencies
      description: Any additional context (links, constraints, dependencies)
    validations:
      required: false
```
