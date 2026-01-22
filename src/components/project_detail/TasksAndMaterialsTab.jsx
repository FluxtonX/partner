import React, { useState, useEffect } from 'react';
import { User, UserTask } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, UserPlus, Trash2 } from "lucide-react";
import { toast } from 'sonner';
import TaskScheduler from '../calendar/TaskScheduler';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';

export default function TasksAndMaterialsTab({ project, users = [], onUpdate }) {
  const [userTasks, setUserTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [taskToSchedule, setTaskToSchedule] = useState(null);
  const [allUserTasks, setAllUserTasks] = useState([]);

  useEffect(() => {
    if (project?.id) {
      fetchProjectTasks();
      fetchAllTasksForScheduler();
    }
  }, [project?.id]);

  const fetchProjectTasks = async () => {
    setIsLoading(true);
    try {
      const tasks = await UserTask.filter({ project_id: project.id });
      setUserTasks(Array.isArray(tasks) ? tasks : []);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      toast.error("Failed to load tasks.");
      setUserTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllTasksForScheduler = async () => {
    try {
        const allTasks = await UserTask.list();
        setAllUserTasks(Array.isArray(allTasks) ? allTasks : []);
    } catch (error)        {
        console.error("Error fetching all tasks:", error);
        setAllUserTasks([]);
    }
  }

  const handleCreateOrUpdateTask = async (lineItem, assignedEmails) => {
    const existingTask = userTasks.find(t => t.line_item_id === lineItem.id);
    const taskData = {
      title: lineItem.description,
      description: lineItem.description,
      project_id: project.id,
      product_service_id: lineItem.product_service_id,
      line_item_id: lineItem.id,
      estimated_hours: (lineItem.hours || 0) * (lineItem.quantity || 1),
      assigned_to: assignedEmails || [],
      status: existingTask?.status || 'not_started',
    };

    try {
      if (existingTask) {
        await UserTask.update(existingTask.id, { assigned_to: assignedEmails || [] });
        toast.success("Task updated successfully.");
      } else {
        await UserTask.create(taskData);
        toast.success("Task created and assigned.");
      }
      fetchProjectTasks();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task.");
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task? This cannot be undone.")) {
        try {
            await UserTask.delete(taskId);
            toast.success("Task deleted successfully.");
            fetchProjectTasks();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Failed to delete task.");
        }
    }
  };

  const laborLineItems = (project?.line_items && Array.isArray(project.line_items))
    ? project.line_items.filter(item => item.type === 'labor')
    : [];

  if (!project) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No project data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks and Materials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Labor Tasks</h3>
          {isLoading ? (
            <p>Loading tasks...</p>
          ) : (
            <div className="space-y-4">
              {laborLineItems.map(item => {
                const task = userTasks.find(t => t.line_item_id === item.id);
                return (
                  <TaskItem
                    key={item.id}
                    lineItem={item}
                    task={task}
                    users={users}
                    onAssign={handleCreateOrUpdateTask}
                    onSchedule={() => setTaskToSchedule(task)}
                    onDelete={handleDeleteTask}
                  />
                );
              })}
              {laborLineItems.length === 0 && (
                <p className="text-muted-foreground">No labor items found in the estimate.</p>
              )}
            </div>
          )}
        </div>

        {taskToSchedule && (
          <TaskScheduler
            tasks={allUserTasks}
            users={users}
            events={[]}
            projects={[project]}
            currentWeek={new Date()}
            onSchedule={(taskId, userEmail, dateTime) => {
                console.log('Scheduling logic to be implemented here', { taskId, userEmail, dateTime });
                setTaskToSchedule(null);
                toast.info("Scheduling from here needs calendar event creation logic.");
            }}
            onCancel={() => setTaskToSchedule(null)}
          />
        )}
      </CardContent>
    </Card>
  );
}

function TaskItem({ lineItem, task, users = [], onAssign, onSchedule, onDelete }) {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // When the popover is opened, sync its internal state with the actual task assignees.
    useEffect(() => {
        if (isPopoverOpen) {
            setSelectedUsers(task?.assigned_to || []);
        }
    }, [isPopoverOpen, task]);

    const handleAssigneeToggle = (email) => {
        const currentSelection = [...(selectedUsers || [])];
        const newSelection = currentSelection.includes(email)
            ? currentSelection.filter(e => e !== email)
            : [...currentSelection, email];
        setSelectedUsers(newSelection);
    };

    const handleAssignClick = () => {
        onAssign(lineItem, selectedUsers || []);
        setIsPopoverOpen(false); // Close popover after assigning
    };

    const assignedUserNames = (task?.assigned_to || [])
        .map(email => (users || []).find(u => u.email === email)?.full_name || email)
        .join(', ');

    const hasAssignees = task && Array.isArray(task.assigned_to) && task.assigned_to.length > 0;

    return (
        <div className="p-4 border rounded-lg flex items-center justify-between gap-4">
            <div className="flex-1">
                <p className="font-medium">{lineItem.description || 'Untitled Task'}</p>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Users className="w-4 h-4" />
                    <span className="truncate">
                        {hasAssignees ? assignedUserNames : (task ? 'Unassigned' : 'Task not created')}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {task && (
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                        {(task.status || 'not_started').replace('_', ' ')}
                    </Badge>
                )}
                
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                            <UserPlus className="w-4 h-4 mr-2" /> 
                            {hasAssignees ? 'Re-assign' : 'Assign'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0">
                        <Command>
                            <CommandInput placeholder="Search users..." />
                            <CommandEmpty>No users found.</CommandEmpty>
                            <CommandGroup>
                                {(users || []).map(user => (
                                    <CommandItem key={user.id} onSelect={() => handleAssigneeToggle(user.email)}>
                                        <Checkbox 
                                            className="mr-2" 
                                            checked={(selectedUsers || []).includes(user.email)} 
                                        />
                                        {user.full_name || user.email}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                        <div className="p-2 border-t">
                            <Button onClick={handleAssignClick} size="sm" className="w-full">
                                {task ? 'Update Assignees' : 'Create & Assign Task'}
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Button 
                    onClick={onSchedule} 
                    size="sm" 
                    disabled={!hasAssignees}
                >
                    <Calendar className="w-4 h-4 mr-2" /> 
                    Schedule
                </Button>
                
                {task && (
                    <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                )}
            </div>
        </div>
    );
}