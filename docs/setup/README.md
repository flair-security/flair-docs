---
slug: /
sidebar_position: 0
sidebar_label: "Overview"
---

# Setup

There is no runnable local dev stack to document here yet. FLAIR is pre-MVP: `flair-agent`,
`flair-core` and `flair-ui` are all still in early development, and none of them has a
verified, working local dev flow across the board today.

## What's planned

The org's engineering conventions (see `flair-security/.github/CLAUDE.md`) describe the target
model: local dev via **Docker Desktop**, with each repo providing its own
`docker-compose.dev.yml`, e.g.

```bash
docker compose -f docker-compose.dev.yml up
```

`flair-agent` additionally needs access to a Linux kernel for its eBPF programs — on Docker
Desktop that comes from the intermediate Linux VM, which is enough for unit and functional
tests but not for full performance/kernel-compatibility validation (that needs a dedicated
Linux test server).

## Where this page goes next

Real, tested setup instructions (clone order, environment variables, first run, troubleshooting)
will land here once `flair-core` and `flair-agent` actually have a runnable dev stack to point
people at. Until then, please don't expect `git clone && docker compose up` to work end to end —
check the individual repos' own README/CLAUDE.md for their current state.
