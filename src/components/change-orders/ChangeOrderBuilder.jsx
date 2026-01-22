
import React, { useState, useEffect } from 'react';
import { ChangeOrder, ProductOrService, User, BusinessSettings, ActivityLog } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Trash2, Save, X, Calculator, FileText } from "lucide-react";
import { toast } from "sonner";
import { generateChangeOrderPdf } from "@/api/functions";

export default function ChangeOrderBuilder({ project, changeOrder, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(changeOrder || {
    project_id: project?.id || '',
    title: '',
    description: '',
    change_order_number: '',
    reason_for_change: '',
    impact_on_schedule: '',
    client_requested: false,
    urgency: 'medium',
    estimated_completion_impact: '',
    line_items: [],
    subtotal: 0,
    tax_amount: 0,
    overall_adjustment: 0,
    overall_adjustment_reason: '',
    total_after_adjustments: 0,
    internal_cost_total: 0 // New field for internal cost tracking
  });

  const [products, setProducts] = useState([]);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadData();
    if (!changeOrder) {
      generateChangeOrderNumber();
    }
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData.line_items, formData.overall_adjustment]);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [productsData, settingsData] = await Promise.all([
        ProductOrService.filter({ business_id: user.current_business_id }),
        BusinessSettings.filter({ business_id: user.current_business_id })
      ]);

      setProducts(productsData);
      setBusinessSettings(settingsData.length > 0 ? settingsData[0] : null);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load initial data.');
    }
  };

  const generateChangeOrderNumber = async () => {
    try {
      // Get existing change orders for this project to generate next number
      const existingChangeOrders = await ChangeOrder.filter({ project_id: project.id });
      const nextNumber = existingChangeOrders.length + 1;
      const changeOrderNumber = `CO-${String(nextNumber).padStart(3, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        change_order_number: changeOrderNumber
      }));
    } catch (error) {
      console.error('Error generating change order number:', error);
    }
  };

  const calculateTotals = () => {
    const lineItems = formData.line_items || [];
    const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const internalCostTotal = lineItems.reduce((sum, item) => sum + ((item.cost_price || 0) * (item.quantity || 0)), 0);
    
    const taxRate = businessSettings?.tax_rate || 0;
    const taxableAmount = lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.total || 0), 0);
    
    const taxAmount = taxableAmount * taxRate;
    const totalAfterAdjustments = subtotal + taxAmount + (formData.overall_adjustment || 0);

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_after_adjustments: totalAfterAdjustments,
      internal_cost_total: internalCostTotal
    }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [...(prev.line_items || []), {
        description: '',
        quantity: 1,
        unit_price: 0,
        cost_price: 0,
        type: 'material',
        total: 0,
        taxable: true,
        adjustment_amount: 0,
        adjustment_reason: '',
        hours: 0, // Default for new item
        required_labor_type_name: null // Default for new item
      }]
    }));
  };

  const updateLineItem = (index, field, value) => {
    const updatedItems = [...(formData.line_items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitPrice = field === 'unit_price' ? value : updatedItems[index].unit_price;
      updatedItems[index].total = quantity * unitPrice + (updatedItems[index].adjustment_amount || 0);
    }
    
    if (field === 'adjustment_amount') {
      const quantity = updatedItems[index].quantity || 0;
      const unitPrice = updatedItems[index].unit_price || 0;
      updatedItems[index].total = (quantity * unitPrice) + (value || 0);
    }

    setFormData(prev => ({ ...prev, line_items: updatedItems }));
  };

  const removeLineItem = (index) => {
    const updatedItems = formData.line_items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, line_items: updatedItems }));
  };

  const addProductService = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        line_items: [...(prev.line_items || []), {
          description: product.name,
          quantity: 1,
          unit_price: product.unit_price,
          cost_price: product.cost_price || 0,
          type: product.type || 'material',
          total: product.unit_price,
          taxable: true,
          adjustment_amount: 0,
          adjustment_reason: '',
          hours: product.hours || 0,
          required_labor_type_name: product.required_labor_type_name || null
        }]
      }));
    }
  };

  const handleDateSelect = (date) => {
    setFormData(prev => ({
      ...prev,
      estimated_completion_impact: date ? format(date, 'yyyy-MM-dd') : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const changeOrderData = { ...formData };
      
      let savedChangeOrder;
      if (changeOrder) {
        savedChangeOrder = await ChangeOrder.update(changeOrder.id, changeOrderData);
        toast.success("Change order updated successfully");
      } else {
        savedChangeOrder = await ChangeOrder.create(changeOrderData);
        
        // Generate PDF automatically for new change orders
        try {
          // Assuming generateChangeOrderPdf returns a response object with a data property containing the PDF blob/buffer
          const pdfResponse = await generateChangeOrderPdf({ changeOrderId: savedChangeOrder.id });
          const pdfBlob = new Blob([pdfResponse.data], { type: 'application/pdf' });
          
          const pdfFileName = `ChangeOrder-${formData.change_order_number}.pdf`;
          const pdfUrl = window.URL.createObjectURL(pdfBlob); // In production, this would be a cloud storage URL
          
          // Store PDF reference in change order
          await ChangeOrder.update(savedChangeOrder.id, {
            pdf_url: pdfUrl,
            pdf_filename: pdfFileName,
            pdf_generated_date: new Date().toISOString()
          });
          
          toast.success("Change order created successfully with PDF generated!");
          
        } catch (pdfError) {
          console.error('Error generating change order PDF:', pdfError);
          toast.warning("Change order created successfully, but PDF generation failed. You can generate it manually later.");
        }
      }

      // Log the activity
      if (currentUser) {
        await ActivityLog.create({
          project_id: project.id,
          user_email: currentUser.email,
          user_name: currentUser.full_name || currentUser.email,
          action_type: 'change_order_created',
          action_description: `${changeOrder ? 'Updated' : 'Created'} change order: ${formData.title}`,
          metadata: {
            change_order_number: formData.change_order_number,
            total_amount: formData.total_after_adjustments,
            urgency: formData.urgency
          },
          visible_to_client: true
        });
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving change order:', error);
      toast.error('Failed to save change order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChangeOrder = async () => {
    if (!changeOrder?.id) return;
    
    setIsSubmitting(true);
    try {
      await ChangeOrder.delete(changeOrder.id);
      toast.success("Change order deleted successfully");
      // Since this is a builder/editor dialog, on successful delete, we close the dialog.
      // The parent component should then refresh its list of change orders.
      onCancel(); 
    } catch (error) {
      console.error('Error deleting change order:', error);
      toast.error('Failed to delete change order. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {changeOrder ? 'Edit Change Order' : 'Create Change Order'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Change Order Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter change order title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="change_order_number">Change Order Number</Label>
                <Input
                  id="change_order_number"
                  value={formData.change_order_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, change_order_number: e.target.value }))}
                  placeholder="CO-001"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the change order"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason_for_change">Reason for Change</Label>
              <Textarea
                id="reason_for_change"
                value={formData.reason_for_change}
                onChange={(e) => setFormData(prev => ({ ...prev, reason_for_change: e.target.value }))}
                placeholder="Detailed reason why this change is needed"
                rows={3}
              />
            </div>

            {/* Change Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="client_requested"
                  checked={formData.client_requested}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, client_requested: checked }))}
                />
                <Label htmlFor="client_requested">Client Requested Change</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact_on_schedule">Impact on Schedule</Label>
              <Textarea
                id="impact_on_schedule"
                value={formData.impact_on_schedule}
                onChange={(e) => setFormData(prev => ({ ...prev, impact_on_schedule: e.target.value }))}
                placeholder="How this change affects the project timeline"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>New Estimated Completion (if applicable)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.estimated_completion_impact 
                      ? format(new Date(formData.estimated_completion_impact), "PPP") 
                      : "Select new completion date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.estimated_completion_impact ? new Date(formData.estimated_completion_impact) : undefined}
                    onSelect={handleDateSelect}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Separator />

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Change Order Items</h3>
                <div className="flex gap-2">
                  <Select onValueChange={addProductService}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Add from catalog" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ${product.unit_price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addLineItem} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Taxable</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(formData.line_items || []).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${(item.total || 0).toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.taxable}
                          onCheckedChange={(checked) => updateLineItem(index, 'taxable', checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="overall_adjustment">Overall Adjustment</Label>
                  <Input
                    id="overall_adjustment"
                    type="number"
                    step="0.01"
                    value={formData.overall_adjustment}
                    onChange={(e) => setFormData(prev => ({ ...prev, overall_adjustment: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overall_adjustment_reason">Adjustment Reason</Label>
                  <Input
                    id="overall_adjustment_reason"
                    value={formData.overall_adjustment_reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, overall_adjustment_reason: e.target.value }))}
                    placeholder="Reason for adjustment"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(formData.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${(formData.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overall Adjustment:</span>
                  <span>${(formData.overall_adjustment || 0).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${(formData.total_after_adjustments || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 justify-between">
              <div className="flex gap-2">
                {changeOrder && ( // Only show delete button if editing an existing change order
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={confirmDelete}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : (changeOrder ? 'Update Change Order' : 'Create Change Order')}
                  </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Change Order</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete change order "{formData.title}"? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChangeOrder} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete Change Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
