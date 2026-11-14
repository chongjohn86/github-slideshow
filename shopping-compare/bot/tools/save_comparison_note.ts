import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import { z } from "zod";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export default defineTool({
  description: prompt`
    Save a Notes-ready comparison brief as durable markdown.
    Use after the comparison is ready. Optionally POSTs the same body to
    NOTES_WEBHOOK_URL (Apple Shortcuts / email bridge) when that env var
    is set. Always return the markdown so the user can paste into iOS Notes.
  `,
  effect: "idempotent",
  inputSchema: z.object({
    title: z.string().min(1).max(200),
    markdown: z.string().min(1).max(80_000),
    /** Stable id for idempotent rewrites of the same brief. */
    noteKey: z.string().min(1).max(120).optional(),
    deliverWebhook: z.boolean().default(true),
  }),
  dryRunResult: ({ title, noteKey }) => ({
    saved: false,
    dryRun: true,
    title,
    path: `notes/${slugify(noteKey ?? title)}.md`,
    webhookDelivered: false,
  }),
  async execute({ title, markdown, noteKey, deliverWebhook }, ctx) {
    const key = noteKey ?? slugify(title);
    const path = `notes/${slugify(key)}.md`;
    const body = markdown.startsWith("#")
      ? markdown
      : `# ${title}\n\n${markdown}`;

    // Deployment scope so Notes survive across sessions and work for
    // direct `tool call` (no session-bound files context).
    await ctx.host.files.write(path, body, { scope: "deployment" });

    const kvKey = `note:${slugify(key)}`;
    await ctx.host.kv.put(kvKey, {
      path,
      title,
      sessionId: ctx.session.id,
      updatedAt: new Date().toISOString(),
    });

    let webhookDelivered = false;
    let webhookError: string | undefined;
    const webhookUrl = process.env.NOTES_WEBHOOK_URL?.trim();
    if (deliverWebhook && webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title,
            markdown: body,
            path,
            source: "shopping-compare",
          }),
        });
        webhookDelivered = res.ok;
        if (!res.ok) {
          webhookError = `webhook HTTP ${res.status}`;
        }
      } catch (err) {
        webhookError = err instanceof Error ? err.message : "webhook failed";
      }
    }

    return {
      saved: true,
      title,
      path,
      webhookDelivered,
      ...(webhookError !== undefined ? { webhookError } : {}),
      webhookConfigured: Boolean(webhookUrl),
      markdown: body,
      howToNotes: webhookDelivered
        ? "Posted to NOTES_WEBHOOK_URL (your Shortcuts / Notes bridge)."
        : "Copy the returned markdown into Apple Notes, or set NOTES_WEBHOOK_URL to an iOS Shortcut webhook.",
    };
  },
});
