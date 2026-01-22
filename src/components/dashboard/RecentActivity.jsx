import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, FolderOpen, User, ExternalLink } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RecentActivity({ communications, projects, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Safe date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      if (isValid(date)) {
        return format(date, 'MMM d, h:mm a');
      }
      return 'Recently';
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Recently';
    }
  };

  // Combine and sort recent activities
  const recentActivities = [
    ...communications.slice(0, 3).map(comm => ({
      id: `comm-${comm.id}`,
      type: 'communication',
      title: comm.message,
      subtitle: 'Communication update',
      date: comm.created_date,
      icon: MessageSquare,
      color: 'bg-blue-500',
      linkTo: comm.project_id ? createPageUrl(`ProjectDetail?id=${comm.project_id}`) : null
    })),
    ...projects.filter(p => p.updated_date).slice(0, 3).map(project => ({
      id: `project-${project.id}`,
      type: 'project',
      title: project.title,
      subtitle: `Project ${project.status}`,
      date: project.updated_date,
      icon: FolderOpen,
      color: project.status === 'completed' ? 'bg-green-500' : project.status === 'active' ? 'bg-orange-500' : 'bg-slate-500',
      linkTo: createPageUrl(`ProjectDetail?id=${project.id}`)
    }))
  ].sort((a, b) => {
    try {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    } catch (error) {
      return 0;
    }
  }).slice(0, 5);

  const statusColors = {
    active: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    estimate: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800"
  };

  const ActivityItem = ({ activity }) => {
    const content = (
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50/70 transition-colors group cursor-pointer">
        <div className={`w-8 h-8 rounded-full ${activity.color} flex items-center justify-center flex-shrink-0`}>
          <activity.icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{activity.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-slate-500">{activity.subtitle}</p>
            {activity.type === 'project' && (
              <Badge className={`${statusColors[projects.find(p => `project-${p.id}` === activity.id)?.status] || statusColors.active} text-xs`}>
                {projects.find(p => `project-${p.id}` === activity.id)?.status || 'active'}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400 flex-shrink-0">
            {formatDate(activity.date)}
          </div>
          {activity.linkTo && (
            <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
    );

    if (activity.linkTo) {
      return (
        <Link key={activity.id} to={activity.linkTo}>
          {content}
        </Link>
      );
    }

    return <div key={activity.id}>{content}</div>;
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivities.length > 0 ? (
          <div className="space-y-1">
            {recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}