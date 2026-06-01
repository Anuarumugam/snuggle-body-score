import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AnalyzeInput = z.object({
  text: z.string().min(20).max(20000),
  sourceUrl: z.string().url().optional().or(z.literal("")).optional(),
  save: z.boolean().optional().default(true),
});

export type AnalysisResult = {
  classification: "real" | "fake" | "suspicious";
  confidence: number;
  sentiment: "positive" | "neutral" | "negative";
  riskLevel: "low" | "medium" | "high";
  explanation: string;
  keywords: string[];
  savedId?: string;
};

const SYSTEM_PROMPT = `You are TruthGuard AI, an expert fact-checker and misinformation analyst.
Analyze the supplied news content for credibility. Consider:
- emotional / sensationalist language
- verifiable specific claims vs vague generalities
- presence of named sources, dates, locations
- known disinformation patterns
- internal contradictions

Reply ONLY with a JSON object matching this exact shape:
{
  "classification": "real" | "fake" | "suspicious",
  "confidence": number (0-100),
  "sentiment": "positive" | "neutral" | "negative",
  "riskLevel": "low" | "medium" | "high",
  "explanation": string (2-4 concise sentences in plain English),
  "keywords": string[] (3-6 short flagged terms or claims)
}
No prose outside the JSON.`;

function fallback(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  const redFlags = ["shocking", "you won't believe", "secret", "miracle", "they don't want you", "exposed", "100%", "guaranteed"];
  const hits = redFlags.filter((f) => lower.includes(f));
  const fake = hits.length >= 2;
  return {
    classification: fake ? "suspicious" : "real",
    confidence: fake ? 55 : 65,
    sentiment: "neutral",
    riskLevel: fake ? "medium" : "low",
    explanation:
      "Heuristic fallback used (AI gateway unavailable). Result is based on basic language patterns only.",
    keywords: hits.length ? hits : ["heuristic"],
  };
}

export const analyzeContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;

    let result: AnalysisResult;

    if (!apiKey) {
      result = fallback(data.text);
    } else {
      try {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: `Source URL: ${data.sourceUrl || "(none)"}\n\nContent:\n${data.text}`,
              },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (res.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
        if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
        if (!res.ok) throw new Error(`AI gateway error: ${res.status}`);

        const json = await res.json();
        const content = json.choices?.[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(content);

        result = {
          classification: ["real", "fake", "suspicious"].includes(parsed.classification)
            ? parsed.classification
            : "suspicious",
          confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 50)),
          sentiment: ["positive", "neutral", "negative"].includes(parsed.sentiment)
            ? parsed.sentiment
            : "neutral",
          riskLevel: ["low", "medium", "high"].includes(parsed.riskLevel)
            ? parsed.riskLevel
            : "medium",
          explanation: String(parsed.explanation ?? "No explanation provided."),
          keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 8).map(String) : [],
        };
      } catch (e) {
        if (e instanceof Error && (e.message.includes("Rate limit") || e.message.includes("credits"))) {
          throw e;
        }
        result = fallback(data.text);
      }
    }

    if (data.save) {
      const { data: row, error } = await supabase
        .from("analyses")
        .insert({
          user_id: userId,
          input_text: data.text,
          source_url: data.sourceUrl || null,
          classification: result.classification,
          confidence: result.confidence,
          sentiment: result.sentiment,
          risk_level: result.riskLevel,
          explanation: result.explanation,
          keywords: result.keywords,
        })
        .select("id")
        .single();
      if (!error && row) result.savedId = row.id;
    }

    return result;
  });

export const listAnalyses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("analyses").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });