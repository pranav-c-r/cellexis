import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, StickyNote, Tag, Plus, Search, Trash2 } from "lucide-react";

interface BookmarkItem {
  id: string;
  type: 'paper' | 'snippet' | 'node';
  title: string;
  content: string;
  source: string;
  tags: string[];
  notes: string;
  createdAt: string;
}

const mockBookmarks: BookmarkItem[] = [
  {
    id: "bookmark-1",
    type: 'paper',
    title: "Cell growth in microgravity",
    content: "Effects of microgravity on plant stem cells show significant changes in growth patterns...",
    source: "NASA-001",
    tags: ['microgravity', 'cell-growth', 'plants'],
    notes: "Key finding: 15% reduction in cell division rate under microgravity conditions",
    createdAt: "2024-01-15"
  },
  {
    id: "bookmark-2",
    type: 'snippet',
    title: "Immune response data",
    content: "T-cell activation decreased by 15-20% in microgravity environments...",
    source: "NASA-214, p.5",
    tags: ['immune-response', 't-cells', 'microgravity'],
    notes: "Important for long-term space mission planning",
    createdAt: "2024-01-14"
  },
  {
    id: "bookmark-3",
    type: 'node',
    title: "Mitochondrial Dynamics",
    content: "Graph node representing mitochondrial behavior in space conditions",
    source: "Knowledge Graph",
    tags: ['mitochondria', 'energy', 'graph-node'],
    notes: "Connected to 12 other research papers",
    createdAt: "2024-01-13"
  }
];

export default function BookmarksNotes() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(mockBookmarks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkItem | null>(null);
  const [newNote, setNewNote] = useState("");

  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    bookmark.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addNote = (bookmarkId: string) => {
    if (!newNote.trim()) return;
    
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === bookmarkId 
        ? { ...bookmark, notes: bookmark.notes + "\n" + newNote }
        : bookmark
    ));
    setNewNote("");
  };

  const deleteBookmark = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
    if (selectedBookmark?.id === bookmarkId) {
      setSelectedBookmark(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'paper':
        return <Bookmark className="h-4 w-4 text-primary" />;
      case 'snippet':
        return <StickyNote className="h-4 w-4 text-accent" />;
      case 'node':
        return <Tag className="h-4 w-4 text-secondary" />;
      default:
        return <Bookmark className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'paper':
        return <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">Paper</Badge>;
      case 'snippet':
        return <Badge variant="default" className="bg-accent/20 text-accent border-accent/30">Snippet</Badge>;
      case 'node':
        return <Badge variant="default" className="bg-secondary/20 text-secondary border-secondary/30">Node</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Bookmark className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-gradient">Bookmarks & Notes</h2>
      </div>

      <Tabs defaultValue="bookmarks" className="w-full">
        <TabsList className="glass">
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarks" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
            <Input
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Bookmarks Grid */}
          <div className="grid gap-4">
            {filteredBookmarks.map((bookmark) => (
              <Card 
                key={bookmark.id} 
                className="glass border-border/60 cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => setSelectedBookmark(bookmark)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(bookmark.type)}
                      <CardTitle className="text-sm font-medium text-foreground/90">
                        {bookmark.title}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBookmark(bookmark.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-foreground/70 mb-2 line-clamp-2">
                    {bookmark.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground/60">{bookmark.source}</span>
                    <div className="flex gap-1">
                      {bookmark.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {bookmark.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{bookmark.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          {selectedBookmark && (
            <Card className="glass border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(selectedBookmark.type)}
                  <CardTitle className="text-gradient">{selectedBookmark.title}</CardTitle>
                  {getTypeBadge(selectedBookmark.type)}
                </div>
                <p className="text-sm text-foreground/60">Source: {selectedBookmark.source}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Content</h4>
                  <p className="text-sm text-foreground/80 bg-muted/20 p-3 rounded-lg">
                    {selectedBookmark.content}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedBookmark.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Notes</h4>
                  {selectedBookmark.notes ? (
                    <div className="bg-muted/20 p-3 rounded-lg">
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                        {selectedBookmark.notes}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/60 italic">No notes yet</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1"
                    rows={2}
                  />
                  <Button
                    onClick={() => addNote(selectedBookmark.id)}
                    disabled={!newNote.trim()}
                    className="bg-gradient-to-r from-primary via-accent to-secondary text-black"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
