
import React, { useState, useEffect } from 'react';
import { Invoice, Project, Client, ProductOrService, BusinessSettings, ActivityLog } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Plus, Trash2, Save, X, FileText } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { generateInvoicePdf } from "@/api/functions";
import { toast } from 'sonner'; // Assuming 'sonner' for toast notifications

export default function InvoiceEditor() {
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState(null); // This state holds the project_id for navigation back to ProjectDetail
  const [formData, setFormData] = useState({ // Renamed 'invoice' to 'formData'
    project_id: '',
    client_id: '', // Added client_id as it's required for Invoice model
    invoice_number: `INV-${Date.now()}`, // Initial dummy number, will be overridden for new invoices
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: '',
    status: 'draft',
    notes: '',
    line_items: []
  });
  const [products, setProducts] = useState([]);
  const [projects, setProjects] = useState([]); // New state for projects list
  const [clients, setClients] = useState([]); // New state for clients list
  const [isSubmitting, setIsSubmitting] = useState(false); // New state to manage save button loading
  const [isLoading, setIsLoading] = useState(true); // New state to manage initial data loading
  const [businessSettings, setBusinessSettings] = useState(null); // To store business settings
  
  // Placeholder for currentUser - In a real app, this would come from an AuthContext or similar.
  const [currentUser, setCurrentUser] = useState({
      email: 'defaultuser@example.com',
      full_name: 'Default User',
      current_business_id: 'default_business_id' // Will attempt to update from BusinessSettings
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, clientsData, productsData, settingsList] = await Promise.all([
        Project.list(),
        Client.list(),
        ProductOrService.list(),
        BusinessSettings.list()
      ]);
      setProjects(projectsData);
      setClients(clientsData);
      setProducts(productsData);

      const settings = settingsList.length > 0 ? settingsList[0] : null;
      setBusinessSettings(settings); // Store business settings
      if (settings && settings.id) {
          // If business settings carry the business_id, use it for current user's business context
          setCurrentUser(prev => ({ ...prev, current_business_id: settings.id }));
      }


      const urlParams = new URLSearchParams(window.location.search);
      const invoiceId = urlParams.get('id'); // Used if editing an existing invoice
      const initialProjectIdFromUrl = urlParams.get('project_id'); // Used if creating a new invoice for a project

      if (invoiceId) {
        // We are editing an existing invoice
        await loadInvoiceForEditing(invoiceId);
      } else {
        // We are creating a new invoice, pre-fill from query params and settings
        let newInvoiceData = {
          notes: settings?.invoice_notes_template || ''
        };

        if (initialProjectIdFromUrl) {
          const selectedProject = projectsData.find(p => p.id === initialProjectIdFromUrl);
          if (selectedProject) {
            newInvoiceData.project_id = initialProjectIdFromUrl;
            newInvoiceData.client_id = selectedProject.client_id; // Assuming project has client_id
            setProjectId(initialProjectIdFromUrl); // Set projectId for navigation

            try {
              const projectInvoices = await Invoice.filter({ project_id: initialProjectIdFromUrl });
              // Sequential invoice numbering: ProjectTitle - SequentialNumber
              newInvoiceData.invoice_number = `${selectedProject.title} - ${projectInvoices.length + 1}`;
            } catch (error) {
              console.error("Error fetching project invoices for numbering:", error);
              newInvoiceData.invoice_number = `${selectedProject.title} - 1`; // Fallback
            }
          }
        }
        setFormData(prev => ({ ...prev, ...newInvoiceData }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load initial data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadInvoiceForEditing = async (invoiceId) => {
    try {
      const fetchedInvoice = await Invoice.get(invoiceId);
      setFormData(fetchedInvoice); // Use setFormData
      // If the fetched invoice has a project_id, set it for navigation purposes
      if (fetchedInvoice.project_id) {
        setProjectId(fetchedInvoice.project_id);
      }
    } catch (error) {
      console.error("Failed to load invoice for editing:", error);
      toast.error("Failed to load invoice for editing. It might not exist.");
    }
  };
  
  const handleProjectChange = async (newProjectId) => {
    const selectedProject = projects.find(p => p.id === newProjectId);
    if (!selectedProject) return;

    setProjectId(newProjectId); // Important for navigation

    let update = {
      project_id: newProjectId,
      client_id: selectedProject.client_id,
    };

    // Only generate a new invoice number if we are creating a new invoice
    if (!formData.id) {
      try {
        const projectInvoices = await Invoice.filter({ project_id: newProjectId });
        update.invoice_number = `${selectedProject.title} - ${projectInvoices.length + 1}`;
      } catch (error) {
        console.error("Error fetching project invoices for numbering:", error);
        update.invoice_number = `${selectedProject.title} - 1`; // Fallback
      }
    }

    setFormData(prev => ({ ...prev, ...update }));
  };

  const updateLineItem = (index, field, value) => { // Renamed from handleLineItemChange
    const newItems = [...formData.line_items];
    newItems[index][field] = value;
    
    if(field === 'quantity' || field === 'unit_price') {
      newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
    }
    
    setFormData(prev => ({ ...prev, line_items: newItems })); // Use setFormData
  };
  
  const addLineItem = () => {
    setFormData(prev => ({ // Use setFormData
      ...prev,
      line_items: [...prev.line_items, { description: '', quantity: 1, unit_price: 0, total: 0 }]
    }));
  };
  
  const removeLineItem = (index) => {
    setFormData(prev => ({ // Use setFormData
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index)
    }));
  };

  const addProductService = (productId) => { // New function from outline
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        line_items: [
          ...prev.line_items,
          {
            description: product.name,
            quantity: 1,
            unit_price: product.price,
            total: product.price,
            product_id: product.id // Store product ID if needed for future reference
          }
        ]
      }));
    }
  };

  const calculateTotal = () => {
    return formData.line_items.reduce((sum, item) => sum + item.total, 0); // Use formData
  };
  
  const handleSubmit = async (e) => { // Renamed from handleSave
    e.preventDefault(); // Prevent default form submission
    setIsSubmitting(true);
    
    const total_amount = calculateTotal();
    const selectedClient = clients.find(c => c.id === formData.client_id);
    const editingInvoice = !!formData.id; // Check if formData has an ID, implying it's an existing invoice to update

    // Validation from outline
    if (!formData.project_id || !selectedClient) {
      toast.error('Please select a project and ensure a client is associated.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.line_items || formData.line_items.length === 0) {
      toast.error('Please add at least one line item.');
      setIsSubmitting(false);
      return;
    }

    try {
      const invoicePayload = {
        ...formData,
        total_amount, // Ensure total_amount is included in the payload
        client_name: selectedClient.contact_person || selectedClient.company_name,
        client_email: selectedClient.email,
        business_id: currentUser.current_business_id || businessSettings?.id // Use businessSettings id as fallback
      };

      let savedInvoice;
      if (editingInvoice) {
        savedInvoice = await Invoice.update(formData.id, invoicePayload);
        toast.success('Invoice updated successfully!');
      } else {
        savedInvoice = await Invoice.create(invoicePayload);
        toast.success('Invoice created successfully!'); // Initial success toast

        // Generate PDF automatically for new invoices
        try {
          // Assuming generateInvoicePdf takes an object with invoiceId and returns an ArrayBuffer or Blob
          const pdfData = await generateInvoicePdf({ invoiceId: savedInvoice.id });
          
          // Assuming pdfData is an ArrayBuffer or Blob
          const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
          
          const pdfFileName = `Invoice-${savedInvoice.invoice_number}.pdf`;
          // In production, this would typically be a cloud storage URL (e.g., S3, Firebase Storage)
          // For now, generating a temporary client-side URL.
          const pdfUrl = window.URL.createObjectURL(pdfBlob);
          
          // Store PDF reference in the invoice record
          await Invoice.update(savedInvoice.id, {
            pdf_url: pdfUrl,
            pdf_filename: pdfFileName,
            pdf_generated_date: new Date().toISOString()
          });
          
          toast.success('PDF generated and linked to invoice successfully!');
          
        } catch (pdfError) {
          console.error('Error generating invoice PDF:', pdfError);
          toast.warning("Invoice created successfully, but PDF generation failed. You can generate it manually later.");
        }
      }

      // Log activity
      await ActivityLog.create({
        project_id: formData.project_id,
        user_email: currentUser.email,
        user_name: currentUser.full_name || currentUser.email,
        action_type: editingInvoice ? 'invoice_updated' : 'invoice_created',
        action_description: `${editingInvoice ? 'Updated' : 'Created'} invoice: ${formData.invoice_number}`,
        metadata: {
          invoice_number: formData.invoice_number,
          total_amount: total_amount,
          client_name: invoicePayload.client_name
        },
        visible_to_client: true
      });

      // Navigate to the invoices list page after save
      navigate(createPageUrl('Invoices'));
      
    } catch (error) {
      console.error("Failed to save invoice", error);
      toast.error('Failed to save invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading Invoice Editor...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50"> {/* Updated main div styling */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 max-w-4xl mx-auto space-y-8"> {/* Form wrapper */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"> {/* Updated Card styling */}
          <CardHeader>
            <CardTitle>{formData.id ? "Edit Invoice" : "Create Invoice"}</CardTitle> {/* Use formData */}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Added grid for project and invoice number */}
              <div className="space-y-2">
                <Label htmlFor="project_id">Project *</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={handleProjectChange}
                  required
                  disabled={!!formData.id} // Disable project selection if editing an existing invoice
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Invoice Number *</Label>
                <Input
                  id="invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                  placeholder="e.g., INV-001"
                  required
                  readOnly
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Changed from 3 cols to 2 for better layout with new fields */}
             <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input type="date" value={formData.issue_date} onChange={e => setFormData(p => ({...p, issue_date: e.target.value}))} /> {/* Use formData */}
            </div>
             <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={formData.due_date} onChange={e => setFormData(p => ({...p, due_date: e.target.value}))} /> {/* Use formData */}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invoice-notes">Notes</Label>
            <Textarea 
              id="invoice-notes" 
              value={formData.notes} 
              onChange={e => setFormData(p => ({...p, notes: e.target.value}))} 
              placeholder="Add any specific notes for the invoice, e.g., payment terms or special instructions." 
            /> {/* Use formData */}
          </div>

          <h3 className="font-semibold border-t pt-4">Line Items</h3>
          {formData.line_items.map((item, index) => ( 
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                 <Label>Description</Label>
                 <Input value={item.description} onChange={e => updateLineItem(index, 'description', e.target.value)} /> 
              </div>
              <div className="w-24 space-y-1">
                <Label>Qty</Label>
                <Input type="number" value={item.quantity} onChange={e => updateLineItem(index, 'quantity', parseFloat(e.target.value))} /> {/* Use updateLineItem */}
              </div>
              <div className="w-32 space-y-1">
                <Label>Unit Price</Label>
                <Input type="number" value={item.unit_price} onChange={e => updateLineItem(index, 'unit_price', parseFloat(e.target.value))} /> {/* Use updateLineItem */}
              </div>
              <div className="w-32 flex items-center h-10">Total: ${item.total.toFixed(2)}</div>
              <Button variant="ghost" size="icon" onClick={() => removeLineItem(index)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
            </div>
          ))}
          <Button variant="outline" onClick={addLineItem}><Plus className="w-4 h-4 mr-2"/>Add Line Item</Button>

          <div className="text-right font-bold text-xl">
              Total: ${calculateTotal().toFixed(2)}
          </div>
          
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}> {/* Changed to type="submit" */}
                <Save className="w-4 h-4 mr-2"/>
                {isSubmitting ? "Saving..." : (formData.id ? "Update Invoice" : "Save Invoice")} {/* Use formData */}
            </Button>
        </CardFooter>
      </Card>
      </form>
    </div>
  );
}
