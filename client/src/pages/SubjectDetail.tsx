import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Edit3, 
  FileText, 
  ArrowRight, 
  Play, 
  PenTool, 
  Trophy 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface Topic {
  id: number;
  subjectId: number;
  title: string;
  description: string;
  content: string;
  order: number;
  estimatedMinutes: number;
}

export default function SubjectDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const subjectId = parseInt(id || "1");

  const { data: subject, isLoading: isLoadingSubject } = getQueryFn<any>({
    on401: "throw",
    queryKey: ['/api/subjects', subjectId],
    url: `/api/subjects/${subjectId}`,
  })();

  const { data: topics, isLoading: isLoadingTopics } = getQueryFn<Topic[]>({
    on401: "throw",
    queryKey: ['/api/subjects', subjectId, 'topics'],
    url: `/api/subjects/${subjectId}/topics`,
  })();

  const { data: progress, isLoading: isLoadingProgress } = getQueryFn<any>({
    on401: "throw",
    queryKey: ['/api/users/1/progress'],
    url: `/api/users/1/progress`,
  })();

  const subjectProgress = progress?.find((p: any) => p.subjectId === subjectId);

  // Function to update progress when a topic is marked as completed
  const markTopicAsCompleted = async (topicId: number) => {
    try {
      const currentProgress = progress?.find((p: any) => p.subjectId === subjectId) || {
        userId: 1,
        subjectId,
        topicsCompleted: 0,
        percentComplete: 0,
      };
      
      const updatedTopicsCompleted = (currentProgress.topicsCompleted || 0) + 1;
      const totalTopics = subject?.totalTopics || topics?.length || 1;
      const percentComplete = Math.round((updatedTopicsCompleted / totalTopics) * 100);
      
      await apiRequest("POST", "/api/users/1/progress", {
        userId: 1,
        subjectId,
        topicsCompleted: updatedTopicsCompleted,
        percentComplete,
        lastStudied: new Date(),
      });
      
      // Also log a study streak
      await apiRequest("POST", "/api/users/1/study-streaks", {
        userId: 1,
        minutesStudied: 30, // Default study time
      });
      
      queryClient.invalidateQueries({queryKey: ['/api/users/1/progress']});
      queryClient.invalidateQueries({queryKey: ['/api/users/1/study-streaks']});
      
      toast({
        title: "Progress Updated",
        description: "Your learning progress has been saved.",
      });
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Start studying functionality
  const startLearning = (topicId: number) => {
    navigate(`/topic/${topicId}`);
  };

  if (isLoadingSubject || isLoadingTopics || isLoadingProgress) {
    return (
      <div className="container py-8">
        <div className="flex items-center space-x-4 animate-pulse">
          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-4 w-36 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 p-6 rounded-lg animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Subject Not Found</h1>
          <p className="mb-6">The subject you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/subjects")}>Back to Subjects</Button>
        </div>
      </div>
    );
  }

  const percentComplete = subjectProgress?.percentComplete || 0;
  const topicsCompleted = subjectProgress?.topicsCompleted || 0;
  const sortedTopics = topics ? [...topics].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{subject.name}</h1>
          <p className="text-gray-600">{subject.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-2">Your Progress</div>
          <div className="flex items-center gap-2">
            <Progress value={percentComplete} className="w-40" />
            <span className="text-sm font-medium">{percentComplete}%</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {topicsCompleted} of {subject.totalTopics} topics completed
          </div>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>About this Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  {subject.description} This is a comprehensive course designed to help you prepare for 
                  the Bacalaureat exam. You'll learn key concepts, practice with real exam questions, 
                  and develop essential skills needed for success.
                </p>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock size={18} />
                  <span>Estimated completion time: {subject.totalTopics * 45} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen size={18} />
                  <span>{subject.totalTopics} learning topics</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full p-2 ${percentComplete > 0 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        <BookOpen size={20} />
                      </div>
                      <span>Start Learning</span>
                    </div>
                    {percentComplete > 0 && <CheckCircle2 className="text-green-500" size={20} />}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full p-2 ${percentComplete >= 50 ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                        <Edit3 size={20} />
                      </div>
                      <span>Practice Exercises</span>
                    </div>
                    {percentComplete >= 50 && <CheckCircle2 className="text-green-500" size={20} />}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full p-2 ${percentComplete >= 75 ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400"}`}>
                        <FileText size={20} />
                      </div>
                      <span>Mock Exams</span>
                    </div>
                    {percentComplete >= 75 && <CheckCircle2 className="text-green-500" size={20} />}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full p-2 ${percentComplete === 100 ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400"}`}>
                        <Trophy size={20} />
                      </div>
                      <span>Master the Subject</span>
                    </div>
                    {percentComplete === 100 && <CheckCircle2 className="text-green-500" size={20} />}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sortedTopics.slice(0, 3).map((topic) => (
                <Card key={topic.id} className="overflow-hidden">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Clock size={14} /> {topic.estimatedMinutes} minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{topic.description}</p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => startLearning(topic.id)}
                    >
                      Start Learning <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-4">
              <Button variant="link" onClick={() => setActiveTab("topics")}>
                View All Topics <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="topics">
          <div className="space-y-4">
            {sortedTopics.map((topic, index) => (
              <Card key={topic.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1">
                    <div className="flex items-center mb-2">
                      <div className="bg-gray-100 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-semibold">{topic.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{topic.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{topic.estimatedMinutes} minutes</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end p-6 bg-gray-50 md:w-64">
                    <Button 
                      className="w-full"
                      onClick={() => startLearning(topic.id)}
                    >
                      <Play size={16} className="mr-1" /> Start Learning
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" /> Study Materials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Access comprehensive study materials, notes, and key concepts.</p>
                <Button variant="outline" className="w-full">Browse Materials</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PenTool className="mr-2 h-5 w-5" /> Practice Worksheets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Download practice worksheets for further self-study.</p>
                <Button variant="outline" className="w-full">Get Worksheets</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" /> Past Exam Papers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Practice with authentic past Bacalaureat exam papers.</p>
                <Button variant="outline" className="w-full">View Papers</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="practice">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
              <FileText size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ready to test your knowledge?</h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Take quizzes and practice tests to assess your understanding of {subject.name}
              concepts and prepare for your Bacalaureat exam.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate(`/exam-simulator?subjectId=${subjectId}`)}>
                Take a Practice Test
              </Button>
              <Button variant="outline" onClick={() => navigate(`/subjects`)}>
                Return to Subjects
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}