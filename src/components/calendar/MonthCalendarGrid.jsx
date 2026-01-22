import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isWithinInterval } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Briefcase, Plane, Wrench, Check, X, Clock, User, Calendar as CalendarIcon, Coffee } from 'lucide-react';

export default function MonthCalendarGrid({ 
  currentMonth, 
  events = [], 
  tasks = [], 
  timeOff = [], 
  calendarBlocks = [],
  assetLogs = [],
  users = [],
  onTimeOffAction,
  currentUser
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner');

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name?.split(' ')[0] || email.split('@')[0]; // First name or email prefix
  };

  const getBlockTypeIcon = (blockType) => {
    const icons = {
      unavailable: <X className="w-3 h-3" />,
      personal: <User className="w-3 h-3" />,
      training: <Coffee className="w-3 h-3" />,
      meeting: <CalendarIcon className="w-3 h-3" />,
      travel: <Truck className="w-3 h-3" />,
      other: <Clock className="w-3 h-3" />
    };
    return icons[blockType] || icons.other;
  };

  const getBlockTypeColor = (blockType) => {
    const colors = {
      unavailable: 'bg-red-100 border-red-200 text-red-800',
      personal: 'bg-purple-100 border-purple-200 text-purple-800',
      training: 'bg-blue-100 border-blue-200 text-blue-800',
      meeting: 'bg-indigo-100 border-indigo-200 text-indigo-800',
      travel: 'bg-yellow-100 border-yellow-200 text-yellow-800',
      other: 'bg-orange-100 border-orange-200 text-orange-800'
    };
    return colors[blockType] || colors.other;
  };

  const renderDays = () => {
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        
        // Safely filter events with null checks
        const dayEvents = Array.isArray(events) 
          ? events.filter(e => e && e.start_time && isSameDay(new Date(e.start_time), cloneDay))
          : [];
          
        const dayTasks = Array.isArray(tasks) 
          ? tasks.filter(t => t && t.due_date && isSameDay(new Date(t.due_date), cloneDay))
          : [];
          
        // Check for time off requests that span this day
        const dayTimeOff = Array.isArray(timeOff) 
          ? timeOff.filter(t => t && t.start_date && t.end_date && 
              isWithinInterval(cloneDay, { 
                start: new Date(t.start_date), 
                end: new Date(t.end_date) 
              }))
          : [];

        // Check for calendar blocks that span this day
        const dayCalendarBlocks = Array.isArray(calendarBlocks)
          ? calendarBlocks.filter(block => block && block.start_date && block.end_date &&
              isWithinInterval(cloneDay, {
                start: new Date(block.start_date),
                end: new Date(block.end_date)
              }))
          : [];
          
        const dayAssetLogs = Array.isArray(assetLogs) 
          ? assetLogs.filter(log => log && log.checkout_date && 
              cloneDay >= new Date(log.checkout_date) && 
              (!log.checkin_date || cloneDay <= new Date(log.checkin_date)))
          : [];

        days.push(
          <div
            key={day}
            className={`flex-1 border-r border-b p-2 min-h-[120px] ${
              !isSameMonth(day, monthStart) ? 'bg-slate-50 text-slate-400' : 'bg-white'
            } ${isSameDay(day, new Date()) ? 'ring-2 ring-emerald-500' : ''}`}
          >
            <div className="font-semibold text-right mb-1">{format(day, 'd')}</div>
            <div className="space-y-1">
              {/* Tasks */}
              {dayTasks.map(task => (
                <Badge key={`task-${task.id}`} variant="outline" className="w-full text-xs bg-blue-50 border-blue-200 text-blue-800 block truncate">
                  <Wrench className="w-3 h-3 mr-1" /> {task.title}
                </Badge>
              ))}

              {/* Events */}
              {dayEvents.map(event => (
                <Badge key={`event-${event.id}`} variant="outline" className="w-full text-xs bg-purple-50 border-purple-200 text-purple-800 block truncate">
                  <Briefcase className="w-3 h-3 mr-1" /> {event.title}
                </Badge>
              ))}

              {/* Time Off Requests */}
              {dayTimeOff.map(req => (
                <div key={`timeoff-${req.id}`} className="text-xs">
                  <Badge variant="outline" className="w-full bg-green-50 border-green-200 text-green-800 block">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Plane className="w-3 h-3 mr-1" />
                        <span className="truncate">{getUserName(req.user_email)} - {req.request_type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </Badge>
                </div>
              ))}

              {/* Calendar Blocks */}
              {dayCalendarBlocks.map(block => (
                <div key={`block-${block.id}`} className="text-xs">
                  <Badge variant="outline" className={`w-full block ${getBlockTypeColor(block.block_type)}`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {getBlockTypeIcon(block.block_type)}
                        <span className="ml-1 truncate">
                          {getUserName(block.user_email)} - {block.title}
                        </span>
                      </div>
                    </div>
                  </Badge>
                  {!block.visible_to_team && (
                    <div className="text-xs text-gray-400 mt-1">Private</div>
                  )}
                </div>
              ))}

              {/* Asset Logs */}
              {dayAssetLogs.map(log => (
                <Badge key={`asset-${log.id}`} variant="outline" className="w-full text-xs bg-gray-100 border-gray-300 text-gray-700 block truncate">
                  <Truck className="w-3 h-3 mr-1" /> {getUserName(log.user_email)} - Asset Out
                </Badge>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex border-b">
          {dayNames.map(name => (
            <div key={name} className="flex-1 text-center font-bold p-2 text-sm text-slate-600">{name}</div>
          ))}
        </div>
        <div className="border-l border-t">{renderDays()}</div>
      </CardContent>
    </Card>
  );
}