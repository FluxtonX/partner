import React from 'react';

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
    },
    {
      name: 'Business Plan',
      price: '119',
      description: 'Ideal for businesses getting started with AI estimating',
      features: [
        'Unlimited AI estimates',
        'Advanced project management',
        'Priority client portal',
        'Phone & email support',
        'Team collaboration (up to 5)',
        'Custom branding',
        'Advanced analytics',
      ],
      badge: 'Save 20%',
      buttonText: 'Start Free Trial',
      popular: true,
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
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-display-sm lg:text-display-md text-white font-bold mb-6">
            Start for free. Pay as little
            <br />
            as{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
              $119 per month
            </span>
            .
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Partner will immediately start making you more money,
            <br />
            before you have to pay us even one cent.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up ${
                plan.popular
                  ? 'shadow-large border-2 border-primary-500 md:scale-105'
                  : 'shadow-medium border border-neutral-200'
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex px-4 py-2 bg-gradient-to-r from-accent-orange to-accent-yellow text-white font-bold text-sm rounded-full shadow-medium">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6 pb-6 border-b border-neutral-200">
                <h3 className="text-heading-lg text-neutral-900 font-bold mb-2">
                  {plan.name}
                </h3>
                <p className="text-neutral-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-2">
                  {plan.price !== 'Custom' ? (
                    <>
                      <span className="text-5xl font-bold text-neutral-900">
                        ${plan.price}
                      </span>
                      <span className="text-neutral-600">/month</span>
                    </>
                  ) : (
                    <span className="text-5xl font-bold text-neutral-900">
                      {plan.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg
                        className="w-3 h-3 text-primary-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-primary hover:shadow-lg hover:scale-105'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2 text-neutral-300">
              <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">7-day free trial</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;