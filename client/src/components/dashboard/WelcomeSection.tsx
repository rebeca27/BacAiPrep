import { Button } from "@/components/ui/button";
import { Play, FileText, Clock } from "lucide-react";

interface WelcomeSectionProps {
  username: string;
}

export default function WelcomeSection({ username }: WelcomeSectionProps) {
  // Calculate days until Bacalaureat
  const calculateDaysRemaining = (): number => {
    // Assuming Bacalaureat is on June 28th of current or next year
    const today = new Date();
    const currentYear = today.getFullYear();
    const month = today.getMonth(); // 0-indexed (0 = January)
    
    // Set the exam date
    let examDate = new Date(currentYear, 5, 28); // June 28th
    
    // If we're past June 28th this year, use next year's date
    if (today > examDate) {
      examDate = new Date(currentYear + 1, 5, 28);
    }
    
    // Calculate difference in days
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="bg-white shadow rounded-lg mb-8 overflow-hidden">
      <div className="px-6 py-8 md:flex md:items-center md:justify-between">
        <div className="md:flex-1">
          <h1 className="text-2xl font-heading font-bold text-neutral-900">
            Welcome back, {username}!
          </h1>
          <p className="mt-1 text-neutral-600 max-w-3xl">
            Your next exam is approaching. Continue your preparation or try a practice test to see your progress.
          </p>
          
          {/* Countdown to Exam */}
          <div className="mt-4 inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full">
            <Clock className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium">Bacalaureat: {daysRemaining} days remaining</span>
          </div>
        </div>
        <div className="mt-6 md:mt-0 md:ml-6">
          <Button className="inline-flex items-center">
            <Play className="mr-2 h-4 w-4" />
            Start Studying
          </Button>
          <Button variant="outline" className="ml-3 inline-flex items-center border-primary-500 text-primary-500">
            <FileText className="mr-2 h-4 w-4" />
            Take Practice Test
          </Button>
        </div>
      </div>
    </div>
  );
}
