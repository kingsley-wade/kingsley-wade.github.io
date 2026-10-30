---
id: agent-serving-scheduling
title: Stage-Aware Group Scheduling for Offline Agent Workloads
summary: A stage-aware mixed-integer scheduler for offline agent workflows.
period: 2025-2026
role: Research, implementation, evaluation, and manuscript writing
order: 10
links:
  - label: OpenReview
    url: https://openreview.net/forum?id=xpJiRqbBUk
tags:
  - agent systems
  - scheduling
  - mixed-integer programming
visibility: public
updatedAt: "2026-10-29"
---

I designed and implemented AgentMIP, a DAG-aware mixed-integer programming
scheduler that groups compatible stages across offline agent workflows while
accounting for workflow dependencies and adapter switching. The work studies
stage abstraction as a scheduling unit, aiming to approach token-level
scheduling performance without scheduling at token granularity. The manuscript
is at the final-decision stage for AAAI 2027.
