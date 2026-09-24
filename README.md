# PARALLAX — Return Fraud Intelligence

> **Detect the fraud ring, not just the fraudulent account.**

PARALLAX is a return-fraud intelligence platform designed to detect coordinated refund fraud in D2C e-commerce.

Traditional return-fraud systems often evaluate customers individually. Sophisticated fraud rings can exploit this by distributing suspicious returns across multiple accounts, keeping each account's activity below individual fraud thresholds.

PARALLAX looks beyond individual accounts by connecting relationships across **customers, devices, addresses, payment tokens, products, return behaviour, and submitted evidence** to identify hidden coordinated patterns.

---

## 🎥 Prototype Demo

▶️ YouTube Demo:
[Watch the PARALLAX Prototype Demo](https://youtu.be/CpMioh_Kl-c?si=kDNDL8HU_i58SFJa)

The video demonstrates the complete investigation workflow from a suspicious return request to fraud-ring detection, explainability, human review, and audit logging.

---

## 🏆 Hackathon

**Hackathon:** MUSA CodeX 2026  
**Domain:** FinTech & Digital Economy  
**Problem Statement:** CX0507 — The Fraudulent Refund Loop  
**Project:** PARALLAX — Return Fraud Intelligence

### Problem Statement

A small D2C seller is losing increasing revenue due to return fraud such as:

- Empty-box returns
- Staged damage claims
- Repeated suspicious return requests
- Manipulated return evidence
- Coordinated fraud across multiple customer accounts

The challenge is that sophisticated fraud rings can keep each individual account's return activity just below the merchant's fraud threshold.

The system therefore needs to identify **coordinated behaviour across seemingly unrelated accounts**, rather than relying only on individual customer scores.

---

# 💡 Our Solution

PARALLAX uses a two-level fraud analysis approach:

### 1. Individual Risk

Each return request is evaluated using signals such as:

- Customer return history
- Return frequency
- Refund value
- Return latency
- Repeated return reasons
- Order behaviour
- Product/SKU patterns
- Device and network signals
- Address relationships
- Evidence similarity

### 2. Network Risk

The system then looks for relationships between multiple entities.

For example:

```text
Customer A ── Device X ── Customer B
     │             │
     │             └── Customer C
     │
  Address Y ── Payment Token Z
     │
  SKU 104 ── Similar Damage Evidence
