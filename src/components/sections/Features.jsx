import React from 'react';

const Features = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'AI-Powered Estimates',
      description: 'Generate accurate estimates in seconds using AI. Upload blueprints and let our intelligent system create detailed takeoff lists automatically.',
      color: 'primary',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      title: 'Smart Project Management',
      description: 'Track costs in real-time, manage tasks efficiently, and keep your entire team aligned with comprehensive project dashboards.',
      color: 'secondary',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Client Portal',
      description: 'Give clients visibility into their projects. Share updates, collect selections, and maintain transparent communication throughout.',
      color: 'accent',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Profit Protection',
      description: 'Built-in profit margin locks ensure every estimate meets your business requirements. Never lose money on poorly priced jobs again.',
      color: 'primary',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Automated Workflows',
      description: 'Set up automatic client communications, reminders, and follow-ups. Let the system handle routine tasks while you focus on growing.',
      color: 'secondary',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Real-Time Analytics',
      description: 'Monitor profitability, track performance metrics, and make data-driven decisions with comprehensive business insights.',
      color: 'accent',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: {
        bg: 'bg-primary-100',
        text: 'text-primary-600',
        hover: 'group-hover:bg-primary-500',
      },
      secondary: {
        bg: 'bg-secondary-100',
        text: 'text-secondary-600',
        hover: 'group-hover:bg-secondary-500',
      },
      accent: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        hover: 'group-hover:bg-purple-500',
      },
    };
    return colors[color];
  };

  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-heading-xl lg:text-display-sm text-neutral-900 mb-4">
            Everything You Need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-accent">
              Scale Your Business
            </span>
          </h2>
          <p className="text-xl text-neutral-600">
            Powerful features designed specifically for contractors who want to work smarter, not harder.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const colorClasses = getColorClasses(feature.color);
            return (
              <div
                key={index}
                className="group p-8 bg-neutral-50 hover:bg-white rounded-2xl border-2 border-neutral-100 hover:border-primary-200 transition-all duration-300 hover:shadow-medium hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className={`inline-flex p-4 ${colorClasses.bg} ${colorClasses.text} rounded-xl mb-6 transition-all duration-300 ${colorClasses.hover} group-hover:text-white group-hover:scale-110 group-hover:shadow-lg`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-heading-md text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Learn More Link */}
                <div className="mt-6">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all group/link"
                  >
                    Learn more
                    <svg className="w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Highlight Section */}
        <div className="mt-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 font-semibold text-sm mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Most Popular Feature
            </div>

            <h3 className="text-heading-xl text-neutral-900 mb-4">
              Turn Estimates into Winning Proposals
            </h3>
            <p className="text-lg text-neutral-600 mb-6">
              Partner transforms your estimates into beautiful, professional proposals that win more deals. Attach files, collect signatures, and wow your clients.
            </p>

            <div className="space-y-4 mb-8">
              {[
                'AI-generated proposal content',
                'Professional document templates',
                'E-signature integration',
                'Client-facing file attachments',
                'Automated follow-up reminders',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">{item}</span>
                </div>
              ))}
            </div>

            <button className="inline-flex items-center gap-2 text-primary-600 font-semibold text-lg hover:gap-3 transition-all group/link">
              Explore Proposals
              <svg className="w-5 h-5 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Right - Visual */}
          <div className="relative animate-slide-in-left">
            <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-8 shadow-large">
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                  <div>
                    <h4 className="font-bold text-neutral-900">Bathroom Renovation</h4>
                    <p className="text-sm text-neutral-600">Proposal #2024-245</p>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-semibold">
                    Sent
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-700">Project Total</span>
                    <span className="font-bold text-neutral-900">$28,500</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-700">Deposit (50%)</span>
                    <span className="font-bold text-primary-600">$14,250</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary-100 rounded-lg">
                    <span className="text-sm text-primary-700 font-semibold">Status</span>
                    <span className="font-bold text-primary-700">Awaiting Signature</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>3 attachments included</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-neutral-100 rounded-lg p-2 text-xs text-center text-neutral-700">
                      Contract.pdf
                    </div>
                    <div className="flex-1 bg-neutral-100 rounded-lg p-2 text-xs text-center text-neutral-700">
                      Timeline.pdf
                    </div>
                    <div className="flex-1 bg-neutral-100 rounded-lg p-2 text-xs text-center text-neutral-700">
                      Specs.pdf
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -top-6 -right-6 bg-white px-4 py-3 rounded-2xl shadow-large flex items-center gap-2 animate-float">
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-neutral-900">Live Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;