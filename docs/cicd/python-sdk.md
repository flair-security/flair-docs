---
sidebar_position: 2
---

# CI/CD — Python SDK

Repo: [flair-sdk-python](https://github.com/flair-security/flair-sdk-python)
Stack: Python

Same 4-job security baseline as the Go repos, adapted for a Python source tree — CodeQL runs
`python` instead of `go`, and the Semgrep ruleset swaps in Python-specific rules. There is no
`scorecard.yml` divergence either: it's the same OpenSSF Scorecard workflow as every other repo.

---

## Workflows

### `security.yml` — Security

Triggered on push to `main`, every pull request (any target branch), and every Monday at
06:00 UTC. No `paths-ignore`, for the same reason as the Go repos: SARIF-uploading jobs must
run on every push/PR so code scanning doesn't report a missing configuration.

| Job | Tool | Description |
|---|---|---|
| **Gitleaks - Secret Scan** | Gitleaks OSS CLI | Same install-and-scan step as the Go repos: checksum-verified `gitleaks` binary, `gitleaks detect --source . --redact --exit-code 1`. SARIF uploaded under category `gitleaks-secrets`. |
| **CodeQL - SAST** | `github/codeql-action` | `languages: python`, config at `.github/codeql/config.yml`. Guarded by `hashFiles('**/*.py') != ''` instead of a `go.mod` check — the source-detection guard differs from the Go pattern because there's no single manifest file that reliably indicates "real Python source exists yet." |
| **Semgrep - SAST** | Semgrep CLI | Rulesets `p/python`, `p/owasp-top-ten`, `p/security-audit`, `p/secrets`. Fails the job on any non-suppressed finding. SARIF uploaded under category `semgrep-sast`. |
| **Plumber - CI/CD Compliance** | `getplumber/plumber` | Same as the Go pattern: compliance gate ≥ 90%, SARIF (`plumber-supply-chain`) + CycloneDX PBOM artifact, `PLUMBER_TOKEN` for branch-protection reads. |

### `scorecard.yml` — OpenSSF Scorecard

Triggered on push to `main` and every Monday at 06:00 UTC. Identical to the Go repos'
Scorecard workflow — publishes to [scorecard.dev](https://scorecard.dev), SARIF uploaded
under category `openssf-scorecard`.

---

## Compliance policy (`.plumber.yaml`)

Same policy shape as the Go group, with one difference in the authorized-actions allow-list:
`actions/setup-python` in place of `actions/setup-go` (this repo's own tooling, plus what the
Semgrep CLI step needs), alongside `ossf/scorecard-action` and `getplumber/plumber`. All other
controls — SHA-pinned actions, no mutable image tags, no debug trace, `securityJobsMustNotBeWeakened`,
`branchMustBeProtected` — are identical to the Go repos.
