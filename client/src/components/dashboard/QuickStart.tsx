import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowRight } from "lucide-react";

export default function QuickStart() {
  const [_, setLocation] = useLocation();
  
  // Fetch subjects
  const { data: subjects, isLoading } = useQuery({
    queryKey: ['/api/subjects'],
    staleTime: 60000, // 1 minute
  });

  // Function to start studying a subject
  const handleStartStudying = (subjectId: number) => {
    setLocation(`/learning/${subjectId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }

  // Get 3 subjects to display (or all if less than 3)
  const subjectsToDisplay = subjects ? (subjects.length > 3 ? subjects.slice(0, 3) : subjects) : [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          Start Studying
        </CardTitle>
        <CardDescription>Choose a subject to continue your studies</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {subjectsToDisplay.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No subjects available yet.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {subjectsToDisplay.map((subject: any) => (
              <Button 
                key={subject.id} 
                variant="outline" 
                className="justify-between"
                onClick={() => handleStartStudying(subject.id)}
              >
                {subject.name}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => setLocation("/subjects")}
        >
          View All Subjects <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}