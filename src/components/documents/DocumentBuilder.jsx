
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Move, 
  Type, 
  Image, 
  Table, 
  BarChart3, 
  PieChart, 
  LineChart,
  DollarSign,
  Calendar,
  FileText,
  Palette,
  Sparkles,
  Wand2,
  Loader2,
  Eye,
  Download,
  TestTube
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  InvokeLLM,
  BusinessSettings,
  Project,
  Client,
  ProductOrService,
  Invoice
} from '../../api/integrations.js';
import { toast } from 'sonner';

import ComponentPalette from './ComponentPalette';
import ComponentEditor from './ComponentEditor';
import DocumentPreview from './DocumentPreview';

export default function DocumentBuilder({ template, documentType, onSubmit, onCancel }) {
  const [templateData, setTemplateData] = useState(template || {
    name: '',
    type: documentType,
    layout: {
      components: []
    },
    styles: {
      primaryColor: '#059669',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif'
    }
  });

  const [selectedComponent, setSelectedComponent] = useState(null);
  const [activeTab, setActiveTab] = useState('design');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiRequirement, setAiRequirement] = useState('');
  const [isGeneratingComponent, setIsGeneratingComponent] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [previewData, setPreviewData] = useState(null); // This state is now redundant if using realAppData directly for preview
  const [realAppData, setRealAppData] = useState(null);
  const [isLoadingAppData, setIsLoadingAppData] = useState(false);

  // Load real app data for testing
  const loadRealAppData = useCallback(async () => {
    if (isLoadingAppData && realAppData) return; // Prevent re-loading if already loading or loaded

    setIsLoadingAppData(true);
    try {
      const [businessData, projectsData, clientsData, productsData, invoicesData] = await Promise.all([
        BusinessSettings.list(),
        Project.list('-updated_date', 5),
        Client.list('-updated_date', 3),
        ProductOrService.list('-updated_date', 10),
        Invoice.list('-updated_date', 3)
      ]);

      const business = businessData[0] || {};
      const sampleProject = projectsData[0] || {};
      const sampleClient = clientsData[0] || {};
      const sampleProducts = productsData.slice(0, 6);
      const sampleInvoices = invoicesData;

      // Create realistic line items from actual products
      const lineItems = sampleProducts.map((product, index) => ({
        description: product.name || `Service Item ${index + 1}`,
        quantity: Math.floor(Math.random() * 5) + 1,
        unitPrice: product.unit_price || (Math.floor(Math.random() * 200) + 50),
        total: 0 // Will be calculated
      }));
      
      lineItems.forEach(item => {
        item.total = item.quantity * item.unitPrice;
      });

      const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0) || 15750.00; // Fallback to a default if 0

      setRealAppData({
        business_name: business.business_name || "Your Business Name",
        business_address: business.address_line_1 ? `${business.address_line_1}\n${business.address_line_2 ? business.address_line_2 + '\n' : ''}${business.city || ''}, ${business.state || ''} ${business.zip_code || ''}`.trim() : "123 Business Street\nYour City, State 12345",
        business_phone: business.phone_number || "(555) 123-4567",
        business_email: business.email || "info@yourbusiness.com",
        client_name: sampleClient.contact_person || sampleClient.company_name || "Sample Client",
        client_address: sampleClient.address ? `${sampleClient.address}\n${sampleClient.city || ''}, ${sampleClient.state || ''} ${sampleClient.zip_code || ''}`.trim() : "456 Client Avenue\nClient City, State 67890",
        client_email: sampleClient.email || "client@email.com",
        estimate_number: `EST-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
        invoice_number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
        receipt_number: `REC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
        issue_date: new Date().toLocaleDateString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        payment_date: new Date().toLocaleDateString(),
        payment_method: "Check #1234",
        project_name: sampleProject.title || "Sample Project",
        totalAmount: totalAmount,
        paymentAmount: totalAmount,
        lineItems: lineItems,
        projectStats: [
          { month: 'Jan', revenue: Math.floor(Math.random() * 20000) + 25000 },
          { month: 'Feb', revenue: Math.floor(Math.random() * 20000) + 25000 },
          { month: 'Mar', revenue: Math.floor(Math.random() * 20000) + 25000 },
          { month: 'Apr', revenue: Math.floor(Math.random() * 20000) + 25000 }
        ],
        expenseCategories: [
          { category: 'Materials', amount: Math.floor(totalAmount * 0.4) },
          { category: 'Labor', amount: Math.floor(totalAmount * 0.35) },
          { category: 'Equipment', amount: Math.floor(totalAmount * 0.15) },
          { category: 'Other', amount: Math.floor(totalAmount * 0.1) }
        ],
        timeline: [
          { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: Math.floor(totalAmount * 0.3) },
          { date: new Date().toISOString().split('T')[0], amount: Math.floor(totalAmount * 0.4) },
          { date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: Math.floor(totalAmount * 0.3) }
        ]
      });
    } catch (error) {
      console.error('Error loading real app data:', error);
      // Fallback to original sample data if real data fails
      setRealAppData(getSampleData());
    } finally {
      setIsLoadingAppData(false);
    }
  }, [isLoadingAppData, realAppData]);

  // Original sample data as fallback
  const getSampleData = () => {
    return {
      business_name: "Sample Construction Co",
      business_address: "123 Main Street\nAnytown, State 12345",
      business_phone: "(555) 123-4567",
      business_email: "info@sampleconstruction.com",
      client_name: "John & Jane Doe",
      client_address: "456 Oak Avenue\nSample City, State 67890",
      client_email: "client@email.com",
      estimate_number: "EST-2024-001",
      invoice_number: "INV-2024-001",
      receipt_number: "REC-2024-001",
      issue_date: new Date().toLocaleDateString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      payment_date: new Date().toLocaleDateString(),
      payment_method: "Check #1234",
      project_name: "Kitchen Renovation",
      totalAmount: 15750.00,
      paymentAmount: 15750.00,
      lineItems: [
        { description: "Kitchen Cabinet Installation", quantity: 1, unitPrice: 8500.00, total: 8500.00 },
        { description: "Granite Countertops", quantity: 45, unitPrice: 85.00, total: 3825.00 },
        { description: "Tile Backsplash", quantity: 35, unitPrice: 25.00, total: 875.00 },
        { description: "Electrical Work", quantity: 12, unitPrice: 95.00, total: 1140.00 },
        { description: "Plumbing Modifications", quantity: 8, unitPrice: 125.00, total: 1000.00 },
        { description: "Paint & Finish", quantity: 1, unitPrice: 410.00, total: 410.00 }
      ],
      projectStats: [
        { month: 'Jan', revenue: 25000 },
        { month: 'Feb', revenue: 32000 },
        { month: 'Mar', revenue: 28000 },
        { month: 'Apr', revenue: 41000 }
      ],
      expenseCategories: [
        { category: 'Materials', amount: 8500 },
        { category: 'Labor', amount: 5200 },
        { category: 'Equipment', amount: 1800 },
        { category: 'Other', amount: 250 }
      ],
      timeline: [
        { date: '2024-01-15', amount: 5000 },
        { date: '2024-02-01', amount: 5000 },
        { date: '2024-02-15', amount: 5750 }
      ]
    };
  };

  // Load real data on component mount
  useEffect(() => {
    loadRealAppData();
  }, [loadRealAppData]);

  const componentTypes = {
    text: { 
      icon: Type, 
      label: 'Text Block', 
      color: 'bg-blue-100 text-blue-700',
      description: 'Add headings, paragraphs, or any text content'
    },
    image: { 
      icon: Image, 
      label: 'Logo/Image', 
      color: 'bg-green-100 text-green-700',
      description: 'Company logos, photos, or other images'
    },
    table: { 
      icon: Table, 
      label: 'Data Table', 
      color: 'bg-purple-100 text-purple-700',
      description: 'Line items, pricing tables, or structured data'
    },
    barChart: { 
      icon: BarChart3, 
      label: 'Bar Chart', 
      color: 'bg-orange-100 text-orange-700',
      description: 'Revenue trends, project comparisons'
    },
    pieChart: { 
      icon: PieChart, 
      label: 'Pie Chart', 
      color: 'bg-pink-100 text-pink-700',
      description: 'Expense breakdowns, category distributions'
    },
    lineChart: { 
      icon: LineChart, 
      label: 'Line Chart', 
      color: 'bg-indigo-100 text-indigo-700',
      description: 'Timeline data, payment schedules'
    },
    currency: { 
      icon: DollarSign, 
      label: 'Currency Field', 
      color: 'bg-emerald-100 text-emerald-700',
      description: 'Total amounts, subtotals, prices'
    },
    date: { 
      icon: Calendar, 
      label: 'DateField', 
      color: 'bg-amber-100 text-amber-700',
      description: 'Issue dates, due dates, completion dates'
    }
  };

  const addComponent = (componentType) => {
    const newComponent = {
      id: `component_${Date.now()}`,
      type: componentType,
      props: getDefaultProps(componentType),
      styles: {
        margin: '10px 0',
        padding: '10px',
        backgroundColor: componentType === 'currency' ? '#f0fdf4' : 'transparent',
        borderRadius: componentType === 'currency' ? '8px' : '0px'
      }
    };

    setTemplateData(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        components: [...prev.layout.components, newComponent]
      }
    }));

    // Auto-select the new component for editing
    setSelectedComponent(newComponent);
    toast.success(`${componentTypes[componentType].label} added to template`);
  };

  const generateTestPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Load fresh real data for PDF generation
      await loadRealAppData();
      toast.success('Test PDF generated with real business data! Check the preview.');
    } catch (error) {
      console.error('Error generating test PDF:', error);
      toast.error('Failed to generate test PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateAIComponent = async () => {
    if (!aiRequirement.trim()) {
      toast.error('Please describe what component you need');
      return;
    }

    setIsGeneratingComponent(true);
    try {
      // Enhanced prompt with real business context
      const businessContext = realAppData ? `
Business Context:
- Business Name: ${realAppData.business_name}
- Business Type: ${documentType || 'Service Business'}
- Typical Services/Products: ${realAppData.lineItems?.map(item => item.description).join(', ') || 'Various services'}
- Average Project Value: $${realAppData.totalAmount || '5,000'}
` : '';

      const prompt = `Generate a document template component for a ${documentType} based on this requirement: "${aiRequirement}"

${businessContext}

Based on the requirement and business context, determine the most appropriate component type and configuration.

Available component types:
- text: For headings, labels, paragraphs, terms and conditions
- table: For line items, itemized lists, data presentation
- currency: For displaying monetary amounts
- date: For displaying dates
- image: For logos, signatures, photos
- barChart: For showing trends or comparisons (e.g., projectStats)
- pieChart: For showing distributions (e.g., expenseCategories)
- lineChart: For showing timeline data (e.g., timeline)

Data available for templates (use double curly braces for variables, e.g., {{business_name}}):
- Business info: {{business_name}}, {{business_address}}, {{business_phone}}, {{business_email}}
- Client info: {{client_name}}, {{client_address}}, {{client_email}}  
- Document info: {{estimate_number}}, {{invoice_number}}, {{receipt_number}}, {{issue_date}}, {{due_date}}, {{expiry_date}}, {{payment_date}}, {{payment_method}}, {{project_name}}
- Financial data: {{totalAmount}}, {{paymentAmount}}, lineItems (array with description, quantity, unitPrice, total)
- Charts data: projectStats (array with month, revenue), expenseCategories (array with category, amount), timeline (array with date, amount)

Return a JSON object with this structure:
{
  "component_type": "text|table|currency|date|image|barChart|pieChart|lineChart",
  "name": "Component name for display",
  "props": {
    "content": "Text content with {{variable}} placeholders if text type",
    "fontSize": "Size in px like 14px",
    "fontWeight": "normal|bold",
    "textAlign": "left|center|right",
    "src": "image URL if image type",
    "width": "image width",
    "height": "image height",
    "columns": [array of column objects if table type],
    "dataSource": "data source name if table/chart type",
    "field": "field name if currency/date type",
    "label": "display label if currency/date type",
    "format": "format type if currency/date type (e.g., 'currency', 'MMM d, yyyy')",
    "xAxis": "x-axis key if chart type",
    "yAxis": "y-axis key if chart type",
    "valueField": "value field if pie chart",
    "labelField": "label field if pie chart",
    "title": "chart title"
  },
  "styles": {
    "margin": "margin spacing (e.g., '10px 0')",
    "padding": "padding spacing (e.g., '10px')", 
    "backgroundColor": "background color if needed (e.g., '#f0fdf4')",
    "borderRadius": "border radius if needed",
    "textAlign": "text alignment if applicable"
  },
  "explanation": "Brief explanation of why this component fits the requirement and how it uses the available data"
}

Make sure to use actual variable names from the available data (like {{business_name}} or {{client_name}}) in text content. Prioritize using data sources like 'lineItems', 'projectStats', 'expenseCategories', 'timeline' for tables and charts.`;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            component_type: { type: "string" },
            name: { type: "string" },
            props: { type: "object", additionalProperties: true },
            styles: { type: "object", additionalProperties: true },
            explanation: { type: "string" }
          },
          required: ["component_type", "name", "props", "styles", "explanation"]
        }
      });

      // Create the AI-generated component
      const newComponent = {
        id: `ai_component_${Date.now()}`,
        type: response.component_type,
        props: response.props,
        styles: response.styles
      };

      setTemplateData(prev => ({
        ...prev,
        layout: {
          ...prev.layout,
          components: [...prev.layout.components, newComponent]
        }
      }));

      setSelectedComponent(newComponent);
      toast.success(`Added ${response.name}: ${response.explanation}`);
      setAiRequirement('');
      setShowAIAssistant(false);

    } catch (error) {
      console.error('AI component generation failed:', error);
      toast.error('Failed to generate component. Please try again.');
    } finally {
      setIsGeneratingComponent(false);
    }
  };

  const getDefaultProps = (type) => {
    switch (type) {
      case 'text':
        return { content: 'Sample text content', fontSize: '14px', fontWeight: 'normal', textAlign: 'left' };
      case 'image':
        return { src: '', alt: 'Company Logo', width: '200px', height: 'auto' };
      case 'table':
        return { 
          dataSource: 'lineItems',
          columns: [
            { key: 'description', title: 'Description', width: '50%' },
            { key: 'quantity', title: 'Qty', width: '15%' },
            { key: 'unitPrice', title: 'Price', width: '20%' },
            { key: 'total', title: 'Total', width: '15%' }
          ]
        };
      case 'barChart':
        return { 
          dataSource: 'projectStats',
          xAxis: 'month',
          yAxis: 'revenue',
          title: 'Monthly Revenue',
          height: '300px'
        };
      case 'pieChart':
        return { 
          dataSource: 'expenseCategories',
          valueField: 'amount',
          labelField: 'category',
          title: 'Expense Breakdown',
          height: '300px'
        };
      case 'lineChart':
        return { 
          dataSource: 'timeline',
          xAxis: 'date',
          yAxis: 'amount',
          title: 'Payment Timeline',
          height: '300px'
        };
      case 'currency':
        return { field: 'totalAmount', label: 'Total Amount', format: 'currency' };
      case 'date':
        return { field: 'issue_date', label: 'Issue Date', format: 'MMM d, yyyy' };
      default:
        return {};
    }
  };

  const updateComponent = (componentId, updates) => {
    setTemplateData(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        components: prev.layout.components.map(comp =>
          comp.id === componentId ? { ...comp, ...updates } : comp
        )
      }
    }));
  };

  const removeComponent = (componentId) => {
    if (window.confirm('Are you sure you want to delete this component?')) {
      setTemplateData(prev => ({
        ...prev,
        layout: {
          ...prev.layout,
          components: prev.layout.components.filter(comp => comp.id !== componentId)
        }
      }));
      setSelectedComponent(null);
      toast.success('Component deleted');
    }
  };

  const duplicateComponent = (component) => {
    const duplicatedComponent = {
      ...component,
      id: `component_${Date.now()}`,
      // Only duplicate content for text components, otherwise, it might be weird
      props: { ...component.props, ...(component.type === 'text' ? { content: component.props.content + ' (Copy)' } : {}) }
    };

    setTemplateData(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        components: [...prev.layout.components, duplicatedComponent]
      }
    }));

    toast.success('Component duplicated');
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(templateData.layout.components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTemplateData(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        components: items
      }
    }));

    toast.success('Components reordered');
  };

  // New function to handle reordering from preview
  const handlePreviewReorder = (sourceIndex, destinationIndex) => {
    const items = Array.from(templateData.layout.components);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(destinationIndex, 0, reorderedItem);

    setTemplateData(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        components: items
      }
    }));

    toast.success('Components reordered in preview');
  };

  const handleSave = () => {
    if (!templateData.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    onSubmit(templateData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {template ? 'Edit Template' : `Create ${documentType?.charAt(0).toUpperCase() + documentType?.slice(1)} Template`}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                onClick={generateTestPDF}
                disabled={isGeneratingPDF || templateData.layout.components.length === 0 || isLoadingAppData}
                variant="outline"
                size="sm"
              >
                {isGeneratingPDF || isLoadingAppData ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isLoadingAppData ? 'Loading Data...' : 'Generating...'}</>
                ) : (
                  <><TestTube className="w-4 h-4 mr-2" /> Test PDF</>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-6 h-[calc(90vh-100px)]">
          {/* Left Panel - Design Tools */}
          <div className="w-80 flex flex-col border-r bg-slate-50/50">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="p-4 border-b">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
                  <TabsTrigger value="components" className="text-xs">Add</TabsTrigger>
                  <TabsTrigger value="styles" className="text-xs">Styles</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <TabsContent value="design" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      value={templateData.name}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                      autoComplete="off"
                    />
                  </div>

                  {/* AI Component Generator */}
                  <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <CardTitle className="text-sm text-indigo-900">AI Assistant</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Describe what you need (e.g., 'Add a section for payment terms', 'Create a table for project timeline')"
                          value={aiRequirement}
                          onChange={(e) => setAiRequirement(e.target.value)}
                          rows={2}
                          className="bg-white text-sm"
                        />
                        <Button
                          onClick={generateAIComponent}
                          disabled={isGeneratingComponent || !aiRequirement.trim()}
                          size="sm"
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                          {isGeneratingComponent ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                          ) : (
                            <><Wand2 className="w-4 h-4 mr-2" /> Generate Component</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm">Template Components</h3>
                      <Badge variant="outline" className="text-xs">
                        {templateData.layout.components.length} items
                      </Badge>
                    </div>
                    
                    {templateData.layout.components.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No components yet</p>
                        <p className="text-xs">Add components from the "Add" tab</p>
                      </div>
                    ) : (
                      <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="components">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                              {templateData.layout.components.map((component, index) => {
                                const ComponentInfo = componentTypes[component.type];
                                return (
                                  <Draggable key={component.id} draggableId={component.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                          selectedComponent?.id === component.id
                                            ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                        } ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
                                        onClick={() => setSelectedComponent(component)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                            <Move className="w-4 h-4 text-slate-400" />
                                          </div>
                                          {ComponentInfo?.icon && <ComponentInfo.icon className="w-4 h-4" />}
                                          <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium block truncate">{ComponentInfo?.label || component.type}</span>
                                            <p className="text-xs text-slate-500 truncate">
                                              {component.props.content || component.props.label || component.props.title || 'Component'}
                                            </p>
                                          </div>
                                          <div className="flex gap-1">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                duplicateComponent(component);
                                              }}
                                            >
                                              <Plus className="w-3 h-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                removeComponent(component.id);
                                              }}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="components" className="mt-0">
                  <ComponentPalette onAddComponent={addComponent} componentTypes={componentTypes} />
                </TabsContent>

                <TabsContent value="styles" className="space-y-4 mt-0">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={templateData.styles.primaryColor}
                          onChange={(e) => setTemplateData(prev => ({
                            ...prev,
                            styles: { ...prev.styles, primaryColor: e.target.value }
                          }))}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={templateData.styles.primaryColor}
                          onChange={(e) => setTemplateData(prev => ({
                            ...prev,
                            styles: { ...prev.styles, primaryColor: e.target.value }
                          }))}
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={templateData.styles.backgroundColor}
                          onChange={(e) => setTemplateData(prev => ({
                            ...prev,
                            styles: { ...prev.styles, backgroundColor: e.target.value }
                          }))}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={templateData.styles.backgroundColor}
                          onChange={(e) => setTemplateData(prev => ({
                            ...prev,
                            styles: { ...prev.styles, backgroundColor: e.target.value }
                          }))}
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="textColor"
                          type="color"
                          value={templateData.styles.textColor}
                          onChange={(e) => setTemplateData(prev => ({
                            ...prev,
                            styles: { ...prev.styles, textColor: e.target.value }
                          }))}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={templateData.styles.textColor}
                          onChange={(e) => setTemplateData(prev => ({
                            ...prev,
                            styles: { ...prev.styles, textColor: e.target.value }
                          }))}
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="fontFamily">Font Family</Label>
                      <select
                        id="fontFamily"
                        value={templateData.styles.fontFamily}
                        onChange={(e) => setTemplateData(prev => ({
                          ...prev,
                          styles: { ...prev.styles, fontFamily: e.target.value }
                        }))}
                        className="w-full mt-1 p-2 border rounded-md text-sm"
                      >
                        <option value="Inter, sans-serif">Inter (Modern)</option>
                        <option value="Arial, sans-serif">Arial (Classic)</option>
                        <option value="Georgia, serif">Georgia (Elegant)</option>
                        <option value="Helvetica, sans-serif">Helvetica (Clean)</option>
                        <option value="Times New Roman, serif">Times New Roman (Traditional)</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            {/* Component Editor */}
            {selectedComponent && (
              <div className="border-t bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">Edit Component</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeComponent(selectedComponent.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
                <ComponentEditor
                  component={selectedComponent}
                  onUpdate={(updates) => updateComponent(selectedComponent.id, updates)}
                />
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Live Preview</h3>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {templateData.type?.charAt(0).toUpperCase() + templateData.type?.slice(1)}
                  </Badge>
                  {realAppData && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                      Real Data Loaded
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    Drag & Drop Enabled
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-100 overflow-y-auto p-4">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <DocumentPreview 
                  template={templateData}
                  documentType={documentType}
                  sampleData={realAppData || getSampleData()} // Use realAppData if available, otherwise fallback to sample
                  onComponentReorder={handlePreviewReorder}
                  isEditable={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            {templateData.layout.components.length > 0 && (
              <Button
                onClick={generateTestPDF}
                disabled={isGeneratingPDF || isLoadingAppData}
                variant="outline"
              >
                {isGeneratingPDF || isLoadingAppData ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isLoadingAppData ? 'Loading Data...' : 'Generating...'}</>
                ) : (
                  <><Eye className="w-4 h-4 mr-2" /> Generate Test PDF</>
                )}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
