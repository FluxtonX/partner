import React, { useState, useEffect } from 'react';
import { UserTask, Training, ProductOrService } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckSquare, Clock, AlertCircle, Play, BookOpen, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const statusColors = {
  not_started: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700'
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

export default function MyTasks({ projects, currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [productsServices, setProductsServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.email) {
      loadMyTasks();
      loadTrainings();
      loadProductsServices();
    }
  }, [currentUser]);

  const loadMyTasks = async () => {
    try {
      const myTasks = await UserTask.filter({ 
        assigned_to: [currentUser.email] 
      }, '-created_date', 10);
      setTasks(myTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrainings = async () => {
    try {
      const allTrainings = await Training.list();
      setTrainings(allTrainings);
    } catch (error) {
      console.error('Error loading trainings:', error);
    }
  };

  const loadProductsServices = async () => {
    try {
      const allProducts = await ProductOrService.list();
      setProductsServices(allProducts);
    } catch (error) {
      console.error('Error loading products/services:', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await UserTask.update(taskId, { status: newStatus });
      toast.success('Task status updated!');
      loadMyTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status');
    }
  };

  const getProjectTitle = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  const getTaskTraining = (task) => {
    if (task.product_service_id) {
      return trainings.find(training => training.product_service_id === task.product_service_id);
    }
    return null;
  };

  const handleStartTask = (task) => {
    const training = getTaskTraining(task);
    
    if (training) {
      // Redirect to training for this specific task
      window.location.href = createPageUrl(`Training?task_id=${task.id}&training_id=${training.id}`);
    } else {
      // Start task without training
      updateTaskStatus(task.id, 'in_progress');
    }
  };

  const activeTasks = tasks.filter(task => 
    task.status === 'not_started' || task.status === 'in_progress'
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            My Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5" />
          My Tasks ({activeTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No active tasks assigned</p>
            <p className="text-sm">New tasks will appear here when assigned to you</p>
          </div>
        ) : (
          activeTasks.map(task => {
            const training = getTaskTraining(task);
            
            return (
              <div key={task.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{task.title}</h4>
                    <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Project: {getProjectTitle(task.project_id)}</span>
                      {task.due_date && (
                        <>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge className={statusColors[task.status]}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    {task.priority && (
                      <Badge variant="outline" className={priorityColors[task.priority]}>
                        {task.priority}
                      </Badge>
                    )}
                    {training && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        Training Available
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {task.status === 'not_started' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStartTask(task)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {training ? (
                          <>
                            <BookOpen className="w-4 h-4 mr-1" />
                            Start Training
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Start Task
                          </>
                        )}
                      </Button>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateTaskStatus(task.id, 'under_review')}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        <div className="pt-4 border-t">
          <Link to={createPageUrl("Calendar?tab=tasks")}>
            <Button variant="outline" className="w-full">
              View All Tasks
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}