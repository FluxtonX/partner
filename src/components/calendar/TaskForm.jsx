import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, CheckCircle, AlertTriangle, Users as UsersIcon, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO, addMinutes } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BusinessSettings, ProductOrService } from '@/api/entities';

export default function TaskForm({ task, users, projects, products, currentUser, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(task ? {
    ...task,
    assigned_to: Array.isArray(task.assigned_to) ? task.assigned_to : (task.assigned_to ? [task.assigned_to] : []),
    due_date: task.due_date ? format(parseISO(task.due_date), "yyyy-MM-dd'T'HH:mm") : '',
  } : {
    title: '',
    description: '',
    assigned_to: [],
    project_id: '',
    product_service_id: '',
    due_date: '',
    estimated_hours: '',
    priority: 'medium',
    status: 'not_started',
    attachments: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userTrainingStatus, setUserTrainingStatus] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Load business settings
  useEffect(() => {
    const loadBusinessSettings = async () => {
      if (!currentUser?.current_business_id) return;
      try {
        const settings = await BusinessSettings.filter({ business_id: currentUser.current_business_id });
        if (settings.length > 0) {
          setBusinessSettings(settings[0]);
        }
      } catch (error) {
        console.error('Error loading business settings:', error);
      }
    };
    loadBusinessSettings();
  }, [currentUser]);

  // Filter products based on selected project
  const getAvailableProducts = () => {
    if (!formData.project_id) {
      // No project selected - show all products/services, filtered by search
      return products.filter(product => 
        searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Project selected - filter by project's line items
    const selectedProject = projects.find(p => p.id === formData.project_id);
    if (!selectedProject?.line_items) return [];

    const projectProductIds = selectedProject.line_items.map(item => item.product_service_id).filter(Boolean);
    return products.filter(product => 
      projectProductIds.includes(product.id) && (
        searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const handleProductSelect = (product) => {
    const isSelected = selectedProducts.find(p => p.id === product.id);
    if (isSelected) {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const handleSingleProductSelect = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        product_service_id: productId,
        title: product.name,
        description: product.description || '',
        estimated_hours: product.hours || ''
      }));
      setSelectedProducts([product]);
    }
  };

  const calculateTaskDistribution = () => {
    if (!businessSettings || selectedProducts.length === 0) return [];

    const workDays = businessSettings.work_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const startHour = parseInt(businessSettings.business_hours_start?.split(':')[0] || '8');
    const endHour = parseInt(businessSettings.business_hours_end?.split(':')[0] || '17');
    const dailyHours = endHour - startHour;

    const tasks = [];
    let currentDate = formData.due_date ? new Date(formData.due_date) : new Date();

    selectedProducts.forEach((product, index) => {
      const taskHours = parseFloat(product.hours) || 1;
      const daysNeeded = Math.ceil(taskHours / dailyHours);

      // Find next available work day
      let taskDate = new Date(currentDate);
      for (let i = 0; i < daysNeeded; i++) {
        while (!workDays.includes(taskDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())) {
          taskDate.setDate(taskDate.getDate() + 1);
        }
        
        const taskStartTime = new Date(taskDate);
        taskStartTime.setHours(startHour, 0, 0, 0);

        tasks.push({
          title: product.name,
          description: product.description || '',
          product_service_id: product.id,
          estimated_hours: Math.min(taskHours - (i * dailyHours), dailyHours),
          due_date: format(taskStartTime, "yyyy-MM-dd'T'HH:mm"),
          assigned_to: formData.assigned_to,
          project_id: formData.project_id,
          priority: formData.priority,
          status: 'not_started'
        });

        taskDate.setDate(taskDate.getDate() + 1);
      }
      
      currentDate = new Date(taskDate);
    });

    return tasks;
  };

  useEffect(() => {
    if (formData.assigned_to?.length > 0 && formData.product_service_id) {
      checkUserTraining();
    } else {
      setUserTrainingStatus([]);
    }
  }, [formData.assigned_to, formData.product_service_id]);

  const checkUserTraining = async () => {
    if (!formData.assigned_to || formData.assigned_to.length === 0 || !formData.product_service_id) {
      setUserTrainingStatus([]);
      return;
    }
    try {
      const trainings = await Training.filter({ product_service_id: formData.product_service_id });
      const requiredTrainings = trainings.filter(t => t.required);

      if (requiredTrainings.length === 0) {
        setUserTrainingStatus([]);
        return;
      }

      const statuses = await Promise.all(formData.assigned_to.map(async (email) => {
        const progress = await UserTrainingProgress.filter({ user_email: email });
        const completedTrainingIds = progress
          .filter(p => p.status === 'completed')
          .map(p => p.training_id);

        const hasCompletedRequired = requiredTrainings.every(t =>
          completedTrainingIds.includes(t.id)
        );
        
        return {
          email,
          hasRequiredTraining: true,
          hasCompletedRequired,
          totalRequired: requiredTrainings.length,
          completedCount: requiredTrainings.filter(t => completedTrainingIds.includes(t.id)).length
        };
      }));
      setUserTrainingStatus(statuses);
    } catch (error) {
      console.error('Error checking user training:', error);
      setUserTrainingStatus([]);
    }
  };

  const handleAssigneeToggle = (email) => {
    setFormData(prev => {
      const currentlyAssigned = prev.assigned_to || [];
      const newAssigned = currentlyAssigned.includes(email)
        ? currentlyAssigned.filter(e => e !== email)
        : [...currentlyAssigned, email];
      return { ...prev, assigned_to: newAssigned };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedProducts.length > 1) {
        // Multiple products selected - create distributed tasks
        const distributedTasks = calculateTaskDistribution();
        for (const taskData of distributedTasks) {
          const submitData = {
            ...taskData,
            project_id: taskData.project_id === '' ? null : taskData.project_id,
            estimated_hours: taskData.estimated_hours ? parseFloat(taskData.estimated_hours) : undefined,
            due_date: taskData.due_date ? new Date(taskData.due_date).toISOString() : undefined
          };
          await onSubmit(submitData);
        }
      } else {
        // Single task submission
        const submitData = {
          ...formData,
          project_id: formData.project_id === '' ? null : formData.project_id,
          estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
          due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined
        };
        await onSubmit(submitData);
      }
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignedUsersNames = (formData.assigned_to || [])
    .map(email => users.find(u => u.email === email)?.full_name || email)
    .join(', ');

  const availableProducts = getAvailableProducts();

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Related Project - Now at top */}
          <div className="space-y-2">
            <Label htmlFor="project_id">Related Project</Label>
            <Select
              value={formData.project_id || ''}
              onValueChange={(value) => {
                setFormData(prev => ({ 
                  ...prev, 
                  project_id: value === '__none__' ? '' : value,
                  product_service_id: '' // Clear selected service when project changes
                }));
                setSelectedProducts([]); // Clear selected products
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'__none__'}>No Project</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Related Service/Product with Search */}
          <div className="space-y-2">
            <Label htmlFor="product_service_id">Related Service/Product *</Label>
            {!task && (
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                >
                  {selectedProducts.length > 1 ? `${selectedProducts.length} Selected` : 'Search Products'}
                  <Search className="w-4 h-4 ml-2" />
                </Button>
                {selectedProducts.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProducts([]);
                      setFormData(prev => ({ ...prev, product_service_id: '', title: '', description: '', estimated_hours: '' }));
                    }}
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
            )}

            {showProductSearch ? (
              <div className="border rounded-lg p-4 space-y-3">
                <Input
                  placeholder="Search products and services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {availableProducts.map(product => (
                      <div key={product.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          checked={selectedProducts.some(p => p.id === product.id)}
                          onCheckedChange={() => handleProductSelect(product)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-gray-500">{product.description}</div>
                          )}
                          <div className="text-xs text-blue-600">
                            {product.hours && `${product.hours} hrs`} • {product.type?.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {selectedProducts.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Selected ({selectedProducts.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedProducts.map(product => (
                        <Badge key={product.id} variant="outline" className="text-xs">
                          {product.name}
                          <button
                            type="button"
                            onClick={() => handleProductSelect(product)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Select
                value={formData.product_service_id}
                onValueChange={handleSingleProductSelect}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product/service" />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.type?.replace('_', ' ')}
                      {product.hours && ` (${product.hours} hrs)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assigned To */}
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    <UsersIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">
                      {assignedUsersNames || "Select users..."}
                    </span>
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                  <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {users.map(user => (
                        <CommandItem
                          key={user.id}
                          value={user.full_name}
                          onSelect={() => handleAssigneeToggle(user.email)}
                        >
                          <Checkbox
                            className="mr-2"
                            checked={(formData.assigned_to || []).includes(user.email)}
                            onCheckedChange={() => handleAssigneeToggle(user.email)}
                          />
                          <span>{user.full_name}</span>
                          {user.user_type === 'subcontractor' && user.next_available_date && (
                            <Badge variant="outline" className="ml-auto font-normal">
                              Avail: {format(parseISO(user.next_available_date), 'MMM d')}
                            </Badge>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Training Status Alert */}
          {userTrainingStatus.map(status => status.hasRequiredTraining && (
            <div key={status.email} className={`p-3 rounded-lg border ${
              status.hasCompletedRequired
                ? 'bg-green-50 border-green-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                {status.hasCompletedRequired ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                <p className={`text-sm font-medium ${
                  status.hasCompletedRequired ? 'text-green-800' : 'text-amber-800'
                }`}>
                  {users.find(u => u.email === status.email)?.full_name || status.email}: {status.completedCount}/{status.totalRequired} required trainings done
                </p>
              </div>
              {!status.hasCompletedRequired && (
                <p className="text-xs text-amber-700 mt-1">
                  This user has not completed all required training for this service.
                </p>
              )}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>

            {/* Estimated Hours */}
            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.5"
                value={formData.estimated_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          {task && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Multiple Tasks Preview */}
          {selectedProducts.length > 1 && businessSettings && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Task Distribution Preview</h4>
              <p className="text-sm text-blue-700 mb-3">
                {selectedProducts.length} tasks will be created and distributed across your business hours
              </p>
              <div className="space-y-2">
                {calculateTaskDistribution().slice(0, 3).map((task, index) => (
                  <div key={index} className="text-sm bg-white p-2 rounded border">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-gray-600">
                      {format(new Date(task.due_date), 'PPp')} • {task.estimated_hours}hrs
                    </div>
                  </div>
                ))}
                {calculateTaskDistribution().length > 3 && (
                  <div className="text-sm text-blue-600">
                    +{calculateTaskDistribution().length - 3} more tasks...
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 
                selectedProducts.length > 1 ? `Create ${selectedProducts.length} Tasks` :
                task ? 'Update Task' : 'Create Task'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}