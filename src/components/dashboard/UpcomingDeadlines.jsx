
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { format, differenceInDays } from "date-fns"; // 'format' kept for potential use by safeFormatDate, differenceInDays added
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Added Button import
import { createPageUrl } from "@/utils";
import { safeFormatDate } from '@/components/lib/formatters';

export default function UpcomingDeadlines({ projects, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="w-16 h-6 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Updated filtering and sorting logic
  const upcomingProjects = projects
    .filter(p => p.status === 'active' && p.estimated_completion && p.estimated_completion !== 'TBD' && new Date(p.estimated_completion) >= new Date())
    .sort((a, b) => {
      // Ensure dates are valid for sorting
      const dateA = new Date(a.estimated_completion);
      const dateB = new Date(b.estimated_completion);
      // Handle invalid dates in sorting by pushing them to the end
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  // New formatDate using safeFormatDate
  const formatDate = (dateString) => {
    return safeFormatDate(dateString, 'MMM dd');
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingProjects.length > 0 ? (
          <div className="space-y-4">
            {upcomingProjects.map((project) => {
              const today = new Date();
              const completionDate = new Date(project.estimated_completion);
              const daysLeft = differenceInDays(completionDate, today);
              const isDueSoon = daysLeft <= 7;
              
              return (
                <div key={project.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50/70 transition-colors">
                  <div className={`w-12 h-12 flex-shrink-0 rounded-lg flex flex-col items-center justify-center ${isDueSoon ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                    <span className="text-sm font-bold">{formatDate(project.estimated_completion)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{project.title}</p>
                    <p className={`text-sm ${isDueSoon ? 'text-amber-600 font-semibold' : 'text-slate-500'}`}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
                    </p>
                  </div>
                  <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No upcoming deadlines</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
