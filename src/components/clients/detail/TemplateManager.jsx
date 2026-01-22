import React, { useState } from 'react';
import { CommunicationTemplate } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Copy, Eye } from 'lucide-react';

export default function TemplateManager({ templates, onUpdate, onClose }) {
  const [activeTab, setActiveTab] = useState('email');
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    category: 'other',
    subject_template: '',
    message_template: '',
    variables: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await CommunicationTemplate.update(editingTemplate.id, formData);
      } else {
        await CommunicationTemplate.create(formData);
      }
      setShowForm(false);
      setEditingTemplate(null);
      resetForm();
      onUpdate();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      category: template.category,
      subject_template: template.subject_template || '',
      message_template: template.message_template,
      variables: template.variables || []
    });
    setShowForm(true);
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await CommunicationTemplate.delete(templateId);
        onUpdate();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'email',
      category: 'other',
      subject_template: '',
      message_template: '',
      variables: []
    });
  };

  const getTemplatesByType = (type) => {
    return templates.filter(t => t.type === type);
  };

  const commonVariables = [
    '{client_name}', '{company_name}', '{client_email}', 
    '{client_phone}', '{today}', '{user_name}'
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Communication Templates</DialogTitle>
        </DialogHeader>

        {!showForm ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-slate-600">Manage your reusable communication templates</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="email">Email Templates</TabsTrigger>
                <TabsTrigger value="text_message">Text Templates</TabsTrigger>
                <TabsTrigger value="phone_script">Phone Scripts</TabsTrigger>
              </TabsList>

              {['email', 'text_message', 'phone_script'].map(type => (
                <TabsContent key={type} value={type}>
                  <div className="grid gap-4 md:grid-cols-2">
                    {getTemplatesByType(type).map(template => (
                      <Card key={template.id}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              <Badge variant="outline" className="mt-1">
                                {template.category}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(template)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(template.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {template.subject_template && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-slate-700">Subject:</p>
                              <p className="text-sm text-slate-600 italic">{template.subject_template}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-700">Message:</p>
                            <p className="text-sm text-slate-600 line-clamp-3">
                              {template.message_template}
                            </p>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            Used {template.usage_count || 0} times
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {getTemplatesByType(type).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No {type.replace('_', ' ')} templates yet</p>
                      <Button 
                        onClick={() => {
                          setFormData(prev => ({ ...prev, type }));
                          setShowForm(true);
                        }}
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                      >
                        Create First Template
                      </Button>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Follow-up Email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="text_message">Text Message</SelectItem>
                    <SelectItem value="phone_script">Phone Script</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                  <SelectItem value="project_update">Project Update</SelectItem>
                  <SelectItem value="invoice_reminder">Invoice Reminder</SelectItem>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="thank_you">Thank You</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'email' && (
              <div className="space-y-2">
                <Label>Subject Template</Label>
                <Input
                  value={formData.subject_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject_template: e.target.value }))}
                  placeholder="e.g., Follow-up on {company_name} project"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Message Template</Label>
              <Textarea
                value={formData.message_template}
                onChange={(e) => setFormData(prev => ({ ...prev, message_template: e.target.value }))}
                placeholder="Enter your message template here..."
                rows={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Available Variables</Label>
              <div className="flex flex-wrap gap-2">
                {commonVariables.map(variable => (
                  <Badge 
                    key={variable}
                    variant="outline" 
                    className="cursor-pointer hover:bg-slate-100"
                    onClick={() => {
                      const textarea = document.querySelector('textarea');
                      const cursorPos = textarea.selectionStart;
                      const textBefore = formData.message_template.substring(0, cursorPos);
                      const textAfter = formData.message_template.substring(cursorPos);
                      setFormData(prev => ({
                        ...prev,
                        message_template: textBefore + variable + textAfter
                      }));
                    }}
                  >
                    {variable}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-500">Click on a variable to insert it at cursor position</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}