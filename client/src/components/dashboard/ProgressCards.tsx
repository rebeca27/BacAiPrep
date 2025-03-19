import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle } from "lucide-react";
import { Link } from "wouter";

interface ProgressCardProps {
  subject: {
    id: number;
    name: string;
  };
  percentComplete: number;
  topicsCompleted: number;
  totalTopics: number;
  lastStudied: string;
}

interface ProgressCardsProps {
  progress: any[];
}

function formatLastStudied(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return new Date(dateString).toLocaleDateString();
}

export default function ProgressCards({ progress }: ProgressCardsProps) {
  if (!progress || progress.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-neutral-500 text-center">No progress data available yet.</p>
        </div>
      </div>
    );
  }

  // Sort progress by percentComplete
  const sortedProgress = [...progress].sort((a, b) => b.percentComplete - a.percentComplete);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {sortedProgress.map((item) => (
        <ProgressCard
          key={item.id}
          subject={{
            id: item.subjectId,
            name: item.subject?.name || `Subject ${item.subjectId}`
          }}
          percentComplete={item.percentComplete}
          topicsCompleted={item.topicsCompleted}
          totalTopics={18} // This would ideally come from the subject data
          lastStudied={item.lastStudied}
        />
      ))}
    </div>
  );
}

function ProgressCard({ subject, percentComplete, topicsCompleted, totalTopics, lastStudied }: ProgressCardProps) {
  const formattedLastStudied = formatLastStudied(lastStudied);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-900">{subject.name}</h3>
          <span className="text-primary-500 font-semibold text-lg">{percentComplete}%</span>
        </div>
        <div className="mt-2 relative pt-1">
          <Progress value={percentComplete} className="h-2" />
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <div>
            <span className="text-neutral-500">Last studied</span>
            <p className="font-medium flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formattedLastStudied}
            </p>
          </div>
          <div className="text-right">
            <span className="text-neutral-500">Topics mastered</span>
            <p className="font-medium flex items-center justify-end">
              <CheckCircle className="h-3 w-3 mr-1" />
              {topicsCompleted}/{totalTopics}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-neutral-50 px-5 py-3">
        <Link href={`/subjects/${subject.id}`} className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center">
          Continue Learning <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );
}
