---
sidebar_position: 6
---

# CI/CD — org `.github` repo

Repo: [flair-security/.github](https://github.com/flair-security/.github)
Stack: Markdown, YAML — org profile, backlog governance, and repo automation

The `.github` repo carries no application source either, but it's the org's governance
surface — issue templates, skill definitions, label taxonomy — so on top of the same
Gitleaks + Plumber pair every no-source repo gets, it also runs a `validate.yml` workflow
that lints its own content, plus a handful of repo-automation workflows that are not part of
the required-checks gate.

---

## Workflows

### `security.yml` — Security

Triggered on push to `main`, every pull request (any target branch — no `branches: [main]`
restriction here, unlike flair-docs/flair-rules/flair-demo), and every Monday at 06:00 UTC.

| Job | Tool | Description |
|---|---|---|
| **Gitleaks - Secret Scan** | Gitleaks OSS CLI | Same install-and-scan step as every other repo: checksum-verified `gitleaks` binary, `gitleaks detect --source . --redact --exit-code 1`. SARIF uploaded under category `gitleaks-secrets`. |
| **Plumber - CI/CD Compliance** | `getplumber/plumber` | Same pattern as the rest of the org: compliance gate ≥ 90%, SARIF (`plumber-supply-chain`) + CycloneDX PBOM artifact, `PLUMBER_TOKEN` for branch-protection reads. |

### `validate.yml` — Validate

Triggered on push to `main` and pull requests targeting `main`. Default `permissions:
contents: read` — none of these jobs need write access, they only lint the checkout.

| Job | Tool | Description |
|---|---|---|
| **Validate skill YAML files** | `yamllint` | Lints `.project/skills/` with a relaxed ruleset (`line-length: 200`, `truthy`/`comments`/`colons` disabled — skill files intentionally column-align values). |
| **Validate markdown files** | `DavidAnson/markdownlint-cli2-action` | Lints every `**/*.md` in the repo, excluding `node_modules/` and `vendor/`. |
| **Secret scanning** | `trufflesecurity/trufflehog` | Runs with `--only-verified` against the full history (`fetch-depth: 0`), diffed from `${{ github.event.repository.default_branch }}`. A belt-and-suspenders check alongside Gitleaks. |

### `scorecard.yml` — OpenSSF Scorecard

Triggered on push to `main` and every Monday at 06:00 UTC. Identical to every other repo in
the org — publishes to [scorecard.dev](https://scorecard.dev), SARIF uploaded under category
`openssf-scorecard`.

### `auto-label.yml` — Auto label

Triggered on `issues: [opened, edited]` and `pull_request: [opened, edited, synchronize]`.
Not part of the required-checks gate — this is convenience automation, not a merge blocker.

| Job | Runs on | Description |
|---|---|---|
| **label-issue** | `issues` events | Scans the issue body for component names (e.g. "flair-agent (Linux eBPF)" → `component:agent`) and regulatory keywords (NIS2, DORA, GDPR, ISO 27001, SOC 2 → `regulatory`), applies matching labels. |
| **label-pr** | `pull_request` events | Derives labels from the PR title's Conventional Commits prefix (`feat`, `fix`, `chore`, …), flags `breaking-change` from `!:`/`BREAKING CHANGE`, and flags `flow-contract`/`security` from body keywords. |

### `stale.yml` — Stale issues

Triggered every Monday at 08:00 UTC. Issues go stale after 60 days of inactivity and close
14 days later; PRs go stale after 30 days and close 14 days later. Labels `pinned`,
`security`, `needs-human-review` (and `epic`/`flow-contract`/`breaking-change` where
applicable) are exempt from both.

### `sync-labels.yml` — Sync labels

Triggered on push to `main` when `.github/labels.yml` changes, or manually via
`workflow_dispatch`. Parses `labels.yml` and applies the label set to every repo in the org
(`flair-agent`, `flair-core`, `flair-ui`, `flair-helm`, `flair-docs`, `flair-agent-windows`,
`flair-agent-k8s`, the three `flair-terraform-*` repos, `flair-sdk-go`, `flair-sdk-python`,
`flair-rules`) via the `gh` CLI, authenticated with the `GH_TOKEN_REPOS` secret (a token with
write access across the org — broader than the per-repo `GITHUB_TOKEN`).

---

## Compliance policy (`.plumber.yaml`)

Same policy shape as the docs/rules group, with two additions to the authorized-actions
allow-list to cover `validate.yml`'s tooling: `DavidAnson/markdownlint-cli2-action` and
`trufflesecurity/trufflehog`, alongside `ossf/scorecard-action` and `getplumber/plumber`. All
other controls — SHA-pinning, no mutable image tags, no debug trace,
`securityJobsMustNotBeWeakened`, `branchMustBeProtected` — are unchanged.
