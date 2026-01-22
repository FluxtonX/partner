import React, { useState, useEffect } from 'react';
import { User, BusinessSettings } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, Shield, CheckCircle } from 'lucide-react';
import { stripePayments } from '@/api/functions';

import SavedPaymentMethods from '../components/payments/SavedPaymentMethods';
import StripePaymentForm from '../components/payments/StripePaymentForm';

export default function PaymentSettings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [stripeCustomerId, setStripeCustomerId] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const settings = await BusinessSettings.filter({ business_id: user.current_business_id });
      const businessData = settings.length > 0 ? settings[0] : null;
      setBusinessSettings(businessData);

      // Check if user has a Stripe customer ID
      if (user.stripe_customer_id) {
        setStripeCustomerId(user.stripe_customer_id);
        await loadPaymentMethods(user.stripe_customer_id);
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentMethods = async (customerId) => {
    try {
      const { data } = await stripePayments({
        action: 'get_payment_methods',
        customer_id: customerId,
      });
      setPaymentMethods(data.payment_methods || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const createStripeCustomer = async () => {
    setIsCreatingCustomer(true);
    try {
      const { data } = await stripePayments({
        action: 'create_customer',
        email: currentUser.email,
        name: currentUser.full_name,
        phone: businessSettings?.business_phone || '',
        address: {
          line1: businessSettings?.business_address || '',
          city: businessSettings?.business_city || '',
          state: businessSettings?.business_state || '',
          postal_code: businessSettings?.business_zip || '',
          country: 'US',
        },
      });

      // Save the customer ID to the user record
      await User.updateMyUserData({
        stripe_customer_id: data.customer_id,
      });

      setStripeCustomerId(data.customer_id);
      setCurrentUser(prev => ({ ...prev, stripe_customer_id: data.customer_id }));
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      alert('Failed to set up payment account. Please try again.');
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handlePaymentMethodAdded = () => {
    setShowAddPayment(false);
    if (stripeCustomerId) {
      loadPaymentMethods(stripeCustomerId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="w-8 h-8 text-slate-700" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Payment Settings</h1>
            <p className="text-slate-600">Manage your payment methods and billing information</p>
          </div>
        </div>

        {!stripeCustomerId ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Set Up Payment Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                To manage payment methods and process payments, you need to set up a payment account.
              </p>
              <Button
                onClick={createStripeCustomer}
                disabled={isCreatingCustomer}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                {isCreatingCustomer ? 'Setting up...' : 'Set Up Payment Account'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Payment Methods */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Saved Payment Methods
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddPayment(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Payment Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <SavedPaymentMethods
                  customerId={stripeCustomerId}
                  paymentMethods={paymentMethods}
                  onMethodsChanged={() => loadPaymentMethods(stripeCustomerId)}
                />
              </CardContent>
            </Card>

            {/* Add Payment Method Form */}
            {showAddPayment && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Add New Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <StripePaymentForm
                    amount={0} // Setup intent, no charge
                    onSuccess={handlePaymentMethodAdded}
                    onError={(error) => {
                      console.error('Payment method setup error:', error);
                      alert('Failed to add payment method. Please try again.');
                    }}
                    customerId={stripeCustomerId}
                    setupMode={true}
                  />
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddPayment(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Information */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">PCI DSS Compliant</h4>
                    <p className="text-sm text-slate-600">
                      All payment information is processed securely through Stripe, a PCI DSS Level 1 certified provider.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Encrypted Storage</h4>
                    <p className="text-sm text-slate-600">
                      Your payment methods are encrypted and stored securely. We never store your full card details.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Fraud Protection</h4>
                    <p className="text-sm text-slate-600">
                      Advanced fraud detection and prevention systems protect every transaction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}