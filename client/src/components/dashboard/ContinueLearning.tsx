import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, FileText } from "lucide-react";

export default function ContinueLearning() {
  // Mock data for in-progress lessons
  // In a real app, this would come from an API call
  const inProgressLessons = [
    {
      id: 1,
      type: "mathematics",
      icon: "BookOpen",
      title: "Mathematics: Geometric Progressions",
      description: "Continue your practice on calculating sums and products of geometric progressions.",
      timeRemaining: 25,
      percentComplete: 58
    },
    {
      id: 2,
      type: "romanian",
      icon: "FileText",
      title: "Romanian: Literary Analysis",
      description: "Practice analyzing themes and characters in \"Ion\" by Liviu Rebreanu.",
      timeRemaining: 40,
      percentComplete: 32
    }
  ];

  const getIconByType = (type: string) => {
    switch (type) {
      case "mathematics":
        return <BookOpen className="text-xl text-primary-500" />;
      case "romanian":
        return <FileText className="text-xl text-secondary-500" />;
      default:
        return <BookOpen className="text-xl text-primary-500" />;
    }
  };

  const getIconBgByType = (type: string) => {
    switch (type) {
      case "mathematics":
        return "bg-primary-100";
      case "romanian":
        return "bg-secondary-100";
      default:
        return "bg-primary-100";
    }
  };

  return (
    <>
      <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-4">Continue Learning</h2>
      <Card>
        {inProgressLessons.map((lesson, index) => (
          <div key={lesson.id} className={index > 0 ? "border-t border-gray-200" : ""}>
            <CardContent className={index === 0 ? "pt-6 pb-6" : "py-6"}>
              <div className="flex items-start">
                <div className={`flex-shrink-0 p-3 ${getIconBgByType(lesson.type)} rounded-md`}>
                  {getIconByType(lesson.type)}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-neutral-900">{lesson.title}</h3>
                  <p className="mt-1 text-neutral-600">{lesson.description}</p>
                  <div className="mt-3 flex items-center">
                    <span className="flex items-center text-sm text-neutral-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {lesson.timeRemaining} min remaining
                    </span>
                    <span className="mx-2 text-neutral-300">|</span>
                    <span className="text-sm font-medium text-primary-500">{lesson.percentComplete}% complete</span>
                  </div>
                  <div className="mt-4">
                    <Button>
                      Resume Lesson
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        ))}
      </Card>
    </>
  );
}
