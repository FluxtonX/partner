import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, FileText, Calendar } from 'lucide-react';

export default function ContractSigningForm({ contract, assignment, onSign, onCancel }) {
  const [formData, setFormData] = useState({
    start_date: contract.start_date || '',
    completion_date: contract.completion_date || '',
    digital_signature: '',
    terms_acknowledged: false,
    penalty_terms_understood: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.terms_acknowledged || !formData.penalty_terms_understood) {
      alert('You must acknowledge all terms and conditions to proceed.');
      return;
    }

    if (!formData.digital_signature.trim()) {
      alert('Please provide your digital signature (type your full name).');
      return;
    }

    setIsSubmitting(true);

    try {
      const contractData = {
        start_date: formData.start_date,
        completion_date: formData.completion_date,
        digital_signature: formData.digital_signature,
        ip_address: 'unknown', // Could be enhanced to get actual IP
      };

      await onSign(contractData);
    } catch (error) {
      console.error('Error signing contract:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const penaltyTerms = contract.penalty_terms || {};

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Contract Agreement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Overview */}
          <Card className="bg-slate-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Contract Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Agreed Amount:</span>
                  <p className="text-green-600 font-bold text-lg">${contract.agreed_amount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium">Assignment Type:</span>
                  <p className="capitalize">{assignment?.assignment_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Penalty Terms Warning */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important Penalty Terms:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Daily delay penalty: {((penaltyTerms.daily_delay_rate || 0.01) * 100).toFixed(1)}% reduction per day for not updating status</li>
                <li>Completion delay penalty: {((penaltyTerms.completion_delay_rate || 0.02) * 100).toFixed(1)}% reduction per day for not marking as completed</li>
                <li>Holdback amount: {((penaltyTerms.holdback_percentage || 0.10) * 100).toFixed(0)}% held until completion verification</li>
                <li>Payment terms: {penaltyTerms.payment_terms || 'Net 30 days after completion verification'}</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Contract Terms (Simplified - in real app would show full contract) */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Terms and Conditions</h4>
              <div className="text-sm text-slate-600 space-y-3 max-h-48 overflow-y-auto bg-slate-50 p-4 rounded">
                <p><strong>1. Scope of Work:</strong> The subcontractor agrees to complete the assigned work according to the specifications provided in the project assignment.</p>
                
                <p><strong>2. Timeline Commitment:</strong> Work must begin by the agreed start date and be completed by the agreed completion date. Regular status updates are required.</p>
                
                <p><strong>3. Quality Standards:</strong> All work must meet industry standards and pass inspection by the contracting party.</p>
                
                <p><strong>4. Penalty Structure:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>Failure to update work status will result in daily penalties</li>
                  <li>Failure to complete work by the agreed date will result in additional penalties</li>
                  <li>A percentage of payment will be held back until completion is verified</li>
                </ul>
                
                <p><strong>5. Materials and Equipment:</strong> Unless specified otherwise, subcontractor is responsible for providing all necessary tools and equipment.</p>
                
                <p><strong>6. Insurance and Liability:</strong> Subcontractor maintains appropriate insurance coverage and accepts liability for their work.</p>
                
                <p><strong>7. Termination:</strong> Either party may terminate this agreement with written notice if terms are not met.</p>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Timeline Confirmation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Confirmed Start Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="completion_date">Confirmed Completion Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="completion_date"
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                    className="pl-10"
                    min={formData.start_date}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Digital Signature */}
            <div className="space-y-2">
              <Label htmlFor="digital_signature">Digital Signature (Type your full name) *</Label>
              <Input
                id="digital_signature"
                value={formData.digital_signature}
                onChange={(e) => setFormData(prev => ({ ...prev, digital_signature: e.target.value }))}
                placeholder="Type your full legal name here"
                required
              />
              <p className="text-xs text-slate-500">
                By typing your name, you are providing a legally binding digital signature
              </p>
            </div>

            {/* Acknowledgments */}
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms_acknowledged"
                  checked={formData.terms_acknowledged}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, terms_acknowledged: checked }))}
                />
                <Label htmlFor="terms_acknowledged" className="text-sm leading-relaxed">
                  I acknowledge that I have read and understand the terms and conditions of this contract, including the scope of work, timeline requirements, and quality standards.
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="penalty_terms_understood"
                  checked={formData.penalty_terms_understood}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, penalty_terms_understood: checked }))}
                />
                <Label htmlFor="penalty_terms_understood" className="text-sm leading-relaxed">
                  <strong>I understand and agree to the penalty structure</strong>, including daily delay penalties, completion delay penalties, and holdback amounts. I commit to completing the work within the agreed timeframe and providing regular status updates.
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.terms_acknowledged || !formData.penalty_terms_understood}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? 'Signing Contract...' : 'Sign Contract'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}