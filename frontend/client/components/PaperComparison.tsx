import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, FileText, TrendingUp } from "lucide-react";

interface ComparisonResult {
  id: string;
  papers: {
    id: string;
    title: string;
    answer: string;
    confidence: number;
  }[];
  consensus: 'agreement' | 'disagreement' | 'partial';
  query: string;
}

const mockComparisons: ComparisonResult[] = [
  {
    id: "comp-1",
    query: "How does microgravity affect immune response?",
    consensus: 'agreement',
    papers: [
      {
        id: "NASA-001",
        title: "Cell growth in microgravity",
        answer: "Microgravity reduces T-cell activation and decreases immune function by 15-20%.",
        confidence: 0.85
      },
      {
        id: "NASA-214",
        title: "Immune response post-flight",
        answer: "Immune suppression observed in microgravity conditions with 15-20% reduction in T-cell activity.",
        confidence: 0.82
      }
    ]
  },
  {
    id: "comp-2",
    query: "What is the optimal duration for space missions?",
    consensus: 'disagreement',
    papers: [
      {
        id: "NASA-387",
        title: "Mitochondrial dynamics in space",
        answer: "Long-term missions (6+ months) show significant cellular damage and should be limited.",
        confidence: 0.78
      },
      {
        id: "NASA-501",
        title: "Extended mission protocols",
        answer: "Missions up to 12 months are safe with proper countermeasures and monitoring.",
        confidence: 0.73
      }
    ]
  }
];

export default function PaperComparison() {
  const [selectedComparison, setSelectedComparison] = useState<ComparisonResult | null>(null);

  const getConsensusIcon = (consensus: string) => {
    switch (consensus) {
      case 'agreement':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disagreement':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
    }
  };

  const getConsensusBadge = (consensus: string) => {
    switch (consensus) {
      case 'agreement':
        return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">Consensus</Badge>;
      case 'disagreement':
        return <Badge variant="default" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Disagreement</Badge>;
      default:
        return <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30">Partial</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-gradient">Paper Comparison & Consensus</h2>
      </div>

      {/* Comparison List */}
      <div className="grid gap-4">
        {mockComparisons.map((comparison) => (
          <Card 
            key={comparison.id} 
            className="glass border-border/60 cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => setSelectedComparison(comparison)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium text-foreground/90">
                  {comparison.query}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getConsensusIcon(comparison.consensus)}
                  {getConsensusBadge(comparison.consensus)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-foreground/60">
                <span>{comparison.papers.length} papers compared</span>
                <span>Avg confidence: {Math.round(comparison.papers.reduce((acc, p) => acc + p.confidence, 0) / comparison.papers.length * 100)}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Comparison Modal */}
      {selectedComparison && (
        <Card className="glass border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gradient">{selectedComparison.query}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedComparison(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedComparison.papers.map((paper, index) => (
              <div key={paper.id} className="glass rounded-lg p-4 border border-border/40">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{paper.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(paper.confidence * 100)}% confidence
                  </Badge>
                </div>
                <p className="text-sm text-foreground/80 mb-2">{paper.answer}</p>
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <span>Paper ID: {paper.id}</span>
                  <span>•</span>
                  <span>Source: NASA Database</span>
                </div>
              </div>
            ))}
            
            <div className="glass rounded-lg p-4 border border-primary/20 bg-primary/5">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                {getConsensusIcon(selectedComparison.consensus)}
                Analysis Summary
              </h4>
              <p className="text-sm text-foreground/80">
                {selectedComparison.consensus === 'agreement' 
                  ? "Papers show strong consensus on this topic with consistent findings across multiple studies."
                  : selectedComparison.consensus === 'disagreement'
                  ? "Papers present conflicting findings, suggesting this area needs further research."
                  : "Mixed findings across papers indicate partial consensus with some areas of agreement."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
