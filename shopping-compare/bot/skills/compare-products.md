---
description: Research and rank products or clinics on quality, price, and popularity before recommending.
---

# Compare products

## When to load

Any request to compare products, services, clinics, or “which is best.”

## Loop

1. Clarify the decision: category, location/budget constraints, must-haves.
2. Gather 3–6 options with sources and links (prefer primary + recent forum/review signals).
3. Normalize units (currency, per-unit pricing, what’s included).
4. Score each option 0–10 on quality, price value, popularity — then call `score_options`.
5. Recommend a shortlist (usually top 2) with tradeoffs, not a fake certainty winner.
6. If the user wants Notes, call `save_comparison_note` with the full brief.

## Scoring guide

- **Quality:** credentials, materials/spec, measured outcomes, red flags.
- **Price:** value for what you get (include fees, aftercare, shipping), not lowest sticker.
- **Popularity:** review volume, forum mention quality, brand awareness — discount obvious astroturf.

## Guardrails

- Separate facts from clinic/marketing claims.
- Medical/cosmetic: say “consult a licensed clinician”; do not diagnose.
- Never invent prices; label ranges as market estimates.
