import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, X, CheckSquare, Wrench } from "lucide-react";
import { format, addHours, startOfHour, isWithinInterval, parseISO } from 'date-fns';
import { UserTask, CalendarEvent, Project } from '@/api/entities';

export default function TaskScheduler({ tasks = [], users = [], projects = [], events = [], currentWeek, onSchedule, onCancel }) {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [schedulableItems, setSchedulableItems] = useState([]);

  // Load all active projects and their labor items
  useEffect(() => {
    loadSchedulableItems();
  }, []);

  const loadSchedulableItems = async () => {
    try {
      // Get all active projects
      const activeProjects = await Project.filter({ status: 'active' });
      setAllProjects(activeProjects || []);
      
      // Create schedulable items from project labor line items and existing tasks
      const items = [];
      
      // Add labor items from active projects
      (activeProjects || []).forEach(project => {
        if (project.line_items && Array.isArray(project.line_items)) {
          project.line_items
            .filter(item => item.type === 'labor')
            .forEach(lineItem => {
              items.push({
                id: `${project.id}-${lineItem.id}`,
                type: 'line_item',
                title: lineItem.description,
                description: lineItem.description,
                project_id: project.id,
                project_title: project.title,
                line_item_id: lineItem.id,
                estimated_hours: (lineItem.hours || 1) * (lineItem.quantity || 1),
                required_labor_type: lineItem.required_labor_type_name,
                priority: project.priority || 'medium',
                line_item: lineItem
              });
            });
        }
      });
      
      // Add existing unscheduled tasks
      const safeEvents = Array.isArray(events) ? events : [];
      const safeTasks = Array.isArray(tasks) ? tasks : [];
      const unscheduledTasks = safeTasks.filter(task => {
        const scheduledEventsForTask = safeEvents.filter(e => e.task_id === task.id);
        if (scheduledEventsForTask.length === 0) return true;
        const scheduledUserEmails = new Set(scheduledEventsForTask.map(e => e.user_email));
        return Array.isArray(task.assigned_to) && task.assigned_to.some(email => !scheduledUserEmails.has(email));
      });
      
      unscheduledTasks.forEach(task => {
        items.push({
          id: task.id,
          type: 'task',
          title: task.title,
          description: task.description,
          project_id: task.project_id,
          project_title: getProjectName(task.project_id),
          estimated_hours: task.estimated_hours || 1,
          priority: task.priority || 'medium',
          assigned_to: task.assigned_to || [],
          task: task
        });
      });
      
      setSchedulableItems(items);
    } catch (error) {
      console.error('Error loading schedulable items:', error);
      setSchedulableItems([]);
    }
  };

  useEffect(() => {
    if (selectedItemId) {
      const item = schedulableItems.find(i => i.id === selectedItemId);
      setSelectedItem(item);
      
      // If it's an existing task with only one assignee, pre-select them
      if (item?.type === 'task' && item.assigned_to?.length === 1) {
        setSelectedUserEmail(item.assigned_to[0]);
      } else {
        setSelectedUserEmail('');
      }
    } else {
      setSelectedItem(null);
      setSelectedUserEmail('');
    }
    setAvailableSlots([]);
    setSelectedSlot('');
  }, [selectedItemId, schedulableItems]);

  useEffect(() => {
    if (selectedItem && selectedUserEmail) {
      generateAvailableSlots(selectedItem, selectedUserEmail);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedUserEmail, events]);

  const generateAvailableSlots = (item, userEmail) => {
    const safeEvents = Array.isArray(events) ? events : [];
    const userEvents = safeEvents.filter(e => e.user_email === userEmail);
    const slots = [];
    const now = new Date();
    
    for (let day = 0; day < 14; day++) { // Look ahead 2 weeks
      const currentDay = new Date(now);
      currentDay.setDate(now.getDate() + day);
      if (currentDay.getDay() === 0 || currentDay.getDay() === 6) continue; // Skip weekends
      
      for (let hour = 8; hour < 17; hour++) {
        const slotStart = new Date(currentDay);
        slotStart.setHours(hour, 0, 0, 0);
        const estimatedHours = item.estimated_hours || 1;
        const slotEnd = addHours(slotStart, estimatedHours);
        
        const hasConflict = userEvents.some(event => {
          try {
            const eventStart = parseISO(event.start_time);
            const eventEnd = parseISO(event.end_time);
            return (
              isWithinInterval(slotStart, { start: eventStart, end: eventEnd }) ||
              isWithinInterval(slotEnd, { start: eventStart, end: eventEnd }) ||
              (slotStart <= eventStart && slotEnd >= eventEnd)
            );
          } catch (e) {
            return false;
          }
        });
        
        if (!hasConflict && slotStart > now) {
          slots.push({
            id: `${slotStart.getTime()}`,
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            display: `${format(slotStart, 'EEE, MMM d')} at ${format(slotStart, 'h:mm a')} - ${format(slotEnd, 'h:mm a')}`
          });
        }
      }
    }
    setAvailableSlots(slots.slice(0, 20));
  };

  const handleSchedule = async () => {
    if (!selectedItemId || !selectedUserEmail || !selectedSlot) return;
    
    setIsScheduling(true);
    try {
      const slot = availableSlots.find(s => s.id === selectedSlot);
      if (!slot) return;
      
      if (selectedItem.type === 'line_item') {
        // Create a task first, then schedule it
        const taskData = {
          title: selectedItem.title,
          description: selectedItem.description,
          project_id: selectedItem.project_id,
          product_service_id: selectedItem.line_item.product_service_id,
          line_item_id: selectedItem.line_item_id,
          estimated_hours: selectedItem.estimated_hours,
          assigned_to: [selectedUserEmail],
          status: 'not_started',
          priority: selectedItem.priority
        };
        
        const newTask = await UserTask.create(taskData);
        
        // Create calendar event for the new task
        const eventData = {
          title: selectedItem.title,
          description: selectedItem.description,
          user_email: selectedUserEmail,
          project_id: selectedItem.project_id,
          task_id: newTask.id,
          start_time: slot.start,
          end_time: slot.end,
          event_type: 'task',
          status: 'scheduled'
        };
        
        await CalendarEvent.create(eventData);
      } else {
        // Schedule existing task
        if (onSchedule) {
          await onSchedule(selectedItem.id, selectedUserEmail, {
            start: slot.start,
            end: slot.end
          });
        }
      }
      
      if (onCancel) onCancel(); // Close the dialog
    } catch (error) {
      console.error('Error scheduling item:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const getProjectName = (projectId) => {
    const project = (allProjects || []).find(p => p.id === projectId) || 
                    (projects || []).find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  const getUserName = (email) => {
    if (!Array.isArray(users)) return email;
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const getItemPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const getAvailableUsers = () => {
    if (selectedItem?.type === 'task' && selectedItem.assigned_to) {
      // For existing tasks, only show assigned users
      return (users || []).filter(user => selectedItem.assigned_to.includes(user.email));
    } else if (selectedItem?.required_labor_type) {
      // For line items, filter by required labor type
      return (users || []).filter(user => 
        user.primary_labor_type === selectedItem.required_labor_type
      );
    } else {
      // Show all users if no specific requirement
      return users || [];
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Work
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Item Selection */}
          <div className="space-y-2">
            <Label>Select Work to Schedule</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose work to schedule..." />
              </SelectTrigger>
              <SelectContent>
                {schedulableItems.length > 0 ? (
                  schedulableItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2 w-full">
                        {item.type === 'line_item' ? (
                          <Wrench className="w-4 h-4" />
                        ) : (
                          <CheckSquare className="w-4 h-4" />
                        )}
                        <div className="flex flex-col">
                          <span className="truncate">{item.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.project_title} • {item.estimated_hours}h
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-items" disabled>
                    No work available to schedule
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Item Details & User Selection */}
          {selectedItem && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{selectedItem.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getItemPriorityColor(selectedItem.priority)}>
                        {selectedItem.priority}
                      </Badge>
                      <Badge variant="outline">
                        {selectedItem.type === 'line_item' ? 'Project Work' : 'Task'}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Project: {selectedItem.project_title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Estimated Duration: {selectedItem.estimated_hours} hours
                  </div>
                  {selectedItem.required_labor_type && (
                    <div className="text-sm text-muted-foreground">
                      Required Skill: {selectedItem.required_labor_type}
                    </div>
                  )}
                  {selectedItem.type === 'task' && selectedItem.assigned_to?.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Assigned to: {selectedItem.assigned_to.map(email => getUserName(email)).join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Schedule for User</Label>
                <Select value={selectedUserEmail} onValueChange={setSelectedUserEmail}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user to schedule..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableUsers().map(user => (
                      <SelectItem key={user.email} value={user.email}>
                        <div className="flex flex-col">
                          <span>{getUserName(user.email)}</span>
                          {user.primary_labor_type && (
                            <span className="text-xs text-muted-foreground">
                              {user.primary_labor_type}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                    {getAvailableUsers().length === 0 && (
                      <SelectItem value="no-users" disabled>
                        No suitable users available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Available Time Slots */}
          {selectedUserEmail && (
            <div className="space-y-2">
              <Label>Available Time Slots for {getUserName(selectedUserEmail)}</Label>
              <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an available time slot..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.length > 0 ? (
                    availableSlots.map(slot => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.display}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-slots" disabled>
                      No available slots found for this user
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isScheduling}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSchedule} 
            disabled={!selectedItemId || !selectedUserEmail || !selectedSlot || isScheduling} 
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {isScheduling ? 'Scheduling...' : 'Schedule Work'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}