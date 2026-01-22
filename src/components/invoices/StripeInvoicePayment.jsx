import React, { useState, useEffect } from 'react';
import { Invoice, InvoicePayment, BusinessSettings, User } from '@/api/entities';
import StripePaymentForm from '../payments/StripePaymentForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, CreditCard, DollarSign, Building } from 'lucide-react';
import { stripePayments } from '@/api/functions';

export default function StripeInvoicePayment({ invoice, onPaymentSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [stripeCustomerId, setStripeCustomerId] = useState(null);

  useEffect(() => {
    loadBusinessInfo();
  }, []);

  const loadBusinessInfo = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      const settings = await BusinessSettings.filter({ business_id: user.current_business_id });
      if (settings.length > 0) {
        setBusinessInfo(settings[0]);
      }

      // Create or get Stripe customer if needed
      if (!user.stripe_customer_id) {
        await createStripeCustomer(user, settings[0]);
      } else {
        setStripeCustomerId(user.stripe_customer_id);
      }
    } catch (error) {
      console.error('Error loading business info:', error);
    }
  };

  const createStripeCustomer = async (user, businessSettings) => {
    try {
      const { data } = await stripePayments({
        action: 'create_customer',
        email: user.email,
        name: businessSettings?.business_name || user.full_name,
        phone: businessSettings?.business_phone || '',
        address: {
          line1: businessSettings?.business_address || '',
          city: businessSettings?.business_city || '',
          state: businessSettings?.business_state || '',
          postal_code: businessSettings?.business_zip || '',
          country: 'US',
        },
        metadata: {
          business_id: user.current_business_id,
          business_name: businessSettings?.business_name || '',
          subscription_type: businessSettings?.subscription_type || 'Trial',
          user_email: user.email,
        }
      });

      // Save customer ID to user
      await User.updateMyUserData({
        stripe_customer_id: data.customer_id,
      });

      setStripeCustomerId(data.customer_id);
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      setError('Failed to set up payment account. Please try again.');
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    setIsProcessing(true);
    try {
      // Create comprehensive payment record with business and subscription data
      const paymentData = {
        invoice_id: invoice.id,
        payment_method: 'card',
        amount: invoice.total_amount,
        payment_date: new Date().toISOString(),
        status: 'completed',
        transaction_id: paymentIntent.id,
        notes: `Payment processed via Stripe for ${businessInfo?.business_name || 'Business'}`,
        card_details: paymentIntent.payment_method?.card ? {
          last_four: paymentIntent.payment_method.card.last4,
          brand: paymentIntent.payment_method.card.brand,
          exp_month: paymentIntent.payment_method.card.exp_month,
          exp_year: paymentIntent.payment_method.card.exp_year,
        } : undefined,
        business_data: {
          business_id: currentUser.current_business_id,
          business_name: businessInfo?.business_name || '',
          subscription_type: businessInfo?.subscription_type || 'Trial',
          subscription_status: businessInfo?.subscription_status || 'active',
        },
        stripe_data: {
          customer_id: stripeCustomerId,
          payment_intent_id: paymentIntent.id,
          payment_method_id: paymentIntent.payment_method?.id,
          receipt_url: paymentIntent.receipt_url,
        }
      };

      await InvoicePayment.create(paymentData);

      // Update invoice status
      await Invoice.update(invoice.id, {
        status: 'paid',
        paid_date: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntent.id,
      });

      setPaymentCompleted(true);
      onPaymentSuccess && onPaymentSuccess(paymentIntent);
    } catch (error) {
      console.error('Error recording payment:', error);
      setError('Payment was successful but there was an error updating the invoice. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error) => {
    setError(error.message);
  };

  if (paymentCompleted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Payment Successful!</h3>
          <p className="text-slate-600 mb-4">
            Your payment of ${invoice.total_amount.toFixed(2)} has been processed successfully.
          </p>
          {businessInfo && (
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building className="w-4 h-4" />
                <span>{businessInfo.business_name}</span>
                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                  {businessInfo.subscription_type}
                </span>
              </div>
            </div>
          )}
          <p className="text-sm text-slate-500">
            You will receive a receipt via email shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Business & Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Invoice Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Business Information */}
            {businessInfo && (
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4" />
                  <span className="font-medium">{businessInfo.business_name}</span>
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                    {businessInfo.subscription_type} Plan
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {businessInfo.business_address}
                </p>
                {businessInfo.business_phone && (
                  <p className="text-sm text-slate-600">
                    {businessInfo.business_phone}
                  </p>
                )}
              </div>
            )}
            
            {/* Invoice Details */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Invoice Number:</span>
                <span className="font-medium">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Issue Date:</span>
                <span className="font-medium">{new Date(invoice.issue_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Due Date:</span>
                <span className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>${invoice.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {stripeCustomerId ? (
        <StripePaymentForm
          amount={invoice.total_amount}
          currency="usd"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          customerId={stripeCustomerId}
          metadata={{
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            business_id: currentUser?.current_business_id,
            business_name: businessInfo?.business_name || '',
            subscription_type: businessInfo?.subscription_type || 'Trial',
            payment_type: 'invoice',
          }}
        />
      ) : (
        <div className="text-center py-4">
          <p className="text-slate-600">Setting up payment account...</p>
        </div>
      )}
    </div>
  );
}