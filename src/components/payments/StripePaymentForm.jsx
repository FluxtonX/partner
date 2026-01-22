import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield } from 'lucide-react';
import { stripePayments } from '@/api/functions';

let stripePromise;

const PaymentForm = ({ 
    amount, 
    currency = 'usd', 
    clientEmail, 
    clientName,
    description,
    metadata = {},
    onSuccess, 
    onError,
    buttonText = "Pay Now"
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        try {
            // Create payment intent
            const { data: paymentIntentData } = await stripePayments({
                action: 'create_payment_intent',
                amount: amount,
                currency: currency,
                metadata: {
                    ...metadata,
                    client_email: clientEmail,
                    client_name: clientName,
                    description: description
                }
            });

            if (!paymentIntentData?.client_secret) {
                throw new Error('Failed to create payment intent');
            }

            // Confirm payment
            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
                paymentIntentData.client_secret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: clientName,
                            email: clientEmail,
                        },
                    },
                }
            );

            if (confirmError) {
                throw confirmError;
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent);
            }

        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message || 'Payment failed');
            onError(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border border-slate-200 rounded-lg">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                        },
                    }}
                />
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Button 
                type="submit" 
                disabled={!stripe || isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        {buttonText}
                    </>
                )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-2">
                <Shield className="w-3 h-3" />
                <span>Secured by Stripe • Your payment information is encrypted</span>
            </div>
        </form>
    );
};

export default function StripePaymentForm(props) {
    const [publishableKey, setPublishableKey] = useState(null);

    useEffect(() => {
        const initializeStripe = async () => {
            try {
                const { data } = await stripePayments({ action: 'get_publishable_key' });
                if (data?.publishable_key) {
                    setPublishableKey(data.publishable_key);
                    stripePromise = loadStripe(data.publishable_key);
                }
            } catch (error) {
                console.error('Error loading Stripe:', error);
                props.onError?.(error);
            }
        };

        initializeStripe();
    }, []);

    if (!publishableKey) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading payment form...</span>
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise}>
            <PaymentForm {...props} />
        </Elements>
    );
}