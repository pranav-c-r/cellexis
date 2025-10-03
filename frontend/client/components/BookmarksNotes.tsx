import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bookmark, StickyNote, Tag, Plus, Search, Trash2, Edit3, Save, X } from "lucide-react";

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

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
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

const mockNotes: Note[] = [
  {
    id: "note-1",
    title: "Research Ideas",
    content: "Need to investigate the correlation between microgravity exposure duration and cellular adaptation mechanisms. Consider examining:\n- Time-dependent changes in gene expression\n- Comparative analysis across different cell types\n- Recovery patterns post-flight",
    tags: ['research', 'microgravity', 'ideas'],
    createdAt: "2024-01-16",
    updatedAt: "2024-01-16"
  },
  {
    id: "note-2",
    title: "Meeting Notes - Jan 15",
    content: "Discussion with Dr. Smith about upcoming experiments:\n- Need to prepare samples for next ISS mission\n- Review protocols for cell culture in microgravity\n- Budget approval pending for additional equipment",
    tags: ['meeting', 'planning', 'experiments'],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  }
];

// Storage keys
const BOOKMARKS_STORAGE_KEY = 'cellexis-bookmarks';
const NOTES_STORAGE_KEY = 'cellexis-notes';

// Helper functions for localStorage
const loadBookmarks = (): BookmarkItem[] => {
  try {
    const item = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return item ? JSON.parse(item) : mockBookmarks;
  } catch (error) {
    console.error('Error loading bookmarks from localStorage:', error);
    return mockBookmarks;
  }
};

const loadNotes = (): Note[] => {
  try {
    const item = localStorage.getItem(NOTES_STORAGE_KEY);
    return item ? JSON.parse(item) : mockNotes;
  } catch (error) {
    console.error('Error loading notes from localStorage:', error);
    return mockNotes;
  }
};

const saveBookmarks = (bookmarks: BookmarkItem[]): void => {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Error saving bookmarks to localStorage:', error);
  }
};

const saveNotes = (notes: Note[]): void => {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes to localStorage:', error);
  }
};

export default function BookmarksNotes() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkItem | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [isNewBookmarkDialogOpen, setIsNewBookmarkDialogOpen] = useState(false);
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);
  const [newBookmarkForm, setNewBookmarkForm] = useState<{
    title: string;
    content: string;
    source: string;
    tags: string;
    type: 'paper' | 'snippet' | 'node';
  }>({
    title: "",
    content: "",
    source: "",
    tags: "",
    type: "paper"
  });
  const [newNoteForm, setNewNoteForm] = useState({
    title: "",
    content: "",
    tags: ""
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = loadBookmarks();
    const savedNotes = loadNotes();
    setBookmarks(savedBookmarks);
    setNotes(savedNotes);
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (bookmarks.length > 0) {
      saveBookmarks(bookmarks);
    }
  }, [bookmarks]);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      saveNotes(notes);
    }
  }, [notes]);

  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    bookmark.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const createBookmark = () => {
    if (!newBookmarkForm.title.trim() || !newBookmarkForm.content.trim()) return;
    
    const bookmark: BookmarkItem = {
      id: `bookmark-${Date.now()}`,
      title: newBookmarkForm.title,
      content: newBookmarkForm.content,
      source: newBookmarkForm.source || "User Created",
      tags: newBookmarkForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      type: newBookmarkForm.type,
      notes: "",
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setBookmarks(prev => [bookmark, ...prev]);
    setNewBookmarkForm({ title: "", content: "", source: "", tags: "", type: "paper" });
    setIsNewBookmarkDialogOpen(false);
  };

  const createNote = () => {
    if (!newNoteForm.title.trim() || !newNoteForm.content.trim()) return;
    
    const note: Note = {
      id: `note-${Date.now()}`,
      title: newNoteForm.title,
      content: newNoteForm.content,
      tags: newNoteForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setNotes(prev => [note, ...prev]);
    setNewNoteForm({ title: "", content: "", tags: "" });
    setIsNewNoteDialogOpen(false);
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : note
    ));
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
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
          {/* Search and Add Bookmark */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <Input
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog open={isNewBookmarkDialogOpen} onOpenChange={setIsNewBookmarkDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary via-accent to-secondary text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bookmark
                </Button>
              </DialogTrigger>
              <DialogContent className="glass max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Bookmark</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Title"
                    value={newBookmarkForm.title}
                    onChange={(e) => setNewBookmarkForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Content"
                    value={newBookmarkForm.content}
                    onChange={(e) => setNewBookmarkForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={3}
                  />
                  <Input
                    placeholder="Source (optional)"
                    value={newBookmarkForm.source}
                    onChange={(e) => setNewBookmarkForm(prev => ({ ...prev, source: e.target.value }))}
                  />
                  <Input
                    placeholder="Tags (comma-separated)"
                    value={newBookmarkForm.tags}
                    onChange={(e) => setNewBookmarkForm(prev => ({ ...prev, tags: e.target.value }))}
                  />
                  <select
                    value={newBookmarkForm.type}
                    onChange={(e) => setNewBookmarkForm(prev => ({ ...prev, type: e.target.value as 'paper' | 'snippet' | 'node' }))}
                    className="w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="paper">Paper</option>
                    <option value="snippet">Snippet</option>
                    <option value="node">Node</option>
                  </select>
                  <div className="flex gap-2">
                    <Button onClick={createBookmark} className="flex-1">Create</Button>
                    <Button variant="outline" onClick={() => setIsNewBookmarkDialogOpen(false)}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

          {/* Bookmark Details */}
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

        <TabsContent value="notes" className="space-y-4">
          {/* Search and Add Note */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary via-accent to-secondary text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="glass max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Note title"
                    value={newNoteForm.title}
                    onChange={(e) => setNewNoteForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Write your note here..."
                    value={newNoteForm.content}
                    onChange={(e) => setNewNoteForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={5}
                  />
                  <Input
                    placeholder="Tags (comma-separated)"
                    value={newNoteForm.tags}
                    onChange={(e) => setNewNoteForm(prev => ({ ...prev, tags: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button onClick={createNote} className="flex-1">Create Note</Button>
                    <Button variant="outline" onClick={() => setIsNewNoteDialogOpen(false)}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Notes Grid */}
          <div className="grid gap-4">
            {filteredNotes.map((note) => (
              <Card 
                key={note.id} 
                className="glass border-border/60 cursor-pointer hover:border-accent/40 transition-colors"
                onClick={() => setSelectedNote(note)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <StickyNote className="h-4 w-4 text-accent" />
                      <CardTitle className="text-sm font-medium text-foreground/90">
                        {note.title}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNote(note.id);
                        }}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-foreground/70 mb-2 line-clamp-3">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground/60">
                      {note.createdAt === note.updatedAt ? `Created: ${note.createdAt}` : `Updated: ${note.updatedAt}`}
                    </span>
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Note Details */}
          {selectedNote && (
            <Card className="glass border-accent/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-accent" />
                    <CardTitle className="text-gradient">{selectedNote.title}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingNote(selectedNote.id)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-foreground/60">
                  {selectedNote.createdAt === selectedNote.updatedAt 
                    ? `Created: ${selectedNote.createdAt}` 
                    : `Updated: ${selectedNote.updatedAt}`}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Content</h4>
                  {editingNote === selectedNote.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={selectedNote.content}
                        onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                        rows={6}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingNote(null)}
                          className="bg-gradient-to-r from-primary via-accent to-secondary text-black"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingNote(null)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/20 p-3 rounded-lg">
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                        {selectedNote.content}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedNote.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
