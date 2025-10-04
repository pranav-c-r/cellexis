import { useState, useEffect, useRef } from "react";
import {useAuth} from "@/contexts/AuthContext"
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
import { ChevronLeft, ChevronRight, Search, User, LogOut, Mic, MicOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PaperComparison from "@/components/PaperComparison";
import BookmarksNotes from "@/components/BookmarksNotes";
import ExportShare from "@/components/ExportShare";
import UserFeedback from "@/components/UserFeedback";
import VisualizationEnhancements from "@/components/VisualizationEnhancements";

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

// Voice command mappings
const VOICE_COMMANDS = {
  navigation: {
    "search": "search",
    "qa": "qa",
    "question answer": "qa",
    "ask": "qa",
    "compare": "comparison",
    "comparison": "comparison",
    "bookmarks": "bookmarks",
    "bookmark": "bookmarks",
    "export": "export",
    "feedback": "feedback",
    "visualize": "visualization",
    "visualization": "visualization",
    "visual": "visualization"
  },
  actions: {
    "logout": "logout",
    "log out": "logout",
    "sign out": "logout",
    "profile": "profile",
    "open left": "openLeft",
    "close left": "closeLeft",
    "open right": "openRight",
    "close right": "closeRight",
    "toggle left": "toggleLeft",
    "toggle right": "toggleRight"
  }
};

export default function Dashboard() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("comparison");
  const [selected, setSelected] = useState<Paper | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const {user,signOut} = useAuth();
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout>();

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.warn('Speech Recognition API not supported in this browser');
        return null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      return recognition;
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      return null;
    }
  };

  // Process voice commands
  const processVoiceCommand = (command: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const cleanCommand = command.toLowerCase().trim();
    
    console.log('Processing command:', cleanCommand);

    // Check for navigation commands
    for (const [key, tab] of Object.entries(VOICE_COMMANDS.navigation)) {
      if (cleanCommand.includes(key)) {
        console.log('Navigating to:', tab);
        setActiveTab(tab);
        speak(`Navigating to ${key}`);
        resetProcessing();
        return;
      }
    }

    // Check for action commands
    for (const [key, action] of Object.entries(VOICE_COMMANDS.actions)) {
      if (cleanCommand.includes(key)) {
        console.log('Executing action:', action);
        executeAction(action);
        resetProcessing();
        return;
      }
    }

    // Special case for wake word
    if (cleanCommand.includes("hey cellexis") && !isVoiceActive) {
      console.log('Wake word detected');
      activateVoiceAssistant();
      resetProcessing();
      return;
    }

    // Deactivation commands
    if ((cleanCommand.includes("stop") || cleanCommand.includes("sleep") || cleanCommand.includes("deactivate")) && isVoiceActive) {
      deactivateVoiceAssistant();
      resetProcessing();
      return;
    }

    // If no command matched but we're active, provide feedback
    if (isVoiceActive && cleanCommand.length > 3) {
      speak("Command not recognized. Try saying 'go to search' or 'logout'");
    }

    resetProcessing();
  };

  const executeAction = (action: string) => {
    switch (action) {
      case "logout":
        speak("Logging out");
        setTimeout(() => navigate("/"), 1000);
        break;
      case "profile":
        speak("Profile feature coming soon");
        break;
      case "openLeft":
      case "toggleLeft":
        setLeftOpen(true);
        speak("Left panel opened");
        break;
      case "closeLeft":
        setLeftOpen(false);
        speak("Left panel closed");
        break;
      case "openRight":
      case "toggleRight":
        setRightOpen(true);
        speak("Right panel opened");
        break;
      case "closeRight":
        setRightOpen(false);
        speak("Right panel closed");
        break;
      default:
        speak("Action not available");
    }
  };

  const resetProcessing = () => {
    setTimeout(() => {
      setIsProcessing(false);
      setTranscript("");
    }, 1000);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        console.log('Finished speaking:', text);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const activateVoiceAssistant = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initializeSpeechRecognition();
      
      if (!recognitionRef.current) {
        alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
        return;
      }

      // Set up event handlers
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          const cleanTranscript = finalTranscript.toLowerCase().trim();
          setTranscript(cleanTranscript);
          processVoiceCommand(cleanTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access to use voice commands.');
          deactivateVoiceAssistant();
        } else if (event.error === 'network') {
          console.log('Network error in speech recognition');
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        if (isListening) {
          // Restart recognition if we're still supposed to be listening
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.log('Error restarting recognition:', error);
              }
            }
          }, 100);
        }
      };
    }

    setIsVoiceActive(true);
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
      speak("Voice assistant activated. How can I help you?");
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      // If start fails, try reinitializing
      setTimeout(() => {
        recognitionRef.current = null;
        activateVoiceAssistant();
      }, 1000);
    }
  };

  const deactivateVoiceAssistant = () => {
    setIsListening(false);
    setIsVoiceActive(false);
    setTranscript("");
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    speak("Voice assistant deactivated");
  };

  const toggleVoiceAssistant = () => {
    if (isVoiceActive) {
      deactivateVoiceAssistant();
    } else {
      activateVoiceAssistant();
    }
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.code === 'Space') {
        event.preventDefault();
        event.stopPropagation();
        
        if (isVoiceActive) {
          deactivateVoiceAssistant();
        } else {
          activateVoiceAssistant();
        }
      }
      
      if (event.code === 'Escape' && isVoiceActive) {
        event.preventDefault();
        deactivateVoiceAssistant();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVoiceActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error cleaning up recognition:', error);
        }
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="bg-space min-h-screen">
      {/* Navigation Bar */}
      <div className="border-b border-border/40 bg-background/60 backdrop-blur">
        <div className="container mx-auto px-4 flex items-center justify-between py-2 gap-2 md:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F2c7b56b85f304d7c977ff7daf41b0b6b%2F26e7d7bed7e64e34a762ec067e93d1e7?format=webp&width=200"
              alt="Cellexis"
              className="h-8 md:h-12 w-auto object-contain"
            />
            <span className="sr-only">Cellexis</span>
          </Link>

          {/* Navigation Options */}
          <div className="flex items-center gap-1 md:gap-2 flex-1 justify-center">
            <Button
              variant={activeTab === "search" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("search")}
              className="text-xs md:text-sm"
            >
              Search
            </Button>
            <Button
              variant={activeTab === "qa" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("qa")}
              className="text-xs md:text-sm"
            >
              QA
            </Button>
            <Button
              variant={activeTab === "comparison" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("comparison")}
              className="text-xs md:text-sm"
            >
              Compare
            </Button>
            <Button
              variant={activeTab === "bookmarks" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("bookmarks")}
              className="text-xs md:text-sm"
            >
              Bookmarks
            </Button>
            <Button
              variant={activeTab === "export" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("export")}
              className="text-xs md:text-sm"
            >
              Export
            </Button>
            <Button
              variant={activeTab === "feedback" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("feedback")}
              className="text-xs md:text-sm"
            >
              Feedback
            </Button>
            <Button
              variant={activeTab === "visualization" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("visualization")}
              className="text-xs md:text-sm"
            >
              Visualize
            </Button>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              className="text-foreground/70 hover:text-foreground whitespace-nowrap p-1 md:p-2"
            >
              <User className="h-3 w-3 md:mr-2 md:h-4 md:w-4" />
              <span className="hidden md:inline">Profile</span>
            </Button>
            <Button
              variant="ghost"
              className="text-foreground/70 hover:text-foreground whitespace-nowrap p-1 md:p-2"
              onClick={signOut}
            >
              <LogOut className="h-3 w-3 md:mr-2 md:h-4 md:w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Feature Content */}
        {activeTab === "search" && (
          <div className="grid grid-cols-12 gap-4 md:gap-6">
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
                <h3 className="font-semibold mb-2">Search Papers</h3>
                <div className="flex gap-2">
                  <Input placeholder="Search across NASA bioscience publications..." />
                  <Button className="bg-gradient-to-r from-primary via-accent to-secondary text-black">
                    Search
                  </Button>
                </div>
              </div>
              <div className="glass rounded-xl p-4">
                <h3 className="font-semibold">Search Results</h3>
                <p className="mt-2 text-sm text-foreground/80">
                  Use the filters to find relevant papers from the NASA database.
                </p>
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
        )}

        {activeTab === "qa" && (
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <main className="col-span-12 grid gap-4">
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
          </div>
        )}

        {activeTab === "comparison" && <PaperComparison />}
        {activeTab === "bookmarks" && <BookmarksNotes />}
        {activeTab === "export" && <ExportShare />}
        {activeTab === "feedback" && <UserFeedback />}
        {activeTab === "visualization" && <VisualizationEnhancements />}
      </div>

      {/* Voice Assistant Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Voice Status Indicator */}
          {isVoiceActive && (
            <div className="absolute -top-2 -right-2">
              <div className="relative">
                <div className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-green-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></div>
              </div>
            </div>
          )}
          
          {/* Voice Assistant Button */}
          <Button
            onClick={toggleVoiceAssistant}
            className={`rounded-full w-14 h-14 shadow-lg transition-all duration-300 ${
              isVoiceActive 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white ring-2 ring-green-300' 
                : 'bg-gradient-to-r from-primary via-accent to-secondary text-black hover:scale-105'
            }`}
            size="icon"
          >
            {isVoiceActive ? (
              <Mic className="h-6 w-6 animate-pulse" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Voice Command Feedback */}
        {isVoiceActive && (
          <div className="absolute bottom-16 right-0 mb-2 w-80 glass rounded-lg p-4 shadow-xl border border-green-200/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm text-green-600">Voice Assistant Active</h4>
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span className="text-xs text-green-600">Listening</span>
              </div>
            </div>
            
            {transcript && (
              <div className="mt-2 p-2 bg-background/50 rounded text-sm border border-green-200/30">
                <div className="text-xs text-foreground/60 mb-1">Heard:</div>
                <div className="font-medium text-green-700">{transcript}</div>
              </div>
            )}
            
            <div className="mt-3 text-xs text-foreground/70">
              <div className="font-medium mb-1">Try saying:</div>
              <ul className="space-y-1">
                <li>"Go to search" / "Open bookmarks"</li>
                <li>"Toggle left panel" / "Close right panel"</li>
                <li>"Logout" / "Profile"</li>
                <li>"Stop listening" to deactivate</li>
              </ul>
            </div>
            
            <div className="mt-3 text-xs text-foreground/50 flex gap-4">
              <span>Press Ctrl+Space to toggle</span>
              <span>Press ESC to deactivate</span>
            </div>
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