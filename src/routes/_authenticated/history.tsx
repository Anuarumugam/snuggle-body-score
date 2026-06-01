import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listAnalyses, deleteAnalysis } from "@/lib/analyze.functions";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — TruthGuard AI" }] }),
  component: History,
});

function History() {
  const list = useServerFn(listAnalyses);
  const del = useServerFn(deleteAnalysis);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "real" | "suspicious" | "fake">("all");

  const { data, isLoading } = useQuery({ queryKey: ["analyses"], queryFn: () => list() });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["analyses"] });
      toast.success("Deleted");
    },
  });

  const rows = (data ?? [])
    .filter((r) => filter === "all" || r.classification === filter)
    .filter((r) => !q || r.input_text.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Analysis history</h1>
      <p className="text-muted-foreground mb-6">Your saved AI verifications.</p>

      <Card className="mb-4">
        <CardContent className="pt-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search text…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex gap-1">
            {(["all","real","suspicious","fake"] as const).map((f) => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
                {f}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No analyses match. <Link to="/analyzer" className="text-primary">Run a new one →</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">
                    <ClassBadge c={r.classification} /> <span className="ml-2 text-muted-foreground font-normal text-sm">{Number(r.confidence).toFixed(0)}% · risk {r.risk_level}</span>
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm line-clamp-3">{r.input_text}</p>
                <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">AI:</span> {r.explanation}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}{r.source_url ? ` · ${r.source_url}` : ""}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ClassBadge({ c }: { c: string }) {
  const map: Record<string, string> = {
    real: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    suspicious: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
    fake: "bg-destructive/15 text-destructive",
  };
  return <span className={`text-xs font-medium px-2 py-1 rounded ${map[c] ?? ""}`}>{c}</span>;
}