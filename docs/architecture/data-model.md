---
sidebar_position: 3
---

# Data model

See [ADR-0002](../adr/adr-0002-postgresql-age-graph.md) for why PostgreSQL + Apache AGE was chosen as the single database engine for both the relational and graph data below.

## Relational (PostgreSQL)

- `flows` — raw captured flows with all metadata
- `services` — discovered services (deduplicated by name + IP)
- `agents` — enrolled agents with certificate thumbprints
- `audit_logs` — append-only action log (never UPDATE or DELETE)
- `system_config` — key/value configuration (retention period, webhook URLs...)

## Graph (Apache AGE on same PostgreSQL instance)

- Nodes: `Service` — one per discovered endpoint
- Edges: `FLOW` — directional, carries protocol/encryption/bytes
- Primary query: cross-zone unencrypted flow detection via Cypher
