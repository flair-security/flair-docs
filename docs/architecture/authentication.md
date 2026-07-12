---
sidebar_position: 4
---

# Authentication model

| Actor | Method | Token lifetime |
| --- | --- | --- |
| Human user (RSSI, admin) | OIDC + Bearer JWT | 15 min access + 8h refresh |
| flair-agent | mTLS client certificate | 90 days, auto-renewed |
| Webhook receiver | HMAC-SHA256 signature | Per-request |

Agent enrollment flow: admin generates single-use token (1h TTL) → agent sends CSR → flair-core signs certificate → mTLS established.
