import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Trash2, Plus, Loader2 } from 'lucide-react';
import { stripePayments } from '@/api/functions';

export default function SavedPaymentMethods({ customerId, onPaymentMethodSelect }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);

  useEffect(() => {
    if (customerId) {
      loadPaymentMethods();
    }
  }, [customerId]);

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const { data } = await stripePayments({
        action: 'get_payment_methods',
        customer_id: customerId,
      });
      setPaymentMethods(data.payment_methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    onPaymentMethodSelect && onPaymentMethodSelect(method);
  };

  const getCardBrandIcon = (brand) => {
    // You can add specific brand icons here
    return <CreditCard className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading payment methods...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Saved Payment Methods</span>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="text-center py-6">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No saved payment methods</p>
            <p className="text-sm text-slate-400">Add a payment method to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod?.id === method.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleSelectMethod(method)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCardBrandIcon(method.card.brand)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          •••• •••• •••• {method.card.last4}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {method.card.brand.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        Expires {method.card.exp_month.toString().padStart(2, '0')}/{method.card.exp_year}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}