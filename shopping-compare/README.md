# shopping-compare

Shopping / comparison agent: research options across the web, rank them on
**quality**, **price value**, and **popularity**, and export a Notes-ready brief
(including links) for Apple Notes via copy-paste or `NOTES_WEBHOOK_URL`.

## Local loop

```bash
cd shopping-compare
npx @grok/agent-sdk@0.6.0 validate --dir .
npx @grok/agent-sdk@0.6.0 info --dir . --json
npx tsc --noEmit -p .
npx @grok/agent-sdk@0.6.0 tool call score_options --dir . --json --input '{…}'
npx @grok/agent-sdk@0.6.0 run --dir . --message "Compare Taiwan FUE clinics…"
npx @grok/agent-sdk@0.6.0 dev
```

Playground: `http://127.0.0.1:3000/playground` when `dev` is running.

## Notes delivery

1. Default: agent returns markdown — paste into iOS Notes.
2. Optional: set `NOTES_WEBHOOK_URL` to an iOS Shortcut webhook that creates a Note.

## Deploy

Do not deploy from this transcript. From your own terminal after login:

```bash
npx @grok/agent-sdk@0.6.0 validate --dir ./shopping-compare
npx @grok/agent-sdk@0.6.0 deploy --dir ./shopping-compare --dry-run
npx @grok/agent-sdk@0.6.0 deploy --dir ./shopping-compare
```
