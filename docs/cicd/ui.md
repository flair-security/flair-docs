---
sidebar_position: 3
---

# CI/CD — UI

Repo: [flair-ui](https://github.com/flair-security/flair-ui)
Stack: TypeScript / Angular

Same 4-job security baseline as the Go and Python repos, adapted for a JS/TS frontend —
CodeQL runs `javascript` (which also covers TypeScript), and the Semgrep ruleset adds
frontend-specific coverage (XSS) on top of the shared OWASP set.

---

## Workflows

### `security.yml` — Security

Triggered on push to `main`, every pull request (any target branch), and every Monday at
06:00 UTC. No `paths-ignore`, same rationale as the other language repos.

| Job | Tool | Description |
|---|---|---|
| **Gitleaks - Secret Scan** | Gitleaks OSS CLI | Checksum-verified `gitleaks` binary, `gitleaks detect --source . --redact --exit-code 1`. SARIF uploaded under category `gitleaks-secrets`. |
| **CodeQL - SAST** | `github/codeql-action` | `languages: javascript`, config at `.github/codeql/config.yml`. Guarded by `hashFiles('package.json') != ''` so the job no-ops cleanly until the Angular app has a `package.json` committed. |
| **Semgrep - SAST** | Semgrep CLI | Rulesets `p/javascript`, `p/typescript`, `p/owasp-top-ten`, `p/security-audit`, `p/xss`, `p/secrets` — the only repo group with a dedicated XSS ruleset. Fails the job on any non-suppressed finding. SARIF uploaded under category `semgrep-sast`. |
| **Plumber - CI/CD Compliance** | `getplumber/plumber` | Same pattern as the other groups: compliance gate ≥ 90%, SARIF (`plumber-supply-chain`) + CycloneDX PBOM artifact, `PLUMBER_TOKEN` for branch-protection reads. |

### `scorecard.yml` — OpenSSF Scorecard

Triggered on push to `main` and every Monday at 06:00 UTC. Same as every other repo —
publishes to [scorecard.dev](https://scorecard.dev), SARIF uploaded under category
`openssf-scorecard`.

---

## Compliance policy (`.plumber.yaml`)

Same policy shape as the other language repos. The authorized-actions allow-list is the
widest of any repo: `actions/setup-node`, `actions/setup-python` (Semgrep CLI still needs
Python), `ossf/scorecard-action`, `getplumber/plumber`. All other controls — SHA-pinned
actions, no mutable image tags, no debug trace, `securityJobsMustNotBeWeakened`,
`branchMustBeProtected` — match the rest of the language repos.
