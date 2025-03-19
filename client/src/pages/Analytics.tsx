import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { format } from "date-fns";
import { useState } from "react";
import { Clock, Calendar, BarChart2, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("last7days");
  
  // Fetch user test results
  const { data: testResults, isLoading: isLoadingResults } = useQuery({
    queryKey: ['/api/users/1/test-results'],
    staleTime: 60000, // 1 minute
  });

  // Fetch user progress
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['/api/users/1/progress'],
    staleTime: 60000, // 1 minute
  });

  // Fetch study streaks
  const { data: studyStreaks, isLoading: isLoadingStreaks } = useQuery({
    queryKey: ['/api/users/1/study-streaks'],
    staleTime: 60000, // 1 minute
  });

  const isLoading = isLoadingResults || isLoadingProgress || isLoadingStreaks;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-72 mb-2" />
          <Skeleton className="h-6 w-full mb-4" />
        </div>
        
        <div className="flex justify-end mb-4">
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Prepare test results data for charts
  const testScoreData = testResults ? testResults.map((result: any) => ({
    name: result.testName,
    score: result.percentCorrect,
    subject: result.subjectName,
    date: format(new Date(result.completedAt), 'MMM d, yyyy')
  })) : [];

  // Prepare subject progress data for radar chart
  const subjectProgressData = progressData ? progressData.map((progress: any) => ({
    subject: progress.subject?.name || `Subject ${progress.subjectId}`,
    progress: progress.percentComplete,
    fill: `hsl(${progress.subjectId * 30}, 70%, 50%)`
  })) : [];

  // Prepare study time data
  const studyTimeData = studyStreaks ? studyStreaks.map((streak: any) => ({
    date: format(new Date(streak.date), 'MMM d'),
    minutes: streak.minutesStudied
  })) : [];

  // Custom pie chart colors
  const COLORS = ['#5C6BC0', '#26A69A', '#FFA726', '#EF5350'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-neutral-900">
          Performance Analytics
        </h1>
        <p className="mt-1 text-neutral-600 max-w-3xl">
          Track your progress and performance across all subjects to identify areas for improvement.
        </p>
      </div>
      
      <div className="flex justify-end mb-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last7days">Last 7 days</SelectItem>
            <SelectItem value="last30days">Last 30 days</SelectItem>
            <SelectItem value="last3months">Last 3 months</SelectItem>
            <SelectItem value="alltime">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Test Score History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Test Score History</CardTitle>
            <BarChart2 className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent className="pt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={testScoreData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                <Legend />
                <Bar 
                  dataKey="score" 
                  name="Percentage Score" 
                  fill="#5C6BC0" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Study Time Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Study Time Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent className="pt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={studyTimeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} minutes`, 'Time Studied']} />
                <Line 
                  type="monotone" 
                  dataKey="minutes" 
                  name="Minutes Studied" 
                  stroke="#26A69A" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <div className="p-2 bg-primary-100 rounded-md">
              <BarChart2 className="h-4 w-4 text-primary-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testScoreData.length > 0 
                ? `${Math.round(testScoreData.reduce((sum, item) => sum + item.score, 0) / testScoreData.length)}%` 
                : 'N/A'}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Across all subjects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
            <div className="p-2 bg-primary-100 rounded-md">
              <PieChartIcon className="h-4 w-4 text-primary-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testScoreData.length}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Total tests taken
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <div className="p-2 bg-primary-100 rounded-md">
              <Clock className="h-4 w-4 text-primary-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studyTimeData.length > 0 
                ? `${studyTimeData.reduce((sum, item) => sum + item.minutes, 0)} min` 
                : '0 min'}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Total time studied
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <div className="p-2 bg-primary-100 rounded-md">
              <Calendar className="h-4 w-4 text-primary-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studyTimeData.length} days
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Current streak
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Subject breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Progress Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Subject Progress</CardTitle>
            <BarChart2 className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent className="pt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectProgressData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="subject" type="category" width={80} />
                <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
                <Bar 
                  dataKey="progress" 
                  name="Subject Progress" 
                  radius={[0, 4, 4, 0]}
                >
                  {subjectProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Performance Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Score Distribution</CardTitle>
            <PieChartIcon className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent className="pt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: '90-100%', value: testScoreData.filter(item => item.score >= 90).length },
                    { name: '70-89%', value: testScoreData.filter(item => item.score >= 70 && item.score < 90).length },
                    { name: '50-69%', value: testScoreData.filter(item => item.score >= 50 && item.score < 70).length },
                    { name: '0-49%', value: testScoreData.filter(item => item.score < 50).length }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {[0, 1, 2, 3].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
