import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network, Activity, BarChart3, Target, Zap, Globe } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: 'entity' | 'mission' | 'experiment' | 'organism';
  connections: number;
  citations: number;
  size: number;
  color: string;
}

interface HeatmapData {
  entity: string;
  citations: number;
  missions: string[];
  intensity: number;
}

const mockNodes: GraphNode[] = [
  {
    id: "mitochondria",
    label: "Mitochondria",
    type: 'entity',
    connections: 45,
    citations: 23,
    size: 85,
    color: "hsl(var(--primary))"
  },
  {
    id: "iss-mission",
    label: "ISS Mission",
    type: 'mission',
    connections: 32,
    citations: 18,
    size: 72,
    color: "hsl(var(--accent))"
  },
  {
    id: "t-cells",
    label: "T-Cells",
    type: 'entity',
    connections: 28,
    citations: 15,
    size: 65,
    color: "hsl(var(--secondary))"
  },
  {
    id: "arabidopsis",
    label: "Arabidopsis",
    type: 'organism',
    connections: 22,
    citations: 12,
    size: 58,
    color: "hsl(var(--primary))"
  }
];

const mockHeatmapData: HeatmapData[] = [
  { entity: "Mitochondria", citations: 45, missions: ["ISS", "STS-135", "Expedition 45"], intensity: 95 },
  { entity: "T-Cells", citations: 32, missions: ["ISS", "STS-134"], intensity: 78 },
  { entity: "Arabidopsis", citations: 28, missions: ["ISS", "STS-135"], intensity: 68 },
  { entity: "Microgravity", citations: 52, missions: ["ISS", "STS-135", "STS-134", "Expedition 45"], intensity: 100 },
  { entity: "Immune Response", citations: 38, missions: ["ISS", "STS-134"], intensity: 82 },
  { entity: "Cell Division", citations: 25, missions: ["ISS", "STS-135"], intensity: 58 }
];

export default function VisualizationEnhancements() {
  const [selectedView, setSelectedView] = useState<'heatmap' | 'network' | 'analytics'>('heatmap');
  const [colorBy, setColorBy] = useState<'mission' | 'experiment' | 'citations'>('mission');
  const [sizeBy, setSizeBy] = useState<'connections' | 'citations'>('connections');

  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case 'entity':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'mission':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'experiment':
        return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'organism':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 90) return 'bg-red-500/30 border-red-500/50';
    if (intensity >= 70) return 'bg-orange-500/30 border-orange-500/50';
    if (intensity >= 50) return 'bg-yellow-500/30 border-yellow-500/50';
    return 'bg-green-500/30 border-green-500/50';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-gradient">Visualization Enhancements</h2>
      </div>

      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)} className="w-full">
        <TabsList className="glass">
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-4">
          <Card className="glass border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Entity Citation Heatmap
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={colorBy} onValueChange={(value) => setColorBy(value as any)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mission">Mission</SelectItem>
                      <SelectItem value="experiment">Experiment</SelectItem>
                      <SelectItem value="citations">Citations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockHeatmapData.map((item, index) => (
                  <Card 
                    key={item.entity} 
                    className={`glass border-2 transition-all hover:scale-105 cursor-pointer ${getIntensityColor(item.intensity)}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{item.entity}</h4>
                        <Badge variant="outline" className="text-xs">
                          {item.citations} cites
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {item.missions.map(mission => (
                            <Badge key={mission} variant="outline" className="text-xs">
                              {mission}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted/20 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                              style={{ width: `${item.intensity}%` }}
                            />
                          </div>
                          <span className="text-xs text-foreground/60">{item.intensity}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card className="glass border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  Interactive Knowledge Graph
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={sizeBy} onValueChange={(value) => setSizeBy(value as any)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="connections">Connections</SelectItem>
                      <SelectItem value="citations">Citations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Graph Visualization Placeholder */}
              <div className="relative h-96 bg-muted/10 rounded-lg border-2 border-dashed border-border/40 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Network className="h-16 w-16 text-foreground/30 mx-auto" />
                  <div>
                    <h4 className="font-medium text-foreground/70">Interactive Graph View</h4>
                    <p className="text-sm text-foreground/50">Cytoscape.js integration would go here</p>
                  </div>
                </div>
              </div>

              {/* Node Legend */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {mockNodes.map((node) => (
                  <div 
                    key={node.id}
                    className="flex items-center gap-2 p-2 glass rounded-lg border border-border/40 cursor-pointer hover:border-primary/40 transition-colors"
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: node.color,
                        transform: `scale(${node.size / 100})`
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate">{node.label}</div>
                      <div className="text-xs text-foreground/60">
                        {sizeBy === 'connections' ? `${node.connections} conn` : `${node.citations} cites`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass border-border/60">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Connection Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {mockNodes.map((node) => (
                    <div key={node.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getEntityTypeColor(node.type)}>
                          {node.type}
                        </Badge>
                        <span className="text-sm">{node.label}</span>
                      </div>
                      <div className="text-sm text-foreground/70">
                        {node.connections} connections
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/60">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Mission Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ISS Missions</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted/20 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
                      </div>
                      <span className="text-xs text-foreground/60">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">STS Missions</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted/20 rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: '60%' }} />
                      </div>
                      <span className="text-xs text-foreground/60">60%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expedition Series</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted/20 rounded-full h-2">
                        <div className="bg-secondary h-2 rounded-full" style={{ width: '45%' }} />
                      </div>
                      <span className="text-xs text-foreground/60">45%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-border/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Research Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <span className="text-sm font-medium">Most Connected</span>
                  </div>
                  <div className="text-lg font-bold text-primary">Mitochondria</div>
                  <div className="text-xs text-foreground/60">45 connections</div>
                </div>
                
                <div className="glass rounded-lg p-4 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-accent rounded-full" />
                    <span className="text-sm font-medium">Most Cited</span>
                  </div>
                  <div className="text-lg font-bold text-accent">Microgravity</div>
                  <div className="text-xs text-foreground/60">52 citations</div>
                </div>
                
                <div className="glass rounded-lg p-4 border border-secondary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-secondary rounded-full" />
                    <span className="text-sm font-medium">Emerging Topic</span>
                  </div>
                  <div className="text-lg font-bold text-secondary">Immune Response</div>
                  <div className="text-xs text-foreground/60">+23% growth</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
