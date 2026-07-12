---
sidebar_position: 5
---

# Security scoring

Scores are 0–100 per flow. Lower = higher risk.

| Strategy | Weight | Key signals |
| --- | --- | --- |
| TLS version | 40% | TLS 1.3 = 100, unencrypted = 0 |
| Cipher suite | 20% | Weak cipher = 0 |
| Protocol | 25% | gRPC/HTTPS = high, HTTP = low |
| Zone crossing | 15% | Same zone = 100, EXTERNAL→DATA = 0 |

Hard penalties override the weighted score:

- Unencrypted + cross-zone → max 15
- Weak cipher detected → max 25
- TLS 1.0/1.1 → max 30

Colour mapping: ≥ 70 = green, 30–69 = amber, < 30 = red.
