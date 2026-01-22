import React, { useState, useEffect } from 'react';
import { DocumentTemplate, BusinessSettings, Project, Client } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Save, 
  Copy,
  Palette,
  Layout,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Image,
  Type,
  Calendar,
  DollarSign
} from 'lucide-react';

import DocumentBuilder from '../components/documents/DocumentBuilder';
import DocumentPreview from '../components/documents/DocumentPreview';

export default function DocumentCustomizerPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [documentType, setDocumentType] = useState('invoice');
  const [showBuilder, setShowBuilder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await DocumentTemplate.list('-updated_date');
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setShowBuilder(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setShowBuilder(true);
  };

  const handleCloneTemplate = async (template) => {
    try {
      const clonedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        default_template: false
      };
      delete clonedTemplate.id;
      delete clonedTemplate.created_date;
      delete clonedTemplate.updated_date;
      
      await DocumentTemplate.create(clonedTemplate);
      loadTemplates();
    } catch (error) {
      console.error('Error cloning template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await DocumentTemplate.delete(templateId);
        loadTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleSetDefault = async (template) => {
    try {
      // Remove default from all templates of this type
      const sameTypeTemplates = templates.filter(t => t.type === template.type);
      await Promise.all(
        sameTypeTemplates.map(t => 
          DocumentTemplate.update(t.id, { default_template: false })
        )
      );
      
      // Set this template as default
      await DocumentTemplate.update(template.id, { default_template: true });
      loadTemplates();
    } catch (error) {
      console.error('Error setting default template:', error);
    }
  };

  const filteredTemplates = templates.filter(t => t.type === documentType);

  const typeColors = {
    invoice: 'bg-green-100 text-green-800 border-green-200',
    estimate: 'bg-blue-100 text-blue-800 border-blue-200',
    receipt: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Document Templates</h1>
            <p className="text-slate-600">Customize your invoices, estimates, and receipts with advanced layouts and visualizations</p>
          </div>
          <Button
            onClick={handleCreateTemplate}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Document Type Filter */}
        <div className="mb-6">
          <Tabs value={documentType} onValueChange={setDocumentType}>
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="invoice">Invoices</TabsTrigger>
              <TabsTrigger value="estimate">Estimates</TabsTrigger>
              <TabsTrigger value="receipt">Receipts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-32 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <Card key={template.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <Badge className={`${typeColors[template.type]} border font-medium`}>
                        {template.type}
                      </Badge>
                      {template.default_template && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Preview Image Placeholder */}
                  <div className="h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCloneTemplate(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {!template.default_template && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(template)}
                        title="Set as default"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No {documentType} templates found</p>
              <p className="text-slate-400 mb-6">Create your first template to get started</p>
              <Button
                onClick={handleCreateTemplate}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create {documentType} Template
              </Button>
            </div>
          )}
        </div>

        {/* Document Builder Modal */}
        {showBuilder && (
          <DocumentBuilder
            template={selectedTemplate}
            documentType={documentType}
            onSave={async (templateData) => {
              try {
                if (selectedTemplate) {
                  await DocumentTemplate.update(selectedTemplate.id, templateData);
                } else {
                  await DocumentTemplate.create({ ...templateData, type: documentType });
                }
                setShowBuilder(false);
                loadTemplates();
              } catch (error) {
                console.error('Error saving template:', error);
              }
            }}
            onCancel={() => setShowBuilder(false)}
          />
        )}
      </div>
    </div>
  );
}