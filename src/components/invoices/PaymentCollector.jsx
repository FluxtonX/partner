
import React, { useState } from 'react';
import { InvoicePayment } from '@/api/entities';
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, FileImage, DollarSign, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { generateReceiptPdfOnPayment } from "@/api/functions";

export default function PaymentCollector({ invoice, onPaymentComplete, onClose }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState(invoice.total_amount || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Card payment states
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });

  // Check payment states
  const [checkFile, setCheckFile] = useState(null);
  const [checkDetails, setCheckDetails] = useState({
    checkNumber: '',
    routingNumber: '',
    accountNumber: '',
    bankName: ''
  });
  const [isExtractingCheck, setIsExtractingCheck] = useState(false);

  // Cash payment states
  const [cashDetails, setCashDetails] = useState({
    receivedBy: '',
    location: '',
    receiptNumber: ''
  });

  const [notes, setNotes] = useState('');

  const handleCheckUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCheckFile(file);
    setIsExtractingCheck(true);
    setError('');

    try {
      // Upload the file first
      const { file_url } = await UploadFile({ file });
      
      // Extract check data
      const extractionResult = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            check_number: { type: "string" },
            routing_number: { type: "string" },
            account_number: { type: "string" },
            bank_name: { type: "string" },
            amount: { type: "number" },
            date: { type: "string" },
            memo: { type: "string" }
          }
        }
      });

      if (extractionResult.status === 'success' && extractionResult.output) {
        setCheckDetails({
          checkNumber: extractionResult.output.check_number || '',
          routingNumber: extractionResult.output.routing_number || '',
          accountNumber: extractionResult.output.account_number || '',
          bankName: extractionResult.output.bank_name || ''
        });
        
        // Update amount if extracted from check
        if (extractionResult.output.amount) {
          setAmount(extractionResult.output.amount);
        }
        
        setSuccess('Check details extracted successfully! Please verify the information.');
      } else {
        setError('Could not extract check details. Please enter them manually.');
      }
    } catch (error) {
      console.error('Error extracting check data:', error);
      setError('Failed to process check image. Please enter details manually.');
    } finally {
      setIsExtractingCheck(false);
    }
  };

  const simulateCardPayment = async () => {
    // Simulate card payment processing
    // In a real app, you would integrate with Stripe, Square, etc.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transaction_id: `txn_${Date.now()}`,
          last_four: cardDetails.cardNumber.slice(-4),
          brand: 'Visa' // This would come from the payment processor
        });
      }, 2000);
    });
  };

  const handleSubmitPayment = async () => {
    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      let paymentData = {
        invoice_id: invoice.id,
        payment_method: paymentMethod,
        amount: parseFloat(amount),
        payment_date: new Date().toISOString(),
        notes: notes
      };

      if (paymentMethod === 'card') {
        // Validate card details
        if (!cardDetails.cardNumber || !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv) {
          throw new Error('Please fill in all card details');
        }

        // Simulate card processing
        const cardResult = await simulateCardPayment();
        
        if (cardResult.success) {
          paymentData.status = 'completed';
          paymentData.transaction_id = cardResult.transaction_id;
          paymentData.card_details = {
            last_four: cardResult.last_four,
            brand: cardResult.brand,
            exp_month: parseInt(cardDetails.expiryMonth),
            exp_year: parseInt(cardDetails.expiryYear)
          };
        } else {
          throw new Error('Card payment failed');
        }

      } else if (paymentMethod === 'check') {
        if (!checkDetails.routingNumber || !checkDetails.accountNumber) {
          throw new Error('Please provide routing and account numbers');
        }

        let checkImageUrl = null;
        if (checkFile) {
          const { file_url } = await UploadFile({ file: checkFile });
          checkImageUrl = file_url;
        }

        paymentData.status = 'pending'; // Checks need to be verified
        paymentData.check_details = {
          ...checkDetails,
          check_image_url: checkImageUrl
        };

      } else if (paymentMethod === 'cash') {
        if (!cashDetails.receivedBy) {
          throw new Error('Please specify who received the cash payment');
        }

        paymentData.status = 'completed';
        paymentData.cash_details = cashDetails;
      }

      // Create payment record
      await InvoicePayment.create(paymentData);
      
      // Generate receipt PDF automatically
      try {
        const receiptPdfData = await generateReceiptPdfOnPayment({
          invoiceId: invoice.id,
          paymentAmount: parseFloat(amount),
          paymentMethod: paymentMethod,
          transactionId: paymentData.transaction_id
        });

        // Update payment record with PDF information
        await InvoicePayment.update(paymentData.id, {
          receipt_pdf_url: receiptPdfData.pdf_url,
          receipt_pdf_filename: receiptPdfData.pdf_filename,
          receipt_pdf_generated_date: receiptPdfData.pdf_generated_date
        });

        setSuccess('Payment recorded successfully with receipt generated!');
      } catch (pdfError) {
        console.error('Error generating receipt PDF:', pdfError);
        setSuccess('Payment recorded successfully, but receipt PDF generation failed. You can generate it manually later.');
      }
      
      setSuccess('Payment processed successfully!');
      setTimeout(() => {
        onPaymentComplete();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Payment processing error:', error);
      setError(error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const remainingAmount = invoice.total_amount - (invoice.paid_amount || 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Collect Payment - Invoice #{invoice.invoice_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Invoice Total:</span>
                  <span className="font-semibold">${invoice.total_amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Previously Paid:</span>
                  <span>${(invoice.paid_amount || 0).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Amount Due:</span>
                  <span>${remainingAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              max={remainingAmount}
            />
          </div>

          {/* Card Payment Form */}
          {paymentMethod === 'card' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Card Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Month</Label>
                    <Select 
                      value={cardDetails.expiryMonth} 
                      onValueChange={(value) => setCardDetails(prev => ({ ...prev, expiryMonth: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 12}, (_, i) => (
                          <SelectItem key={i+1} value={String(i+1).padStart(2, '0')}>
                            {String(i+1).padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiryYear">Year</Label>
                    <Select 
                      value={cardDetails.expiryYear} 
                      onValueChange={(value) => setCardDetails(prev => ({ ...prev, expiryYear: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 10}, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return <SelectItem key={year} value={String(year)}>{year}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={cardDetails.cardholderName}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Check Payment Form */}
          {paymentMethod === 'check' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="w-5 h-5" />
                  Check Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="checkUpload">Upload Check Image</Label>
                  <Input
                    id="checkUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleCheckUpload}
                  />
                  {isExtractingCheck && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Extracting check details...
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkNumber">Check Number</Label>
                    <Input
                      id="checkNumber"
                      value={checkDetails.checkNumber}
                      onChange={(e) => setCheckDetails(prev => ({ ...prev, checkNumber: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={checkDetails.bankName}
                      onChange={(e) => setCheckDetails(prev => ({ ...prev, bankName: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      value={checkDetails.routingNumber}
                      onChange={(e) => setCheckDetails(prev => ({ ...prev, routingNumber: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={checkDetails.accountNumber}
                      onChange={(e) => setCheckDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cash Payment Form */}
          {paymentMethod === 'cash' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Cash Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receivedBy">Received By</Label>
                  <Input
                    id="receivedBy"
                    placeholder="Staff member who received payment"
                    value={cashDetails.receivedBy}
                    onChange={(e) => setCashDetails(prev => ({ ...prev, receivedBy: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Where payment was received"
                    value={cashDetails.location}
                    onChange={(e) => setCashDetails(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="receiptNumber">Receipt Number (Optional)</Label>
                  <Input
                    id="receiptNumber"
                    placeholder="Receipt or reference number"
                    value={cashDetails.receiptNumber}
                    onChange={(e) => setCashDetails(prev => ({ ...prev, receiptNumber: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Payment Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitPayment} 
              disabled={!paymentMethod || isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Process Payment ($${amount.toFixed(2)})`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
