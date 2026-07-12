---
sidebar_position: 2
---

# Flow contract

The `Flow` struct is the central cross-repo interface. Any change is a breaking change requiring an ADR (see [ADR-0001](../adr/adr-0001-flow-contract.md)), coordinated PRs, and the `flow-contract` label on all PRs.

**Update order on any change**: `flair-agent` → `flair-core` → `flair-ui`

```go
type Flow struct {
    // Identity
    AgentID    string            // unique identifier of the emitting agent

    // Network
    SrcIP      string
    SrcPort    int
    DstIP      string
    DstPort    int
    Direction  string            // "outbound" | "inbound" | "internal"

    // Application protocol
    Protocol   string            // "HTTP/1.1" | "gRPC" | "SQL" | "AMQP" | "Redis"...

    // Encryption
    TLSVersion     string        // "TLS1.3" | "TLS1.2" | "" (none)
    TLSCipherSuite string        // e.g. "TLS_AES_256_GCM_SHA384" — empty if unencrypted
    JA3Hash        string        // TLS client fingerprint — empty if unencrypted
    Encrypted      bool

    // Source process
    SrcProcess  string
    SrcPID      int
    ContainerID string            // optional — enriched by flair-agent-k8s

    // Metrics
    BytesTransferred int64

    // Time
    Timestamp  time.Time

    // Extensible metadata
    Metadata   map[string]string  // "environment" | "owner" | "app_id"
                                   // "criticality" | "zone" | ...
}
```

Optional fields (`ContainerID`, `JA3Hash`, `TLSCipherSuite`): zero value is acceptable, never block a minimal agent implementation.
`Metadata` is intentionally open — do not add dedicated columns for concepts that belong here.

Breaking changes to the Flow contract require:

1. An ADR in `docs/ADR/`
2. Coordinated PRs across all affected repos opened simultaneously
3. Label `flow-contract` on all PRs

---

## Abstract interfaces

These interfaces allow swapping implementations without changing callers.
Implementations live in `flair-core/infrastructure/` only.

| Interface | MVP implementation | Target |
| --- | --- | --- |
| `GraphStore` (Reader + Writer) | SQLite (dev/test) | PostgreSQL + Apache AGE |
| `AuthProvider` | Local dev OIDC (Dex) | Coreos go-oidc (Entra ID, Okta, Keycloak...) |
| `IngestQueue` | Direct PostgreSQL write | NATS (at scale) |
