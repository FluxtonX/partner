
import React, { useState, useEffect } from 'react';
import { Contract } from '@/api/entities';
import { UploadFile } from '@/api/integrations'; // This import is not used in the provided code, but kept as per instructions to preserve other features.
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, Edit, Trash2, Download, Upload, Eye } from 'lucide-react'; // Download and Upload are not used but kept.
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import ContractForm from '../components/contracts/ContractForm';

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingContract, setDeletingContract] = useState(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const data = await Contract.list('-created_date');
      setContracts(data);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('Failed to load contracts.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setShowForm(true);
  };

  const handleDelete = async (contractId) => {
    setDeletingContract(contractId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingContract) return;
    
    try {
      await Contract.delete(deletingContract);
      toast.success("Contract deleted successfully");
      loadContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Failed to delete contract. Please try again.');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingContract(null);
    }
  };

  const handleSubmit = async (contractData) => {
    try {
      if (editingContract) {
        await Contract.update(editingContract.id, contractData);
        toast.success("Contract updated successfully");
      } else {
        await Contract.create(contractData);
        toast.success("Contract created successfully");
      }
      setShowForm(false);
      setEditingContract(null);
      loadContracts();
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('Failed to save contract. Please try again.');
    }
  };

  // The toggleActive function and typeColors object are no longer used based on the outline's table structure.
  // Original functionality for toggling active status directly from the table row is removed in the outline.
  // The typeColors object for badges in the Type column is also removed in the outline.
  // To strictly follow the outline, these are removed to avoid dead code.

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Contract Templates</h1>
            <p className="text-slate-600">Manage your contract templates and payment terms for estimates</p>
          </div>
          <Button
            onClick={() => { setEditingContract(null); setShowForm(true); }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contract Template
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{contracts.length}</p>
                  <p className="text-sm text-slate-600 font-medium">Total Templates</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{contracts.filter(c => c.active).length}</p>
                  <p className="text-sm text-slate-600 font-medium">Active</p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-100">
                  <Eye className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-600">{contracts.filter(c => !c.active).length}</p>
                  <p className="text-sm text-slate-600 font-medium">Inactive</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-100">
                  <FileText className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contracts Table */}
        {isLoading ? (
          <div className="text-center p-8">Loading contract templates...</div>
        ) : contracts.length > 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Contract Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Payment Terms</TableHead>
                      <TableHead>Warranty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map(contract => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.name}</TableCell>
                        <TableCell className="capitalize">{contract.contract_type}</TableCell>
                        <TableCell>{contract.payment_terms}</TableCell>
                        <TableCell>{contract.warranty_period_days || 0} days</TableCell>
                        <TableCell>
                          <Badge variant={contract.active ? 'default' : 'outline'}>
                            {contract.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(contract)}>Edit</Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(contract.id)} className="text-red-600">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <FileText className="w-12 h-12 text-slate-300" />
              <p className="text-slate-500">No contract templates found</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Template
              </Button>
            </div>
          </div>
        )}
        
        {/* Contract Form Modal */}
        {showForm && (
          <ContractForm
            contract={editingContract}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingContract(null);
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Contract</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this contract? This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Contract
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
