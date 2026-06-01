import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BarChart3, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAnalyses } from "@/lib/analyze.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — TruthGuard AI" }] }),
  component: Dashboard,
});

const COLORS = {
  real: "oklch(0.7 0.18 145)",
  suspicious: "oklch(0.78 0.16 75)",
  fake: "oklch(0.62 0.23 27)",
};

function Dashboard() {
  const list = useServerFn(listAnalyses);
  const { data, isLoading } = useQuery({ queryKey: ["analyses"], queryFn: () => list() });
  const rows = data ?? [];

  const counts = {
    real: rows.filter((r) => r.classification === "real").length,
    suspicious: rows.filter((r) => r.classification === "suspicious").length,
    fake: rows.filter((r) => r.classification === "fake").length,
  };
  const pie = [
    { name: "Real", value: counts.real, key: "real" },
    { name: "Suspicious", value: counts.suspicious, key: "suspicious" },
    { name: "Fake", value: counts.fake, key: "fake" },
  ];
  const total = rows.length;
  const avgConfidence = total
    ? Math.round(rows.reduce((s, r) => s + Number(r.confidence), 0) / total)
    : 0;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Overview of your verification activity.</p>
        </div>
        <Button asChild>
          <Link to="/analyzer">New analysis <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatCard title="Total analyses" value={total} icon={BarChart3} />
        <StatCard title="Real" value={counts.real} icon={ShieldCheck} tone="success" />
        <StatCard title="Suspicious" value={counts.suspicious} icon={AlertTriangle} tone="warning" />
        <StatCard title="Fake" value={counts.fake} icon={XCircle} tone="danger" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Credibility breakdown</CardTitle></CardHeader>
          <CardContent>
            {total === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No analyses yet.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                      {pie.map((entry) => (
                        <Cell key={entry.key} fill={COLORS[entry.key as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Average confidence</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary">{avgConfidence}%</div>
              <div className="mt-2 text-sm text-muted-foreground">across {total} analyses</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Recent analyses</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No analyses yet. <Link to="/analyzer" className="text-primary">Run your first one →</Link></p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.slice(0, 5).map((r) => (
                <li key={r.id} className="py-3 flex items-start gap-3">
                  <Badge classification={r.classification} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{r.input_text.slice(0, 120)}{r.input_text.length > 120 ? "…" : ""}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()} · {Number(r.confidence).toFixed(0)}% · risk {r.risk_level}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, tone }: { title: string; value: number; icon: React.ComponentType<{ className?: string }>; tone?: "success" | "warning" | "danger" }) {
  const colors = {
    success: "text-[color:var(--success)] bg-[color:var(--success)]/10",
    warning: "text-[color:var(--warning)] bg-[color:var(--warning)]/10",
    danger: "text-destructive bg-destructive/10",
  };
  const c = tone ? colors[tone] : "text-primary bg-primary/10";
  return (
    <Card>
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${c}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Badge({ classification }: { classification: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    real: { label: "Real", cls: "bg-[color:var(--success)]/15 text-[color:var(--success)]" },
    suspicious: { label: "Susp.", cls: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]" },
    fake: { label: "Fake", cls: "bg-destructive/15 text-destructive" },
  };
  const c = map[classification] ?? map.suspicious;
  return <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded ${c.cls}`}>{c.label}</span>;
}