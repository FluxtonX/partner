import React, { useState } from 'react';
import { UploadFile } from '@/api/integrations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, Save, X, FileText } from 'lucide-react';

export default function ContractForm({ contract, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(contract || {
    name: '',
    description: '',
    pdf_url: '',
    payment_terms: '',
    deposit_percentage: 0,
    contract_type: 'other',
    terms_and_conditions: '',
    warranty_period_days: 0,
    active: true
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, pdf_url: file_url }));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.pdf_url) {
      alert('Please upload a PDF contract document.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {contract ? 'Edit Contract Template' : 'Add Contract Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Standard Service Contract"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_type">Contract Type</Label>
              <Select
                value={formData.contract_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, contract_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this contract template"
              rows={2}
            />
          </div>

          {/* PDF Upload */}
          <div className="space-y-2">
            <Label htmlFor="pdf_upload">Contract PDF Document *</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="pdf_upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>
              <div className="flex items-center gap-2">
                {isUploading && <span className="text-sm text-slate-500">Uploading...</span>}
                {formData.pdf_url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(formData.pdf_url, '_blank')}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    View
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Payment Terms</h4>
            
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms *</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                placeholder="e.g., Net 30, 50% upfront 50% on completion"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deposit_percentage">Deposit Percentage (%)</Label>
                <Input
                  id="deposit_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.deposit_percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, deposit_percentage: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty_period_days">Warranty Period (Days)</Label>
                <Input
                  id="warranty_period_days"
                  type="number"
                  min="0"
                  value={formData.warranty_period_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, warranty_period_days: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Additional Terms */}
          <div className="space-y-2">
            <Label htmlFor="terms_and_conditions">Additional Terms & Conditions</Label>
            <Textarea
              id="terms_and_conditions"
              value={formData.terms_and_conditions}
              onChange={(e) => setFormData(prev => ({ ...prev, terms_and_conditions: e.target.value }))}
              placeholder="Any additional terms and conditions..."
              rows={4}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
            />
            <Label>Active (available for use in estimates)</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : contract ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}