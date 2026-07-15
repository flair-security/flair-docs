---
sidebar_position: 7
---

# Branch protection

Every repository in the `flair-security` org has classic branch protection configured on
`main`, applied uniformly regardless of repo group:

- **Pull request required before merging.** Direct pushes to `main` are rejected for
  everyone, including the org owner.
- **0 required approvals.** FLAIR is solo-founder, pre-MVP, with no second reviewer
  available — requiring an approval would deadlock every merge. The PR gate exists to force
  every change through the status-check pipeline below, not to force human review.
- **Required status checks** — repo-specific, must be green before merge:

  | Repo group | Required status checks |
  |---|---|
  | flair-agent, flair-agent-k8s, flair-agent-windows, flair-core, flair-sdk-go, flair-sdk-python, flair-ui | `Gitleaks - Secret Scan`, `CodeQL - SAST`, `Semgrep - SAST`, `Plumber - CI/CD Compliance` |
  | flair-helm, flair-terraform-aws, flair-terraform-azure, flair-terraform-gcp | `Gitleaks - Secret Scan`, `Semgrep - SAST`, `Plumber - CI/CD Compliance` |
  | flair-docs, flair-rules, flair-demo | `Gitleaks - Secret Scan`, `Plumber - CI/CD Compliance` |
  | `.github` | `Gitleaks - Secret Scan`, `Plumber - CI/CD Compliance`, `Validate markdown files`, `Validate skill YAML files`, `Secret scanning` |

- **No force-push, no branch deletion.** `main` cannot be rewritten or removed by anyone.
- **`enforce_admins: true`.** The branch protection rules apply to admins too — the org owner
  cannot bypass the PR-plus-status-checks requirement, even for a one-line hotfix. Combined
  with 0 required approvals, the net effect is: the founder can still self-merge (no one else
  needs to click "approve"), but **cannot** merge without opening a PR and getting every
  required check green first — there is no direct-push escape hatch for anyone, including
  the account that owns the org.
- **`delete_branch_on_merge: true`.** Feature branches are deleted automatically once their
  PR merges, keeping the branch list from accumulating merged work.

## Known gap

Each repo's `.plumber.yaml` declares `branchMustBeProtected.codeOwnerApprovalRequired: true`,
but no repo in the org currently has a `CODEOWNERS` file, and live branch protection has
`require_code_owner_reviews: false` with `required_approving_review_count: 0` everywhere.
That specific Plumber control is aspirational until a `CODEOWNERS` file exists and code-owner
review is actually turned on — worth resolving (or relaxing the policy) once there's a second
maintainer to own review.
