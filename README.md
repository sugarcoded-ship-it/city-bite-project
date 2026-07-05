# CityBite Bangkok — Digital Ordering System (Team 03)

A web-based ordering and order-management MVP for CityBite Bangkok, a single-location food business currently juggling walk-in, phone, and chat orders. Customers browse the menu and submit orders as guests; staff manage all incoming orders from one dashboard instead of reconciling multiple channels by hand.

**Team 03 — ICCS 372 (Software Engineering: Practical Agile Delivery)**
Chawinthorn Kittivacharaphong · Suppapoo Ekpipattana · Natthakul Yikusung · Pakawun Jindawat · Nattapas Nunthameteesuk · Matteo Ramdani

---

## Start here

| I want to... | Go to |
|---|---|
| Run the system locally | [`docs/handover/runbook.md`](docs/handover/runbook.md) |
| Understand the project scope and what's in/out of the MVP | [`docs/brief/product_brief_v05_team03.md`](docs/brief/product_brief_v05_team03.md) |
| See the system design and key flows | [`docs/architecture/architecture-page-team3.md`](docs/architecture/architecture-page-team3.md) |
| See why a major technical decision was made | [`docs/architecture/adrs/`](docs/architecture/adrs/) |
| See the backlog / user stories | [`docs/planning/user_stories_team03.md`](docs/planning/user_stories_team03.md) |
| Check what's broken or deliberately out of scope | [`docs/handover/known-issues.md`](docs/handover/known-issues.md) |
| See what shipped each sprint | [`docs/handover/release-notes.md`](docs/handover/release-notes.md) |

---

## What's built

- **Customer:** browse the menu by category, customize items with option groups, manage a cart, submit an order as a guest, and track its status (Pending → In Kitchen → Ready) by reference number.
- **Staff:** a single order inbox sorted by submission time, full order detail (items, options, special requests), claim/complete/cancel an order, toggle menu item availability, and manage stock — accepting an order automatically deducts the ingredients it requires and restores them if the order is canceled.
- **Owner:** everything staff can do, plus managing the staff roster and store open/closed state.

Payment processing, delivery/rider tracking, and financial reporting are explicitly out of scope for this MVP — see the product brief and [ADR 002](docs/architecture/adrs/0002-scope-reduction-decisions.md) for why.

---

## Tech stack

- **Frontend:** React + TypeScript (Vite) — `codes/frontend/restaurant`
- **Backend:** Kotlin + Spring Boot (REST API) — `codes/backend/restaurant`
- **Database:** PostgreSQL
- **Auth:** Keycloak (`STAFF` / `OWNER` roles; customers are unauthenticated guests)
- **Infra:** Docker Compose + NGINX reverse proxy

Full setup and troubleshooting steps are in the [runbook](docs/handover/runbook.md).

---

## Repository layout

```plaintext
.
├── codes/                        # Application source (monorepo)
│   ├── frontend/restaurant/      # React/TypeScript SPA
│   ├── backend/restaurant/       # Kotlin/Spring Boot API
│   ├── docker-compose*.yml       # Local dev / standard / db-only stacks
│   └── realm-config.json         # Keycloak realm import
├── docs/
│   ├── brief/                    # Product brief
│   ├── architecture/             # Architecture page + ADRs + C4 diagram
│   ├── planning/                 # Backlog, DoD, risk list
│   ├── handover/                 # Runbook, known issues, release notes
│   ├── sprint-meetings/          # Per-sprint notes and individual logs
│   └── presentations/            # Kickoff deck
└── .github/                      # Issue/PR templates, CI workflow
```

---

## Contributing (team workflow)

Create an issue → branch off `main` → open a PR using [`.github/pull_request_template.md`](.github/pull_request_template.md) → CI (`.github/workflows/ci.yml`) must pass → at least one teammate reviews before merge. Full criteria in [`docs/planning/definition-of-done.md`](docs/planning/definition-of-done.md).