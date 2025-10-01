import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share2, Copy, FileText, FileJson, FileSpreadsheet, Link, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportData {
  id: string;
  type: 'qa' | 'graph' | 'papers';
  title: string;
  content: string;
  format: 'pdf' | 'json' | 'csv';
  createdAt: string;
}

const mockExportData: ExportData[] = [
  {
    id: "export-1",
    type: 'qa',
    title: "Microgravity Immune Response Analysis",
    content: "Q: How does microgravity affect immune response?\nA: Studies show 15-20% reduction in T-cell activation...",
    format: 'pdf',
    createdAt: "2024-01-15"
  },
  {
    id: "export-2",
    type: 'graph',
    title: "Space Biology Knowledge Graph Subset",
    content: '{"nodes": [{"id": "mitochondria", "type": "biological_process"}], "edges": [...]}',
    format: 'json',
    createdAt: "2024-01-14"
  },
  {
    id: "export-3",
    type: 'papers',
    title: "NASA Papers Dataset",
    content: "Paper ID,Title,Year,Key Findings\nNASA-001,Cell growth in microgravity,2021,15% reduction...",
    format: 'csv',
    createdAt: "2024-01-13"
  }
];

export default function ExportShare() {
  const [exportData, setExportData] = useState<ExportData[]>(mockExportData);
  const [shareUrl, setShareUrl] = useState("");
  const { toast } = useToast();

  const handleExport = (format: 'pdf' | 'json' | 'csv') => {
    // Simulate export functionality
    toast({
      title: "Export Started",
      description: `Your data is being exported as ${format.toUpperCase()}. Download will begin shortly.`,
    });
  };

  const handleShare = () => {
    if (!shareUrl) {
      // Generate a shareable link
      const newUrl = `https://cellexis.app/share/${Math.random().toString(36).substr(2, 9)}`;
      setShareUrl(newUrl);
      
      toast({
        title: "Share Link Generated",
        description: "Your query results are now shareable via the generated link.",
      });
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Share link has been copied to your clipboard.",
      });
    }
  };

  const copyCitation = (data: ExportData) => {
    const citation = `Cellexis Research Platform. (2024). ${data.title}. Retrieved from NASA Bioscience Database.`;
    navigator.clipboard.writeText(citation);
    toast({
      title: "Citation Copied",
      description: "Citation-ready text copied to clipboard.",
    });
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'json':
        return <FileJson className="h-4 w-4 text-yellow-500" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFormatBadge = (format: string) => {
    switch (format) {
      case 'pdf':
        return <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30">PDF</Badge>;
      case 'json':
        return <Badge variant="default" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">JSON</Badge>;
      case 'csv':
        return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">CSV</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-gradient">Export & Share</h2>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="glass">
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="citations">Citations</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          {/* Export Options */}
          <Card className="glass border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Export Current Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-2 h-auto p-4 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-400 hover:from-red-500/30 hover:to-red-600/30"
                >
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Export as PDF</div>
                    <div className="text-xs opacity-70">Formatted document</div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleExport('json')}
                  className="flex items-center gap-2 h-auto p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-yellow-400 hover:from-yellow-500/30 hover:to-yellow-600/30"
                >
                  <FileJson className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Export as JSON</div>
                    <div className="text-xs opacity-70">Structured data</div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-2 h-auto p-4 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 text-green-400 hover:from-green-500/30 hover:to-green-600/30"
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Export as CSV</div>
                    <div className="text-xs opacity-70">Spreadsheet format</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export History */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Recent Exports</h3>
            <div className="space-y-2">
              {exportData.map((data) => (
                <Card key={data.id} className="glass border-border/40">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFormatIcon(data.format)}
                        <div>
                          <div className="font-medium text-sm">{data.title}</div>
                          <div className="text-xs text-foreground/60">{data.createdAt}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getFormatBadge(data.format)}
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="share" className="space-y-4">
          <Card className="glass border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Share Query Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Shareable Link</label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    placeholder="Click 'Generate Link' to create a shareable URL"
                    readOnly
                    className="bg-muted/20"
                  />
                  <Button
                    onClick={handleShare}
                    className="bg-gradient-to-r from-primary via-accent to-secondary text-black"
                  >
                    {shareUrl ? <Copy className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    {shareUrl ? 'Copy' : 'Generate Link'}
                  </Button>
                </div>
              </div>

              {shareUrl && (
                <div className="glass rounded-lg p-4 border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">QR Code</span>
                  </div>
                  <p className="text-xs text-foreground/70">
                    Scan this QR code to access the shared results on mobile devices.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="citations" className="space-y-4">
          <Card className="glass border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Citation-Ready Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {exportData.map((data) => (
                  <div key={data.id} className="glass rounded-lg p-3 border border-border/40">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm">{data.title}</div>
                        <div className="text-xs text-foreground/60">{data.createdAt}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCitation(data)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="bg-muted/20 p-2 rounded text-xs text-foreground/80 font-mono">
                      Cellexis Research Platform. (2024). {data.title}. Retrieved from NASA Bioscience Database.
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
