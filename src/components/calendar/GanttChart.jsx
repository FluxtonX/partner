import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarEvent, Project, Client, User } from '@/api/entities';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, differenceInDays, addDays, isWithinInterval } from 'date-fns';
import { Calendar, Clock, User as UserIcon, Building2 } from 'lucide-react';

export default function GanttChart({ currentWeek, users }) {
  const [projectEvents, setProjectEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    loadGanttData();
  }, [currentWeek]);

  const loadGanttData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, projectsData, clientsData] = await Promise.all([
        CalendarEvent.filter({ event_type: 'task' }),
        Project.list(),
        Client.list()
      ]);

      // Group events by project and calculate project timelines
      const projectEventMap = {};
      eventsData.forEach(event => {
        if (event.project_id) {
          if (!projectEventMap[event.project_id]) {
            projectEventMap[event.project_id] = [];
          }
          projectEventMap[event.project_id].push(event);
        }
      });

      // Create project timeline data
      const projectTimelines = Object.entries(projectEventMap).map(([projectId, events]) => {
        const project = projectsData.find(p => p.id === projectId);
        if (!project) return null;

        const eventDates = events.map(e => parseISO(e.start_time));
        const startDate = new Date(Math.min(...eventDates));
        const endDates = events.map(e => parseISO(e.end_time));
        const endDate = new Date(Math.max(...endDates));

        // Calculate progress based on completed events
        const completedEvents = events.filter(e => e.status === 'completed');
        const progress = events.length > 0 ? (completedEvents.length / events.length) * 100 : 0;

        // Get assigned users
        const assignedUsers = [...new Set(events.map(e => e.user_email))];

        return {
          project,
          events,
          startDate,
          endDate,
          progress,
          assignedUsers,
          totalHours: events.reduce((sum, e) => {
            const start = parseISO(e.start_time);
            const end = parseISO(e.end_time);
            return sum + ((end - start) / (1000 * 60 * 60)); // Convert to hours
          }, 0)
        };
      }).filter(Boolean);

      setProjectEvents(projectTimelines);
      setProjects(projectsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading Gantt data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectsInWeek = () => {
    return projectEvents.filter(projectData => {
      return isWithinInterval(projectData.startDate, { start: weekStart, end: weekEnd }) ||
             isWithinInterval(projectData.endDate, { start: weekStart, end: weekEnd }) ||
             (projectData.startDate <= weekStart && projectData.endDate >= weekEnd);
    });
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.company_name || client?.contact_person || 'Unknown Client';
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'estimate': return 'bg-amber-500';
      case 'active': return 'bg-emerald-500';
      case 'service': return 'bg-blue-500';
      case 'completed': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const calculateBarPosition = (startDate, endDate) => {
    const totalWeekDays = 7;
    const weekStartTime = weekStart.getTime();
    const weekEndTime = weekEnd.getTime();
    const weekDuration = weekEndTime - weekStartTime;

    const projectStartTime = Math.max(startDate.getTime(), weekStartTime);
    const projectEndTime = Math.min(endDate.getTime(), weekEndTime);

    const leftPercent = ((projectStartTime - weekStartTime) / weekDuration) * 100;
    const widthPercent = ((projectEndTime - projectStartTime) / weekDuration) * 100;

    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `${Math.max(1, widthPercent)}%`
    };
  };

  const projectsInWeek = getProjectsInWeek();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading project timeline...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Project Timeline - {format(weekStart, 'MMM d')} to {format(weekEnd, 'MMM d, yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projectsInWeek.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No scheduled projects for this week
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timeline Header */}
            <div className="relative">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="text-center text-sm font-medium text-slate-600 p-2">
                    <div>{format(day, 'EEE')}</div>
                    <div className="text-lg font-bold">{format(day, 'd')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Bars */}
            <div className="space-y-4">
              {projectsInWeek.map((projectData) => {
                const barPosition = calculateBarPosition(projectData.startDate, projectData.endDate);
                
                return (
                  <div key={projectData.project.id} className="relative">
                    {/* Project Info */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(projectData.project.status)}`}></div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{projectData.project.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              <span>{getClientName(projectData.project.client_id)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{Math.round(projectData.totalHours)}h total</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <UserIcon className="w-4 h-4" />
                              <span>{projectData.assignedUsers.length} assigned</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Progress value={projectData.progress} className="w-20 mb-1" />
                        <span className="text-xs text-slate-600">{Math.round(projectData.progress)}% complete</span>
                      </div>
                    </div>

                    {/* Timeline Bar */}
                    <div className="relative h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <div 
                        className={`absolute top-0 h-full ${getStatusColor(projectData.project.status)} opacity-80 rounded-lg flex items-center justify-center`}
                        style={barPosition}
                      >
                        <span className="text-white text-xs font-medium px-2 truncate">
                          {projectData.events.length} tasks
                        </span>
                      </div>
                      
                      {/* Progress overlay */}
                      {projectData.progress > 0 && (
                        <div 
                          className="absolute top-0 h-full bg-white bg-opacity-40 rounded-lg"
                          style={{
                            ...barPosition,
                            width: `${parseFloat(barPosition.width) * (projectData.progress / 100)}%`
                          }}
                        />
                      )}
                    </div>

                    {/* Assigned Users */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500">Assigned to:</span>
                      <div className="flex flex-wrap gap-1">
                        {projectData.assignedUsers.slice(0, 3).map(userEmail => (
                          <Badge key={userEmail} variant="outline" className="text-xs">
                            {getUserName(userEmail)}
                          </Badge>
                        ))}
                        {projectData.assignedUsers.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{projectData.assignedUsers.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}