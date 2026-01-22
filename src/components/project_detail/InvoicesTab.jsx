
import React, { useState, useEffect } from 'react';
import { Invoice, InvoicePayment, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Table components are no longer used for the main invoice list in the new structure.
// Payment history section is also removed as per the outline.
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
// Added new icons as specified in the outline, alongside existing ones.
import { FileText, Plus, Eye, Edit, DollarSign, CreditCard, Check, Banknote, CheckCircle, Mail, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate for programmatic navigation
import { createPageUrl } from '@/utils';

// PaymentCollector import removed as the component structure no longer uses this modal directly.
// import PaymentCollector from '../invoices/PaymentCollector';

export default function InvoicesTab({ project, onInvoiceUpdate }) { // onRefresh prop renamed to onInvoiceUpdate as per outline
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  // Removed showPaymentCollector and selectedInvoice states as the PaymentCollector modal is removed.
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); // New state for 'Send to Client' button loading

  const navigate = useNavigate(); // Initialize useNavigate hook for programmatic navigation

  useEffect(() => {
    // Renamed loadInvoicesAndPayments to loadInvoices as per outline.
    // Retain the core logic for calculating paid/remaining amounts for accurate display and summary.
    loadInvoices();
    loadCurrentUser();
  }, [project.id]); // Dependency on project.id ensures refresh when project changes

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // Renamed from loadInvoicesAndPayments to loadInvoices as per the outline.
  // Critical: Re-introduced the calculation of 'paid_amount' and 'remaining_amount' per invoice.
  // This is essential for the summary cards (Total Paid, Outstanding) and for the individual invoice card display
  // (e.g., to determine if an invoice is fully paid and to show the remaining amount).
  const loadInvoices = async () => {
    try {
      setIsLoading(true); // Set loading true at the start of data fetch
      const [invoicesData, paymentsData] = await Promise.all([
        // Filter invoices by project_id and order by issue_date descending for display
        Invoice.filter({ project_id: project.id }, '-issue_date'),
        // Fetch all payments to correctly calculate paid amounts for all relevant invoices
        InvoicePayment.list('-payment_date')
      ]);

      // Calculate paid amounts and remaining amounts for each invoice based on completed payments
      const processedInvoices = invoicesData.map(invoice => {
        // Filter payments relevant to this specific invoice that are 'completed'
        const invoicePayments = paymentsData.filter(p =>
          p.invoice_id === invoice.id && p.status === 'completed'
        );
        const paidAmount = invoicePayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        return {
          ...invoice,
          paid_amount: paidAmount,
          remaining_amount: (invoice.total_amount || 0) - paidAmount,
          // You might also store `invoicePayments` directly on the invoice if needed for complex displays
          // payments_list: invoicePayments,
        };
      });

      setInvoices(processedInvoices); // Set processed invoices with calculated amounts
      setPayments(paymentsData); // Keep all payments in state, for getPaymentInfo lookup etc.
    } catch (error) {
      console.error('Error loading invoices and payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // getStatusColor now takes the full invoice object to check remaining_amount.
  // It prioritizes `remaining_amount` for 'Paid' status to ensure accuracy even if `invoice.status` field lags.
  const getStatusColor = (invoice) => {
    if (invoice.remaining_amount <= 0) return 'bg-emerald-100 text-emerald-800'; // Fully paid
    switch (invoice.status) {
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-slate-100 text-slate-600';
      case 'paid': return 'bg-emerald-100 text-emerald-800'; // Explicit 'paid' status from backend
      default: return 'bg-slate-100 text-slate-600'; // Default for other or unknown statuses
    }
  };

  // getStatusText also uses the full invoice object for 'Paid' determination.
  const getStatusText = (invoice) => {
    if (invoice.remaining_amount <= 0) return 'Paid'; // Fully paid
    const statusText = invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);
    return statusText || 'Draft'; // Default to 'Draft' if status is null/empty
  };

  // getPaymentMethodIcon function removed as it's not utilized in the new card-based display.

  // handleCollectPayment and handlePaymentComplete functions removed as the PaymentCollector modal is gone.

  // New function from the outline to retrieve a single completed payment for display purposes.
  // Note: This finds only *one* completed payment. For invoices paid across multiple transactions,
  // this will only show details of the first completed one found.
  const getPaymentInfo = (invoiceId) => {
    return payments.find(p => p.invoice_id === invoiceId && p.status === 'completed');
  };

  // New action handler for editing an invoice. Navigates to InvoiceEditor page.
  const handleEdit = (invoice) => {
    navigate(createPageUrl(`InvoiceEditor?id=${invoice.id}`));
  };

  // New action handler for sending an invoice to client via email. Simulates an API call.
  const handleSendToClient = async (invoice) => {
    setIsSending(true);
    try {
      // Simulate an asynchronous API call for sending the email
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`Successfully simulated sending invoice ${invoice.invoice_number} to client.`);
      // In a real application, you would make an actual API call here, e.g., Invoice.sendEmail(invoice.id)
      // and potentially show a success toast notification.
    } catch (error) {
      console.error('Error sending invoice:', error);
      // Show an error toast notification if the API call fails
    } finally {
      setIsSending(false);
    }
  };

  // New action handler for viewing invoice details. Navigates to PublicInvoice page.
  const handleViewDetails = (invoice) => {
    navigate(createPageUrl(`PublicInvoice?id=${invoice.id}`));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-20 bg-slate-200 animate-pulse rounded"></div>
        ))}
      </div>
    );
  }

  // Calculate summary totals based on the processed invoices which now contain accurate paid/remaining amounts.
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  return (
    <div className="space-y-6">
      {/* Summary Cards - Retained from original structure, calculations use derived amounts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Invoiced</p>
                <p className="text-2xl font-bold">${totalInvoiced.toFixed(2)}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Paid</p>
                <p className="text-2xl font-bold text-emerald-600">${totalPaid.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Outstanding</p>
                <p className="text-2xl font-bold text-amber-600">${totalOutstanding.toFixed(2)}</p>
              </div>
              <CreditCard className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List - Now rendered as individual cards instead of a table */}
      <Card> {/* This outer card wraps the entire invoice list section */}
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Project Invoices</CardTitle>
            <Link to={createPageUrl(`InvoiceEditor?project_id=${project.id}`)}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-4"> {/* Container for the individual invoice cards */}
              {invoices.map((invoice) => {
                // Determine if the invoice is considered fully paid based on calculated remaining_amount
                const isPaid = invoice.remaining_amount <= 0;
                // Get a single completed payment's info for display in the card (as per outline)
                const payment = getPaymentInfo(invoice.id);

                return (
                  <Card key={invoice.id} className="border border-slate-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Invoice #{invoice.invoice_number}
                          </CardTitle>
                          <p className="text-slate-600 text-sm mt-1">
                            Issued: {format(new Date(invoice.issue_date), 'MMM d, yyyy')} •
                            Due: {invoice.due_date && format(new Date(invoice.due_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(invoice)}>
                            {isPaid && <CheckCircle className="w-3 h-3 mr-1" />}
                            {getStatusText(invoice)}
                          </Badge>
                          {isPaid && payment && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              Paid: {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Amount</p>
                          <p className="text-2xl font-bold text-slate-900">
                            ${(invoice.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        {isPaid && payment ? ( // Display payment details only if invoice is paid and a payment record exists
                          <>
                            <div>
                              <p className="text-sm font-medium text-slate-700">Payment Method</p>
                              <p className="text-lg font-semibold capitalize">
                                {payment.payment_method}
                                {payment.payment_method === 'card' && payment.card_details?.last_four &&
                                  ` •••• ${payment.card_details.last_four}`
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">Transaction ID</p>
                              <p className="text-sm font-mono text-slate-600">
                                {payment.transaction_id ? `${payment.transaction_id.substring(0, 20)}...` : 'N/A'}
                              </p>
                            </div>
                          </>
                        ) : ( // If not paid, display remaining amount
                          <div>
                            <p className="text-sm font-medium text-slate-700">Remaining</p>
                            <p className="text-2xl font-bold text-amber-600">
                              ${(invoice.remaining_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        )}
                      </div>

                      {isPaid && payment && ( // Show payment confirmation and Stripe receipt link if available
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              Payment received on {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {payment.stripe_data?.receipt_url && (
                            <a
                              href={payment.stripe_data.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-green-600 hover:text-green-800 underline ml-6"
                            >
                              View Stripe Receipt
                            </a>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap"> {/* Added flex-wrap for responsiveness */}
                        {!isPaid && ( // Allow editing only if the invoice is not fully paid
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(invoice)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendToClient(invoice)}
                          disabled={isSending} // Disable button while email is being sent
                        >
                          {isSending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Send to Client
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(invoice)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        {/* If invoice is not fully paid, offer the option to collect payment.
                            Links to a new CollectPayment page (assuming it exists). */}
                        {!isPaid && (
                          <Link to={createPageUrl(`CollectPayment?invoice_id=${invoice.id}`)}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Collect Payment
                            </Button>
                          </Link>
                        )}
                        {isPaid && ( // Provide an option to download receipt if invoice is paid
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReceipt(invoice.id)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No invoices created yet</p>
              <Link to={createPageUrl(`InvoiceEditor?project_id=${project.id}`)}>
                <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Invoice
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History section was removed as per the outline. */}

      {/* Payment Collector Modal section was removed as per the outline.
          The outline also mentioned "// ... keep existing code (invoice editor modal) ...",
          however, there was no InvoiceEditor modal in the original code.
          InvoiceEditor and PublicInvoice are handled via `createPageUrl` (react-router-dom Link/navigate)
          which means they are separate pages, not modals rendered within this component.
      */}
    </div>
  );
}

// Global function to handle downloading an invoice receipt as a PDF.
// In a real application, this would interact with a backend function that generates the PDF.
const downloadReceipt = async (invoiceId) => {
  try {
    // Replace '/functions/generateReceiptPdf' with your actual API endpoint to generate PDF receipts.
    // Ensure this endpoint handles authentication and proper PDF generation.
    const response = await fetch('/functions/generateReceiptPdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId }),
    });

    if (response.ok) {
      const blob = await response.blob(); // Get the response as a Blob (binary data)
      const url = window.URL.createObjectURL(blob); // Create a URL for the Blob
      const a = document.createElement('a'); // Create a temporary anchor element
      a.href = url;
      a.download = `Receipt-${invoiceId}-${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`; // Suggest a filename
      document.body.appendChild(a); // Append anchor to body (necessary for Firefox)
      a.click(); // Programmatically click the anchor to trigger download
      window.URL.revokeObjectURL(url); // Clean up the URL object
      a.remove(); // Remove the temporary anchor element
    } else {
      console.error('Failed to download receipt:', response.status, response.statusText);
      const errorBody = await response.text();
      console.error('Error details:', errorBody);
      // Implement user-friendly error feedback here (e.g., a toast notification)
    }
  } catch (error) {
    console.error('Error downloading receipt:', error);
    // Implement user-friendly error feedback here
  }
};
