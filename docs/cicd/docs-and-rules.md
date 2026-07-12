---
sidebar_position: 5
---

# CI/CD — Docs & rules

Repos: [flair-docs](https://github.com/flair-security/flair-docs) · [flair-rules](https://github.com/flair-security/flair-rules) · [flair-demo](https://github.com/flair-security/flair-demo)
Stack: Markdown / Docusaurus (flair-docs) · YAML rule definitions (flair-rules) · demo assets (flair-demo)

These three repos carry no application source to run SAST against, so the security baseline
is trimmed to the minimal pair that applies to any repo regardless of language: secret
scanning and CI/CD compliance. No CodeQL, no Semgrep.

---

## Workflows

### `security.yml` — Security

Triggered on push to `main`, pull requests targeting `main`, and every Monday at 06:00 UTC —
same narrower PR trigger as the infra repos (`pull_request: branches: [main]`).

| Job | Tool | Description |
|---|---|---|
| **Gitleaks - Secret Scan** | Gitleaks OSS CLI | Same install-and-scan step as every other repo: checksum-verified `gitleaks` binary, `gitleaks detect --source . --redact --exit-code 1`. SARIF uploaded under category `gitleaks-secrets`. |
| **Plumber - CI/CD Compliance** | `getplumber/plumber` | Same pattern as the rest of the org: compliance gate ≥ 90%, SARIF (`plumber-supply-chain`) + CycloneDX PBOM artifact, `PLUMBER_TOKEN` for branch-protection reads. |

### `scorecard.yml` — OpenSSF Scorecard

Triggered on push to `main` and every Monday at 06:00 UTC. Identical to every other repo in
the org — publishes to [scorecard.dev](https://scorecard.dev), SARIF uploaded under category
`openssf-scorecard`.

---

## Compliance policy (`.plumber.yaml`)

Same policy shape as the rest of the org, trimmed to match what actually runs here: the
`securityJobsMustNotBeWeakened` pattern list drops `*codeql*`/`*semgrep*`/`*sast*` (there are
no such jobs to protect), and the authorized-actions allow-list only needs
`ossf/scorecard-action` and `getplumber/plumber` — no language-tooling action is required.
SHA-pinning, no mutable image tags, no debug trace, and `branchMustBeProtected` are unchanged.
