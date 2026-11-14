import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "Ranks options then saves a Notes-ready comparison brief.",
  async test(t) {
    await t.send(
      [
        "Compare these two hair clinics for me and save a Notes brief.",
        "Clinic A: strong credentials, mid price, high forum mentions.",
        "Clinic B: weaker credentials, cheaper, fewer mentions.",
        "Use score_options then save_comparison_note.",
      ].join(" "),
    );
    t.succeeded();
    t.calledTool("score_options");
    t.calledTool("save_comparison_note");
  },
});
