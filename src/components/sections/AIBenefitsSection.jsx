import React from 'react';

const AIBenefitsSection = () => {
  const benefits = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Reclaim Your Time',
      description: 'Regain valuable time with our efficient AI estimator. Let it crunch the numbers for you.',
      color: 'bg-accent-orange',
      textColor: 'text-accent-orange',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Estimate Anywhere, Anytime',
      description: 'Provide the client with an accurate estimate without leaving their house.',
      color: 'bg-secondary-500',
      textColor: 'text-secondary-500',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: 'Bid with Expertise',
      description: 'Partner ensures accuracy, eliminating worries about bidding.',
      color: 'bg-primary-500',
      textColor: 'text-primary-500',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-display-sm lg:text-display-md text-neutral-900 font-bold mb-6">
            Automate your contracting
            <br />
            business with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
              AI estimating software
            </span>
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-soft hover:shadow-large transition-all duration-500 hover:-translate-y-2 animate-fade-in-up border border-neutral-100"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Icon Container */}
              <div className="mb-6">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 ${benefit.color} text-white rounded-2xl shadow-medium group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                >
                  {benefit.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-heading-md text-neutral-900 font-bold mb-3">
                {benefit.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {benefit.description}
              </p>

              {/* Decorative Elements */}
              <div className={`absolute -z-10 top-0 right-0 w-32 h-32 ${benefit.color} rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-primary hover:shadow-lg transition-all hover:scale-105">
            Get Started Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default AIBenefitsSection;