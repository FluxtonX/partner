import React, { useState, useEffect } from 'react';
import { Invoice, InvoicePayment, BusinessSettings, Project } from '@/api/entities';
import { createPageUrl } from '@/utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, DollarSign, FileText, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { StripePaymentForm } from '@/components/payments/StripePaymentForm';


export default function InvoicePaymentForm({ invoice, project, onPaymentComplete }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateCompletionPercentage = () => {
    if (!invoice || !project) return 0;
    const totalProjectValue = project.total_after_adjustments || project.estimated_cost || 0;
    if (totalProjectValue === 0) return 0;
    return Math.round((invoice.total_amount / totalProjectValue) * 100);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    setIsSubmitting(true);
    try {
      await InvoicePayment.create({
        invoice_id: invoice.id,
        payment_method: paymentDetails.paymentMethod,
        amount: paymentDetails.amount,
        payment_date: new Date().toISOString(),
        status: 'completed',
        transaction_id: paymentDetails.transactionId,
        ...paymentDetails 
      });

      await Invoice.update(invoice.id, {
        status: 'paid' 
      });

      toast.success('Payment successful! Thank you.');
      
      const portalUrl = `${window.location.origin}${createPageUrl(`ClientPortal?type=project&project_id=${invoice.project_id}`)}`;
      window.location.href = portalUrl;
        
    } catch (error) {
      console.error('Error processing payment confirmation:', error);
      toast.error('Payment was successful, but there was an error updating records. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Invoice Number:</span>
              <span>{invoice?.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Amount Due:</span>
              <span className="font-bold text-lg">${(invoice?.total_amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Project Value:</span>
              <span>${(project?.total_after_adjustments || project?.estimated_cost || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Amount to be paid:</span>
              <span className="font-bold text-emerald-600">${(invoice?.total_amount || 0).toFixed(2)}</span>
            </div>
            <p className="text-sm text-slate-600">
              This payment represents {calculateCompletionPercentage()}% of the total project value.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Make a Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <StripePaymentForm
            amount={invoice?.total_amount || 0}
            onSuccess={handlePaymentSuccess}
            clientEmail={project?.client_email}
          />

          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-slate-900">Payment Acknowledgment</h4>
            <div className="text-xs text-slate-600 border p-2 rounded-md bg-white">
              By submitting this payment, you acknowledge that the work completed by the project team is satisfactory to the degree represented by the amount paid. For example, a payment of {calculateCompletionPercentage()}% of the total estimate acknowledges that {calculateCompletionPercentage()}% of the project has been completed to your satisfaction.
            </div>
          </div>
          <div className="flex items-center justify-center text-xs text-slate-500 gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure payments powered by Stripe</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}