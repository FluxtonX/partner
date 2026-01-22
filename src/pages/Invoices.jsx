
import React, { useState, useEffect } from 'react';
import { Invoice, Project, Client, WorkLog, ChangeOrder, User, BusinessSettings, InvoicePayment } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format, addDays } from 'date-fns';
import { FileText, Plus, Edit, Trash2, Send, DollarSign, Clock, Calculator, Eye, Percent, Hash, CreditCard, CheckCircle } from "lucide-react";
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [changeOrders, setChangeOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [invoicePayments, setInvoicePayments] = useState({});

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [invoicesData, projectsData, clientsData, workLogsData, changeOrdersData, usersData, settingsData, paymentsData] = await Promise.all([
        Invoice.list('-created_date'),
        Project.list(),
        Client.list(),
        WorkLog.list(),
        ChangeOrder.list(),
        User.list(),
        BusinessSettings.filter({ business_id: user.current_business_id }),
        InvoicePayment.list('-payment_date')
      ]);

      setInvoices(invoicesData);
      setProjects(projectsData);
      setClients(clientsData);
      setWorkLogs(workLogsData);
      setChangeOrders(changeOrdersData);
      setUsers(usersData);
      setBusinessSettings(settingsData.length > 0 ? settingsData[0] : null);

      // Group payments by invoice ID
      const paymentsGrouped = paymentsData.reduce((acc, payment) => {
        if (!acc[payment.invoice_id]) acc[payment.invoice_id] = [];
        acc[payment.invoice_id].push(payment);
        return acc;
      }, {});
      setInvoicePayments(paymentsGrouped);

    } catch (error) {
      console.error('Error loading invoice data:', error);
      toast.error('Failed to load invoice data');
    } finally {
      setIsLoading(false);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return 'Unknown Client';
    return client.company_name || client.contact_person || `${client.first_name || ''} ${client.last_name || ''}`.trim();
  };

  const getProjectTitle = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  const handleCreateInvoice = (project = null) => {
    setSelectedProject(project);
    setEditingInvoice(null);
    setShowInvoiceBuilder(true);
  };

  const handleEditInvoice = (invoice) => {
    const project = projects.find(p => p.id === invoice.project_id);
    setSelectedProject(project);
    setEditingInvoice(invoice);
    setShowInvoiceBuilder(true);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    setDeletingInvoice(invoiceId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteInvoice = async () => {
    if (!deletingInvoice) return;
    
    try {
      await Invoice.delete(deletingInvoice);
      toast.success('Invoice deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice. Please try again.');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingInvoice(null);
    }
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    void: 'bg-gray-100 text-gray-700'
  };

  const handleShowPaymentStatus = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
  };

  const handlePaymentStatusUpdate = () => {
    setSelectedInvoiceForPayment(null);
    loadData(); // Refresh all data
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Invoices</h1>
            <p className="text-slate-600">Create and manage client invoices from projects and work logs</p>
          </div>
          <Button onClick={() => handleCreateInvoice()} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{invoices.length}</p>
                  <p className="text-sm text-slate-600 font-medium">Total Invoices</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0).toFixed(0)}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Paid Invoices</p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    ${invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + (i.total_amount || 0), 0).toFixed(0)}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Outstanding</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {invoices.filter(i => i.status === 'overdue').length}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Overdue</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              All Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading invoices...</div>
            ) : invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{getClientName(invoice.client_id)}</TableCell>
                      <TableCell>{getProjectTitle(invoice.project_id)}</TableCell>
                      <TableCell>{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(new Date(invoice.due_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="font-semibold">${(invoice.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[invoice.status]}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.status === 'paid' ? (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">
                              {invoicePayments[invoice.id] ? `${invoicePayments[invoice.id].length} payment(s)` : 'Paid'}
                            </span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowPaymentStatus(invoice)}
                          >
                            <CreditCard className="w-4 h-4 mr-1" />
                            Manage Payment
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditInvoice(invoice)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Link to={createPageUrl(`PublicInvoice?id=${invoice.id}`)} target="_blank">
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteInvoice(invoice.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">No invoices found</p>
                <p className="text-slate-400">Create your first invoice to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Builder Modal */}
        {showInvoiceBuilder && (
          <InvoiceBuilder
            invoice={editingInvoice}
            selectedProject={selectedProject}
            projects={projects}
            clients={clients}
            workLogs={workLogs}
            changeOrders={changeOrders}
            users={users}
            businessSettings={businessSettings}
            currentUser={currentUser}
            onSubmit={async (invoiceData) => {
              try {
                const dataToSave = {
                    ...invoiceData,
                    business_id: currentUser.current_business_id, // Add business_id
                };

                let savedInvoice; // Variable to hold the result of create/update

                if (editingInvoice) {
                  savedInvoice = await Invoice.update(editingInvoice.id, dataToSave);
                  toast.success('Invoice updated successfully');
                } else {
                  savedInvoice = await Invoice.create(dataToSave);
                  toast.success('Invoice created successfully');
                  
                  // Auto-generate PDF for the new invoice
                  try {
                    console.log('Auto-generating PDF for new invoice (on-demand):', savedInvoice.id);
                    // The PDF will be generated on-demand when accessed through client portal
                  } catch (pdfError) {
                    console.error('Error logging invoice PDF generation:', pdfError);
                    // Don't fail the invoice creation if PDF generation logging fails
                  }
                }
                setShowInvoiceBuilder(false);
                loadData();
              } catch (error) {
                console.error('Error saving invoice:', error);
                toast.error('Failed to save invoice');
              }
            }}
            onCancel={() => setShowInvoiceBuilder(false)}
          />
        )}

        {/* Payment Status Management Modal */}
        {selectedInvoiceForPayment && (
          <Dialog open={true} onOpenChange={() => setSelectedInvoiceForPayment(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Payment Management - Invoice #{selectedInvoiceForPayment.invoice_number}</DialogTitle>
              </DialogHeader>
              <PaymentStatusManager
                invoice={selectedInvoiceForPayment}
                payments={invoicePayments[selectedInvoiceForPayment.id] || []}
                onStatusUpdate={handlePaymentStatusUpdate}
                businessId={currentUser?.current_business_id}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this invoice? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteInvoice}>
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Invoice Builder Component
const InvoiceBuilder = ({ invoice, selectedProject, projects, clients, workLogs, changeOrders, users, businessSettings, currentUser, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    project_id: selectedProject?.id || invoice?.project_id || '',
    client_id: selectedProject?.client_id || invoice?.client_id || '',
    invoice_number: invoice?.invoice_number || `INV-${Date.now()}`,
    issue_date: invoice?.issue_date || format(new Date(), 'yyyy-MM-dd'),
    due_date: invoice?.due_date || format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    notes: invoice?.notes || '',
    line_items: invoice?.line_items || []
  });

  const [billingMethod, setBillingMethod] = useState('items'); // 'items', 'percentage', 'hours', 'manual'
  const [selectedItems, setSelectedItems] = useState([]);
  const [percentageAmount, setPercentageAmount] = useState(100);
  const [selectedWorkLogs, setSelectedWorkLogs] = useState([]);
  const [manualItems, setManualItems] = useState([]);

  useEffect(() => {
    // Auto-select project if coming from project context
    if (selectedProject && !formData.project_id) {
      setFormData(prev => ({
        ...prev,
        project_id: selectedProject.id,
        client_id: selectedProject.client_id
      }));
    }

    // If editing an existing invoice, populate selected items/worklogs/manual based on its line_items
    if (invoice && invoice.line_items && invoice.line_items.length > 0) {
      // This part might need more sophisticated logic if we want to reverse-engineer the billing method
      // For now, we'll assume 'manual' if editing an existing invoice, unless a clear method can be inferred.
      // Or, better, the invoice object itself should store the billing method used.
      // As a fallback for demonstration, we can just populate manualItems if editing.
      setManualItems(invoice.line_items);
      setBillingMethod('manual'); // Default to manual if line items already exist
    }
  }, [selectedProject, invoice]);

  const handleProjectChange = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setFormData(prev => ({
        ...prev,
        project_id: projectId,
        client_id: project.client_id
      }));
      // Reset selections when project changes
      setSelectedItems([]);
      setSelectedWorkLogs([]);
      setManualItems([]);
      setPercentageAmount(100);
    }
  };

  const getProjectEstimateItems = () => {
    if (!formData.project_id) return [];
    const project = projects.find(p => p.id === formData.project_id);
    return project?.line_items || [];
  };

  const getProjectChangeOrders = () => {
    if (!formData.project_id) return [];
    return changeOrders.filter(co => co.project_id === formData.project_id && co.status === 'approved');
  };

  const getUnbilledWorkLogs = () => {
    if (!formData.project_id) return [];
    // Ensure that 'invoiced' field is correctly checked, if it exists on WorkLog.
    // Assuming 'invoiced' means already part of a finalized invoice.
    // If not, we might need a way to filter work logs already used in *any* invoice.
    return workLogs.filter(wl => wl.project_id === formData.project_id && !wl.invoiced);
  };

  const calculateLineItems = () => {
    let lineItems = [];

    if (billingMethod === 'items') {
      // Add selected estimate items
      const estimateItems = getProjectEstimateItems();
      selectedItems.forEach(itemId => {
        const item = estimateItems.find(i => i.id === itemId);
        if (item) {
          lineItems.push({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total
          });
        }
      });

      // Add selected change order items
      getProjectChangeOrders().forEach(co => {
        if (selectedItems.includes(co.id)) {
          co.line_items?.forEach(item => {
            lineItems.push({
              description: `${item.description} (Change Order ${co.change_order_number})`,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total: item.total
            });
          });
        }
      });
    } else if (billingMethod === 'percentage') {
      const project = projects.find(p => p.id === formData.project_id);
      if (project) {
        const totalAmount = (project.total_after_adjustments || project.estimated_cost || 0) * (percentageAmount / 100);
        lineItems.push({
          description: `${percentageAmount}% of Project Total`,
          quantity: 1,
          unit_price: totalAmount,
          total: totalAmount
        });
      }
    } else if (billingMethod === 'hours') {
      // Fallback rate if business settings or user hourly rate are not defined
      const defaultHourlyRate = 50; 
      
      selectedWorkLogs.forEach(logId => {
        const log = getUnbilledWorkLogs().find(wl => wl.id === logId);
        if (log) {
          const user = users.find(u => u.email === log.user_email);
          // Use user's specific hourly rate if available, otherwise apply business labor markup to default rate
          const effectiveHourlyRate = user?.hourly_rate || 
                                      (businessSettings?.labor_markup ? (businessSettings.labor_markup + 1) * defaultHourlyRate : defaultHourlyRate);
          const total = log.duration_hours * effectiveHourlyRate;
          
          lineItems.push({
            description: `Labor: ${user?.full_name || log.user_email} (${format(new Date(log.start_time), 'MMM d')})`,
            quantity: log.duration_hours,
            unit_price: effectiveHourlyRate,
            total: total
          });
        }
      });
    } else if (billingMethod === 'manual') {
      lineItems = [...manualItems];
    }

    return lineItems;
  };

  const addManualItem = () => {
    setManualItems(prev => [...prev, {
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }]);
  };

  const updateManualItem = (index, field, value) => {
    setManualItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      if (field === 'quantity' || field === 'unit_price') {
        updated[index].total = updated[index].quantity * updated[index].unit_price;
      }
      
      return updated;
    });
  };

  const removeManualItem = (index) => {
    setManualItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const calculatedLineItems = calculateLineItems();
    const subtotal = calculatedLineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxRate = businessSettings?.tax_rate || 0;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    if (calculatedLineItems.length === 0 && billingMethod !== 'manual') {
      toast.error('Please select at least one item or enter manual items.');
      return;
    }
    if (billingMethod === 'manual' && manualItems.length === 0) {
      toast.error('Please add at least one manual item.');
      return;
    }

    const invoiceData = {
      ...formData,
      line_items: calculatedLineItems,
      total_amount: totalAmount,
      status: invoice ? invoice.status : 'draft'
    };

    onSubmit(invoiceData);
  };

  const lineItems = calculateLineItems();
  const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const taxRate = businessSettings?.tax_rate || 0;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_id">Project</Label>
              <Select value={formData.project_id} onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue_date">Issue Date</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Billing Method Selection */}
          <div className="space-y-4">
            <Label>Billing Method</Label>
            <Tabs value={billingMethod} onValueChange={setBillingMethod}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="items">Estimate Items</TabsTrigger>
                <TabsTrigger value="percentage">Percentage</TabsTrigger>
                <TabsTrigger value="hours">Work Hours</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-semibold">Select Items from Estimate & Change Orders</h4>
                  {(!formData.project_id) && (
                    <p className="text-sm text-slate-500">Please select a project to load items.</p>
                  )}
                  
                  {/* Estimate Items */}
                  {formData.project_id && getProjectEstimateItems().length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Original Estimate Items</h5>
                      {getProjectEstimateItems().map(item => (
                        <div key={item.id} className="flex items-center space-x-2 p-2 border rounded">
                          <Checkbox
                            id={`est-${item.id}`}
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedItems(prev => [...prev, item.id]);
                              } else {
                                setSelectedItems(prev => prev.filter(id => id !== item.id));
                              }
                            }}
                          />
                          <Label htmlFor={`est-${item.id}`} className="flex-1 cursor-pointer">
                            {item.description} - ${item.total?.toFixed(2) || '0.00'}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  {formData.project_id && getProjectEstimateItems().length === 0 && getProjectChangeOrders().length === 0 && (
                     <p className="text-sm text-slate-500">No estimate items or approved change orders found for this project.</p>
                  )}

                  {/* Change Order Items */}
                  {formData.project_id && getProjectChangeOrders().length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Change Orders</h5>
                      {getProjectChangeOrders().map(co => (
                        <div key={co.id} className="flex items-center space-x-2 p-2 border rounded">
                          <Checkbox
                            id={`co-${co.id}`}
                            checked={selectedItems.includes(co.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedItems(prev => [...prev, co.id]);
                              } else {
                                setSelectedItems(prev => prev.filter(id => id !== co.id));
                              }
                            }}
                          />
                          <Label htmlFor={`co-${co.id}`} className="flex-1 cursor-pointer">
                            {co.title} ({co.change_order_number}) - ${co.total_after_adjustments?.toFixed(2) || '0.00'}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="percentage" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="percentage">Percentage of Project Total</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="percentage"
                        type="number"
                        min="1"
                        max="100"
                        value={percentageAmount}
                        onChange={(e) => setPercentageAmount(Number(e.target.value))}
                        className="w-20"
                      />
                      <Percent className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                  {formData.project_id ? (
                    <p className="text-sm text-slate-600">
                      Project Total: ${projects.find(p => p.id === formData.project_id)?.total_after_adjustments?.toFixed(2) || '0.00'}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">Please select a project to calculate percentage.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="hours" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-semibold">Select Unbilled Work Hours</h4>
                  {!formData.project_id && (
                     <p className="text-sm text-slate-500">Please select a project to load work logs.</p>
                  )}
                  {formData.project_id && getUnbilledWorkLogs().length === 0 && (
                    <p className="text-sm text-slate-500">No unbilled work logs found for this project.</p>
                  )}
                  {getUnbilledWorkLogs().map(log => {
                    const user = users.find(u => u.email === log.user_email);
                    return (
                      <div key={log.id} className="flex items-center space-x-2 p-2 border rounded">
                        <Checkbox
                          id={`log-${log.id}`}
                          checked={selectedWorkLogs.includes(log.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedWorkLogs(prev => [...prev, log.id]);
                            } else {
                              setSelectedWorkLogs(prev => prev.filter(id => id !== log.id));
                            }
                          }}
                        />
                        <Label htmlFor={`log-${log.id}`} className="flex-1 cursor-pointer">
                          {user?.full_name || log.user_email} - {format(new Date(log.start_time), 'MMM d, yyyy')} 
                          ({log.duration_hours?.toFixed(2)} hrs)
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Manual Line Items</h4>
                    <Button type="button" variant="outline" onClick={addManualItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  
                  {manualItems.length === 0 && (
                    <p className="text-sm text-slate-500">No manual items added yet. Click "Add Item" to start.</p>
                  )}

                  {manualItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 items-end">
                      <div className="col-span-2">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateManualItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateManualItem(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateManualItem(index, 'unit_price', Number(e.target.value))}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label>Total</Label>
                          <div className="text-sm font-medium p-2">${(item.total || 0).toFixed(2)}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeManualItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Invoice Preview */}
          {lineItems.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <h4 className="font-semibold">Invoice Preview</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${(item.unit_price || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right">${(item.total || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes for the client"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={lineItems.length === 0 && billingMethod !== 'manual'}>
              {invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Payment Status Manager Component
const PaymentStatusManager = ({ invoice, payments, onStatusUpdate, businessId }) => {
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentDate, setNewPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [newPaymentNotes, setNewPaymentNotes] = useState('');
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remainingBalance = (invoice.total_amount || 0) - totalPaid;

  const handleAddPayment = async () => {
    if (!newPaymentAmount || isNaN(parseFloat(newPaymentAmount)) || parseFloat(newPaymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount.');
      return;
    }
    if (!newPaymentDate) {
      toast.error('Please select a payment date.');
      return;
    }

    setIsAddingPayment(true);
    try {
      const paymentData = {
        invoice_id: invoice.id,
        amount: parseFloat(newPaymentAmount),
        payment_date: newPaymentDate,
        method: newPaymentMethod || 'Unspecified',
        notes: newPaymentNotes,
        business_id: businessId, // Ensure business_id is passed
      };
      await InvoicePayment.create(paymentData);
      toast.success('Payment added successfully!');

      // Check if invoice is now fully paid
      const updatedTotalPaid = totalPaid + parseFloat(newPaymentAmount);
      if (updatedTotalPaid >= (invoice.total_amount || 0) && invoice.status !== 'paid') {
        await Invoice.update(invoice.id, { status: 'paid' });
        toast.info('Invoice status updated to Paid!');
      } else if (updatedTotalPaid < (invoice.total_amount || 0) && invoice.status === 'paid') {
        // If it was marked paid but now isn't (e.g., if total_amount was edited down)
        await Invoice.update(invoice.id, { status: 'sent' }); // Or 'partial_paid' if that status exists
        toast.info('Invoice status reverted to Sent/Outstanding as it is no longer fully paid.');
      }


      setNewPaymentAmount('');
      setNewPaymentMethod('');
      setNewPaymentNotes('');
      onStatusUpdate(); // Refresh parent data
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment.');
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (window.confirm('Are you sure you want to mark this invoice as Paid? This will override any current status.')) {
      try {
        await Invoice.update(invoice.id, { status: 'paid' });
        toast.success('Invoice marked as Paid.');
        onStatusUpdate();
      } catch (error) {
        console.error('Error marking invoice as paid:', error);
        toast.error('Failed to mark invoice as paid.');
      }
    }
  };

  const handleMarkAsUnpaid = async () => {
    if (window.confirm('Are you sure you want to mark this invoice as Sent/Outstanding?')) {
      try {
        await Invoice.update(invoice.id, { status: 'sent' }); // Or 'overdue' based on date
        toast.success('Invoice marked as Sent/Outstanding.');
        onStatusUpdate();
      } catch (error) {
        console.error('Error marking invoice as unpaid:', error);
        toast.error('Failed to mark invoice as unpaid.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">Invoice Total:</p>
          <p className="text-xl font-bold">${(invoice.total_amount || 0).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Total Paid:</p>
          <p className="text-xl font-bold text-emerald-600">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-slate-500">Remaining Balance:</p>
          <p className={`text-2xl font-bold ${remainingBalance <= 0.01 ? 'text-emerald-600' : 'text-red-600'}`}>
            ${remainingBalance.toFixed(2)}
          </p>
        </div>
      </div>

      <Separator />

      <h3 className="text-lg font-semibold">Existing Payments</h3>
      {payments.length === 0 ? (
        <p className="text-sm text-slate-500">No payments recorded for this invoice yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map(payment => (
              <TableRow key={payment.id}>
                <TableCell>{format(new Date(payment.payment_date), 'MMM d, yyyy')}</TableCell>
                <TableCell>${(payment.amount || 0).toFixed(2)}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell className="text-sm text-slate-600">{payment.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Separator />

      <h3 className="text-lg font-semibold">Add New Payment</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="paymentAmount">Amount</Label>
          <Input
            id="paymentAmount"
            type="number"
            step="0.01"
            value={newPaymentAmount}
            onChange={(e) => setNewPaymentAmount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentDate">Date</Label>
          <Input
            id="paymentDate"
            type="date"
            value={newPaymentDate}
            onChange={(e) => setNewPaymentDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="paymentMethod">Method</Label>
          <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
            <SelectTrigger id="paymentMethod">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Credit Card">Credit Card</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Check">Check</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="paymentNotes">Notes</Label>
          <Textarea
            id="paymentNotes"
            value={newPaymentNotes}
            onChange={(e) => setNewPaymentNotes(e.target.value)}
            placeholder="Any specific notes for this payment (e.g., Check #123)"
            rows={2}
          />
        </div>
      </div>

      <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
        <div className="flex-grow flex gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleMarkAsUnpaid}
            disabled={isAddingPayment || invoice.status !== 'paid'}
          >
            Mark as Outstanding
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleMarkAsPaid}
            disabled={isAddingPayment || invoice.status === 'paid'}
          >
            Mark as Paid
          </Button>
        </div>
        <Button onClick={handleAddPayment} disabled={isAddingPayment}>
          {isAddingPayment ? 'Adding Payment...' : 'Add Payment'}
        </Button>
      </DialogFooter>
    </div>
  );
};
