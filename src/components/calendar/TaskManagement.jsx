
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ListTodo, User, UserPlus, Calendar, Edit } from 'lucide-react';
import { format } from 'date-fns';

function DueDateEditor({ task, onUpdate }) {
    const [isOpen, setIsOpen] = useState(false);
    const [dueDate, setDueDate] = useState(
        task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd'T'HH:mm") : ''
    );

    const handleSave = () => {
        onUpdate(task.id, { 
            due_date: dueDate ? new Date(dueDate).toISOString() : null 
        });
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {task.due_date ? format(new Date(task.due_date), 'MMM d') : 'Set Due Date'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Set Due Date</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="due_date">Due Date & Time</Label>
                        <Input
                            id="due_date"
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function AssigneeSelector({ task, users, onAssign }) {
    const [selectedUsers, setSelectedUsers] = useState(task.assigned_to || []);
    const [isOpen, setIsOpen] = useState(false);

    const handleAssigneeToggle = (email) => {
        const newSelection = selectedUsers.includes(email)
            ? selectedUsers.filter(e => e !== email)
            : [...selectedUsers, email];
        setSelectedUsers(newSelection);
    };

    const handleAssignClick = () => {
        onAssign(task.id, { assigned_to: selectedUsers });
        setIsOpen(false);
    };

    const triggerButtonText = (task.assigned_to && task.assigned_to.length > 0) ? 'Re-assign' : 'Assign';

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {triggerButtonText}
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
                                    checked={selectedUsers.includes(user.email)}
                                />
                                {user.full_name || user.email}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
                <div className="p-2 border-t">
                    <Button onClick={handleAssignClick} size="sm" className="w-full">
                        Update Assignees
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function UnassignedTasks({ tasks = [], users = [], onAssign, onUpdateTask, projects = [] }) {
  const getProjectInfo = (projectId) => {
    if (!projectId) return { name: 'No Project', parentName: null };
    
    const project = Array.isArray(projects) ? projects.find(p => p.id === projectId) : null;
    if (!project) return { name: 'Unknown Project', parentName: null };

    // Check if this project has a parent
    if (project.parent_project_id) {
      const parentProject = projects.find(p => p.id === project.parent_project_id);
      return {
        name: project.title || 'Unknown Project',
        parentName: parentProject?.title || 'Unknown Parent Project',
        isServiceProject: project.status === 'service'
      };
    }

    return { name: project.title || 'Unknown Project', parentName: null };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="w-5 h-5" />
          Unassigned Tasks ({Array.isArray(tasks) ? tasks.length : 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(tasks) && tasks.map(task => {
              const projectInfo = getProjectInfo(task.project_id);
              return (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title || 'Untitled Task'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{projectInfo.name}</div>
                      {projectInfo.parentName && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          {projectInfo.isServiceProject && (
                            <Badge variant="outline" className="text-xs">Service</Badge>
                          )}
                          Parent: {projectInfo.parentName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'outline'}>
                      {task.priority || 'medium'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No due date'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AssigneeSelector task={task} users={users} onAssign={onAssign} />
                      <DueDateEditor task={task} onUpdate={onUpdateTask} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {(!Array.isArray(tasks) || tasks.length === 0) && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No unassigned tasks.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AssignedTasks({ tasks = [], users = [], onAssign, onStatusChange, onUpdateTask, projects = [] }) {
  const getProjectInfo = (projectId) => {
    if (!projectId) return { name: 'No Project', parentName: null };
    
    const project = Array.isArray(projects) ? projects.find(p => p.id === projectId) : null;
    if (!project) return { name: 'Unknown Project', parentName: null };

    // Check if this project has a parent
    if (project.parent_project_id) {
      const parentProject = projects.find(p => p.id === project.parent_project_id);
      return {
        name: project.title || 'Unknown Project',
        parentName: parentProject?.title || 'Unknown Parent Project',
        isServiceProject: project.status === 'service'
      };
    }

    return { name: project.title || 'Unknown Project', parentName: null };
  };

  const getAssignedUserNames = (assignedTo) => {
    if (!Array.isArray(assignedTo) || assignedTo.length === 0) return "Unassigned";
    
    return assignedTo
      .map(email => {
        const user = Array.isArray(users) ? users.find(u => u.email === email) : null;
        return user?.full_name || email;
      })
      .join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Assigned Tasks ({Array.isArray(tasks) ? tasks.length : 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(tasks) && tasks.map(task => {
              const projectInfo = getProjectInfo(task.project_id);
              return (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title || 'Untitled Task'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{projectInfo.name}</div>
                      {projectInfo.parentName && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          {projectInfo.isServiceProject && (
                            <Badge variant="outline" className="text-xs">Service</Badge>
                          )}
                          Parent: {projectInfo.parentName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getAssignedUserNames(task.assigned_to)}</TableCell>
                  <TableCell>
                    {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No due date'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.status || 'not_started'}
                      onValueChange={(status) => onStatusChange && onStatusChange(task.id, { status })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AssigneeSelector task={task} users={users} onAssign={onAssign} />
                      <DueDateEditor task={task} onUpdate={onUpdateTask} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
             {(!Array.isArray(tasks) || tasks.length === 0) && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No assigned tasks.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function TaskManagement({ tasks = [], users = [], onUpdateTask, projects = [] }) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  
  const unassignedTasks = safeTasks.filter(task => 
    !Array.isArray(task.assigned_to) || task.assigned_to.length === 0
  );
  
  const assignedTasks = safeTasks.filter(task => 
    Array.isArray(task.assigned_to) && task.assigned_to.length > 0
  );

  return (
    <div className="space-y-6">
      <UnassignedTasks 
        tasks={unassignedTasks} 
        users={users} 
        onAssign={onUpdateTask}
        onUpdateTask={onUpdateTask}
        projects={projects}
      />
      <AssignedTasks 
        tasks={assignedTasks} 
        users={users} 
        onAssign={onUpdateTask} 
        onStatusChange={onUpdateTask}
        onUpdateTask={onUpdateTask}
        projects={projects}
      />
    </div>
  );
}
