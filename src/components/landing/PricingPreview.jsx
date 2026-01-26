import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';

const PricingPreview = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for solo contractors starting out',
      monthlyPrice: 49,
      yearlyPrice: 470,
      features: [
        'Up to 10 projects/month',
        'AI-powered estimates',
        'Client portal',
        'Basic invoicing',
        'Email support',
        '5 GB storage'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      description: 'For growing contracting businesses',
      monthlyPrice: 99,
      yearlyPrice: 950,
      features: [
        'Unlimited projects',
        'Advanced AI features',
        'Blueprint takeoff',
        'Advanced invoicing',
        'Priority support',
        '50 GB storage',
        'Change order management',
        'Cost tracking & analytics'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'For large teams and organizations',
      monthlyPrice: null,
      yearlyPrice: null,
      features: [
        'Everything in Professional',
        'Unlimited storage',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced security',
        'Custom training',
        'API access',
        'White-label options'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-neutral-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in-up">
          <h2 className="text-display-sm text-neutral-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-neutral-600 mb-8">
            Choose the plan that fits your business. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-soft">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-primary text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-primary text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 transition-all duration-300 animate-fade-in-up ${
                plan.popular
                  ? 'shadow-large border-2 border-primary-500 transform scale-105'
                  : 'shadow-soft border border-neutral-200 hover:shadow-medium hover:-translate-y-1'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-1 shadow-primary">
                    <Star size={14} fill="white" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                <p className="text-neutral-600 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                {plan.monthlyPrice ? (
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-neutral-900">
                        ${billingCycle === 'monthly' ? plan.monthlyPrice : Math.floor(plan.yearlyPrice / 12)}
                      </span>
                      <span className="text-neutral-600 ml-2">/month</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-sm text-neutral-500 mt-2">
                        Billed annually (${plan.yearlyPrice}/year)
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-neutral-900">Custom</div>
                    <p className="text-neutral-600 mt-2">Contact us for pricing</p>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="text-primary-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="ml-3 text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <a
                href={plan.monthlyPrice ? '/signup' : '/contact'}
                className={`block w-full text-center py-3 rounded-xl font-bold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-primary text-white hover:shadow-primary hover:scale-105'
                    : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12 animate-fade-in-up">
          <p className="text-neutral-600">
            All plans include 14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;