---
description: Format comparison briefs for Apple Notes and deliver via copy-paste or NOTES_WEBHOOK_URL Shortcuts bridge.
---

# Notes export

## When to load

User asks to send, save, or sync the comparison to Notes / iOS Notes.

## Format

Use plain Markdown Apple Notes pastes cleanly:

```markdown
# <Topic> comparison — <YYYY-MM-DD>

## Verdict
…

## Table
| Option | Quality | Price | Popularity | Link |
|---|---|---|---|---|

## Shortlist
1. …
2. …

## Sources
- title — url

## Next step
…
```

Include every URL the user may reopen later.

## Delivery

1. Call `save_comparison_note` with `title`, `markdown`, and a stable `noteKey`.
2. Paste the returned `markdown` in the chat reply.
3. If `webhookDelivered` is false, tell the user to copy into Notes, or configure
   `NOTES_WEBHOOK_URL` to an iOS Shortcut that creates a Note.

There is no public Apple Notes API from this host. Webhook + Shortcuts is the
automated path; copy-paste always works.
