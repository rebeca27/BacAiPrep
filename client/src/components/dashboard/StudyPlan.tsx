import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface StudyTask {
  id: number;
  userId: number;
  title: string;
  description: string;
  duration: number;
  priority: boolean;
  recommended: boolean;
  completed: boolean;
  dueDate: string;
}

interface StudyPlanProps {
  tasks: StudyTask[];
}

export default function StudyPlan({ tasks }: StudyPlanProps) {
  const [localTasks, setLocalTasks] = useState<StudyTask[]>(tasks);
  const { toast } = useToast();

  const handleTaskCompletion = async (taskId: number, completed: boolean) => {
    try {
      // Update locally first for immediate feedback
      setLocalTasks(
        localTasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      );

      // Send the update to the server
      await apiRequest("PATCH", `/api/users/1/study-plan/${taskId}`, {
        completed,
      });

      // Invalidate the query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/study-plan'] });

      toast({
        title: completed ? "Task completed" : "Task marked as incomplete",
        description: "Your study plan has been updated.",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      
      // Revert the local change if there was an error
      setLocalTasks(localTasks);
      
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-4">Your Study Plan for Today</h2>
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-neutral-900">Recommended Tasks</h3>
          <div>
            <Button variant="ghost" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
              Edit Plan
            </Button>
          </div>
        </div>
        <div className="p-6">
          {localTasks.length > 0 ? (
            <div className="space-y-6">
              {localTasks.map((task) => (
                <div key={task.id} className="flex items-start">
                  <div className="flex-shrink-0">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={(checked) => 
                        handleTaskCompletion(task.id, checked as boolean)
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`font-medium ${
                        task.completed ? "text-neutral-400 line-through" : "text-neutral-900"
                      }`}
                    >
                      {task.title}
                    </label>
                    <p className={`text-sm ${
                      task.completed ? "text-neutral-400" : "text-neutral-500"
                    }`}>
                      {task.description}
                    </p>
                    <div className="mt-2 flex gap-2">
                      {task.priority && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          Priority
                        </span>
                      )}
                      {task.recommended && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto pl-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-500"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Task</DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            handleTaskCompletion(task.id, !task.completed);
                          }}
                        >
                          {task.completed ? "Mark as incomplete" : "Mark as complete"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Remove Task</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-neutral-500">No study tasks for today</p>
              <Button className="mt-4" variant="outline">
                Generate Study Plan
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
