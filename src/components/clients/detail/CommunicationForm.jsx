import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, Plus, X, Copy } from 'lucide-react';
import { format } from 'date-fns';

export default function CommunicationForm({ client, initialType = '', templates, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: initialType,
    direction: 'outbound',
    subject: '',
    content: '',
    duration_minutes: '',
    outcome: '',
    priority: 'medium',
    tags: [],
    follow_up_date: null,
    attachments: []
  });

  const [newTag, setNewTag] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      follow_up_date: formData.follow_up_date ? format(formData.follow_up_date, 'yyyy-MM-dd') : null,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null
    });
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const applyTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Replace template variables with actual values
      let content = template.message_template;
      let subject = template.subject_template || '';
      
      // Simple template variable replacement
      const replacements = {
        '{client_name}': client.contact_person,
        '{company_name}': client.company_name,
        '{client_email}': client.email,
        '{client_phone}': client.phone || '',
        '{today}': format(new Date(), 'MMMM d, yyyy')
      };
      
      Object.entries(replacements).forEach(([variable, value]) => {
        content = content.replace(new RegExp(variable, 'g'), value);
        subject = subject.replace(new RegExp(variable, 'g'), value);
      });
      
      setFormData(prev => ({
        ...prev,
        type: template.type === 'phone_script' ? 'phone_call' : template.type,
        subject: subject || prev.subject,
        content: content
      }));
    }
  };

  const relevantTemplates = templates.filter(t => 
    !formData.type || t.type === formData.type || 
    (formData.type === 'phone_call' && t.type === 'phone_script')
  );

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Communication - {client.company_name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Communication Type & Direction */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Communication Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone_call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="text_message">Text Message</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Direction</Label>
              <Select 
                value={formData.direction} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, direction: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template Selection */}
          {relevantTemplates.length > 0 && (
            <div className="space-y-2">
              <Label>Use Template (Optional)</Label>
              <div className="flex gap-2">
                <Select 
                  value={selectedTemplate} 
                  onValueChange={(value) => {
                    setSelectedTemplate(value);
                    if (value) applyTemplate(value);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {relevantTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => applyTemplate(selectedTemplate)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief summary of the communication"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Content/Notes</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Detailed notes about the communication..."
              rows={6}
            />
          </div>

          {/* Duration & Outcome */}
          <div className="grid grid-cols-2 gap-4">
            {(formData.type === 'phone_call' || formData.type === 'meeting') && (
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                  placeholder="0"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Outcome</Label>
              <Select 
                value={formData.outcome} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, outcome: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="no_answer">No Answer</SelectItem>
                  <SelectItem value="voicemail">Voicemail</SelectItem>
                  <SelectItem value="callback_requested">Callback Requested</SelectItem>
                  <SelectItem value="follow_up_needed">Follow-up Needed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority & Follow-up Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
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

            <div className="space-y-2">
              <Label>Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.follow_up_date ? format(formData.follow_up_date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.follow_up_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, follow_up_date: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Save Communication
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}