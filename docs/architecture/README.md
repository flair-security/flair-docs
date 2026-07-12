---
sidebar_position: 1
---

# Architecture

> This is the public-browsing copy of FLAIR's architecture documentation. For now, the source of truth is [`docs/ARCHITECTURE.md`](https://github.com/flair-security/.github/blob/main/docs/ARCHITECTURE.md) in the `.github` repo — changes to architecture require an ADR in `docs/ADR/` there (mirrored in [`docs/adr/`](../adr/) here).

## Overview

FLAIR is a self-hosted, single-tenant application flow mapping platform.
It captures network flows at the OS level, enriches them with protocol and TLS metadata,
stores them in a graph database, and exposes a scoring and alerting interface for security teams.

```text
┌─────────────────────────────────────────────────────────────┐
│                    Organisation network                      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ flair-agent  │  │ flair-agent  │  │  flair-agent-k8s │  │
│  │ (Linux eBPF) │  │  (Windows)   │  │  (K8s sidecar)   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                   │             │
│         └─────────────────┼───────────────────┘             │
│                           │ mTLS (TLS 1.3)                  │
│                    ┌──────▼───────┐                         │
│                    │  flair-core  │                         │
│                    │  (REST API)  │                         │
│                    │  (GraphDB)   │                         │
│                    └──────┬───────┘                         │
│                           │                                 │
│                    ┌──────▼───────┐                         │
│                    │   flair-ui   │                         │
│                    │  (Angular)   │                         │
│                    └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Components

### flair-agent (Linux eBPF)

Captures network flows at the kernel level using eBPF TC hooks.
Runs as a non-root process with `CAP_NET_ADMIN` and `CAP_SYS_PTRACE` only.
Performs first-packet DPI (512 bytes) for protocol detection.
Computes JA3 fingerprint in userspace from TLS ClientHello bytes.
Batches flows (1000 flows or 10 seconds) and sends to flair-core via mTLS.
Buffers locally (up to 100MB on disk) when flair-core is unreachable.

### flair-core

Central server. Receives flows from agents, scores them, stores them in PostgreSQL + AGE,
and exposes a REST API authenticated via OIDC (users) and mTLS (agents).
Single instance per organisation — no multi-tenancy.

### flair-ui

Angular SPA served by nginx. Connects to flair-core REST API.
Renders the interactive flow map using D3.js force-directed graph.
Primary user: RSSI / security auditor.

---

## Architecture documents

| Document | Description |
| --- | --- |
| [flow-contract.md](flow-contract.md) | The `Flow` struct — the central cross-repo data contract — plus the abstract interfaces (`GraphStore`, `AuthProvider`, `IngestQueue`) built around it |
| [data-model.md](data-model.md) | Relational (PostgreSQL) and graph (Apache AGE) data model |
| [authentication.md](authentication.md) | Authentication model per actor, and the agent enrollment flow |
| [scoring.md](scoring.md) | Security scoring weights, hard penalties, and colour mapping |

See also [ADR-0001](../adr/adr-0001-flow-contract.md) (Flow struct as the central cross-repo contract) and [ADR-0002](../adr/adr-0002-postgresql-age-graph.md) (PostgreSQL + Apache AGE as the single database engine).

---

## Non-negotiables

These constraints apply to every component without exception:

- No `--tls-verify=false` or equivalent anywhere
- Every `flair-core` API action → structured JSON log to stdout
- Default install works without Kubernetes, Elasticsearch, or third-party services
- Flow retention configurable via admin UI — never hardcoded
- Agents run non-root with documented minimal capabilities
- Semantic Release is authoritative for versioning — no manual tags
- `Flow` contract is versioned — any breaking change explicitly flagged across all affected repos with coordinated PRs
- Merge to `main` only when the full CI/CD pipeline is green — no exceptions
