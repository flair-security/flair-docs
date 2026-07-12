---
sidebar_position: 4
---

# CI/CD — Infra repos

Repos: [flair-helm](https://github.com/flair-security/flair-helm) · [flair-terraform-aws](https://github.com/flair-security/flair-terraform-aws) · [flair-terraform-azure](https://github.com/flair-security/flair-terraform-azure) · [flair-terraform-gcp](https://github.com/flair-security/flair-terraform-gcp)
Stack: Helm charts (flair-helm) · Terraform / HCL (flair-terraform-*)

These four repos run a 3-job security baseline — no CodeQL job, since neither Helm/YAML nor
HCL is a CodeQL-supported language. Gitleaks and Plumber are unchanged from the other groups;
Semgrep is the only job that differs, picking rulesets for whichever IaC format the repo holds.

---

## Workflows

### `security.yml` — Security

Triggered on push to `main`, pull requests targeting `main`, and every Monday at 06:00 UTC.
Note the narrower PR trigger here (`pull_request: branches: [main]`) compared to the language
repos, which fire on pull requests targeting any branch.

| Job | Tool | Description |
|---|---|---|
| **Gitleaks - Secret Scan** | Gitleaks OSS CLI | Same install-and-scan step as every other repo: checksum-verified `gitleaks` binary, `gitleaks detect --source . --redact --exit-code 1`. SARIF uploaded under category `gitleaks-secrets`. |
| **Semgrep - SAST** | Semgrep CLI | flair-helm: `p/kubernetes`, `p/secrets`. flair-terraform-aws/azure/gcp: `p/terraform`, `p/secrets` — same job shape, ruleset swapped for the IaC format. Fails the job on any non-suppressed finding. SARIF uploaded under category `semgrep-sast`. |
| **Plumber - CI/CD Compliance** | `getplumber/plumber` | Same pattern as the other groups: compliance gate ≥ 90%, SARIF (`plumber-supply-chain`) + CycloneDX PBOM artifact, `PLUMBER_TOKEN` for branch-protection reads. |

There is no `codeql` job in this group — its absence is explicit in the workflow (a comment
notes "Helm/YAML is not a supported CodeQL language" / "HCL is not a supported CodeQL
language"), not an oversight.

### `scorecard.yml` — OpenSSF Scorecard

Triggered on push to `main` and every Monday at 06:00 UTC. Identical to every other repo in
the org — publishes to [scorecard.dev](https://scorecard.dev), SARIF uploaded under category
`openssf-scorecard`.

---

## Compliance policy (`.plumber.yaml`)

Same policy shape as the language repos, minus `*codeql*`/`*sast*` from the
`securityJobsMustNotBeWeakened` pattern list (there's no CodeQL job here to protect). The
authorized-actions allow-list reflects each repo's own tooling: flair-helm trusts
`actions/setup-python` (for the Semgrep CLI step); the three Terraform repos additionally
trust `hashicorp/setup-terraform`. All four also trust `ossf/scorecard-action` and
`getplumber/plumber`. SHA-pinning, no mutable image tags, no debug trace, and
`branchMustBeProtected` are unchanged from the rest of the org.
