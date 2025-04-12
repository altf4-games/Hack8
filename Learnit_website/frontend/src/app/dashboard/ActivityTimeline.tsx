import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  getGitHubStyleActivity, 
  getDailyActivity,
  DailyActivity
} from '../services/documentStorage';

// Improved activity cell interface with clearer typing
interface ActivityCell {
  date: string;
  count: number;
  level: number; // 0-4 for intensity
  tooltip: string; // Detailed info for tooltip
}

interface ActivityTimelineProps {
  userId?: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ userId }) => {
  const [activityCells, setActivityCells] = useState<ActivityCell[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTimeFrame, setActiveTimeFrame] = useState<'week' | 'month' | 'year'>('year');
  const [yearRange, setYearRange] = useState<'3months' | '6months' | 'fullyear'>('fullyear');
  
  // Load activity data based on selected timeframe
  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      
      try {
        // Calculate date range based on selected timeframe and year range
        const endDate = new Date();
        let startDate = new Date();
        
        if (activeTimeFrame === 'week') {
          startDate.setDate(endDate.getDate() - 7);
        } else if (activeTimeFrame === 'month') {
          startDate.setMonth(endDate.getMonth() - 1);
        } else {
          // Year view - adjust based on selected year range
          if (yearRange === '3months') {
            startDate.setMonth(endDate.getMonth() - 3);
          } else if (yearRange === '6months') {
            startDate.setMonth(endDate.getMonth() - 6);
          } else {
            startDate.setFullYear(endDate.getFullYear() - 1);
          }
        }
        
        // Get activity data using the appropriate functions from documentStorage.ts
        let activityData: { date: string; count: number }[] = [];
        let dailyDetails: DailyActivity[] = [];
        
        // Get appropriate data based on the view mode
        if (activeTimeFrame === 'year') {
          // Calculate number of weeks to fetch based on year range
          const weeks = yearRange === '3months' ? 13 : (yearRange === '6months' ? 26 : 52);
          activityData = getGitHubStyleActivity(weeks);
        } else {
          // For week and month views, use the daily activity data for more details
          dailyDetails = getDailyActivity(startDate, endDate);
          
          // Convert to the expected format
          activityData = dailyDetails.map(day => ({
            date: day.date,
            count: day.uploads + day.quizzes // Total activity count
          }));
        }
        
        // Find max activity for scaling intensity levels
        const maxActivity = Math.max(...activityData.map(d => d.count), 4); // Minimum divisor of 4
        
        // Process data for rendering
        const processedCells: ActivityCell[] = activityData.map(day => {
          // Find the detailed activity for this day if available
          const detail = dailyDetails.find(d => d.date === day.date);
          
          // Create tooltip text with details
          let tooltipText = `${day.date}: ${day.count} activities`;
          if (detail) {
            tooltipText = `${day.date}: ${detail.uploads} uploads, ${detail.quizzes} quizzes`;
            if (detail.quizzes > 0) {
              tooltipText += `, Avg score: ${(detail.score / detail.quizzes).toFixed(1)}%`;
            }
          }
          
          return {
            date: day.date,
            count: day.count,
            level: day.count === 0 ? 0 : Math.ceil((day.count / maxActivity) * 4),
            tooltip: tooltipText
          };
        });
        
        setActivityCells(processedCells);
      } catch (error) {
        console.error("Error fetching activity data:", error);
        // Fallback to empty data
        setActivityCells([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivityData();
  }, [activeTimeFrame, userId, yearRange]);
  
  // Render the yearly GitHub-style calendar with improved responsiveness
  // Render the yearly GitHub-style calendar with improved responsiveness
const renderYearlyCalendar = () => {
    const today = new Date();
    
    // Create a date for the start of our range based on selected year range
    let startDate = new Date(today);
    if (yearRange === '3months') {
      startDate.setMonth(today.getMonth() - 3);
    } else if (yearRange === '6months') {
      startDate.setMonth(today.getMonth() - 6);
    } else {
      startDate.setFullYear(today.getFullYear() - 1);
    }
    
    // Adjust startDate to the beginning of the week (Sunday)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    // Create arrays to store the weeks and days
    const weeks: ActivityCell[][] = [];
    
    // Sort cells by date
    const sortedCells = [...activityCells].sort((a, b) => a.date.localeCompare(b.date));
    
    // Loop through each day from start date to today
    let currentWeek: ActivityCell[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      
      // If Sunday and not the first date, start a new week
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      
      // Find if we have data for this day
      const existingCell = sortedCells.find(cell => cell.date === dateStr);
      
      if (existingCell) {
        currentWeek.push(existingCell);
      } else {
        currentWeek.push({
          date: dateStr,
          count: 0,
          level: 0,
          tooltip: `${dateStr}: No activity`
        });
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add the last week if it's not empty
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    // Generate month labels for the top with improved positioning
    const monthLabels: {label: string, position: number}[] = [];
    
    // Record the first day of each month
    let currentMonthIndex = -1;
    let totalDays = 0;
    
    // Loop through all days to find month transitions
    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
      const week = weeks[weekIndex];
      for (let dayIndex = 0; dayIndex < week.length; dayIndex++) {
        const day = week[dayIndex];
        if (day.date) {
          const date = new Date(day.date);
          const month = date.getMonth();
          
          // If this is a new month, add a label
          if (month !== currentMonthIndex) {
            const position = totalDays;
            monthLabels.push({
              label: date.toLocaleString('default', { month: 'short' }),
              position
            });
            currentMonthIndex = month;
          }
          
          totalDays++;
        }
      }
    }
    
    // Day labels for the left side
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Total number of days to calculate positions
    const totalWeeks = weeks.length;
    
    return (
      <div className="w-full py-4">
        {/* Month labels row */}
        <div className="flex flex-col">
          <div className="flex">
            <div className="w-10 md:w-12"></div> {/* Space for day labels */}
            <div className="flex-grow relative h-6">
              {monthLabels.map((monthInfo, i) => {
                // Calculate position as percentage of total days
                const percentPosition = (monthInfo.position / totalDays) * 100;
                return (
                  <div 
                    key={`month-${i}`} 
                    className="absolute text-xs text-gray-500 dark:text-gray-400"
                    style={{ 
                      left: `${percentPosition}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {monthInfo.label}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Activity grid with improved layout */}
          <div className="flex mt-2">
            {/* Day labels */}
            <div className="flex flex-col pr-2 space-y-1 md:space-y-1.5">
              {dayLabels.map((day, i) => (
                <div key={`day-${i}`} className="h-3 md:h-4 text-xs flex items-center text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Activity cells with container for responsive sizing */}
            <div className="flex-grow overflow-x-auto">
              <div className="flex space-x-1 md:space-x-1.5 min-w-full">
                {weeks.map((week, weekIndex) => (
                  <div key={`week-${weekIndex}`} className="flex flex-col space-y-1 md:space-y-1.5">
                    {week.map((day, dayIndex) => (
                      <div
                        key={`day-${dayIndex}-${weekIndex}`}
                        title={day.tooltip}
                        className={`w-3 h-3 md:w-4 md:h-4 rounded-sm transition-colors ${
                          day.level === 0 
                            ? 'bg-gray-100 dark:bg-gray-800' 
                            : day.level === 1 
                              ? 'bg-purple-200 dark:bg-purple-900' 
                              : day.level === 2 
                                ? 'bg-purple-400 dark:bg-purple-700' 
                                : day.level === 3 
                                  ? 'bg-purple-600 dark:bg-purple-500'
                                  : 'bg-purple-800 dark:bg-purple-300'
                        } ${
                          day.date === today.toISOString().split('T')[0]
                            ? 'ring-1 ring-purple-500 dark:ring-purple-400'
                            : ''
                        }`}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-end mt-4 text-xs text-gray-500 dark:text-gray-400 items-center">
          <span>Less</span>
          <div className="flex mx-2 space-x-1 md:space-x-1.5">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-purple-200 dark:bg-purple-900"></div>
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-purple-400 dark:bg-purple-700"></div>
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-purple-600 dark:bg-purple-500"></div>
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-sm bg-purple-800 dark:bg-purple-300"></div>
          </div>
          <span>More</span>
        </div>
        
        {/* Time range selector */}
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-2">
            <Button 
              variant={yearRange === '3months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setYearRange('3months')}
            >
              3 Months
            </Button>
            <Button 
              variant={yearRange === '6months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setYearRange('6months')}
            >
              6 Months
            </Button>
            <Button 
              variant={yearRange === 'fullyear' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setYearRange('fullyear')}
            >
              Full Year
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render a monthly calendar view
  const renderMonthlyCalendar = () => {
    // Get current month's data
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of month and last day of month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Calculate offset for first day of month (0 = Sunday, 6 = Saturday)
    const firstDayOffset = firstDay.getDay();
    
    // Get total days in month
    const daysInMonth = lastDay.getDate();
    
    // Build calendar data for the current month
    const calendarDays: ActivityCell[] = [];
    
    // Add empty cells for days before the start of the month
    for (let i = 0; i < firstDayOffset; i++) {
      calendarDays.push({
        date: '',
        count: 0,
        level: 0,
        tooltip: ''
      });
    }
      
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Find activity data for this day
      const activityData = activityCells.find(cell => cell.date === dateStr);
      
      if (activityData) {
        calendarDays.push(activityData);
      } else {
        calendarDays.push({
          date: dateStr,
          count: 0,
          level: 0,
          tooltip: `${dateStr}: No activity`
        });
      }
    }
      
    // Group days into weeks
    const weeks: ActivityCell[][] = [];
    let week: ActivityCell[] = [];
    
    calendarDays.forEach((day, index) => {
      week.push(day);
      
      // Start a new week after every 7 days
      // Start a new week after every 7 days
      if ((index + 1) % 7 === 0) {
        weeks.push(week);
        week = [];
      }
    });
    
    // Add the last week if it's not empty
    if (week.length > 0) {
      // Fill the remainder of the last week with empty cells
      while (week.length < 7) {
        week.push({
          date: '',
          count: 0, 
          level: 0,
          tooltip: ''
        });
      }
      weeks.push(week);
    }
      
    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="w-full">
        <h3 className="text-lg font-medium mb-4 text-center dark:text-white">
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {/* Day headers */}
          {dayHeaders.map((day, i) => (
            <div key={`header-${i}`} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 pb-1">
              {day}
            </div>
          ))}
          
          {/* Calendar cells with responsive sizing */}
          {weeks.flatMap((week, weekIndex) => 
            week.map((day, dayIndex) => (
              <div 
                key={`day-${weekIndex}-${dayIndex}`}
                title={day.tooltip}
                className={`aspect-square rounded-md flex flex-col items-center justify-center p-1 ${
                  day.date === '' 
                    ? 'bg-transparent' 
                    : day.level === 0 
                      ? 'bg-gray-100 dark:bg-gray-800' 
                      : day.level === 1 
                        ? 'bg-purple-100 dark:bg-purple-900' 
                        : day.level === 2 
                          ? 'bg-purple-300 dark:bg-purple-700' 
                          : day.level === 3 
                            ? 'bg-purple-500 dark:bg-purple-500'
                            : 'bg-purple-700 dark:bg-purple-300'
                } ${
                  // Highlight today's date
                  day.date === today.toISOString().split('T')[0] 
                    ? 'ring-1 ring-purple-500 dark:ring-purple-400' 
                    : ''
                }`}
              >
                {day.date !== '' && (
                  <>
                    <span className="text-xs font-medium dark:text-white">
                      {new Date(day.date).getDate()}
                    </span>
                    {day.count > 0 && (
                      <span className="text-xs mt-1 dark:text-white">
                        {day.count}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };
    
  // Render a detailed week view
  const renderWeeklyView = () => {
    // Get current week's dates
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Get first day of current week (Sunday)
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - currentDay);
    
    // Get dates for all days in the current week
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    
    // Get activity data for each day of the week
    const weekActivities = weekDates.map(date => {
      const activity = activityCells.find(cell => cell.date === date);
      return activity || {
        date,
        count: 0,
        level: 0,
        tooltip: `${date}: No activity`
      };
    });
    
    // Day labels
    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return (
      <div className="space-y-2">
        {weekActivities.map((activity, index) => (
          <div 
            key={`day-${index}`}
            className={`p-2 md:p-3 rounded-lg ${
              activity.date === today.toISOString().split('T')[0]
                ? 'bg-purple-50 dark:bg-purple-900/20'
                : 'bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <div className="flex justify-between items-center flex-wrap">
              <div>
                <h3 className="font-medium dark:text-white text-sm md:text-base">
                  {dayLabels[index]}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(activity.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className={`px-2 py-1 rounded-full text-xs md:text-sm ${
                activity.count > 0
                  ? 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {activity.count > 0 
                  ? `${activity.count} ${activity.count === 1 ? 'activity' : 'activities'}`
                  : 'No activity'
                }
              </div>
            </div>
            
            {/* Show detailed breakdown if available */}
            {activity.count > 0 && activity.tooltip && activity.tooltip.includes(':') && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {activity.tooltip.includes('uploads') && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="dark:text-white">
                      {activity.tooltip.match(/(\d+) uploads/)?.[1] || '0'} uploads
                    </span>
                  </div>
                )}
                
                {activity.tooltip.includes('quizzes') && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span className="dark:text-white">
                      {activity.tooltip.match(/(\d+) quizzes/)?.[1] || '0'} quizzes
                    </span>
                  </div>
                )}
                
                {activity.tooltip.includes('score') && (
                  <div className="flex items-center space-x-1 col-span-2">
                    <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="dark:text-white">
                      Average score: {activity.tooltip.match(/Avg score: ([\d\.]+)%/)?.[1] || '0'}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Generate the activity calendar visualization based on selected timeframe
  const generateActivityCalendar = () => {
    // If no data is available and we're not loading, show a message
    if (activityCells.length === 0 && !loading) {
      return (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500 dark:text-gray-400">No activity data available for this time period.</p>
        </div>
      );
    }
    
    if (activeTimeFrame === 'year') {
      return renderYearlyCalendar();
    } else if (activeTimeFrame === 'month') {
      return renderMonthlyCalendar();
    } else {
      return renderWeeklyView();
    }
  };
    
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
          <div className="flex space-x-1 sm:space-x-2">
            <Button 
              variant={activeTimeFrame === 'week' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTimeFrame('week')}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              Week
            </Button>
            <Button 
              variant={activeTimeFrame === 'month' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTimeFrame('month')}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              Month
            </Button>
            <Button 
              variant={activeTimeFrame === 'year' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTimeFrame('year')}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              Year
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-6">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            {generateActivityCalendar()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;