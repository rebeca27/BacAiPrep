import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BarChart, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TestData {
  id: number;
  name: string;
  subjectId: number;
  description: string;
  questions: any[];
  timeLimit: number;
  difficulty: string;
}

interface SubjectData {
  id: number;
  name: string;
}

export default function ExamSimulator() {
  // Fetch tests
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-72 mb-2" />
          <Skeleton className="h-6 w-full mb-4" />
        </div>
        
        <Skeleton className="h-12 w-full mb-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Get subject name by ID
  const getSubjectName = (subjectId: number) => {
    if (!subjects) return "Unknown Subject";
    const subject = subjects.find((s: SubjectData) => s.id === subjectId);
    return subject ? subject.name : "Unknown Subject";
  };

  // Group tests by subject
  const testsBySubject: Record<string, TestData[]> = {};
  if (tests) {
    tests.forEach((test: TestData) => {
      const subjectName = getSubjectName(test.subjectId);
      if (!testsBySubject[subjectName]) {
        testsBySubject[subjectName] = [];
      }
      testsBySubject[subjectName].push(test);
    });
  }

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-neutral-900">
          Exam Simulator
        </h1>
        <p className="mt-1 text-neutral-600 max-w-3xl">
          Practice with real Bacalaureat-style exams under timed conditions to prepare for your actual exam.
        </p>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="w-full max-w-md mx-auto">
          <TabsTrigger value="all" className="flex-1">All Exams</TabsTrigger>
          {subjects && subjects.map((subject: SubjectData) => (
            <TabsTrigger key={subject.id} value={subject.name} className="flex-1">{subject.name}</TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests && tests.map((test: TestData) => (
              <TestCard 
                key={test.id} 
                test={test} 
                subjectName={getSubjectName(test.subjectId)} 
                difficultyColor={getDifficultyColor(test.difficulty)}
              />
            ))}
          </div>
        </TabsContent>
        
        {subjects && subjects.map((subject: SubjectData) => (
          <TabsContent key={subject.id} value={subject.name} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testsBySubject[subject.name]?.map((test: TestData) => (
                <TestCard 
                  key={test.id} 
                  test={test} 
                  subjectName={subject.name} 
                  difficultyColor={getDifficultyColor(test.difficulty)}
                />
              )) || (
                <div className="col-span-full text-center py-12">
                  <p className="text-neutral-500">No tests available for this subject yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="bg-primary-50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-heading font-semibold text-neutral-900 mb-4">About the Bacalaureat Exam</h2>
        <p className="text-neutral-600 mb-4">
          The Romanian Bacalaureat is a standardized national exam that tests your knowledge across several subjects. Our exam simulator helps you prepare with authentic exam questions and timed conditions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-medium mb-2">Exam Format</h3>
            <p className="text-sm text-neutral-500">Multiple subjects with written and multiple-choice sections</p>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-medium mb-2">Time Management</h3>
            <p className="text-sm text-neutral-500">Practice with timed tests to improve your speed and accuracy</p>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-medium mb-2">Scoring</h3>
            <p className="text-sm text-neutral-500">Detailed feedback and analytics to track your progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TestCardProps {
  test: TestData;
  subjectName: string;
  difficultyColor: string;
}

function TestCard({ test, subjectName, difficultyColor }: TestCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-primary-500" />
          <span className="text-sm text-neutral-600">{subjectName}</span>
        </div>
        <CardTitle>{test.name}</CardTitle>
        <CardDescription>{test.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 mb-4">
          <Badge variant="outline" className={difficultyColor}>
            {test.difficulty}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-neutral-600">
            <Clock className="h-4 w-4" />
            <span>{test.timeLimit} minutes</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-neutral-600">
            <BarChart className="h-4 w-4" />
            <span>{test.questions.length} questions</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-neutral-50 px-5 py-3">
        <Button className="w-full">Start Exam</Button>
      </CardFooter>
    </Card>
  );
}
