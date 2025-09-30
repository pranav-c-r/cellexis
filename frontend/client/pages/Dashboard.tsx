import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Search, User } from "lucide-react";

interface Paper {
  id: string;
  title: string;
  summary: string;
  year: number;
}

const mockPapers: Paper[] = [
  {
    id: "NASA-001",
    title: "Cell growth in microgravity",
    summary: "Effects of microgravity on plant stem cells.",
    year: 2021,
  },
  {
    id: "NASA-214",
    title: "Immune response post-flight",
    summary: "Adaptive immune changes across missions.",
    year: 2022,
  },
  {
    id: "NASA-387",
    title: "Mitochondrial dynamics in space",
    summary: "Energy pathway shifts in mice.",
    year: 2020,
  },
];

export default function Dashboard() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("search");
  const [selected, setSelected] = useState<Paper | null>(null);

  return (
    <div className="bg-space min-h-screen">
      {/* Sub Navbar */}
      <div className="border-b border-border/40 sticky top-16 z-40 bg-background/60 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between py-3">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between gap-4">
              <TabsList className="glass">
                <TabsTrigger value="search">Search</TabsTrigger>
                <TabsTrigger value="qa">QA</TabsTrigger>
                <TabsTrigger value="graph">Graph</TabsTrigger>
                <TabsTrigger value="papers">Papers</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className="text-foreground/70 hover:text-foreground"
                >
                  <User className="mr-2 h-4 w-4" /> Profile
                </Button>
              </div>
            </div>
            <TabsContent value="search" />
            <TabsContent value="qa" />
            <TabsContent value="graph" />
            <TabsContent value="papers" />
          </Tabs>
        </div>
      </div>

      {/* Main Panels */}
      <div className="container mx-auto py-6 grid grid-cols-12 gap-6">
        {/* Left Panel */}
        {leftOpen && (
          <aside className="col-span-12 lg:col-span-3 glass rounded-xl p-4 self-start">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Search & Filters</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLeftOpen(false)}
              >
                <ChevronLeft />
              </Button>
            </div>
            <div className="grid gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
                <Input className="pl-9" placeholder="Search keywords" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Year" />
                <Input placeholder="Organism" />
                <Input placeholder="Experiment type" />
                <Input placeholder="Mission" />
              </div>
              <div className="mt-3 space-y-2">
                <h4 className="text-sm text-foreground/70">Results</h4>
                <div className="space-y-2 max-h-64 overflow-auto pr-1">
                  {mockPapers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="w-full text-left glass rounded-lg p-3 hover:border-primary/40 border border-transparent"
                    >
                      <div className="text-sm font-medium">{p.title}</div>
                      <div className="text-xs text-foreground/60">
                        {p.summary}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Center Panel */}
        <main
          className={`${leftOpen && rightOpen ? "col-span-12 lg:col-span-6" : leftOpen || rightOpen ? "col-span-12 lg:col-span-9" : "col-span-12"} grid gap-4`}
        >
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold mb-2">Ask a question</h3>
            <div className="flex gap-2">
              <Input placeholder="e.g., How does microgravity affect immune response?" />
              <Button className="bg-gradient-to-r from-primary via-accent to-secondary text-black">
                Ask
              </Button>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold">Answer</h3>
            <p className="mt-2 text-sm text-foreground/80">
              Gemini response will appear here.
            </p>
            <div className="mt-4 text-xs text-foreground/60">
              Citations: NASA-001 p.2, NASA-214 p.5
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-foreground/80">
                Retrieved snippets
              </summary>
              <ul className="mt-2 list-disc pl-5 text-sm text-foreground/70 space-y-1">
                <li>
                  "Microgravity reduced T-cell activation in missions STS-XXX
                  ..."
                </li>
                <li>
                  "Mitochondrial fragmentation increased under flight conditions
                  ..."
                </li>
              </ul>
            </details>
          </div>
        </main>

        {/* Right Panel */}
        {rightOpen ? (
          <aside className="col-span-12 lg:col-span-3 glass rounded-xl p-4 self-start">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Graph Explorer</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightOpen(false)}
              >
                <ChevronRight />
              </Button>
            </div>
            <div className="aspect-[4/5] w-full rounded-lg border border-border/50 grid place-items-center text-sm text-foreground/60">
              Cytoscape.js preview here
            </div>
            <p className="mt-3 text-xs text-foreground/60">
              Click nodes to view related papers.
            </p>
          </aside>
        ) : (
          <div className="col-span-12 lg:col-span-1 flex items-start">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightOpen(true)}
            >
              <ChevronLeft />
            </Button>
          </div>
        )}
      </div>

      {/* Paper Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {selected && (
                <div className="text-sm text-foreground/70">
                  <div className="mt-1">
                    Paper ID: {selected.id} • Year: {selected.year}
                  </div>
                  <div className="mt-3 font-medium">TL;DR</div>
                  <p className="text-sm">{selected.summary}</p>
                  <ul className="mt-3 list-disc pl-5 space-y-1">
                    <li>Key finding 1</li>
                    <li>Key finding 2</li>
                  </ul>
                  <div className="mt-4 text-sm">
                    <a className="underline text-primary" href="#">
                      PDF link
                    </a>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
