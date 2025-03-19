import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, ArrowRight } from "lucide-react";

export default function PracticeTests() {
  const [_, setLocation] = useLocation();
  
  // Fetch available tests
  const { data: tests, isLoading: isLoadingTests } = useQuery({
    queryKey: ['/api/tests'],
    staleTime: 60000, // 1 minute
  });

  // Fetch subjects
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['/api/subjects'],
    staleTime: 60000, // 1 minute
  });

  const isLoading = isLoadingTests || isLoadingSubjects;

  // Function to start a practice test
  const handleStartTest = (testId: number) => {
    setLocation(`/exam-simulator/${testId}`);
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
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }

  // Get 3 tests to display (or all if less than 3)
  const testsArray = Array.isArray(tests) ? tests : [];
  const testsToDisplay = testsArray.length > 3 ? testsArray.slice(0, 3) : testsArray;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Award className="h-5 w-5 mr-2 text-primary" />
          Practice Tests
        </CardTitle>
        <CardDescription>Evaluate your knowledge with practice exams</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {testsToDisplay.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No practice tests available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {testsToDisplay.map((test: any) => {
              const subject = subjects?.find((s: any) => s.id === test.subjectId);
              const difficultyColor = 
                test.difficulty === "easy" ? "bg-green-100 text-green-800" : 
                test.difficulty === "medium" ? "bg-yellow-100 text-yellow-800" : 
                "bg-red-100 text-red-800";
              
              return (
                <div key={test.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <div className="font-medium">{test.name}</div>
                    <div className="text-xs text-muted-foreground">{subject?.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={difficultyColor} variant="outline">
                      {test.difficulty}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => handleStartTest(test.id)}
                    >
                      Start
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => setLocation("/exam-simulator")}
        >
          View All Tests <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}