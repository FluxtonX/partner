
import React, { useState, useEffect, useCallback } from 'react';
import { Project, Client, ProductOrService, User, EstimateApproval, BusinessSettings, ActivityLog, Contract, Invoice } from '@/api/entities';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Plus, Send, Edit, Eye, Filter, Mail, FileText } from "lucide-react";
import { format } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import EstimateCard from '../components/estimates/EstimateCard';
import EstimateBuilder from '../components/estimates/EstimateBuilder';
import DigitalSignatureDialog from '../components/estimates/DigitalSignatureDialog';
import EstimateSummaryView from '../components/estimates/EstimateSummaryView';
import { sendClientEmail } from "@/api/functions";
import { generateEstimatePdf } from "@/api/functions";

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState([]);
  const [clients, setClients] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState([]);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [filteredEstimates, setFilteredEstimates] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedEstimateForApproval, setSelectedEstimateForApproval] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingEstimate, setDeletingEstimate] = useState(null);
  const [selectedEstimateId, setSelectedEstimateId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    loadData();
    User.me().then(setCurrentUser).catch(console.error);
  }, []);

  const filterEstimates = useCallback(() => {
    let filtered = [...estimates];

    if (searchTerm) {
      filtered = filtered.filter(est =>
        est.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'approved') {
        filtered = filtered.filter(est => est.budget_approved);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(est => !est.budget_approved);
      }
    }

    setFilteredEstimates(filtered);
  }, [estimates, statusFilter, searchTerm]);

  useEffect(() => {
    filterEstimates();
  }, [filterEstimates]);

  const loadData = async () => {
    try {
      const [projectsData, clientsData, usersData, settingsData, contractsData] = await Promise.all([
        Project.filter({ status: 'estimate' }, '-updated_date'),
        Client.list(),
        User.list(),
        BusinessSettings.list(),
        Contract.list()
      ]);
      setEstimates(projectsData);
      setClients(clientsData);
      setUsers(usersData);
      setBusinessSettings(settingsData.length > 0 ? settingsData[0] : null);
      setContracts(contractsData);
    } catch (error) {
      console.error('Error loading estimates:', error);
      toast.error("Failed to load estimates.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendForApproval = async (estimate) => {
    if (!estimate.client_id || !currentUser) {
      toast.error('Cannot send estimate - no client assigned or user not loaded.');
      return;
    }

    // Profit Margin Check
    if (businessSettings && businessSettings.minimum_profit_margin > 0) {
      const totalCost = (estimate.estimated_labor_cost || 0) + (estimate.estimated_materials_cost || 0);
      const totalSellingPrice = (estimate.subtotal || 0) + (estimate.overall_adjustment || 0);

      let profitMargin = 0;
      if (totalSellingPrice > 0) {
        profitMargin = (totalSellingPrice - totalCost) / totalSellingPrice;
      }

      if (profitMargin < businessSettings.minimum_profit_margin) {
        toast.error(`Cannot send for approval. The profit margin is ${(profitMargin * 100).toFixed(1)}%, which is below the required minimum of ${(businessSettings.minimum_profit_margin * 100).toFixed(1)}%. Please edit the estimate.`);
        return;
      }
    }

    try {
      const client = clients.find(c => c.id === estimate.client_id);
      if (!client) {
        toast.error('Client not found for this estimate.');
        return;
      }

      await EstimateApproval.create({
        project_id: estimate.id,
        client_email: client.email,
        client_name: client.contact_person,
        sent_date: new Date().toISOString(),
        status: 'sent'
      });

      const emailSubject = `Estimate Ready for Your Review: ${estimate.title}`;
      const emailBodyHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
          <h2 style="color: #059669;">Your Estimate is Ready</h2>
          <p>Dear ${client.contact_person},</p>
          <p>Your estimate for <strong>"${estimate.title}"</strong> is ready for your review. Please see the attached PDF for details.</p>
          <p>To approve this estimate or if you have any questions, please contact us directly by replying to this email or calling us.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>Best regards,<br>
            ${users.find(u => u.email === estimate.created_by)?.full_name || 'Project Team'}</p>
          </div>
        </div>
      `;

      // Generate PDF
      const pdfResponse = await generateEstimatePdf({ estimateId: estimate.id });
      const pdfBlob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const pdfFile = new File([pdfBlob], `Estimate-${estimate.barcode || estimate.id}.pdf`, { type: 'application/pdf' });

      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); display: flex; align-items: center;
        justify-content: center; z-index: 1000; padding: 20px;
      `;

      const modalDialog = document.createElement('div');
      modalDialog.style.cssText = `
        background: white; border-radius: 12px; padding: 30px;
        max-width: 90vw; max-height: 90vh; overflow-y: auto;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      `;

      modalDialog.innerHTML = `
        <div style="max-width: 700px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h3 style="color: #059669; margin-bottom: 20px;">📧 Send Estimate Notification</h3>
          <p style="margin-bottom: 15px; color: #64748b;">An email notification will be sent to the client. Please manually attach the downloaded PDF to your email client.</p>

          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <strong>To:</strong> ${client.email}<br>
            <strong>Subject:</strong> ${emailSubject}
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">
              📎 <strong>Action Required:</strong> Please download the PDF and attach it to your email.
            </p>
          </div>

          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb;">
            <strong>Email Preview:</strong><br><br>
            ${emailBodyHTML}
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; margin-top: 20px;">
            <button id="downloadPdfBtn" style="background: #0ea5e9; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">
              📄 Download PDF
            </button>
            <button id="sendEmailBtn" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">
              📤 Send Notification Email
            </button>
            <button id="closeModalBtn" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">
              Close
            </button>
          </div>
        </div>
      `;

      modal.appendChild(modalDialog);
      document.body.appendChild(modal);

      const closeModal = () => {
        if (modal && document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      };

      document.getElementById('downloadPdfBtn').onclick = () => {
        const url = window.URL.createObjectURL(pdfFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdfFile.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success('PDF downloaded!');
      };

      const sendEmailBtn = document.getElementById('sendEmailBtn');
      sendEmailBtn.onclick = async () => {
        sendEmailBtn.disabled = true;
        sendEmailBtn.innerHTML = 'Sending...';
        try {
          // Use the new sendClientEmail function for sending notification
          await sendClientEmail({
            to: client.email,
            subject: emailSubject,
            body: emailBodyHTML,
            from_name: currentUser?.display_name || currentUser?.full_name
          });

          sendEmailBtn.innerHTML = 'Sent!';
          sendEmailBtn.style.background = '#059669';
          toast.success("Estimate notification email sent successfully!");

          await ActivityLog.create({
            project_id: estimate.id,
            user_email: currentUser.email,
            user_name: currentUser.full_name || currentUser.email,
            action_type: 'estimate_sent',
            action_description: `Emailed estimate notification to: ${client.email}`,
            visible_to_client: false
          });

          setTimeout(closeModal, 1500);
        } catch (error) {
          console.error("Email sending failed:", error);
          sendEmailBtn.innerHTML = 'Send Failed';
          sendEmailBtn.style.background = '#ef4444';
          sendEmailBtn.disabled = false;
          toast.error("Failed to send notification email.", { description: error.message });
        }
      };

      document.getElementById('closeModalBtn').onclick = closeModal;

      modal.onclick = (e) => {
        if (e.target === modal) {
          closeModal();
        }
      };

      loadData();
    } catch (error) {
      console.error('Error preparing estimate for sending:', error);
      toast.error('Failed to prepare estimate. Please try again.', { description: error.message });
    }
  };

  const handleStatusChange = async (estimateId, newStatus) => {
    try {
      const estimate = estimates.find(e => e.id === estimateId);
      const updateData = { status: newStatus };

      // When converting estimate to active project, ensure client_id is preserved
      if (newStatus === 'active' && estimate) {
        updateData.client_id = estimate.client_id;
      }

      await Project.update(estimateId, updateData);
      toast.success("Estimate status updated successfully!");
      loadData();
    } catch (error) {
      console.error('Error updating estimate status:', error);
      toast.error("Failed to update estimate status.", { description: error.message });
    }
  };

  const handleApproval = async (estimateId, approved) => {
    try {
      const updateData = { budget_approved: approved };

      // If approving, also lock the estimate
      if (approved) {
        updateData.estimate_locked = true;
        updateData.locked_date = new Date().toISOString();
      }

      await Project.update(estimateId, updateData);
      toast.success(`Estimate marked as ${approved ? 'approved' : 'pending'}.`);
      loadData();
    } catch (error) {
      console.error('Error updating approval:', error);
      toast.error("Failed to update approval status.", { description: error.message });
    }
  };

  const handleInternalApproval = async (estimate) => {
    setSelectedEstimateForApproval(estimate);
    setShowSignatureDialog(true);
  };

  const handleSignatureApproval = async (approvalData) => {
    try {
      const estimate = selectedEstimateForApproval;

      // Get contract details for deposit invoice generation
      let contract = null;
      if (estimate.contract_id) {
        contract = contracts.find(c => c.id === estimate.contract_id);
      }

      // Check if deposit is required
      const depositRequired = contract && contract.deposit_percentage && contract.deposit_percentage > 0;
      const depositAmount = depositRequired
        ? (estimate.total_after_adjustments || estimate.estimated_cost || 0) * (contract.deposit_percentage / 100)
        : 0;

      // Update the project to approved and active status
      await Project.update(estimate.id, {
        status: 'active',
        budget_approved: true,
        estimate_locked: true,
        locked_date: new Date().toISOString()
      });

      // Create EstimateApproval record
      try {
        await EstimateApproval.create({
          project_id: estimate.id,
          client_email: currentUser.email, // Use current user's email for internal approval
          client_name: approvalData.signerName,
          sent_date: new Date().toISOString(),
          approval_date: approvalData.signedDate,
          signature: approvalData.signature,
          status: 'approved',
          client_comments: approvalData.comments,
          client_ip: 'internal-approval',
          approval_token: `internal_${Date.now()}`
        });
      } catch (error) {
        console.warn('Could not create approval record:', error);
        toast.error('Failed to create approval record for this estimate.', { description: error.message });
      }

      // Generate deposit invoice if required
      if (depositRequired && depositAmount > 0) {
        try {
          const client = clients.find(c => c.id === estimate.client_id);

          const invoiceNumber = `DEP-${estimate.id}-${Date.now()}`;
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

          const depositInvoice = await Invoice.create({
            project_id: estimate.id,
            client_id: estimate.client_id,
            client_name: client?.contact_person || client?.email,
            client_email: client?.email,
            invoice_number: invoiceNumber,
            issue_date: new Date().toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            total_amount: depositAmount,
            status: 'sent',
            notes: `Deposit for project: ${estimate.title}`,
            line_items: [{
              description: `Deposit (${contract.deposit_percentage}%) - ${estimate.title}`,
              quantity: 1,
              unit_price: depositAmount,
              total: depositAmount
            }]
          });

          console.log('Deposit invoice created:', depositInvoice.id);

          // Log the activity
          await ActivityLog.create({
            project_id: estimate.id,
            user_email: currentUser.email,
            user_name: currentUser.full_name || currentUser.email,
            action_type: 'estimate_approved',
            action_description: `Estimate approved internally with digital signature. Deposit invoice generated: ${invoiceNumber}`,
            visible_to_client: true
          });
          toast.success("Estimate approved and deposit invoice generated!");

        } catch (error) {
          console.error('Error creating deposit invoice:', error);
          toast.error('Failed to create deposit invoice.', { description: error.message });
        }
      } else {
        // Log the activity without deposit invoice
        await ActivityLog.create({
          project_id: estimate.id,
          user_email: currentUser.email,
          user_name: currentUser.full_name || currentUser.email,
          action_type: 'estimate_approved',
          action_description: 'Estimate approved internally with digital signature',
          visible_to_client: true
        });
        toast.success("Estimate approved internally!");
      }

      setShowSignatureDialog(false);
      setSelectedEstimateForApproval(null);
      loadData(); // Refresh the estimates list

    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error('Failed to approve estimate. Please try again.', { description: error.message });
      throw error;
    }
  };

  const handleDuplicate = async (estimateId) => {
    try {
        const originalEstimate = await Project.get(estimateId);

        // Remove fields that should not be copied
        const { id, created_date, updated_date, created_by, barcode, status, budget_approved, estimate_locked, locked_date, ...restOfEstimate } = originalEstimate;

        const newEstimateData = {
            ...restOfEstimate,
            title: `Copy of ${originalEstimate.title}`,
            status: 'estimate', // Reset status
            budget_approved: false,
            estimate_locked: false,
            locked_date: null
        };

        await Project.create(newEstimateData);

        toast.success("Estimate duplicated successfully!");
        loadData(); // Reload the estimates list
    } catch (error) {
        console.error('Error duplicating estimate:', error);
        toast.error("Failed to duplicate estimate.", { description: error.message });
    }
  };

  const handleDelete = async (estimate) => {
    setDeletingEstimate(estimate.id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingEstimate) return;

    try {
      await Project.delete(deletingEstimate);
      toast.success("Estimate deleted successfully!");
      loadData();
    } catch (error) {
      console.error('Error deleting estimate:', error);
      toast.error("Failed to delete estimate. Please try again.", { description: error.message });
    } finally {
      setShowDeleteConfirm(false);
      setDeletingEstimate(null);
    }
  };

  const getClient = (clientId) => {
    return clients.find(c => c.id === clientId) || null;
  };

  const getAssignedUser = (email) => {
      return users.find(u => u.email === email) || null;
  }

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.display_name || user?.full_name || email;
  };

  const totalEstimateValue = filteredEstimates.reduce((sum, est) => sum + (est.estimated_cost || 0), 0);
  const approvedEstimates = filteredEstimates.filter(est => est.budget_approved).length;
  const pendingEstimates = filteredEstimates.filter(est => !est.budget_approved).length;
  const selectedEstimate = estimates.find(e => e.id === selectedEstimateId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-full mx-auto flex gap-8">
        <div className="flex-1 transition-all duration-300">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Estimates</h1>
              <p className="text-slate-600">Create and manage project estimates for your clients</p>
            </div>
            <Button
              onClick={() => { setSelectedEstimateId(null); setEditingEstimate(null); setShowBuilder(true); }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Estimate
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{filteredEstimates.length}</p>
                    <p className="text-sm text-slate-600 font-medium">Total Estimates</p>
                  </div>
                  <Calculator className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{approvedEstimates}</p>
                    <p className="text-sm text-slate-600 font-medium">Approved</p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Send className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{pendingEstimates}</p>
                    <p className="text-sm text-slate-600 font-medium">Pending</p>
                  </div>
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">${totalEstimateValue.toFixed(2)}</p>
                    <p className="text-sm text-slate-600 font-medium">Total Value</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search estimates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/70"
                />
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-white/70">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Estimates</SelectItem>
                    <SelectItem value="pending">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Estimates Grid */}
          <div className={cn("grid gap-6 md:grid-cols-2", selectedEstimateId ? "xl:grid-cols-2" : "xl:grid-cols-3")}>
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200/60 p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : filteredEstimates.length > 0 ? (
              filteredEstimates.map((estimate) => (
                <div key={estimate.id} onClick={() => setSelectedEstimateId(estimate.id)}>
                  <EstimateCard
                    estimate={estimate}
                    client={getClient(estimate.client_id)}
                    assignedUser={getUserName(estimate.assigned_to)}
                    onStatusChange={handleStatusChange}
                    onApproval={handleApproval}
                    onEdit={(est) => { setSelectedEstimateId(null); setEditingEstimate(est); setShowBuilder(true); }}
                    onSendForApproval={handleSendForApproval}
                    onDelete={handleDelete}
                    onInternalApprove={handleInternalApproval}
                    onDuplicate={handleDuplicate}
                    isSelected={estimate.id === selectedEstimateId}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calculator className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">No estimates found</p>
                <p className="text-slate-400">Create your first estimate to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary View Sidebar */}
        <div className={cn(
          "w-1/3 max-w-md hidden lg:block transition-all duration-300",
          selectedEstimateId ? "block" : "hidden"
        )}>
          <EstimateSummaryView
            estimate={selectedEstimate}
            client={selectedEstimate ? getClient(selectedEstimate.client_id) : null}
            assignedUser={selectedEstimate ? getAssignedUser(selectedEstimate.assigned_to) : null}
            businessSettings={businessSettings}
            currentUser={currentUser}
            onClear={() => setSelectedEstimateId(null)}
          />
        </div>

        {/* Estimate Builder Modal */}
        {showBuilder && (
          <EstimateBuilder
            estimate={editingEstimate}
            clients={clients}
            users={users}
            contracts={contracts}
            onSubmit={async (data) => {
              try {
                if (editingEstimate) {
                  // Don't allow editing if estimate is locked
                  if (editingEstimate.estimate_locked) {
                    toast.error('This estimate is locked and cannot be modified. Create a change order instead.');
                    return;
                  }
                  await Project.update(editingEstimate.id, data);
                  toast.success("Estimate updated successfully!");
                } else {
                  const newEstimate = await Project.create({ ...data, status: 'estimate' });
                  const barcode = `EST-${newEstimate.id}`;
                  await Project.update(newEstimate.id, { barcode });
                  
                  // The PDF will be generated on-demand when accessed through client portal
                  
                  toast.success("Estimate created successfully!");
                }
                setShowBuilder(false);
                setEditingEstimate(null);
                loadData();
              } catch (error) {
                console.error('Error saving estimate:', error);
                toast.error("Failed to save estimate.", { description: error.message });
              }
            }}
            onCancel={() => {
              setShowBuilder(false);
              setEditingEstimate(null);
            }}
          />
        )}

        {/* Digital Signature Dialog */}
        {showSignatureDialog && selectedEstimateForApproval && (
          <DigitalSignatureDialog
            estimate={selectedEstimateForApproval}
            client={getClient(selectedEstimateForApproval.client_id)}
            contract={contracts.find(c => c.id === selectedEstimateForApproval.contract_id)}
            businessSettings={businessSettings}
            onApprove={handleSignatureApproval}
            onCancel={() => {
              setShowSignatureDialog(false);
              setSelectedEstimateForApproval(null);
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Estimate</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this estimate? This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Estimate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
