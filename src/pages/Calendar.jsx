
import React, { useState, useEffect } from 'react';
import { CalendarEvent, UserTask, User, Project, TimeOffRequest, AssetAssignmentLog, ProductOrService, Alert, CalendarBlock } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { toast } from "sonner";

import MonthCalendarGrid from '../components/calendar/MonthCalendarGrid';
import TaskForm from '../components/calendar/TaskForm';
import EventForm from '../components/calendar/EventForm';
import TimeOffRequestCard from '../components/calendar/TimeOffRequestCard';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [calendarBlocks, setCalendarBlocks] = useState([]);
  const [assetLogs, setAssetLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTimeOffSidebar, setShowTimeOffSidebar] = useState(false);

  useEffect(() => {
    loadData();
    getCurrentUser();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, tasksData, usersData, projectsData, timeOffData, assetLogData, productsData, calendarBlocksData] = await Promise.all([
        CalendarEvent.list('-start_time'),
        UserTask.list('-created_date'),
        User.list(),
        Project.list(),
        TimeOffRequest.list('-created_date'), // Fetch all time off requests, not just approved ones
        AssetAssignmentLog.list(),
        ProductOrService.list(),
        CalendarBlock.list('-created_date')
      ]);
      
      // Ensure all data is properly set as arrays with fallbacks
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setTimeOffRequests(Array.isArray(timeOffData) ? timeOffData : []);
      setAssetLogs(Array.isArray(assetLogData) ? assetLogData : []);
      setCalendarBlocks(Array.isArray(calendarBlocksData) ? calendarBlocksData : []);

    } catch (error) {
      console.error('Error loading calendar data:', error);
      // Set empty arrays on error to prevent iteration issues
      setEvents([]);
      setTasks([]);
      setUsers([]);
      setProjects([]);
      setProducts([]);
      setTimeOffRequests([]);
      setAssetLogs([]);
      setCalendarBlocks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      setCurrentUser(null);
    }
  };

  const handleFormSubmit = async (entity, data, isEditing, id) => {
    try {
      if (isEditing) {
        await entity.update(id, data);
      } else {
        await entity.create(data);
      }
      setShowEventForm(false);
      setShowTaskForm(false);
      setEditingEvent(null);
      setEditingTask(null);
      loadData();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleTimeOffApproval = async (requestId, status, notes = '') => {
    try {
      const request = timeOffRequests.find(r => r.id === requestId);
      if (!request) return;

      // Update the time off request
      await TimeOffRequest.update(requestId, {
        status: status,
        approved_by: currentUser?.email || 'system', // Use currentUser email if available, otherwise system
        approval_date: new Date().toISOString(),
        approval_notes: notes
      });

      // Create alert for the requesting user
      const alertMessage = status === 'approved' 
        ? `Your time off request for ${format(new Date(request.start_date), 'MMM d, yyyy')} to ${format(new Date(request.end_date), 'MMM d, yyyy')} has been approved.`
        : `Your time off request for ${format(new Date(request.start_date), 'MMM d, yyyy')} to ${format(new Date(request.end_date), 'MMM d, yyyy')} has been denied.${notes ? ` Reason: ${notes}` : ''}`;

      await Alert.create({
        user_email: request.user_email,
        title: `Time Off Request ${status === 'approved' ? 'Approved' : 'Denied'}`,
        message: alertMessage,
        type: 'other',
        priority: 'medium'
      });

      toast.success(`Time off request ${status} successfully`);
      loadData(); // Refresh data

    } catch (error) {
      console.error('Error handling time off approval:', error);
      toast.error(`Failed to ${status} time off request`);
    }
  };

  const handleTimeOffDeletion = async (requestId) => {
    try {
      await TimeOffRequest.delete(requestId);
      toast.success('Time off request deleted successfully');
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error deleting time off request:', error);
      toast.error('Failed to delete time off request');
    }
  };

  const handleEventDeletion = async (eventId) => {
    try {
      await CalendarEvent.delete(eventId);
      toast.success('Event deleted successfully');
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleTaskDeletion = async (taskId) => {
    try {
      await UserTask.delete(taskId);
      toast.success('Task deleted successfully');
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Filter data based on selected user with proper null checks
  const filterByUser = (items, userField) => {
    if (!Array.isArray(items)) return [];
    if (selectedUser === 'all') return items;
    return items.filter(item => {
      if (!item || !item[userField]) return false;
      return Array.isArray(item[userField]) 
        ? item[userField].includes(selectedUser) 
        : item[userField] === selectedUser;
    });
  };
  
  // Filtered data for the calendar grid
  const filteredEvents = filterByUser(events, 'user_email');
  const filteredTasks = filterByUser(tasks, 'assigned_to');
  
  // For calendar display, we show approved time off requests and active calendar blocks
  const approvedTimeOffRequests = timeOffRequests.filter(request => request.status === 'approved');
  const activeCalendarBlocks = calendarBlocks.filter(block => block.status === 'active');
  
  const filteredTimeOff = filterByUser(approvedTimeOffRequests, 'user_email');
  const filteredCalendarBlocks = filterByUser(activeCalendarBlocks, 'user_email');
  const filteredAssetLogs = filterByUser(assetLogs, 'user_email');

  // Get pending time off requests for admin view
  const pendingTimeOffRequests = timeOffRequests.filter(request => request.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-slate-700" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Calendar & Scheduling</h1>
              <p className="text-slate-600">Monthly overview of tasks, events, availability, and time off.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-slate-800">{format(currentMonth, 'MMMM yyyy')}</h2>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.email}>{user.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {pendingTimeOffRequests.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setShowTimeOffSidebar(true)}
                className="relative"
              >
                Time Off Requests
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingTimeOffRequests.length}
                </div>
              </Button>
            )}
            <Button onClick={() => setShowTaskForm(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> New Task
            </Button>
            <Button onClick={() => setShowEventForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> New Event
            </Button>
          </div>
        </div>

        {/* Calendar Legend */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 p-4 mb-6">
          <h3 className="font-semibold text-sm text-slate-700 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
              <span>Tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
              <span>Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Vacation/Time Off</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
              <span>Blocked Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Asset Usage</span>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Calendar */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="ml-3 text-slate-600">Loading calendar...</p>
              </div>
            ) : (
              <MonthCalendarGrid
                currentMonth={currentMonth}
                events={filteredEvents}
                tasks={filteredTasks}
                timeOff={filteredTimeOff}
                calendarBlocks={filteredCalendarBlocks}
                assetLogs={filteredAssetLogs}
                users={users}
                onTimeOffAction={handleTimeOffApproval}
                onEventDelete={handleEventDeletion}
                onTaskDelete={handleTaskDeletion}
                currentUser={currentUser}
              />
            )}
          </div>

          {/* Time Off Requests Sidebar */}
          {showTimeOffSidebar && (
            <div className="w-80 bg-white rounded-lg border shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pending Time Off Requests</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowTimeOffSidebar(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingTimeOffRequests.map(request => (
                  <TimeOffRequestCard
                    key={request.id}
                    request={request}
                    users={users}
                    onApproval={handleTimeOffApproval}
                    onDelete={handleTimeOffDeletion}
                    currentUser={currentUser}
                  />
                ))}
                {pendingTimeOffRequests.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">No pending requests.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {showEventForm && (
          <EventForm
            event={editingEvent}
            users={users}
            projects={projects}
            currentUser={currentUser}
            onSubmit={(data) => handleFormSubmit(CalendarEvent, data, !!editingEvent, editingEvent?.id)}
            onCancel={() => { setShowEventForm(false); setEditingEvent(null); }}
          />
        )}

        {showTaskForm && (
          <TaskForm
            task={editingTask}
            users={users}
            projects={projects}
            products={products}
            currentUser={currentUser}
            onSubmit={(data) => handleFormSubmit(UserTask, data, !!editingTask, editingTask?.id)}
            onCancel={() => { setShowTaskForm(false); setEditingTask(null); }}
          />
        )}
      </div>
    </div>
  );
}
