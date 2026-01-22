import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Save, X, Calendar as CalendarIcon, Upload } from "lucide-react";
import { UploadFile } from '@/api/integrations';

const policyTypes = [
  { value: 'general_liability', label: 'General Liability' },
  { value: 'workers_compensation', label: 'Workers Compensation' },
  { value: 'commercial_auto', label: 'Commercial Auto' },
  { value: 'property', label: 'Property Insurance' },
  { value: 'professional_liability', label: 'Professional Liability' },
  { value: 'cyber_liability', label: 'Cyber Liability' },
  { value: 'equipment', label: 'Equipment Insurance' },
  { value: 'umbrella', label: 'Umbrella Policy' },
  { value: 'other', label: 'Other' }
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'pending_renewal', label: 'Pending Renewal' }
];

export default function InsuranceForm({ policy, assets, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(policy || {
    policy_name: '',
    insurance_company: '',
    policy_number: '',
    policy_type: 'general_liability',
    coverage_amount: '',
    deductible: '',
    premium_amount: '',
    effective_date: '',
    expiration_date: '',
    auto_renew: false,
    agent_name: '',
    agent_phone: '',
    agent_email: '',
    company_phone: '',
    company_website: '',
    claims_phone: '',
    policy_document_url: '',
    certificate_url: '',
    covered_assets: [],
    additional_insureds: [],
    notes: '',
    notification_days: 30,
    status: 'active'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssetToggle = (assetId, checked) => {
    setFormData(prev => ({
      ...prev,
      covered_assets: checked 
        ? [...prev.covered_assets, assetId]
        : prev.covered_assets.filter(id => id !== assetId)
    }));
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (field === 'policy_document_url') setUploadingDoc(true);
    if (field === 'certificate_url') setUploadingCert(true);

    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, [field]: file_url }));
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingDoc(false);
      setUploadingCert(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitData = {
      ...formData,
      coverage_amount: parseFloat(formData.coverage_amount) || 0,
      deductible: parseFloat(formData.deductible) || 0,
      premium_amount: parseFloat(formData.premium_amount) || 0,
      notification_days: parseInt(formData.notification_days) || 30
    };
    
    await onSubmit(submitData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{policy ? 'Edit' : 'Add'} Insurance Policy</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policy_name">Policy Name *</Label>
              <Input 
                id="policy_name" 
                value={formData.policy_name} 
                onChange={(e) => handleInputChange('policy_name', e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="policy_type">Policy Type *</Label>
              <Select value={formData.policy_type} onValueChange={(value) => handleInputChange('policy_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {policyTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insurance_company">Insurance Company *</Label>
              <Input 
                id="insurance_company" 
                value={formData.insurance_company} 
                onChange={(e) => handleInputChange('insurance_company', e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="policy_number">Policy Number *</Label>
              <Input 
                id="policy_number" 
                value={formData.policy_number} 
                onChange={(e) => handleInputChange('policy_number', e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coverage_amount">Coverage Amount</Label>
              <Input 
                id="coverage_amount" 
                type="number" 
                step="0.01"
                value={formData.coverage_amount} 
                onChange={(e) => handleInputChange('coverage_amount', e.target.value)} 
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deductible">Deductible</Label>
              <Input 
                id="deductible" 
                type="number" 
                step="0.01"
                value={formData.deductible} 
                onChange={(e) => handleInputChange('deductible', e.target.value)} 
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="premium_amount">Annual Premium</Label>
              <Input 
                id="premium_amount" 
                type="number" 
                step="0.01"
                value={formData.premium_amount} 
                onChange={(e) => handleInputChange('premium_amount', e.target.value)} 
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Effective Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.effective_date ? format(new Date(formData.effective_date), 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={formData.effective_date ? new Date(formData.effective_date) : undefined} 
                    onSelect={(date) => handleInputChange('effective_date', date)} 
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Expiration Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiration_date ? format(new Date(formData.expiration_date), 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={formData.expiration_date ? new Date(formData.expiration_date) : undefined} 
                    onSelect={(date) => handleInputChange('expiration_date', date)} 
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Status and Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notification_days">Notification Days</Label>
              <Input 
                id="notification_days" 
                type="number"
                value={formData.notification_days} 
                onChange={(e) => handleInputChange('notification_days', e.target.value)} 
                placeholder="30"
              />
              <p className="text-xs text-slate-500">Days before expiration to send alerts</p>
            </div>
            
            <div className="flex items-center space-x-2 mt-8">
              <Switch
                checked={formData.auto_renew}
                onCheckedChange={(checked) => handleInputChange('auto_renew', checked)}
              />
              <Label>Auto-Renew</Label>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-900">Contact Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent_name">Agent Name</Label>
                <Input 
                  id="agent_name" 
                  value={formData.agent_name} 
                  onChange={(e) => handleInputChange('agent_name', e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent_phone">Agent Phone</Label>
                <Input 
                  id="agent_phone" 
                  value={formData.agent_phone} 
                  onChange={(e) => handleInputChange('agent_phone', e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent_email">Agent Email</Label>
                <Input 
                  id="agent_email" 
                  type="email"
                  value={formData.agent_email} 
                  onChange={(e) => handleInputChange('agent_email', e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_phone">Company Phone</Label>
                <Input 
                  id="company_phone" 
                  value={formData.company_phone} 
                  onChange={(e) => handleInputChange('company_phone', e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="claims_phone">Claims Phone</Label>
                <Input 
                  id="claims_phone" 
                  value={formData.claims_phone} 
                  onChange={(e) => handleInputChange('claims_phone', e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_website">Company Website</Label>
                <Input 
                  id="company_website" 
                  value={formData.company_website} 
                  onChange={(e) => handleInputChange('company_website', e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-900">Documents</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Policy Document</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'policy_document_url')}
                    className="hidden"
                    id="policy-doc-upload"
                  />
                  <label htmlFor="policy-doc-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingDoc}
                      className="cursor-pointer"
                      asChild
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {uploadingDoc ? 'Uploading...' : 'Upload Policy'}
                      </div>
                    </Button>
                  </label>
                  {formData.policy_document_url && (
                    <a 
                      href={formData.policy_document_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline text-sm"
                    >
                      View Document
                    </a>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Insurance Certificate</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(e) => handleFileUpload(e, 'certificate_url')}
                    className="hidden"
                    id="cert-upload"
                  />
                  <label htmlFor="cert-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingCert}
                      className="cursor-pointer"
                      asChild
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {uploadingCert ? 'Uploading...' : 'Upload Certificate'}
                      </div>
                    </Button>
                  </label>
                  {formData.certificate_url && (
                    <a 
                      href={formData.certificate_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline text-sm"
                    >
                      View Certificate
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Covered Assets */}
          {assets && assets.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-900">Covered Assets</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                {assets.map(asset => (
                  <div key={asset.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.covered_assets.includes(asset.id)}
                      onCheckedChange={(checked) => handleAssetToggle(asset.id, checked)}
                    />
                    <Label className="text-sm font-normal">
                      {asset.name} ({asset.type})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={formData.notes} 
              onChange={(e) => handleInputChange('notes', e.target.value)} 
              rows={3}
              placeholder="Additional notes about this policy..."
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Saving...' : 'Save Policy'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}