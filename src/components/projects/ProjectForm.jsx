
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save, X, MapPin, Loader2, AlertCircle } from "lucide-react";
import { InvokeLLM } from '@/api/integrations';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProjectForm({ project, clients, users, onSubmit, onCancel, isOpen }) {
  const [formData, setFormData] = useState(project || {
    title: '',
    description: '',
    client_id: '',
    assigned_to: '',
    status: 'estimate',
    priority: 'medium',
    project_type: 'other',
    start_date: null,
    estimated_completion: null,
    site_address: '',
    site_zip_code: '',
    site_location: null,
    live_feed_provider: '',
    live_feed_url: '',
  });
  
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        client_id: project.client_id || '',
        start_date: project.start_date ? new Date(project.start_date) : null,
        estimated_completion: project.estimated_completion ? new Date(project.estimated_completion) : null,
        site_location: project.site_location || null,
        project_type: project.project_type || 'other',
        live_feed_provider: project.live_feed_provider || '',
        live_feed_url: project.live_feed_url || '',
      });
    }
  }, [project]);

  // Centralized input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Centralized select change handler
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeocode = async () => {
    if (!formData.site_address) {
      setGeocodingError('Please enter an address first.');
      return;
    }
    setIsGeocoding(true);
    setGeocodingError('');
    try {
      const result = await InvokeLLM({
        prompt: `Get the geographic coordinates (latitude and longitude) for the following address: ${formData.site_address}.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            latitude: { type: 'number' },
            longitude: { type: 'number' },
          },
          required: ['latitude', 'longitude'],
        }
      });
      if (result && typeof result.latitude === 'number' && typeof result.longitude === 'number') {
        setFormData(prev => ({ ...prev, site_location: { latitude: result.latitude, longitude: result.longitude } }));
      } else {
        setGeocodingError('Could not find coordinates for this address.');
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      setGeocodingError('Geocoding service failed. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convert Date objects back to string format for saving
    const dataToSubmit = {
      ...formData,
      client_id: formData.client_id,
      start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
      estimated_completion: formData.estimated_completion ? format(formData.estimated_completion, 'yyyy-MM-dd') : null,
    };
    
    try {
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Client *</Label>
              <Select
                name="client_id"
                value={formData.client_id || ''}
                onValueChange={(value) => handleSelectChange('client_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name || `${client.first_name} ${client.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Project description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estimate">Estimate</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                name="priority"
                value={formData.priority}
                onValueChange={(value) => handleSelectChange('priority', value)}
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

            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assignee</Label>
              <Select
                name="assigned_to"
                value={formData.assigned_to || ''}
                onValueChange={(value) => handleSelectChange('assigned_to', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.email}>
                      <span>{user.full_name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_completion">Estimated Completion</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.estimated_completion ? format(formData.estimated_completion, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.estimated_completion || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, estimated_completion: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* New Project Type Field */}
            <div className="space-y-2">
              <Label htmlFor="project_type">Project Type</Label>
              <Select
                name="project_type"
                value={formData.project_type || 'other'}
                onValueChange={(value) => handleSelectChange('project_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="quick_t_and_m">Quick T&M</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_address">Project Site Address</Label>
            <div className="flex items-center gap-2">
              <Input
                id="site_address"
                name="site_address"
                value={formData.site_address || ''}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main St, Anytown, USA"
              />
              <Button type="button" variant="outline" onClick={handleGeocode} disabled={isGeocoding}>
                {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                <span className="ml-2 hidden sm:inline">Find on Map</span>
              </Button>
            </div>
            {geocodingError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{geocodingError}</AlertDescription>
              </Alert>
            )}
            {formData.site_location && !geocodingError && (
              <p className="text-sm text-green-600 mt-1">Coordinates found: {formData.site_location.latitude.toFixed(4)}, {formData.site_location.longitude.toFixed(4)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_zip_code">Site ZIP Code</Label>
            <Input
              id="site_zip_code"
              name="site_zip_code"
              value={formData.site_zip_code || ''}
              onChange={handleInputChange}
              placeholder="For weather tracking"
              maxLength={10}
            />
          </div>

          <Separator />
          
          <h4 className="text-lg font-semibold text-slate-800">Live Feed Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="live_feed_provider">Camera Provider</Label>
              <Select
                name="live_feed_provider"
                value={formData.live_feed_provider || ''}
                onValueChange={(value) => handleSelectChange('live_feed_provider', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ring">Ring</SelectItem>
                  <SelectItem value="Vivint">Vivint</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="live_feed_url">Live Feed URL</Label>
              <Input
                id="live_feed_url"
                name="live_feed_url"
                type="url"
                value={formData.live_feed_url || ''}
                onChange={handleInputChange}
                placeholder="https://..."
              />
              <p className="text-xs text-slate-500">Must be a web-accessible URL.</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : (project ? 'Save Changes' : 'Create Project')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
