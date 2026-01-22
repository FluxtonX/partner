import React, { useState, useEffect } from 'react';
import { UserTask, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckSquare, Clock, Users, DollarSign, Target, CheckCircle, Circle } from 'lucide-react';
import { toast } from 'sonner';

const productCategories = {
  cabinetry: 'Cabinetry',
  carpentry: 'Carpentry',
  cleaning: 'Cleaning',
  concrete: 'Concrete Work',
  countertop: 'Countertops',
  decking: 'Decking',
  demolition: 'Demolition',
  drywall: 'Drywall',
  electrical: 'Electrical',
  excavation: 'Excavation',
  fencing: 'Fencing',
  flooring: 'Flooring',
  foundation: 'Foundation',
  framing: 'Framing',
  gutters: 'Gutters',
  handyman: 'Handyman Services',
  hvac: 'HVAC',
  insulation: 'Insulation',
  landscaping: 'Landscaping',
  lighting_installation: 'Lighting Installation',
  masonry: 'Masonry',
  painting: 'Painting',
  paving: 'Paving',
  plans_permits: 'Plans & Permits',
  plumbing: 'Plumbing',
  project: 'Project Management',
  repair: 'Repair Work',
  roofing: 'Roofing',
  siding: 'Siding',
  tile: 'Tile Work',
  trim_molding: 'Trim & Molding',
  ventilation: 'Ventilation',
  waterproofing: 'Waterproofing',
  windows_doors: 'Windows & Doors',
  uncategorized: 'Uncategorized'
};

export default function MilestonesTab({ project }) {
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMilestoneData();
  }, [project.id]);

  const loadMilestoneData = async () => {
    try {
      const [projectTasks, allUsers] = await Promise.all([
        UserTask.filter({ project_id: project.id }),
        User.list()
      ]);

      setTasks(projectTasks);
      setUsers(allUsers);
      calculateMilestones(project.line_items || [], projectTasks);
    } catch (error) {
      console.error('Error loading milestone data:', error);
      toast.error('Failed to load milestone data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMilestones = (lineItems, projectTasks) => {
    // Group line items by category
    const categoryGroups = lineItems.reduce((groups, item) => {
      const category = item.category || 'uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {});

    // Calculate milestone status for each category
    const milestoneData = Object.entries(categoryGroups).map(([category, items]) => {
      // Find tasks related to this category
      const categoryTasks = projectTasks.filter(task => {
        return items.some(item => item.id === task.line_item_id);
      });

      const totalTasks = categoryTasks.length;
      const completedTasks = categoryTasks.filter(task => task.status === 'completed').length;
      const inProgressTasks = categoryTasks.filter(task => task.status === 'in_progress').length;
      
      const categoryValue = items.reduce((sum, item) => sum + (item.total || 0), 0);
      const categoryHours = items.reduce((sum, item) => sum + ((item.base_quantity || 0) * (item.hours || 0)), 0);

      const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const isCompleted = totalTasks > 0 && completedTasks === totalTasks;
      
      // Get assigned users for this category
      const assignedUsers = [...new Set(categoryTasks.flatMap(task => task.assigned_to || []))];

      return {
        category,
        name: productCategories[category] || category.replace(/_/g, ' '),
        items: items.length,
        total_value: categoryValue,
        total_hours: categoryHours,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        in_progress_tasks: inProgressTasks,
        completion_percentage: completionPercentage,
        is_completed: isCompleted,
        assigned_users: assignedUsers,
        line_items: items,
        tasks: categoryTasks
      };
    });

    // Sort by completion status and then by name
    milestoneData.sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1; // Completed milestones last
      }
      return a.name.localeCompare(b.name);
    });

    setMilestones(milestoneData);
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const getStatusColor = (milestone) => {
    if (milestone.is_completed) return 'bg-green-500';
    if (milestone.completion_percentage > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const getStatusIcon = (milestone) => {
    if (milestone.is_completed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (milestone.completion_percentage > 0) {
      return <Clock className="w-5 h-5 text-blue-600" />;
    }
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = (milestone) => {
    if (milestone.is_completed) return 'Completed';
    if (milestone.completion_percentage > 0) return 'In Progress';
    return 'Not Started';
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading milestones...</div>;
  }

  const overallProgress = milestones.length > 0 
    ? Math.round(milestones.reduce((sum, m) => sum + m.completion_percentage, 0) / milestones.length)
    : 0;

  const completedMilestones = milestones.filter(m => m.is_completed).length;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Project Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{milestones.length}</p>
              <p className="text-sm text-slate-600">Total Milestones</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedMilestones}</p>
              <p className="text-sm text-slate-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{milestones.length - completedMilestones}</p>
              <p className="text-sm text-slate-600">Remaining</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{overallProgress}%</p>
              <p className="text-sm text-slate-600">Overall Progress</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Project Completion</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Milestone Cards */}
      <div className="grid gap-4">
        {milestones.map((milestone) => (
          <Card key={milestone.category} className={`border-l-4 ${
            milestone.is_completed ? 'border-l-green-500 bg-green-50/30' :
            milestone.completion_percentage > 0 ? 'border-l-blue-500' : 'border-l-gray-300'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(milestone)}
                  <div>
                    <CardTitle className="text-lg">{milestone.name}</CardTitle>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-4 h-4" />
                        {milestone.items} item{milestone.items !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${milestone.total_value.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {milestone.total_hours.toFixed(1)} hrs
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={milestone.is_completed ? 'default' : 'secondary'} 
                       className={milestone.is_completed ? 'bg-green-100 text-green-800' : ''}>
                  {getStatusText(milestone)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress ({milestone.completed_tasks}/{milestone.total_tasks} tasks)</span>
                  <span>{milestone.completion_percentage}%</span>
                </div>
                <Progress value={milestone.completion_percentage} 
                         className={`h-2 ${milestone.is_completed ? 'bg-green-100' : ''}`} />
              </div>

              {/* Assigned Users */}
              {milestone.assigned_users.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Assigned Team Members
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {milestone.assigned_users.map((userEmail) => (
                      <Badge key={userEmail} variant="outline" className="text-xs">
                        {getUserName(userEmail)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Task Breakdown */}
              {milestone.total_tasks > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-slate-700 mb-2">Task Status</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="font-semibold text-green-800">{milestone.completed_tasks}</p>
                      <p className="text-green-600">Completed</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="font-semibold text-blue-800">{milestone.in_progress_tasks}</p>
                      <p className="text-blue-600">In Progress</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="font-semibold text-gray-800">
                        {milestone.total_tasks - milestone.completed_tasks - milestone.in_progress_tasks}
                      </p>
                      <p className="text-gray-600">Not Started</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {milestones.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-600">No Milestones Defined</p>
              <p className="text-sm text-gray-500">
                Milestones are created automatically based on project line items organized by category.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}