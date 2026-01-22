
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle, AlertCircle, Crown, Users, Building, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { User, BusinessSettings } from '@/api/entities';
import { stripePayments } from '@/api/functions';

let stripePromise;

// Note: These price IDs need to be created as recurring subscriptions in Stripe
const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price: 49.99,
    priceId: 'price_starter_monthly', // Needs to be created as recurring in Stripe
    features: [
      '9% of sales',
      '$0.49 per AI request',
      '$3.99 per Advanced AI request',
      '$6.99/mo per additional user'
    ],
    recommended: false
  },
  partner: {
    name: 'Partner',
    price: 149.99,
    priceId: 'price_partner_monthly', // Needs to be created as recurring in Stripe
    features: [
      '7% of sales',
      '$0.49 per AI request',
      '$3.99 per Advanced AI request',
      '$6.99/mo per additional user'
    ],
    recommended: true
  },
  enterprise: {
    name: 'Enterprise',
    price: 999.99, // Updated price
    priceId: 'price_enterprise_monthly', // Needs to be created as recurring in Stripe
    features: [
      '0% of sales',
      '$0.49 per AI request',
      '$3.99 per Advanced AI request',
      '$6.99/mo per additional user'
    ],
    recommended: false
  }
};

export default function StripeSubscriptionManager() {
  const [publishableKey, setPublishableKey] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load Stripe publishable key
        const { data } = await stripePayments({ action: 'get_publishable_key' });
        if (data?.publishable_key) {
          setPublishableKey(data.publishable_key);
          stripePromise = loadStripe(data.publishable_key);
        }

        // Load user and business data
        const user = await User.me();
        setCurrentUser(user);

        if (user.current_business_id) {
          const settings = await BusinessSettings.filter({ business_id: user.current_business_id });
          if (settings.length > 0) {
            setBusinessSettings(settings[0]);
          }
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
        toast.error('Failed to load subscription information');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const getCurrentPlanKey = () => {
    if (!businessSettings?.subscription_type) return null;
    return Object.keys(SUBSCRIPTION_PLANS).find(
      key => SUBSCRIPTION_PLANS[key].name === businessSettings.subscription_type
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading subscription plans...</span>
      </div>
    );
  }

  const currentPlanKey = getCurrentPlanKey();

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      {businessSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Current Subscription - {businessSettings.business_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={businessSettings.subscription_status === 'active' ? 'default' : 'destructive'}>
                    {businessSettings.subscription_type} - {businessSettings.subscription_status}
                  </Badge>
                  {businessSettings.subscription_status === 'active' && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  {currentPlanKey && `$${SUBSCRIPTION_PLANS[currentPlanKey].price}/month`}
                  {businessSettings.last_payment_date && (
                    <span className="ml-2">• Last payment: {new Date(businessSettings.last_payment_date).toLocaleDateString()}</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Notice */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="space-y-2">
            <p className="font-semibold">Subscription Setup Required</p>
            <p>To enable subscriptions, you need to create recurring price IDs in your Stripe Dashboard:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to your Stripe Dashboard → Products</li>
              <li>Create products for: Starter ($49.99), Partner ($149.99), Enterprise ($999.99)</li>
              <li>Set each as "Recurring" with "Monthly" billing</li>
              <li>Copy the price IDs and contact support to update the system</li>
            </ol>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open('https://dashboard.stripe.com/products', '_blank')}
              className="mt-2"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Stripe Dashboard
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Plan Display (Read-only for now) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
          <Card 
            key={key} 
            className={`relative flex flex-col ${plan.recommended ? 'border-2 border-emerald-500 shadow-lg' : ''} ${currentPlanKey === key ? 'bg-emerald-50 border-emerald-300' : ''} opacity-75`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-emerald-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-emerald-600">
                ${plan.price}
                <span className="text-sm font-normal text-slate-600">/month</span>
              </div>
              <CardDescription>+ Usage Fees</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 flex-grow flex flex-col">
              <ul className="space-y-2 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button disabled className="w-full opacity-50">
                Setup Required
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Contact support to complete your subscription setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
