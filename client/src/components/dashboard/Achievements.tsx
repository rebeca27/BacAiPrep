import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Medal, BookOpen, Clock, CheckCheck, Calendar } from "lucide-react";

interface BadgeProps {
  icon: JSX.Element;
  name: string;
  iconBgColor: string;
  iconColor: string;
}

interface AchievementsProps {
  badges: any[];
  streaks: any[];
}

export default function Achievements({ badges, streaks }: AchievementsProps) {
  // Get recent badges (top 3)
  const recentBadges = badges.slice(0, 3);

  // Map badge names to icons and colors
  const badgeIcons: Record<string, BadgeProps> = {
    "Math Wizard": {
      icon: <Medal className="text-xl" />,
      name: "Math Wizard",
      iconBgColor: "bg-primary-100",
      iconColor: "text-primary-500"
    },
    "Literature Pro": {
      icon: <BookOpen className="text-xl" />,
      name: "Literature Pro",
      iconBgColor: "bg-amber-100",
      iconColor: "text-amber-500"
    },
    "Speed Demon": {
      icon: <Clock className="text-xl" />,
      name: "Speed Demon",
      iconBgColor: "bg-emerald-100",
      iconColor: "text-emerald-500"
    }
  };

  // Get default badges if no data
  const getBadgeData = (index: number) => {
    if (recentBadges.length > index) {
      const badge = recentBadges[index];
      const badgeName = badge.badge?.name || "Badge";
      const iconData = badgeIcons[badgeName] || {
        icon: <Medal className="text-xl" />,
        name: badgeName,
        iconBgColor: "bg-primary-100",
        iconColor: "text-primary-500"
      };
      return iconData;
    }
    
    // Fallback badges
    const fallbacks = [
      {
        icon: <Medal className="text-xl" />,
        name: "No Badge",
        iconBgColor: "bg-neutral-100",
        iconColor: "text-neutral-400"
      },
      {
        icon: <BookOpen className="text-xl" />,
        name: "No Badge",
        iconBgColor: "bg-neutral-100",
        iconColor: "text-neutral-400"
      },
      {
        icon: <Clock className="text-xl" />,
        name: "No Badge",
        iconBgColor: "bg-neutral-100",
        iconColor: "text-neutral-400"
      }
    ];
    
    return fallbacks[index];
  };

  // Calculate current streak based on consecutive days
  const calculateStreak = () => {
    if (!streaks || streaks.length === 0) return 0;
    
    const sortedStreaks = [...streaks].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const firstStreakDate = new Date(sortedStreaks[0].date);
    firstStreakDate.setHours(0, 0, 0, 0);
    
    // If most recent streak is not from today or yesterday, streak is broken
    const diffDays = Math.floor((today.getTime() - firstStreakDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return 0;
    
    // Count consecutive days
    for (let i = 1; i < sortedStreaks.length; i++) {
      const currentDate = new Date(sortedStreaks[i-1].date);
      currentDate.setHours(0, 0, 0, 0);
      
      const prevDate = new Date(sortedStreaks[i].date);
      prevDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();

  // Generate week days for streak display
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Check if a day has a study record
  const hasStudyRecord = (dayIndex: number) => {
    return dayIndex < currentStreak;
  };

  const badge1 = getBadgeData(0);
  const badge2 = getBadgeData(1);
  const badge3 = getBadgeData(2);

  return (
    <>
      <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-4">Your Achievements</h2>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-medium text-neutral-900">Recent Badges</h3>
            <div className="ml-auto">
              <Link href="/badges" className="text-sm text-primary-500 hover:text-primary-600">View All</Link>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-14 h-14 rounded-full ${badge1.iconBgColor} flex items-center justify-center`}>
                <span className={badge1.iconColor}>{badge1.icon}</span>
              </div>
              <span className="mt-2 text-xs text-center text-neutral-700">{badge1.name}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-14 h-14 rounded-full ${badge2.iconBgColor} flex items-center justify-center`}>
                <span className={badge2.iconColor}>{badge2.icon}</span>
              </div>
              <span className="mt-2 text-xs text-center text-neutral-700">{badge2.name}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-14 h-14 rounded-full ${badge3.iconBgColor} flex items-center justify-center`}>
                <span className={badge3.iconColor}>{badge3.icon}</span>
              </div>
              <span className="mt-2 text-xs text-center text-neutral-700">{badge3.name}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-3">Week Streak</h3>
            <div className="flex justify-between">
              {weekDays.map((day, index) => (
                <div key={day} className="text-center flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1 ${
                      hasStudyRecord(index) 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {day}
                  </div>
                  {hasStudyRecord(index) ? (
                    <CheckCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Calendar className="h-4 w-4 text-neutral-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
