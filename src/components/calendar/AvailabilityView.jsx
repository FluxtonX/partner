import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isWithinInterval, startOfWeek, addDays } from 'date-fns';
import { User, Clock, AlertCircle } from 'lucide-react';

export default function AvailabilityView({ users = [], events = [], currentWeek, selectedUser, isLoading }) {
  const weekStart = startOfWeek(currentWeek || new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const getUserEvents = (userEmail, day) => {
    if (!Array.isArray(events)) return [];
    return events.filter(event => {
      if (event.user_email !== userEmail) return false;
      try {
        const eventStart = parseISO(event.start_time);
        const eventEnd = parseISO(event.end_time);
        return isWithinInterval(day, { start: eventStart, end: eventEnd }) ||
               format(eventStart, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      } catch (e) {
        return false;
      }
    });
  };

  const getAvailabilityStatus = (userEmail, day) => {
    const userEvents = getUserEvents(userEmail, day);
    const blockedEvents = userEvents.filter(e => e.event_type === 'blocked_time');
    const totalEvents = userEvents.length;

    if (blockedEvents.length > 0) return 'blocked';
    if (totalEvents >= 3) return 'busy';
    if (totalEvents > 0) return 'partial';
    return 'available';
  };

  const statusColors = {
    available: 'bg-green-100 text-green-800 border-green-200',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    busy: 'bg-orange-100 text-orange-800 border-orange-200',
    blocked: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusLabels = {
    available: 'Available',
    partial: 'Partially Booked',
    busy: 'Busy',
    blocked: 'Blocked'
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="h-4 bg-slate-200 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-7 gap-2">
                {Array(7).fill(0).map((_, j) => (
                  <div key={j} className="h-8 bg-slate-100 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-500 mb-2">No users found</h3>
        <p className="text-slate-400">Add team members to see their availability</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(users || []).map(user => (
        <Card key={user.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {user.full_name || user.email}
              <Badge variant="outline" className="ml-auto">
                {user.role}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, dayIndex) => {
                const status = getAvailabilityStatus(user.email, day);
                const dayEvents = getUserEvents(user.email, day);
                
                return (
                  <div key={dayIndex} className="text-center">
                    <div className="text-xs font-medium text-slate-600 mb-1">
                      {format(day, 'EEE d')}
                    </div>
                    <div className={`p-2 rounded-lg border text-xs font-medium ${statusColors[status]}`}>
                      {statusLabels[status]}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {(dayEvents || []).slice(0, 2).map(event => (
                          <div key={event.id} className="text-xs text-slate-500 truncate">
                            {format(parseISO(event.start_time), 'HH:mm')} - {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-slate-400">
                            + {dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}