
import React, { useState, useEffect } from 'react';
import { CommunicationTemplate, BusinessSettings } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CLIENT_STATUS_CATEGORIES = ['lead', 'prospect', 'active', 'inactive', 'follow_up', 'welcome', 'thank_you'];

function TemplateEditor({ template, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    template || {
      name: '',
      type: 'email',
      category: 'prospect',
      subject_template: '',
      message_template: '',
    }
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [businessSettings, setBusinessSettings] = useState(null);

  useEffect(() => {
    const fetchBusinessSettings = async () => {
      const settings = await BusinessSettings.list();
      if (settings.length > 0) {
        setBusinessSettings(settings[0]);
      }
    };
    fetchBusinessSettings();
  }, []);

  const handleGenerate = async () => {
    if (!aiPrompt) {
      toast.error("Please provide a description for the email you want to generate.");
      return;
    }
    if (!businessSettings) {
      toast.error("Business details not found. Cannot generate email.");
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `
        You are a marketing assistant for a business named "${businessSettings.business_name}".
        Business contact info: Email: ${businessSettings.business_email || 'not set'}, Phone: ${businessSettings.business_phone || 'not set'}.
        
        Generate a professional and friendly email template for the following purpose: "${aiPrompt}".
        The target audience is a "${formData.category}" client.
        The email should encourage a response or action, and optionally include the business contact info in the signature if appropriate.
        
        Use placeholders like {client_name}, {contact_person}, {business_name}, {business_email}, and {business_phone}.
        
        Provide the output as a JSON object with two keys: "subject" and "body".
        The body should be simple, clean text. Do not use HTML.
      `;

      const response = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" },
          },
        },
      });
      
      setFormData(prev => ({
        ...prev,
        subject_template: response.subject,
        message_template: response.body,
      }));
      toast.success("AI has generated the email template!");
    } catch (error) {
      console.error("AI generation failed:", error);
      toast.error("Failed to generate email template. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit' : 'Create'} Email Template</DialogTitle>
          <DialogDescription>
            Design an email template for your marketing campaigns. Use AI to help you write the perfect message.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 'Initial Follow-Up'"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category (Client Status)</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLIENT_STATUS_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
             <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold text-slate-800">Generate with AI</h4>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Describe the email you want to send:</Label>
              <Textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., 'An email to a new lead introducing our services and asking for a good time to call.'"
                rows={2}
              />
            </div>
            <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Content
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject_template}
              onChange={(e) => setFormData({ ...formData, subject_template: e.target.value })}
              placeholder="Email subject line"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message Body</Label>
            <Textarea
              id="message"
              value={formData.message_template}
              onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
              rows={12}
              placeholder="Write your email here. Use placeholders like {client_name} and {contact_person}."
              required
            />
             <p className="text-xs text-slate-500">
                Available placeholders: {`{client_name}`}, {`{contact_person}`}, {`{business_name}`}, {`{business_email}`}, {`{business_phone}`}
            </p>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>Save Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EmailTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await CommunicationTemplate.filter({ type: 'email' }, '-created_date');
      setTemplates(data);
    } catch (error) {
      console.error("Error loading email templates:", error);
      toast.error("Failed to load templates.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (templateData) => {
    try {
      if (editingTemplate) {
        await CommunicationTemplate.update(editingTemplate.id, templateData);
        toast.success("Template updated successfully!");
      } else {
        await CommunicationTemplate.create(templateData);
        toast.success("Template created successfully!");
      }
      setShowEditor(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template.");
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDelete = async (templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await CommunicationTemplate.delete(templateId);
        toast.success("Template deleted.");
        loadTemplates();
      } catch (error) {
        console.error("Error deleting template:", error);
        toast.error("Failed to delete template.");
      }
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Email Campaign Templates</CardTitle>
          <CardDescription>Create and manage reusable emails for your marketing efforts.</CardDescription>
        </div>
        <Button onClick={() => { setEditingTemplate(null); setShowEditor(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading templates...</TableCell></TableRow>
            ) : templates.length > 0 ? (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="capitalize">{template.category.replace('_', ' ')}</TableCell>
                  <TableCell className="text-slate-600">{template.subject_template}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center py-8">No email templates found. Create one to get started.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSave}
          onCancel={() => { setShowEditor(false); setEditingTemplate(null); }}
        />
      )}
    </Card>
  );
}
