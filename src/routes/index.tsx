import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Shield, Zap, BarChart3, Globe, CheckCircle2, ArrowRight, Brain, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TruthGuard AI — Detect Fake News with AI" },
      { name: "description", content: "Paste any article, headline, or post. Our AI returns a credibility score, classification, and explanation in seconds." },
      { property: "og:title", content: "TruthGuard AI" },
      { property: "og:description", content: "AI-powered fake news detection and verification platform." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Brain, title: "AI Classification", desc: "Gemini-powered analysis labels content as Real, Fake, or Suspicious with a confidence score." },
  { icon: BarChart3, title: "Visual Analytics", desc: "Credibility meters, risk breakdowns, and history trends — at a glance." },
  { icon: Globe, title: "Source Awareness", desc: "Optional source URL is factored into the credibility assessment." },
  { icon: Lock, title: "Private & Secure", desc: "Your analyses are stored privately and only visible to your account." },
];

const steps = [
  { n: "1", title: "Paste content", desc: "Drop in any article, headline, or social post." },
  { n: "2", title: "AI analyzes", desc: "Our model evaluates language patterns, claims, and risk signals." },
  { n: "3", title: "Get a verdict", desc: "Receive a classification, confidence score, and plain-English explanation." },
];

const stats = [
  { n: "<5s", label: "Avg analysis time" },
  { n: "100%", label: "Private by default" },
  { n: "3+", label: "Risk dimensions" },
  { n: "24/7", label: "Available anytime" },
];

const faqs = [
  { q: "Is TruthGuard AI always right?", a: "No AI is infallible. Use TruthGuard as a credibility signal alongside your own judgement and trusted fact-checkers." },
  { q: "Do you store the content I analyze?", a: "Only when you're signed in. Analyses are saved to your private history so you can revisit them later. You can delete any analysis." },
  { q: "What languages are supported?", a: "English performs best today. Other languages may work but with reduced accuracy." },
  { q: "Is it free?", a: "Yes — every signed-in user gets free AI analyses powered by Lovable AI." },
];

function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 dark:opacity-30"
          style={{ background: "var(--gradient-hero)" }}
          aria-hidden
        />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              AI-powered fake news detection
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Spot misinformation in <span className="text-primary">seconds</span>.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
              TruthGuard AI analyzes news articles, headlines, and social posts to classify them as real, fake, or suspicious — with a confidence score and clear explanation.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link to="/analyzer">
                  Analyze content <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Create free account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4 py-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">{s.n}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Built for clarity</h2>
          <p className="mt-3 text-muted-foreground">Everything you need to evaluate a piece of content quickly.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="border-border/60">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three steps from raw content to a credibility verdict.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-xl border border-border bg-card p-6">
                <div className="absolute -top-4 left-6 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {s.n}
                </div>
                <h3 className="mt-2 font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center">Frequently asked</h2>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div
          className="rounded-2xl p-10 md:p-16 text-center text-primary-foreground"
          style={{ background: "var(--gradient-hero)" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">Ready to verify a story?</h2>
          <p className="mt-3 opacity-90">Paste any article or headline and see what the AI thinks.</p>
          <div className="mt-6">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/analyzer">
                Open Analyzer <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>TruthGuard AI © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />
            <span>Powered by Lovable AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
