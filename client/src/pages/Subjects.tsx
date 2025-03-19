import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, BookOpen, CheckCircle } from "lucide-react";

interface SubjectData {
  id: number;
  name: string;
  description: string;
  totalTopics: number;
  icon: string;
}

interface ProgressData {
  id: number;
  userId: number;
  subjectId: number;
  topicsCompleted: number;
  lastStudied: string;
  percentComplete: number;
}

export default function Subjects() {
  const [_, setLocation] = useLocation();
  
  // Fetch subjects
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['/api/subjects'],
    staleTime: 60000, // 1 minute
  });

  // Fetch user progress
  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['/api/users/1/progress'],
    staleTime: 60000, // 1 minute
  });

  const isLoading = isLoadingSubjects || isLoadingProgress;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-72 mb-2" />
          <Skeleton className="h-6 w-full mb-4" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Get progress for each subject
  const getProgressForSubject = (subjectId: number) => {
    if (!progress) return null;
    return progress.find((p: ProgressData) => p.subjectId === subjectId);
  };

  // Format date to relative time (today, yesterday, X days ago)
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-neutral-900">
          Subject Modules
        </h1>
        <p className="mt-1 text-neutral-600 max-w-3xl">
          Explore all the subjects available for your Bacalaureat preparation. Each module contains lessons, exercises, and practice tests.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects && subjects.map((subject: SubjectData) => {
          const subjectProgress = getProgressForSubject(subject.id);
          
          return (
            <Card key={subject.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary-100 rounded-md">
                    <BookOpen className="h-5 w-5 text-primary-500" />
                  </div>
                  <div>
                    <CardTitle>{subject.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{subject.description}</CardDescription>
                
                {subjectProgress ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-500">Progress</span>
                      <span className="text-primary-500 font-semibold">{subjectProgress.percentComplete}%</span>
                    </div>
                    <Progress value={subjectProgress.percentComplete} className="mb-4" />
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-neutral-500">
                        <CheckCircle className="h-4 w-4" />
                        <span>{subjectProgress.topicsCompleted}/{subject.totalTopics} topics</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-500">
                        <CalendarDays className="h-4 w-4" />
                        <span>Last: {formatRelativeDate(subjectProgress.lastStudied)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2 mb-4 bg-neutral-50 rounded-md">
                    <p className="text-sm text-neutral-500">No progress yet</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-neutral-50 px-5 py-3">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => setLocation(`/learning/${subject.id}`)}
                >
                  {subjectProgress ? "Continue Learning" : "Start Learning"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
