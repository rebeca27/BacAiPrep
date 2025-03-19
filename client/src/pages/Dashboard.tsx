import WelcomeSection from "@/components/dashboard/WelcomeSection";
import ProgressCards from "@/components/dashboard/ProgressCards";
import ContinueLearning from "@/components/dashboard/ContinueLearning";
import Achievements from "@/components/dashboard/Achievements";
import TestResults from "@/components/dashboard/TestResults";
import AIAssistant from "@/components/dashboard/AIAssistant";
import StudyPlan from "@/components/dashboard/StudyPlan";
import QuickStart from "@/components/dashboard/QuickStart";
import PracticeTests from "@/components/dashboard/PracticeTests";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/users/1'],
    staleTime: Infinity,
  });

  // Fetch user progress data
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['/api/users/1/progress'],
    staleTime: 60000, // 1 minute
  });

  // Fetch test results
  const { data: testResults, isLoading: isLoadingTests } = useQuery({
    queryKey: ['/api/users/1/test-results'],
    staleTime: 60000, // 1 minute
  });

  // Fetch badges
  const { data: badges, isLoading: isLoadingBadges } = useQuery({
    queryKey: ['/api/users/1/badges'],
    staleTime: 60000, // 1 minute
  });

  // Fetch study streaks
  const { data: streaks, isLoading: isLoadingStreaks } = useQuery({
    queryKey: ['/api/users/1/study-streaks'],
    staleTime: 60000, // 1 minute
  });

  // Fetch study plan
  const { data: studyPlan, isLoading: isLoadingStudyPlan } = useQuery({
    queryKey: ['/api/users/1/study-plan'],
    staleTime: 60000, // 1 minute
  });

  // Fetch chat history
  const { data: chatHistory, isLoading: isLoadingChat } = useQuery({
    queryKey: ['/api/users/1/chat-history'],
    staleTime: 60000, // 1 minute
  });

  // Check if data is loading
  const isLoading = isLoadingUser || isLoadingProgress || isLoadingTests || 
                    isLoadingBadges || isLoadingStreaks || isLoadingStudyPlan || 
                    isLoadingChat;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg mb-8 overflow-hidden">
          <div className="px-6 py-8 md:flex md:items-center md:justify-between">
            <div className="md:flex-1">
              <Skeleton className="h-10 w-72 mb-2" />
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="mt-6 md:mt-0 md:ml-6">
              <Skeleton className="h-10 w-36 mb-2" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
        </div>
        
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <WelcomeSection username={userData?.displayName || "Student"} />

      {/* Quick Actions */}
      <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <QuickStart />
        <PracticeTests />
      </div>

      {/* Progress Overview */}
      <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-4">Your Progress</h2>
      <ProgressCards progress={progressData || []} />

      {/* Study Recommendations & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recommended Continue */}
        <div className="lg:col-span-2">
          <ContinueLearning />
        </div>

        {/* Achievements & Badges */}
        <div>
          <Achievements badges={badges || []} streaks={streaks || []} />
        </div>
      </div>

      {/* Practice Tests & AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Test Results */}
        <TestResults results={testResults || []} />

        {/* AI Assistant */}
        <AIAssistant initialMessages={chatHistory?.messages || []} />
      </div>

      {/* Suggested Study Plan */}
      <StudyPlan tasks={studyPlan || []} />
    </div>
  );
}
