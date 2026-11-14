import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import { z } from "zod";

const OptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** 0–10, higher is better (materials, credentials, reviews quality). */
  quality: z.number().min(0).max(10),
  /** 0–10, higher is better value (not raw cheapness). */
  price: z.number().min(0).max(10),
  /** 0–10, higher is more popular / discussed / reviewed. */
  popularity: z.number().min(0).max(10),
  notes: z.string().optional(),
  url: z.string().optional(),
});

type Scored = {
  id: string;
  name: string;
  quality: number;
  price: number;
  popularity: number;
  total: number;
  rank: number;
  notes?: string;
  url?: string;
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export default defineTool({
  description: prompt`
    Rank shopping options on quality, price value, and popularity.
    Pass 0–10 scores you already judged from research; this tool only
    weights and sorts them. Call before the final recommendation.
  `,
  effect: "read",
  inputSchema: z.object({
    topic: z.string().min(1),
    qualityWeight: z.number().min(0).max(1).default(0.45),
    priceWeight: z.number().min(0).max(1).default(0.35),
    popularityWeight: z.number().min(0).max(1).default(0.2),
    options: z.array(OptionSchema).min(1).max(12),
  }),
  async execute({
    topic,
    qualityWeight,
    priceWeight,
    popularityWeight,
    options,
  }) {
    const weightSum = qualityWeight + priceWeight + popularityWeight;
    const qW = qualityWeight / weightSum;
    const pW = priceWeight / weightSum;
    const popW = popularityWeight / weightSum;

    const scored: Scored[] = options
      .map((opt) => {
        const total = round1(
          opt.quality * qW + opt.price * pW + opt.popularity * popW,
        );
        return {
          id: opt.id,
          name: opt.name,
          quality: opt.quality,
          price: opt.price,
          popularity: opt.popularity,
          total,
          rank: 0,
          ...(opt.notes !== undefined ? { notes: opt.notes } : {}),
          ...(opt.url !== undefined ? { url: opt.url } : {}),
        };
      })
      .sort((a, b) => b.total - a.total || b.quality - a.quality);

    scored.forEach((row, index) => {
      row.rank = index + 1;
    });

    return {
      topic,
      weights: { quality: qW, price: pW, popularity: popW },
      ranking: scored,
      topId: scored[0]?.id ?? null,
    };
  },
});
