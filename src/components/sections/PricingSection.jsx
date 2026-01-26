import React from 'react';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: 'Starter',
      price: '49',
      description: 'Perfect for solo contractors getting started',
      features: [
        '10 AI estimates per month',
        'Basic project management',
        'Client portal access',
        'Email support',
        'Mobile app access',
      ],
      badge: null,
      buttonText: 'Start Free Trial',
      popular: false,
      icon: Sparkles,
      color: 'from-neutral-500 to-neutral-600'
    },
    {
      name: 'Business',
      price: '119',
      description: 'Ideal for growing businesses',
      features: [
        'Unlimited AI estimates',
        'Advanced project management',
        'Priority client portal',
        'Phone & email support',
        'Team collaboration (up to 5)',
        'Custom branding',
        'Advanced analytics',
      ],
      badge: 'Most Popular',
      buttonText: 'Start Free Trial',
      popular: true,
      icon: Zap,
      color: 'from-primary-500 to-secondary-500'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large teams with custom needs',
      features: [
        'Everything in Business',
        'Unlimited team members',
        'Dedicated account manager',
        '24/7 priority support',
        'Custom integrations',
        'Advanced security',
        'Custom training',
      ],
      badge: null,
      buttonText: 'Contact Sales',
      popular: false,
      icon: Crown,
      color: 'from-accent-purple to-accent-blue'
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-accent-purple to-accent-blue rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
            <Zap className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-bold text-white">Simple Pricing</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
            Start for free. Pay as little as{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
              $119/month
            </span>
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Partner will immediately start making you more money,
            <span className="font-bold text-white"> before you pay us even one cent.</span>
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={index}
                className={`relative bg-white rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-3 ${
                  plan.popular
                    ? 'shadow-2xl border-4 border-primary-400 md:scale-105 hover:shadow-primary'
                    : 'shadow-xl border-2 border-neutral-200 hover:shadow-2xl'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="px-6 py-2.5 bg-gradient-to-r from-accent-orange to-accent-yellow text-white font-black text-sm rounded-2xl shadow-2xl">
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl items-center justify-center shadow-xl mb-6`}>
                  <IconComponent className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>

                {/* Plan Header */}
                <div className="mb-8 pb-8 border-b-2 border-neutral-100">
                  <h3 className="text-2xl font-black text-neutral-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-neutral-600 mb-6">{plan.description}</p>
                  <div className="flex items-baseline gap-2">
                    {plan.price !== 'Custom' ? (
                      <>
                        <span className="text-5xl font-black text-neutral-900">
                          ${plan.price}
                        </span>
                        <span className="text-neutral-600 font-semibold">/month</span>
                      </>
                    ) : (
                      <span className="text-5xl font-black text-neutral-900">
                        {plan.price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center mt-0.5`}>
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-neutral-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
                    plan.popular
                      ? `bg-gradient-to-r ${plan.color} text-white shadow-2xl hover:shadow-primary hover:scale-105`
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 hover:scale-105'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="text-center">
          <div className="inline-flex items-center gap-8 px-10 py-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl">
            <div className="flex items-center gap-2 text-neutral-300">
              <Check className="w-5 h-5 text-primary-400" />
              <span className="text-sm font-semibold">7-day free trial</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <Check className="w-5 h-5 text-primary-400" />
              <span className="text-sm font-semibold">No credit card</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <Check className="w-5 h-5 text-primary-400" />
              <span className="text-sm font-semibold">Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;