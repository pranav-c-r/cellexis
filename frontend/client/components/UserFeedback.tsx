import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThumbsUp, ThumbsDown, Star, MessageSquare, TrendingUp, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackItem {
  id: string;
  query: string;
  answer: string;
  rating: 'positive' | 'negative' | null;
  detailedRating: number;
  comment: string;
  timestamp: string;
  source: string;
}

const mockFeedback: FeedbackItem[] = [
  {
    id: "feedback-1",
    query: "How does microgravity affect immune response?",
    answer: "Microgravity reduces T-cell activation by 15-20% based on multiple NASA studies...",
    rating: 'positive',
    detailedRating: 4,
    comment: "Very helpful and well-cited answer",
    timestamp: "2024-01-15",
    source: "NASA-001, NASA-214"
  },
  {
    id: "feedback-2",
    query: "What is the optimal mission duration?",
    answer: "Studies suggest 6-12 month missions are optimal for crew health...",
    rating: 'negative',
    detailedRating: 2,
    comment: "Answer seems incomplete, missing recent studies",
    timestamp: "2024-01-14",
    source: "NASA-387"
  }
];

export default function UserFeedback() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>(mockFeedback);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const { toast } = useToast();

  const handleRating = (feedbackId: string, rating: 'positive' | 'negative') => {
    setFeedback(prev => prev.map(item => 
      item.id === feedbackId 
        ? { ...item, rating }
        : item
    ));
    
    toast({
      title: "Feedback Recorded",
      description: `Your ${rating} rating has been saved and will help improve our AI responses.`,
    });
  };

  const handleDetailedRating = (feedbackId: string, rating: number) => {
    setFeedback(prev => prev.map(item => 
      item.id === feedbackId 
        ? { ...item, detailedRating: rating }
        : item
    ));
  };

  const getRatingIcon = (rating: string | null) => {
    switch (rating) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-foreground/50" />;
    }
  };

  const getRatingBadge = (rating: string | null) => {
    switch (rating) {
      case 'positive':
        return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">Helpful</Badge>;
      case 'negative':
        return <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30">Not Helpful</Badge>;
      default:
        return <Badge variant="outline">No Rating</Badge>;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-400";
    if (rating >= 3) return "text-yellow-400";
    return "text-red-400";
  };

  const averageRating = feedback.reduce((acc, item) => acc + item.detailedRating, 0) / feedback.length;
  const positiveCount = feedback.filter(item => item.rating === 'positive').length;
  const totalRatings = feedback.filter(item => item.rating !== null).length;
  const satisfactionRate = totalRatings > 0 ? (positiveCount / totalRatings) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-gradient">AI Feedback & Learning</h2>
      </div>

      {/* Feedback Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Average Rating</span>
            </div>
            <div className={`text-2xl font-bold ${getRatingColor(averageRating)}`}>
              {averageRating.toFixed(1)}/5
            </div>
            <div className="text-xs text-foreground/60">
              Based on {feedback.length} responses
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Satisfaction Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {satisfactionRate.toFixed(0)}%
            </div>
            <Progress value={satisfactionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="glass border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Feedback</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {feedback.length}
            </div>
            <div className="text-xs text-foreground/60">
              Queries rated
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Recent QA Interactions</h3>
        {feedback.map((item) => (
          <Card 
            key={item.id} 
            className="glass border-border/60 cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => setSelectedFeedback(item)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{item.query}</h4>
                  <p className="text-xs text-foreground/70 line-clamp-2">{item.answer}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {getRatingIcon(item.rating)}
                  {getRatingBadge(item.rating)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-foreground/60">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= item.detailedRating 
                              ? getRatingColor(item.detailedRating) 
                              : 'text-foreground/30'
                          }`}
                          fill={star <= item.detailedRating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-foreground/60">Source: {item.source}</span>
                </div>
                <span className="text-xs text-foreground/60">{item.timestamp}</span>
              </div>

              {/* Rating Buttons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
                <Button
                  variant={item.rating === 'positive' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRating(item.id, 'positive');
                  }}
                  className={`${
                    item.rating === 'positive' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'text-foreground/70 hover:text-green-400'
                  }`}
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Helpful
                </Button>
                <Button
                  variant={item.rating === 'negative' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRating(item.id, 'negative');
                  }}
                  className={`${
                    item.rating === 'negative' 
                      ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                      : 'text-foreground/70 hover:text-red-400'
                  }`}
                >
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  Not Helpful
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Feedback Modal */}
      {selectedFeedback && (
        <Card className="glass border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gradient">Detailed Feedback</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedFeedback(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Query</h4>
              <p className="text-sm text-foreground/80 bg-muted/20 p-3 rounded-lg">
                {selectedFeedback.query}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">AI Response</h4>
              <p className="text-sm text-foreground/80 bg-muted/20 p-3 rounded-lg">
                {selectedFeedback.answer}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Your Rating</h4>
              <div className="flex items-center gap-2 mb-2">
                {getRatingIcon(selectedFeedback.rating)}
                {getRatingBadge(selectedFeedback.rating)}
                <span className={`text-sm ${getRatingColor(selectedFeedback.detailedRating)}`}>
                  {selectedFeedback.detailedRating}/5 stars
                </span>
              </div>
            </div>

            {selectedFeedback.comment && (
              <div>
                <h4 className="font-medium text-sm mb-2">Your Comment</h4>
                <p className="text-sm text-foreground/80 bg-muted/20 p-3 rounded-lg">
                  {selectedFeedback.comment}
                </p>
              </div>
            )}

            <div className="glass rounded-lg p-4 border border-primary/20 bg-primary/5">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                AI Learning Impact
              </h4>
              <p className="text-sm text-foreground/80">
                Your feedback helps improve response quality and accuracy. This interaction contributes to 
                better snippet selection and answer relevance for future queries.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
