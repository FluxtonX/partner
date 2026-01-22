
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, X, CheckSquare, Wrench, Route, AlertTriangle } from "lucide-react";
import { format, addHours, startOfHour, isWithinInterval, parseISO, addMinutes } from 'date-fns';
import { UserTask, CalendarEvent, Project, BusinessSettings } from '@/api/entities';
import { calculateDriveTime } from '@/api/functions';
import { calculateTaskTime } from '@/api/functions'; // New import
import DriveTimeCalculator from './DriveTimeCalculator';

export default function EnhancedTaskScheduler({ tasks = [], users = [], projects = [], events = [], currentWeek, onSchedule, onCancel }) {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [schedulableItems, setSchedulableItems] = useState([]);
  const [driveTimeData, setDriveTimeData] = useState(null);
  const [businessAddress, setBusinessAddress] = useState('');
  const [showDriveTimeWarning, setShowDriveTimeWarning] = useState(false);
  const [taskTimeData, setTaskTimeData] = useState(null); // New state
  const [taskType, setTaskType] = useState('standard'); // New state

  useEffect(() => {
    loadSchedulableItems();
    loadBusinessAddress();
  }, []);

  const loadBusinessAddress = async () => {
    try {
      const businessSettings = await BusinessSettings.list();
      if (businessSettings.length > 0 && businessSettings[0].business_address) {
        setBusinessAddress(businessSettings[0].business_address);
      }
    } catch (error) {
      console.error('Error loading business address:', error);
    }
  };

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
                project_address: project.site_address,
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
        const project = activeProjects?.find(p => p.id === task.project_id);
        items.push({
          id: task.id,
          type: 'task',
          title: task.title,
          description: task.description,
          project_id: task.project_id,
          project_title: getProjectName(task.project_id),
          project_address: project?.site_address,
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
      setDriveTimeData(null); // Reset drive time data
      setTaskTimeData(null); // Reset task time data
      setShowDriveTimeWarning(false);
      
      // If it's an existing task with only one assignee, pre-select them
      if (item?.type === 'task' && item.assigned_to?.length === 1) {
        setSelectedUserEmail(item.assigned_to[0]);
      } else {
        setSelectedUserEmail('');
      }
    } else {
      setSelectedItem(null);
      setSelectedUserEmail('');
      setDriveTimeData(null);
      setTaskTimeData(null); // Reset task time data
      setShowDriveTimeWarning(false);
    }
    setAvailableSlots([]);
    setSelectedSlot('');
  }, [selectedItemId, schedulableItems]);

  // New useEffect to trigger calculateAdjustedTaskTime
  useEffect(() => {
    if (selectedItem && selectedUserEmail && businessAddress) {
      calculateAdjustedTaskTime();
    } else {
      setTaskTimeData(null);
    }
  }, [selectedItem, selectedUserEmail, taskType, businessAddress, users]); // Added 'users' as dependency

  const calculateAdjustedTaskTime = async () => {
    if (!selectedItem || !selectedUserEmail || !businessAddress) {
      setTaskTimeData(null);
      return;
    }

    try {
      // Determine the assigned users for the calculation
      // If it's an existing task, use its assigned_to property to get user emails, then find user objects.
      // If it's a new task (from line item), it's initially for the selected user, so find that user object.
      const assignedUserEmails = selectedItem.type === 'task' && selectedItem.assigned_to && selectedItem.assigned_to.length > 0
        ? selectedItem.assigned_to
        : [selectedUserEmail];

      const assignedUserObjects = assignedUserEmails
         .map(email => users.find(u => u.email === email))
         .filter(Boolean); // Filter out any undefined if user not found

      if (assignedUserObjects.length === 0) {
        setTaskTimeData(null);
        return;
      }

      const result = await calculateTaskTime({
        estimatedHours: selectedItem.estimated_hours || 1,
        assignedUsers: assignedUserObjects, // Pass user objects
        businessAddress,
        projectAddress: selectedItem.project_address,
        taskType
      });

      if (result && result.data) {
        setTaskTimeData(result.data);
      } else {
        setTaskTimeData(null);
      }
    } catch (error) {
      console.error('Error calculating adjusted task time:', error);
      setTaskTimeData(null);
    }
  };

  const calculateDriveTimeForTask = async () => {
    if (!selectedItem?.project_address || !businessAddress || !selectedUserEmail) {
      return;
    }

    try {
      const response = await calculateDriveTime({
        businessAddress,
        projectAddress: selectedItem.project_address,
        assignedUsers: [selectedUserEmail]
      });

      if (response.data) {
        setDriveTimeData(response.data);
        // Check if drive time affects scheduling
        // This warning is based on drive time only, even if taskTimeData is comprehensive
        const totalTaskTime = selectedItem.estimated_hours + (response.data.round_trip_time_minutes / 60);
        if (totalTaskTime > 8) {
          setShowDriveTimeWarning(true);
        } else {
          setShowDriveTimeWarning(false);
        }
      }
    } catch (error) {
      console.error('Error calculating drive time:', error);
    }
  };

  useEffect(() => {
    if (selectedItem && selectedUserEmail && businessAddress && selectedItem.project_address) {
      calculateDriveTimeForTask();
    }
  }, [selectedItem, selectedUserEmail, businessAddress]);

  const generateAvailableSlots = (item, userEmail) => {
    const safeEvents = Array.isArray(events) ? events : [];
    const userEvents = safeEvents.filter(e => e.user_email === userEmail);
    const slots = [];
    const now = new Date();
    
    // Use adjusted time from calculation or fall back to original estimate
    const totalHoursNeeded = taskTimeData ? taskTimeData.final_adjusted_hours : (item.estimated_hours || 1);
    
    for (let day = 0; day < 14; day++) { // Look ahead 2 weeks
      const currentDay = new Date(now);
      currentDay.setDate(now.getDate() + day);
      if (currentDay.getDay() === 0 || currentDay.getDay() === 6) continue; // Skip weekends
      
      // Check if we can fit the task in a working day
      for (let hour = 8; hour < 17; hour++) {
        const slotStart = new Date(currentDay);
        slotStart.setHours(hour, 0, 0, 0);
        
        // Calculate end time based on total hours needed
        const slotEnd = addHours(slotStart, Math.ceil(totalHoursNeeded));
        
        // Don't allow slots that go past business hours
        if (slotEnd.getHours() > 17) continue;
        
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
          const assignedCount = selectedItem.type === 'task' && selectedItem.assigned_to 
            ? selectedItem.assigned_to.length 
            : (selectedUserEmail ? 1 : 0);

          const adjustedTimeInfo = taskTimeData 
            ? ` (${assignedCount} users, ${taskTimeData.final_adjusted_hours.toFixed(1)}h total)`
            : '';

          const displayText = `${format(slotStart, 'EEE, MMM d')} at ${format(slotStart, 'h:mm a')} - ${format(slotEnd, 'h:mm a')}${adjustedTimeInfo}`;
          
          slots.push({
            id: `${slotStart.getTime()}`,
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            display: displayText,
            total_hours: totalHoursNeeded
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
      
      const estimatedHoursForTask = taskTimeData ? taskTimeData.final_adjusted_hours : (selectedItem.estimated_hours || 1);

      if (selectedItem.type === 'line_item') {
        // Create a task first, then schedule it
        const taskData = {
          title: selectedItem.title,
          description: selectedItem.description,
          project_id: selectedItem.project_id,
          product_service_id: selectedItem.line_item.product_service_id,
          line_item_id: selectedItem.line_item_id,
          estimated_hours: estimatedHoursForTask, // Use adjusted hours
          assigned_to: [selectedUserEmail], // When creating from line item, assign to selected user
          status: 'not_started',
          priority: selectedItem.priority,
          task_time_data: taskTimeData, // Store the full calculation details
          drive_time_data: driveTimeData // Store direct drive time data as well
        };
        
        const newTask = await UserTask.create(taskData);
        
        let eventDescription = selectedItem.description;
        if (taskTimeData && taskTimeData.breakdown && taskTimeData.breakdown.drive_time_minutes) {
           eventDescription += ` (includes ${taskTimeData.breakdown.drive_time_minutes}min drive time)`;
        } else if (driveTimeData && driveTimeData.round_trip_time_minutes) {
           eventDescription += ` (includes ${driveTimeData.round_trip_time_minutes}min drive time)`;
        }
        
        // Create calendar event for the new task
        const eventData = {
          title: selectedItem.title,
          description: eventDescription,
          user_email: selectedUserEmail,
          project_id: selectedItem.project_id,
          task_id: newTask.id,
          start_time: slot.start,
          end_time: slot.end,
          event_type: 'task',
          status: 'scheduled',
          task_time_data: taskTimeData, // Store the full calculation details with the event
          drive_time_data: driveTimeData // Store direct drive time data as well
        };
        
        await CalendarEvent.create(eventData);
      } else {
        // Schedule existing task
        if (onSchedule) {
          await onSchedule(selectedItem.id, selectedUserEmail, {
            start: slot.start,
            end: slot.end,
            drive_time_data: driveTimeData,
            task_time_data: taskTimeData // Add the new task time data
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
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Work with Time & Drive Analysis {/* Updated Title */}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          <div className="space-y-6">
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
                      Original Duration: {selectedItem.estimated_hours} hours {/* Updated label */}
                    </div>
                    {taskTimeData && ( // New adjusted duration display
                      <div className="text-sm font-medium text-emerald-700">
                        Adjusted Duration: {taskTimeData.final_adjusted_hours.toFixed(1)} hours 
                        ({taskTimeData.assigned_users_count} users, {taskTimeData.parallelization_factor.toFixed(1)}x efficiency)
                      </div>
                    )}
                    {selectedItem.project_address && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Route className="w-3 h-3" />
                        {selectedItem.project_address}
                      </div>
                    )}
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

                {/* New Task Type Selection */}
                <div className="space-y-2">
                  <Label>Task Type</Label>
                  <Select value={taskType} onValueChange={setTaskType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (Partial Parallel)</SelectItem>
                      <SelectItem value="parallel">Fully Parallel</SelectItem>
                      <SelectItem value="sequential">Sequential Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {taskType === 'parallel' && 'Work can be done simultaneously by multiple people, significantly reducing total time.'}
                    {taskType === 'sequential' && 'Work must be done in sequence, so adding more people does not reduce total time.'}
                    {taskType === 'standard' && 'Most tasks allow for some parallel work, but with diminishing returns as more people are added.'}
                  </p>
                </div>

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

            {/* Drive Time Warning */}
            {showDriveTimeWarning && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Total time (work + drive) exceeds 8-hour workday
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* New Cost Analysis Card */}
            {taskTimeData && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Labor Cost:</span>
                    <span className="font-medium">${taskTimeData.cost_analysis.total_labor_cost.toFixed(2)}</span>
                  </div>
                  {taskTimeData.cost_analysis.drive_cost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Drive Time Cost:</span>
                      <span className="font-medium">${taskTimeData.cost_analysis.drive_cost.toFixed(2)}</span>
                    </div>
                  )}
                  {taskTimeData.cost_analysis.gas_cost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Gas Cost:</span>
                      <span className="font-medium">${taskTimeData.cost_analysis.gas_cost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                    <span>Total Cost:</span>
                    <span>${taskTimeData.cost_analysis.total_cost.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
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

          {/* Drive Time Calculator */}
          <div>
            {selectedItem && selectedUserEmail && selectedItem.project_address && (
              <DriveTimeCalculator
                project={{ site_address: selectedItem.project_address }}
                assignedUsers={[{ email: selectedUserEmail }]}
                onDriveTimeCalculated={(data) => setDriveTimeData(data)}
              />
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isScheduling}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSchedule} 
            disabled={!selectedItemId || !selectedUserEmail || !selectedSlot || isScheduling || !taskTimeData} 
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
