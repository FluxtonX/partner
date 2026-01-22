
import React, { useState } from 'react';
import { ChangeOrder, Project } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, FileText, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';


export default function ChangeOrderApprovalForm({ changeOrder, project, onApprovalComplete, contract, businessSettings }) {
  const [signature, setSignature] = useState('');
  const [clientName, setClientName] = useState(changeOrder?.approved_by || '');
  const [comments, setComments] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!signature.trim() || !clientName.trim()) {
      toast.error('Please provide your name and signature to approve.');
      return;
    }

    if (businessSettings?.electronic_signature_terms && !agreedToTerms) {
      toast.error('Please agree to the electronic signature terms to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      await ChangeOrder.update(changeOrder.id, {
        status: 'approved',
        approval_date: new Date().toISOString(),
        approved_by: clientName,
        client_signature: signature,
        client_signature_date: new Date().toISOString()
      });

      const newTotal = (project.estimated_cost || 0) + (changeOrder.total_after_adjustments || 0);
      await Project.update(project.id, {
        estimated_cost: newTotal,
        change_orders_total: (project.change_orders_total || 0) + (changeOrder.total_after_adjustments || 0)
      });

      toast.success('Thank you! Your change order approval has been recorded.');
      
      // Call the completion callback to refresh data and redirect
      if (onApprovalComplete) {
        onApprovalComplete();
      }
      
    } catch (error) {
      console.error('Error approving change order:', error);
      toast.error('Failed to submit approval. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!comments.trim()) {
      toast.error('Please provide comments on why this change order is being declined.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await ChangeOrder.update(changeOrder.id, {
        status: 'rejected',
        client_comments: comments,
        client_name: clientName || 'N/A'
      });
      
      toast.info('Your response has been recorded. The project team will be in touch.');
      
      // Call the completion callback to refresh data and redirect
      if (onApprovalComplete) {
        onApprovalComplete();
      }
      
    } catch (error) {
      console.error('Error declining change order:', error);
      toast.error('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if electronic signature terms should be shown and required
  const showElectronicSignatureTerms = businessSettings?.electronic_signature_terms !== false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Change Order #{changeOrder?.change_order_number}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Change Order Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{changeOrder?.title}</h3>
              <p className="text-slate-600 mt-2">{changeOrder?.description}</p>
            </div>
            
            {contract && (
              <div className="text-center py-2">
                <a href={contract.pdf_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Associated Contract
                  </Button>
                </a>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-slate-600">Additional Cost</p>
                  <p className="text-lg font-bold text-slate-900">
                    ${(changeOrder?.total_after_adjustments || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {changeOrder?.estimated_completion_impact && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-slate-600">New Completion Date</p>
                    <p className="font-semibold text-slate-900">
                      {format(new Date(changeOrder.estimated_completion_impact), 'PPP')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {changeOrder?.reason_for_change && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Reason for Change</h4>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{changeOrder.reason_for_change}</p>
              </div>
            )}

            {changeOrder?.line_items?.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Change Order Items</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 font-medium">Description</th>
                        <th className="text-center p-3 font-medium">Qty</th>
                        <th className="text-right p-3 font-medium">Price</th>
                        <th className="text-right p-3 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changeOrder.line_items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{item.description}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">${(item.unit_price || 0).toFixed(2)}</td>
                          <td className="p-3 text-right font-medium">${(item.total || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approval Form - new Card as per outline */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Your Full Name *</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signature">Digital Signature *</Label>
              <Input
                id="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your full name to sign"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments (Optional)</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any questions or comments about this change order..."
              rows={3}
            />
          </div>

          {/* Electronic Signature Terms - Conditionally rendered based on businessSettings */}
          {showElectronicSignatureTerms && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-slate-900">Electronic Signature Terms</h4>
              <div className="text-xs text-slate-600 max-h-24 overflow-y-auto border p-2 rounded-md bg-white">
                By providing your electronic signature, you agree that it is the legal equivalent of your manual signature on this Change Order and you consent to be legally bound by its terms and conditions.
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="terms_agreement_co" checked={agreedToTerms} onCheckedChange={setAgreedToTerms} />
                <Label htmlFor="terms_agreement_co" className="text-sm font-medium leading-none cursor-pointer">
                  I agree to the electronic signature terms.
                </Label>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex flex-col md:flex-row gap-4 justify-end">
            <Button 
              onClick={handleDecline} 
              disabled={isSubmitting} 
              variant="outline" 
              className="text-red-700 border-red-300 hover:bg-red-50 hover:text-red-800"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Decline Change Order
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={isSubmitting || !signature || !clientName || (showElectronicSignatureTerms && !agreedToTerms)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
              {isSubmitting ? 'Processing...' : 'Approve & Sign'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
