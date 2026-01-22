import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, CreditCard, X, CheckCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusColors = {
  paid: "bg-emerald-100 text-emerald-800",
  sent: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
};

export default function InvoicePaymentModal({ invoice, project, client, businessSettings, onClose, onPaymentComplete }) {
  const [paymentComplete, setPaymentComplete] = useState(invoice?.status === "paid");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handlePaymentClick = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Create Stripe checkout session
      const response = await fetch('/functions/stripePayments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_invoice_checkout',
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
          amount: invoice.total_amount,
          client_email: client.email,
          client_name: client.contact_person || client.email,
          project_id: project?.id,
          project_title: project?.title,
          success_url: `${window.location.origin}/YourPartner?payment_success=true&invoice_id=${invoice.id}`,
          cancel_url: `${window.location.origin}/YourPartner?payment_cancelled=true`
        }),
      });
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.checkout_url) {
        // Show confirmation before redirect
        toast.success("Redirecting to secure payment...");
        
        // Redirect to Stripe checkout
        window.location.href = result.checkout_url;
      } else {
        throw new Error('Failed to create checkout session');
      }
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Payment Error: ' + error.message);
      setIsProcessingPayment(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await fetch('/functions/generateInvoicePdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${invoice.invoice_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success("Invoice downloaded successfully");
      } else {
        toast.error('Failed to generate invoice PDF');
      }
    } catch (error) {
      toast.error('Error downloading invoice: ' + error.message);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await fetch('/functions/generateReceiptPdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt-${invoice.invoice_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success("Receipt downloaded successfully");
      } else {
        toast.error('Failed to generate receipt PDF');
      }
    } catch (error) {
      toast.error('Error downloading receipt: ' + error.message);
    }
  };

  const subtotal = invoice.line_items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const tax = (invoice.total_amount || 0) - subtotal;

  // If invoice is already paid, show receipt view
  if (paymentComplete || invoice.status === 'paid') {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-8 h-8" />
              Payment Completed
            </DialogTitle>
            <DialogDescription>
              This invoice has been paid in full. You can download your receipt and invoice below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Payment Confirmation */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
              <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Payment Confirmed</h3>
              <p className="text-emerald-700 mb-4">
                Payment of <span className="font-bold">${invoice.total_amount.toFixed(2)}</span> has been received.
              </p>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-lg px-4 py-2">
                PAID IN FULL
              </Badge>
            </div>

            {/* Invoice Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Invoice #{invoice.invoice_number}</span>
                    <span>{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Project:</span>
                    <span>{project?.title || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Business:</span>
                    <span>{businessSettings?.business_name || 'Business'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Paid:</span>
                    <span className="text-emerald-600">${invoice.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download Actions */}
            <div className="flex gap-3">
              <Button onClick={handleDownloadReceipt} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button onClick={handleDownloadInvoice} variant="outline" className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
            </div>

            <div className="text-center">
              <Button onClick={onClose} variant="outline">
                Return to Portal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Payment initiation view
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Payment for Invoice #{invoice.invoice_number}
          </DialogTitle>
          <DialogDescription>
            Review the details below and proceed to secure payment
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Client and Invoice Details */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <h4 className="font-semibold mb-1">Billed To</h4>
                  <p>{client.contact_person || client.email}</p>
                  {client.address && <p>{client.address}</p>}
                  {client.city && <p>{client.city}, {client.state} {client.zip_code}</p>}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Details</h4>
                  <p><strong>Issue Date:</strong> {format(new Date(invoice.issue_date), "PPP")}</p>
                  <p><strong>Due Date:</strong> {format(new Date(invoice.due_date), "PPP")}</p>
                  <p><strong>Project:</strong> {project?.title || "N/A"}</p>
                </div>
              </div>

              <Separator className="my-4"/>

              {/* Line Items Table */}
              {invoice.line_items && invoice.line_items.length > 0 && (
                <Table className="my-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.line_items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">${(item.total || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t font-bold text-lg">
                  <span>Total Amount:</span>
                  <span className="text-2xl text-slate-900">
                    ${invoice.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isProcessingPayment}>
              Cancel
            </Button>
            <Button 
              onClick={handlePaymentClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay ${invoice.total_amount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
          
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800">
              🔒 Your payment is secured by Stripe. You will be redirected to a secure payment page.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}