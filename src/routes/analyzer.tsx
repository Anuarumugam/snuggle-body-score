import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { analyzeContent, type AnalysisResult } from "@/lib/analyze.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/analyzer")({
  head: () => ({
    meta: [
      { title: "Analyzer — TruthGuard AI" },
      { name: "description", content: "Paste a news article or post and get an instant AI credibility analysis." },
    ],
  }),
  component: AnalyzerPage,
});

function AnalyzerPage() {
  const analyze = useServerFn(analyzeContent);
  const [text, setText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setIsAuthed(!!s));
    return () => subscription.unsubscribe();
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      return await analyze({ data: { text, sourceUrl: sourceUrl || undefined, save: true } });
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Analysis complete");
    },
    onError: (e: Error) => {
      toast.error(e.message || "Analysis failed");
    },
  });

  if (!isAuthed) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-xl text-center">
        <h1 className="text-3xl font-bold">Sign in to analyze content</h1>
        <p className="mt-3 text-muted-foreground">Your analyses are saved privately to your history.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button asChild><Link to="/login">Sign in</Link></Button>
          <Button variant="outline" asChild><Link to="/register">Create account</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">News Analyzer</h1>
        <p className="mt-2 text-muted-foreground">Paste any article, headline, or post. We'll classify it and explain why.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="source">Source URL (optional)</label>
              <Input
                id="source"
                type="url"
                placeholder="https://example.com/article"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="content">Text to analyze</label>
              <Textarea
                id="content"
                placeholder="Paste the article text or headline here (minimum 20 characters)..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                className="mt-1.5 resize-none"
              />
              <div className="mt-1 text-xs text-muted-foreground">{text.length} characters</div>
            </div>
            <Button
              onClick={() => mutation.mutate()}
              disabled={text.length < 20 || mutation.isPending}
              size="lg"
              className="w-full"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing with AI…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <ResultPanel result={result} loading={mutation.isPending} />
          {result?.savedId && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={() => router.navigate({ to: "/history" })}>
                View all in History
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultPanel({ result, loading }: { result: AnalysisResult | null; loading: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Running AI analysis…</p>
        </CardContent>
      </Card>
    );
  }
  if (!result) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Results will appear here.
        </CardContent>
      </Card>
    );
  }

  const cfg = {
    real: { label: "Real News", Icon: CheckCircle2, color: "text-[color:var(--success)]", bar: "bg-[color:var(--success)]" },
    suspicious: { label: "Suspicious", Icon: AlertTriangle, color: "text-[color:var(--warning)]", bar: "bg-[color:var(--warning)]" },
    fake: { label: "Fake News", Icon: XCircle, color: "text-destructive", bar: "bg-destructive" },
  }[result.classification];

  const riskColor = {
    low: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
    medium: "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30",
    high: "bg-destructive/15 text-destructive border-destructive/30",
  }[result.riskLevel];

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <div className="flex items-center gap-3">
          <cfg.Icon className={`h-8 w-8 ${cfg.color}`} />
          <div>
            <CardTitle className="text-2xl">{cfg.label}</CardTitle>
            <p className="text-sm text-muted-foreground">Confidence {result.confidence.toFixed(0)}%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span>Credibility</span>
            <span>{result.confidence.toFixed(0)}%</span>
          </div>
          <Progress value={result.confidence} className="h-2" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={riskColor}>Risk: {result.riskLevel}</Badge>
          <Badge variant="outline">Sentiment: {result.sentiment}</Badge>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-1.5">Explanation</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.explanation}</p>
        </div>

        {result.keywords.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-1.5">Flagged signals</h4>
            <div className="flex flex-wrap gap-1.5">
              {result.keywords.map((k) => (
                <Badge key={k} variant="secondary" className="font-normal">{k}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}