import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle, ChevronLeft, ChevronRight, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Topic {
  id: number;
  name: string;
  description: string;
  subjectId: number;
  order: number;
  content: string;
  difficulty?: string; // Make difficulty optional since we might not have it in all topics
}

export default function Learning() {
  const [_, setLocation] = useLocation();
  const [, params] = useRoute("/learning/:subjectId");
  const { toast } = useToast();
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("content");
  const [isCompleted, setIsCompleted] = useState(false);
  
  const subjectId = params?.subjectId ? parseInt(params.subjectId) : null;
  
  // Get subject data
  const { data: subjectData } = useQuery({
    queryKey: [`/api/subjects/${subjectId}`],
    enabled: !!subjectId,
  });
  
  // Type-safe subject access
  const subject = (subjectData as any) || {};
  
  // Get topics for the selected subject
  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    queryKey: [`/api/subjects/${subjectId}/topics`],
    enabled: !!subjectId,
  });
  
  // Get user progress for the subject
  const { data: progressData = [], refetch: refetchProgress } = useQuery({
    queryKey: ['/api/users/1/progress'],
  });

  const progress = Array.isArray(progressData) 
    ? progressData.find((p: any) => p.subjectId === subjectId) 
    : undefined;
  
  const currentTopic: Topic | undefined = Array.isArray(topics) && topics.length > 0
    ? topics[currentTopicIndex]
    : undefined;
  
  // Set current topic index based on user progress
  useEffect(() => {
    if (progress?.topicsCompleted) {
      const completed = progress.topicsCompleted;
      if (completed > 0 && Array.isArray(topics) && completed <= topics.length) {
        setCurrentTopicIndex(completed - 1);
      }
    }
  }, [progress, topics]);
  
  const handlePreviousTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(prev => prev - 1);
      setIsCompleted(false);
      setActiveTab("content");
    }
  };
  
  const handleNextTopic = () => {
    if (Array.isArray(topics) && currentTopicIndex < topics.length - 1) {
      setCurrentTopicIndex(prev => prev + 1);
      setIsCompleted(false);
      setActiveTab("content");
    }
  };
  
  const handleTopicCompletion = async () => {
    try {
      if (!isCompleted && currentTopic && subjectId) {
        // Calculate the topics completed
        const topicsLength = Array.isArray(topics) ? topics.length : 1;
        const newTopicsCompleted = currentTopicIndex + 1;
        const newPercentComplete = Math.round((newTopicsCompleted / topicsLength) * 100);
        
        // Update user progress for the subject
        const progressData = {
          subjectId: subjectId,
          topicsCompleted: newTopicsCompleted,
          percentComplete: newPercentComplete
        };
        
        await apiRequest("POST", "/api/users/1/progress", progressData);
        
        // Update streak - record study time
        await apiRequest("POST", "/api/users/1/study-streaks", {
          minutesStudied: 20 // Assume average of 20 minutes per topic
        });
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/users/1/progress'] });
        queryClient.invalidateQueries({ queryKey: ['/api/users/1/study-streaks'] });
        
        // Mark as completed and show success toast
        setIsCompleted(true);
        toast({
          title: "Topic Completed!",
          description: "Your progress has been saved. Keep up the good work!",
        });
        
        // Refetch progress
        refetchProgress();
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update your progress. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (!subjectId) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Select a Subject to Start Learning</h1>
        <div className="grid grid-cols-1 gap-4">
          <Button onClick={() => setLocation("/subjects")}>
            Go to Subjects
          </Button>
        </div>
      </div>
    );
  }
  
  if (topicsLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Loading topics...</h1>
      </div>
    );
  }
  
  if (!Array.isArray(topics) || topics.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">No topics available for this subject yet</h1>
        <Button onClick={() => setLocation("/subjects")}>Back to Subjects</Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      {/* Subject header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {typeof subject === 'object' && subject !== null && 'name' in subject 
              ? String(subject.name) 
              : 'Subject'}
          </h1>
          <p className="text-muted-foreground">
            {typeof subject === 'object' && subject !== null && 'description' in subject 
              ? String(subject.description) 
              : ''}
          </p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/subjects")}>
          Back to Subjects
        </Button>
      </div>
      
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span>Progress</span>
          <span>{progress?.percentComplete || 0}%</span>
        </div>
        <Progress value={progress?.percentComplete || 0} className="h-2" />
      </div>
      
      {/* Topic navigation header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">
          Topic {currentTopicIndex + 1} of {Array.isArray(topics) ? topics.length : 0}
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={handlePreviousTopic}
            disabled={currentTopicIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={handleNextTopic}
            disabled={!Array.isArray(topics) || currentTopicIndex >= topics.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Topic content */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{currentTopic?.name}</CardTitle>
            <Badge variant={
              currentTopic?.difficulty === "easy" ? "secondary" :
              currentTopic?.difficulty === "medium" ? "default" : "destructive"
            }>
              {currentTopic?.difficulty}
            </Badge>
          </div>
          <CardDescription>{currentTopic?.description}</CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">
                <BookOpen className="h-4 w-4 mr-2" />
                Learn
              </TabsTrigger>
              <TabsTrigger value="outline">
                <List className="h-4 w-4 mr-2" />
                Outline
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="content" className="p-6 min-h-[400px]">
            <div dangerouslySetInnerHTML={{ __html: currentTopic?.content || "" }} />
          </TabsContent>
          
          <TabsContent value="outline" className="p-6 min-h-[400px]">
            <h3 className="text-xl font-semibold mb-4">Topic Outline</h3>
            <ul className="space-y-2">
              {currentTopic?.content?.split('\n\n').map((paragraph, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center bg-primary/20 text-primary text-xs">
                    {index + 1}
                  </div>
                  <p className="text-muted-foreground">
                    {paragraph.substring(0, 100).replace(/<[^>]*>/g, '')}...
                  </p>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={() => setLocation("/subjects")}>
            Exit
          </Button>
          <Button 
            onClick={handleTopicCompletion}
            disabled={isCompleted}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Completed
              </>
            ) : (
              "Mark as Completed"
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Topic navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousTopic}
          disabled={currentTopicIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous Topic
        </Button>
        <Button
          onClick={handleNextTopic}
          disabled={!Array.isArray(topics) || currentTopicIndex >= topics.length - 1}
        >
          Next Topic
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}