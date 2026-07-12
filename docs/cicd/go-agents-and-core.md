---
sidebar_position: 1
---

# CI/CD — Go agents & core

Repos: [flair-agent](https://github.com/flair-security/flair-agent) · [flair-agent-k8s](https://github.com/flair-security/flair-agent-k8s) · [flair-agent-windows](https://github.com/flair-security/flair-agent-windows) · [flair-core](https://github.com/flair-security/flair-core) · [flair-sdk-go](https://github.com/flair-security/flair-sdk-go)
Stack: Go

These five repos run byte-identical `security.yml` and `scorecard.yml` workflows — the 4-job
security baseline plus a weekly Scorecard run. Any change to the pattern is made in one repo,
verified, then mirrored to the other four.

---

## Workflows

### `security.yml` — Security

Triggered on push to `main`, every pull request (any target branch), and every Monday at
06:00 UTC. No `paths-ignore`: the jobs that upload code-scanning SARIF (CodeQL, Semgrep,
Plumber) must run on every push/PR, or GitHub code scanning reports "configuration not
found" for skipped commits and can't diff alerts introduced by a PR.

| Job | Tool | Description |
|---|---|---|
| **Gitleaks - Secret Scan** | Gitleaks OSS CLI | Downloads a checksum-verified `gitleaks` release binary and runs `gitleaks detect --source . --redact --exit-code 1` against `.github/workflows/configuration/.gitleaks.toml`. SARIF uploaded under category `gitleaks-secrets`. |
| **CodeQL - SAST** | `github/codeql-action` | `languages: go`, config at `.github/codeql/config.yml`. Every step is guarded by `hashFiles('go.mod') != ''` so the job no-ops cleanly on repos still in pre-source scaffolding instead of failing (job-level `if: hashFiles(...)` isn't valid, so the guard is repeated per step). |
| **Semgrep - SAST** | Semgrep CLI | Rulesets `p/golang`, `p/owasp-top-ten`, `p/security-audit`, `p/secrets`. Fails the job if any non-suppressed finding remains. SARIF uploaded under category `semgrep-sast`. |
| **Plumber - CI/CD Compliance** | `getplumber/plumber` | Evaluates the repo's `.plumber.yaml` policy, gates on compliance score ≥ 90%, uploads SARIF (`plumber-supply-chain`) plus a CycloneDX PBOM artifact. Reads branch protection via `PLUMBER_TOKEN` (falls back to `GITHUB_TOKEN` if the secret is absent). |

### `scorecard.yml` — OpenSSF Scorecard

Triggered on push to `main` and every Monday at 06:00 UTC. Runs `ossf/scorecard-action`,
publishes results to [scorecard.dev](https://scorecard.dev), and uploads the SARIF output
under code-scanning category `openssf-scorecard`.

---

## Compliance policy (`.plumber.yaml`)

Each repo carries its own near-identical `.plumber.yaml` (policy schema `v2.0`). Notable controls:

- All GitHub Actions must be pinned by commit SHA (`actionsMustBePinnedByCommitSha`), not by tag.
- Actions must come from an authorized source (`githubActionMustComeFromAuthorizedSources`) —
  official GitHub actions, same-org actions, or an explicit allow-list. For this group that
  list is `actions/setup-go`, `ossf/scorecard-action`, `getplumber/plumber`.
- No mutable container image tags (`latest`, `dev`, `staging`, `main`, `HEAD`, …) and no
  debug-trace variables (`ACTIONS_STEP_DEBUG`, `ACTIONS_RUNNER_DEBUG`) in any workflow.
- No Docker-in-Docker on shared runners (`pipelineMustNotUseDockerInDocker`).
- The security jobs themselves (`*codeql*`, `*gitleaks*`, `*semgrep*`, `*plumber*`,
  `*scorecard*`, `*sast*`, `*security*`, `*scan*`) may not be weakened or removed once present
  (`securityJobsMustNotBeWeakened`).
- `main` must be a protected branch with force-push disallowed (`branchMustBeProtected`).
