import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, CreditCard, DollarSign, Calendar, Receipt } from "lucide-react";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Invoice, InvoicePayment } from '@/api/entities';

export default function PaymentStatusManager({ invoice, payments, onStatusUpdate }) {
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsPaid = async () => {
    if (!notes.trim()) {
      toast.error('Please provide a reason for manually marking this invoice as paid');
      return;
    }

    setIsLoading(true);
    try {
      // Update invoice status
      await Invoice.update(invoice.id, {
        status: 'paid',
        updated_date: new Date().toISOString()
      });

      // Create manual payment record
      await InvoicePayment.create({
        invoice_id: invoice.id,
        payment_method: 'manual',
        amount: invoice.total_amount,
        payment_date: new Date().toISOString(),
        status: 'completed',
        transaction_id: `MANUAL_${Date.now()}`,
        notes: notes,
        processed_by: 'admin' // This will be set to the current user's email by the system
      });

      toast.success('Invoice marked as paid successfully');
      setShowMarkPaidDialog(false);
      setNotes('');
      onStatusUpdate();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Failed to update invoice status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsUnpaid = async () => {
    if (window.confirm('Are you sure you want to mark this invoice as unpaid? This will remove all payment records.')) {
      setIsLoading(true);
      try {
        // Update invoice status
        await Invoice.update(invoice.id, {
          status: 'sent',
          updated_date: new Date().toISOString()
        });

        // Note: In a real system, you might want to archive payments rather than delete them
        // For now, we'll just update the status and let admins handle payment records manually

        toast.success('Invoice marked as unpaid');
        onStatusUpdate();
      } catch (error) {
        console.error('Error marking invoice as unpaid:', error);
        toast.error('Failed to update invoice status');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Status</span>
            <Badge className={`${getStatusColor(invoice.status)} border font-medium`}>
              {invoice.status === 'paid' ? (
                <><CheckCircle className="w-3 h-3 mr-1" />Paid</>
              ) : (
                <><XCircle className="w-3 h-3 mr-1" />{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Invoice Amount:</span>
            <span className="text-lg font-bold">${invoice.total_amount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Due Date:</span>
            <span className={`text-sm ${new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
              {format(new Date(invoice.due_date), 'MMM d, yyyy')}
            </span>
          </div>

          {payments && payments.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Payment History:</span>
              {payments.map((payment, index) => (
                <div key={index} className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">${payment.amount.toFixed(2)}</span>
                    <Badge variant="outline" className="text-xs">
                      {payment.payment_method === 'card' ? 'Card Payment' : 'Manual Payment'}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600">
                    {format(new Date(payment.payment_date), 'MMM d, yyyy h:mm a')}
                    {payment.card_details && (
                      <span className="ml-2">
                        • {payment.card_details.brand.toUpperCase()} ending in {payment.card_details.last_four}
                      </span>
                    )}
                  </div>
                  {payment.transaction_id && (
                    <div className="text-xs text-slate-500 mt-1">
                      Transaction ID: {payment.transaction_id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            {invoice.status !== 'paid' ? (
              <Button 
                onClick={() => setShowMarkPaidDialog(true)}
                className="flex-1"
                disabled={isLoading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Paid
              </Button>
            ) : (
              <Button 
                onClick={handleMarkAsUnpaid}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Mark as Unpaid
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Invoice as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                You are about to manually mark this invoice as paid. Please provide a reason for this action.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Reason for manual payment:</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Cash payment received, Check payment processed, etc."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMarkPaidDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMarkAsPaid} 
              disabled={!notes.trim() || isLoading}
            >
              {isLoading ? 'Processing...' : 'Mark as Paid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}