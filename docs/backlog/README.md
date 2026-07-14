---
slug: /
sidebar_position: 0
sidebar_label: "Overview"
---

# Backlog

FLAIR's backlog is managed entirely in **GitHub Projects**, reference repo
[`flair-security/.github`](https://github.com/flair-security/.github). The Project aggregates
issues from every repo in the org into a single unified view — there's no separate backlog tool.

## Sprints

Sprints are **prioritisation groups**, not fixed time boxes. A sprint closes when its User
Stories are merged to `main`. Priority order (descending):

1. Security (vulnerability, non-negotiable)
2. Cross-repo contract breaking changes (unblocking)
3. Core functional value (MVP)
4. Quality, tests, documentation

## Issue hierarchy

```text
Epic (parent issue, label "epic")
└── User Stories / Enablers (child issues, linked via "tracked by")
```

User Stories use the org's `user_story.yml` issue template:

```markdown
**As a** [RSSI / auditor / security engineer / admin]
**I want** [action]
**So that** [business or security benefit]

**Acceptance criteria**
- [ ] ...
- [ ] ...

**Target repo**: flair-{agent|core|ui|...}
**Estimate**: XS / S / M / L / XL
**Dependencies**: #xxx (if applicable)
```

## Project custom fields

| Field | Type | Values |
| --- | --- | --- |
| Status | Single select | Backlog / Ready / In progress / Review / Done |
| Priority | Single select | Critical / High / Medium / Low |
| Repo | Single select | flair-agent / flair-core / flair-ui / ... |
| Phase | Single select | MVP / v1-enterprise / phase-3 |
| Size | Single select | XS / S / M / L / XL |
| Sprint | Iteration | prioritisation groups, no fixed duration |

## Untracked work

If a need comes up that isn't tracked yet, the PO/Scrum Master role is expected to, before any
implementation starts: identify the relevant Epic (or create one), create the User Story issue
with the full template, add it to the Project with the correct fields, and flag it explicitly.
Nothing gets implemented without a traceable issue.
