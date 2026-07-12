---
sidebar_position: 0
---

# CI/CD

FLAIR's CI/CD posture is security-baseline-first: every repository in the `flair-security`
GitHub organisation carries the same minimum security floor — secret scanning (Gitleaks),
static analysis (CodeQL and/or Semgrep, wherever the language is supported), a CI/CD
supply-chain compliance gate (Plumber), and a weekly OpenSSF Scorecard run — layered with
branch protection on `main` so nothing merges without the pipeline passing. Beyond that
shared floor, each repo group runs only the jobs relevant to its own stack: language repos
add SAST, infrastructure repos add Semgrep coverage for their IaC format, and the docs/rules/
demo repos, which carry no application source, run the minimal secrets-plus-compliance pair.

## Repo groups

| Page | Repos | Security job pattern |
|---|---|---|
| [Go agents & core](./go-agents-and-core.md) | flair-agent, flair-agent-k8s, flair-agent-windows, flair-core, flair-sdk-go | Gitleaks, CodeQL, Semgrep, Plumber |
| [Python SDK](./python-sdk.md) | flair-sdk-python | Gitleaks, CodeQL, Semgrep, Plumber |
| [UI](./ui.md) | flair-ui | Gitleaks, CodeQL, Semgrep, Plumber |
| [Infra repos](./infra-repos.md) | flair-helm, flair-terraform-aws, flair-terraform-azure, flair-terraform-gcp | Gitleaks, Semgrep, Plumber |
| [Docs & rules](./docs-and-rules.md) | flair-docs, flair-rules, flair-demo | Gitleaks, Plumber |
| [Org `.github` repo](./org-github-repo.md) | flair-security/.github | Gitleaks, Plumber + doc-linting & repo-automation workflows |
| [Branch protection](./branch-protection.md) | all repos | org-wide `main` protection policy |
