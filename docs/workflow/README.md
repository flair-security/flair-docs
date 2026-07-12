---
slug: /
sidebar_position: 0
sidebar_label: "Overview"
---

# FLAIR's agentic development workflow

## Overview

FLAIR is developed by a chain of specialised AI agents operating on top of a GitHub Projects
backlog. Each User Story (US) moves through a fixed sequence of agents — before, during and
after implementation — coordinated by an **Orchestrator**. Decisions to move a US forward
(dispatch, continue, merge, escalate) are driven by continuous 0–100 **gate scores**, not
boolean checks.

| Principle | Rule |
| --- | --- |
| Backlog traceability | Mandatory — never implement without a traceable GitHub issue |
| Acceptance criteria | Mandatory Given/When/Then format, every AC maps to a test |
| Security | Security Agent involved both before implementation (Red Team AC challenge) and after (Blue Team fix validation) |
| Confidence thresholds | Continuous 0–100 scores per gate, not pass/fail booleans |
| Human escalation | After 2 failed attempts on the same problem, the agent stops and reports — no unbounded looping |

> **Status**: this document describes the **intended** workflow as defined in FLAIR's agent
> prompt files (`.github/.project/prompts/*.md`) and organisation `CLAUDE.md`. FLAIR is
> pre-MVP — at the time of writing, the `flair-security/.github` Projects backlog has no
> issues yet, so this workflow has not been exercised end-to-end on a real, merged User Story.

---

## Agents

| Agent | Role | Moment |
| --- | --- | --- |
| **Orchestrator** | Reads the GitHub Projects backlog, scores Gate 1 for every "Ready" US, dispatches Dev Agents, monitors open PRs/branches, unblocks dependent US, posts a cycle summary | Runs a full cycle (Steps 1–6) on demand |
| **PO Agent** | Generates Epics and User Stories with Given/When/Then AC, clarifies ambiguous AC on request from the Dev Agent, runs sprint planning | Before implementation / on clarification request |
| **Architect Agent** | Reviews technical feasibility of a US (Flow contract impact, cross-repo impact, interface impact, AC implementability), reviews `flow-contract`-labelled PRs, writes ADRs | Before implementation, and on `flow-contract` PRs |
| **Security Agent** | Red Team: challenges AC and adds missing `AC-*-SEC-*` before implementation. Blue Team: validates fixes on `security`-labelled PRs. Also produces regulatory (NIS2/DORA/GDPR) AC mapping | Before implementation (Red Team) and on security PRs (Blue Team) |
| **QA Agent** | Reviews AC testability before implementation, spot-checks test quality as a Gate 2 contribution, writes Playwright E2E specs, analyses coverage gaps | Before implementation and during Gate 2 |
| **Dev Agent** | Implements the US on a dedicated `feat/us-{id}-{slug}` branch, writes code + tests, self-scores Gate 2 after each commit, opens the PR, fixes CI failures | During implementation |
| **PR Review Agent** | Waits for green CI, scores Gate 3 (quality) and Gate 4 (merge confidence), merges (squash) or escalates to a human | After CI passes, before merge |

---

## Cycle

1. **Backlog read** — Orchestrator queries GitHub Projects for all FLAIR items.
2. **Gate 1 — READINESS** — Orchestrator scores every "Ready" US (see thresholds below) and
   commits a `gate-1.yaml` artifact. Score decides: dispatch to Dev Agent, ask PO Agent to
   clarify, or send back to Backlog.
3. **Pre-implementation review** — Architect Agent, Security Agent and QA Agent review the
   dispatched US (feasibility, Red Team AC, testability) before the Dev Agent writes production
   code. Per the org `CLAUDE.md`, the Dev Agent must also get explicit PO confirmation on (a)
   the US itself and (b) the planned AC before writing any production code — except for
   immediately-exploitable security fixes, lint/CI-blocking fixes, and root-caused bug fixes.
4. **Implementation** — Dev Agent works on `feat/us-{id}-{slug}`, following the fixed task
   order below, scoring **Gate 2 — COVERAGE** after each commit.
5. **PR review** — once CI is green, PR Review Agent scores **Gate 3 — QUALITY** then
   **Gate 4 — MERGE CONFIDENCE**, and merges or escalates.
6. **Monitoring & unblocking** — each Orchestrator cycle also watches open `feat/us-*` branches
   for stuck CI (escalating per the 2-attempt rule) and promotes newly-unblocked US to "Ready".

### Task order per User Story (from org `CLAUDE.md`)

| Step | Content |
| --- | --- |
| 1. Code | Implement + GoDoc / TSDoc on exported symbols |
| 2. Tests | Unit + integration tests covering all AC — same commit as the code |
| 3. Quality | Linter and static analysis green |
| 4. UI / templates | Angular components, templates, styles |
| 5. Backlog | Create/update the US in GitHub Projects — **required before commit** |
| 6. E2E | Happy path + one critical error path (Playwright) |
| 7. Commit | Atomic commits, Conventional Commits format, on the dedicated branch |

E2E (step 6) can be deferred to a later session if the test environment is unavailable. Steps 5
and 7 are never deferrable. Tests are written after the code, covering all branches and edge
cases — strict TDD is not used, except when an API/service contract is unclear, in which case
tests are written first to force clarification.

---

## Gates

FLAIR defines four scored gates, all using continuous 0–100 scores rather than booleans.

### Gate 1 — READINESS (Orchestrator, before dispatch)

| Check | Weight |
| --- | --- |
| All AC present, specific, testable | 40 |
| No unresolved cross-repo dependency | 20 |
| Flow contract impact assessed | 15 |
| Security AC present (≥ 1 `AC-{id}-SEC-{n}`) | 15 |
| No circular dependency in sprint | 10 |

**Decision**: score ≥ 80 → **DISPATCH** to Dev Agent · 60–79 → **CLARIFY** (PO Agent responds,
US stays in Ready with a `gate1-gap` label) · < 60 → **BACKLOG** (issue moved back, gaps
commented).

### Gate 2 — COVERAGE (Dev Agent, after each commit)

| Check | Points |
| --- | --- |
| AC covered by test | 50 |
| No untested new code paths | 30 |
| Test quality (not trivial) | 20 |

**Decision**: score < 70 → stop, write the missing tests before the next commit. (The gate
artifact schema also allows `PAUSE`/`STOP` decisions; the prompt only specifies the < 70 stop
rule explicitly — no documented upper threshold beyond "continue".)

### Gate 3 — QUALITY (PR Review Agent, after CI is green)

| Check | Weight | Scoring |
| --- | --- | --- |
| SonarCloud coverage | 25 | ≥ 80% = 25, ≥ 70% = 15, < 70% = 0 |
| Security findings | 25 | 0 findings = 25, 1 medium = 15, any high/critical = 0 |
| Linter clean | 20 | 0 warnings = 20, each warning = −2 |
| No secrets (TruffleHog) | 20 | Clean = 20, any finding = 0 (hard block) |
| Binary size (`flair-agent` only) | 10 | < 20MB = 10, < 25MB = 5, ≥ 25MB = 0 |

**Hard blocks** (score forced to 0, immediate `needs-human-review`): any TruffleHog secret;
`security` label without a Security Agent sign-off comment; `breaking-change` label without an
Architect Agent sign-off; `flow-contract` label without all coordinated PRs open.

**Decision**: score < 70 → fix and re-run · 70–84 → document gaps in a PR comment · ≥ 85 →
proceed to Gate 4.

### Gate 4 — MERGE CONFIDENCE (PR Review Agent, before merge)

| Check | Weight |
| --- | --- |
| Gate 2 final score | 25 |
| Gate 3 score | 25 |
| AC-to-test traceability (every AC has a populated `Test:` field) | 25 |
| Diff coherence (scoped to the US, clean rebase) | 15 |
| Commits human-readable (Conventional Commits, no WIP) | 10 |

Any `AC-{id}-SEC-{n}` without a populated `Test:` field is a hard block regardless of score.

**Decision**: score ≥ 85 → `auto-approved` label, squash merge · 60–84 → merge with doubts
documented in a PR comment · < 60 → `needs-human-review` label, exact score breakdown posted,
stop.

Every gate writes a YAML artifact committed to `docs/gates/us-{id}/gate-{n}[-{sha}].yaml`
(Gate 1/3/4: one file each; Gate 2: one file per commit).

---

## Escalation rule

If an agent fails to resolve a problem after **2 attempts** (same strategy or close variants):

1. **Stop** — do not keep looping.
2. **Report** — describe the blocker, what was tried, and why it failed.
3. **Propose** an alternative — a different approach, a different tool, a workaround, or hand
   off to a human.

This also applies to CI fixes specifically: after 2 failed CI fix attempts, the Dev Agent (or
Orchestrator, when monitoring branches) adds the `needs-human-review` label and stops — no
third attempt.

Typical FLAIR blockers that trigger this rule: an eBPF program failing to load on the target
kernel, Apache AGE not responding to Cypher queries, an OIDC callback not returning, a blocked
SonarCloud quality gate, or a complex rebase conflict on the `Flow` contract.

---

## Backlog & traceability

- The backlog lives in **GitHub Projects**, aggregating issues from all `flair-*` repos into a
  single view, tracked from the reference repo `flair-security/.github`.
- Issue hierarchy: an **Epic** (label `epic`) has child **User Stories** (label `user-story`),
  linked via "tracked by".
- Every User Story must use the `.project/us-template.md` / `.github/ISSUE_TEMPLATE/user-story.md`
  format: role/action/benefit, Given/When/Then acceptance criteria (with a mandatory
  `AC-{id}-SEC-*` for every US), target repo, estimate, dependencies.
- Project custom fields: `Status` (Backlog / Ready / In progress / Review / Done), `Priority`
  (Critical / High / Medium / Low), `Repo`, `Phase` (MVP / v1-enterprise / phase-3), `Size`
  (XS–XL), `Sprint` (a prioritisation grouping with no fixed duration — a sprint closes when its
  US are merged to `main`).
- **Never implement without a traceable issue.** If an untracked need surfaces mid-work, the
  PO/Scrum Master role must immediately create the US (with the full template), add it to the
  Project with correct fields, and signal before implementation continues.
- Every AC — in the US template's Test Mapping table — must carry a populated `Test:` field
  before a PR is opened; an AC without a test is treated as unimplemented regardless of the
  code present. Test function names must contain the AC ID (e.g.
  `TestEBPFCollector_AC42_01_DetectsGRPCProtocol`).

---

## Open items

Diagrams for this workflow (cycle flow, gate sequencing) do not exist yet — TBD.
