import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { format } from "date-fns";

interface TestResultsProps {
  results: any[];
}

export default function TestResults({ results }: TestResultsProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-success-100 text-success-800";
    if (score >= 60) return "bg-warning-100 text-warning-800";
    return "bg-error-100 text-error-800";
  };

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <CardTitle className="text-lg font-medium text-neutral-900">Recent Test Results</CardTitle>
        <Link href="/exam-simulator" className="text-sm text-primary-500 hover:text-primary-600">View All</Link>
      </CardHeader>
      <CardContent className="p-6">
        {results && results.length > 0 ? (
          <div className="space-y-5">
            {results.slice(0, 3).map((result) => (
              <div key={result.id} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-900">{result.testName}</h3>
                  <p className="text-sm text-neutral-500">Completed on {formatDate(result.completedAt)}</p>
                </div>
                <div className="text-right">
                  <Badge className={getScoreBadgeColor(result.percentCorrect)}>
                    {result.percentCorrect}% Correct
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-neutral-500 mb-2">No test results yet</p>
            <p className="text-sm text-neutral-400 mb-4">Take a practice test to see your results here</p>
          </div>
        )}
        <div className="mt-6">
          <Button variant="outline" className="w-full inline-flex justify-center items-center">
            <FileText className="mr-2 h-4 w-4" />
            Take New Practice Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
