import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette, Plus, Trash2 } from 'lucide-react';

export default function ComponentEditor({ component, onUpdate }) {
  if (!component) return null;

  const updateProps = (key, value) => {
    onUpdate({
      props: { ...component.props, [key]: value }
    });
  };

  const updateStyles = (key, value) => {
    onUpdate({
      styles: { ...component.styles, [key]: value }
    });
  };

  const addTableColumn = () => {
    const newColumn = {
      key: `column_${Date.now()}`,
      title: 'New Column',
      width: '20%'
    };
    
    updateProps('columns', [...(component.props.columns || []), newColumn]);
  };

  const updateTableColumn = (index, field, value) => {
    const updatedColumns = [...(component.props.columns || [])];
    updatedColumns[index] = { ...updatedColumns[index], [field]: value };
    updateProps('columns', updatedColumns);
  };

  const removeTableColumn = (index) => {
    const updatedColumns = [...(component.props.columns || [])];
    updatedColumns.splice(index, 1);
    updateProps('columns', updatedColumns);
  };

  const renderPropsEditor = () => {
    switch (component.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={component.props.content || ''}
                onChange={(e) => updateProps('content', e.target.value)}
                placeholder="Enter your text content..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <Select value={component.props.fontSize} onValueChange={(value) => updateProps('fontSize', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12px">Small (12px)</SelectItem>
                    <SelectItem value="14px">Normal (14px)</SelectItem>
                    <SelectItem value="16px">Medium (16px)</SelectItem>
                    <SelectItem value="18px">Large (18px)</SelectItem>
                    <SelectItem value="24px">Heading (24px)</SelectItem>
                    <SelectItem value="32px">Title (32px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fontWeight">Font Weight</Label>
                <Select value={component.props.fontWeight} onValueChange={(value) => updateProps('fontWeight', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="600">Semi Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="textAlign">Text Alignment</Label>
              <Select value={component.props.textAlign} onValueChange={(value) => updateProps('textAlign', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="src">Image URL</Label>
              <Input
                id="src"
                type="url"
                value={component.props.src || ''}
                onChange={(e) => updateProps('src', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={component.props.alt || ''}
                onChange={(e) => updateProps('alt', e.target.value)}
                placeholder="Describe the image..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  value={component.props.width || ''}
                  onChange={(e) => updateProps('width', e.target.value)}
                  placeholder="200px, 100%, auto"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={component.props.height || ''}
                  onChange={(e) => updateProps('height', e.target.value)}
                  placeholder="auto, 100px"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="dataSource">Data Source</Label>
              <Select value={component.props.dataSource} onValueChange={(value) => updateProps('dataSource', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lineItems">Line Items</SelectItem>
                  <SelectItem value="projectStats">Project Statistics</SelectItem>
                  <SelectItem value="expenseCategories">Expense Categories</SelectItem>
                  <SelectItem value="timeline">Timeline Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Table Columns</Label>
                <Button size="sm" variant="outline" onClick={addTableColumn}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add Column
                </Button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(component.props.columns || []).map((column, index) => (
                  <Card key={index} className="border border-slate-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">Column {index + 1}</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeTableColumn(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Key</Label>
                          <Input
                            value={column.key || ''}
                            onChange={(e) => updateTableColumn(index, 'key', e.target.value)}
                            placeholder="fieldName"
                            className="text-xs h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Title</Label>
                          <Input
                            value={column.title || ''}
                            onChange={(e) => updateTableColumn(index, 'title', e.target.value)}
                            placeholder="Display Name"
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label className="text-xs">Width</Label>
                        <Input
                          value={column.width || ''}
                          onChange={(e) => updateTableColumn(index, 'width', e.target.value)}
                          placeholder="20%, 100px"
                          className="text-xs h-8"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'currency':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="field">Field Name</Label>
              <Select value={component.props.field} onValueChange={(value) => updateProps('field', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalAmount">Total Amount</SelectItem>
                  <SelectItem value="paymentAmount">Payment Amount</SelectItem>
                  <SelectItem value="subtotal">Subtotal</SelectItem>
                  <SelectItem value="taxAmount">Tax Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="label">Display Label</Label>
              <Input
                id="label"
                value={component.props.label || ''}
                onChange={(e) => updateProps('label', e.target.value)}
                placeholder="e.g., Total Amount"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="format">Format</Label>
              <Select value={component.props.format} onValueChange={(value) => updateProps('format', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="currency">Currency ($1,234.56)</SelectItem>
                  <SelectItem value="number">Number (1234.56)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="field">Field Name</Label>
              <Select value={component.props.field} onValueChange={(value) => updateProps('field', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="issueDate">Issue Date</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="paymentDate">Payment Date</SelectItem>
                  <SelectItem value="expiryDate">Expiry Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="label">Display Label</Label>
              <Input
                id="label"
                value={component.props.label || ''}
                onChange={(e) => updateProps('label', e.target.value)}
                placeholder="e.g., Issue Date"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="format">Date Format</Label>
              <Select value={component.props.format} onValueChange={(value) => updateProps('format', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MMM d, yyyy">Jan 15, 2024</SelectItem>
                  <SelectItem value="MM/dd/yyyy">01/15/2024</SelectItem>
                  <SelectItem value="dd/MM/yyyy">15/01/2024</SelectItem>
                  <SelectItem value="yyyy-MM-dd">2024-01-15</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={component.props.title || ''}
                onChange={(e) => updateProps('title', e.target.value)}
                placeholder="Chart title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dataSource">Data Source</Label>
              <Select value={component.props.dataSource} onValueChange={(value) => updateProps('dataSource', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="projectStats">Project Statistics</SelectItem>
                  <SelectItem value="expenseCategories">Expense Categories</SelectItem>
                  <SelectItem value="timeline">Timeline Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="height">Chart Height</Label>
              <Select value={component.props.height} onValueChange={(value) => updateProps('height', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select height" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="200px">Small (200px)</SelectItem>
                  <SelectItem value="300px">Medium (300px)</SelectItem>
                  <SelectItem value="400px">Large (400px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
    }
  };

  const renderStylesEditor = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="margin">Margin</Label>
        <Input
          id="margin"
          value={component.styles?.margin || ''}
          onChange={(e) => updateStyles('margin', e.target.value)}
          placeholder="10px 0, 20px 15px"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="padding">Padding</Label>
        <Input
          id="padding"
          value={component.styles?.padding || ''}
          onChange={(e) => updateStyles('padding', e.target.value)}
          placeholder="10px, 15px 20px"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="backgroundColor">Background Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="color"
            value={component.styles?.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyles('backgroundColor', e.target.value)}
            className="w-16 h-10"
          />
          <Input
            type="text"
            value={component.styles?.backgroundColor || ''}
            onChange={(e) => updateStyles('backgroundColor', e.target.value)}
            placeholder="transparent, #ffffff"
            className="flex-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="borderRadius">Border Radius</Label>
        <Input
          id="borderRadius"
          value={component.styles?.borderRadius || ''}
          onChange={(e) => updateStyles('borderRadius', e.target.value)}
          placeholder="0px, 8px, 16px"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="textAlign">Text Alignment</Label>
        <Select value={component.styles?.textAlign} onValueChange={(value) => updateStyles('textAlign', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="justify">Justify</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="properties" className="text-xs">
            <Settings className="w-3 h-3 mr-1" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="styles" className="text-xs">
            <Palette className="w-3 h-3 mr-1" />
            Styles
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="mt-4">
          {renderPropsEditor()}
        </TabsContent>
        
        <TabsContent value="styles" className="mt-4">
          {renderStylesEditor()}
        </TabsContent>
      </Tabs>
    </div>
  );
}