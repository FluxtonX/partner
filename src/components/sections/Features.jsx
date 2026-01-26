import React from 'react';
import { Lightbulb, ClipboardCheck, Users, DollarSign, Calendar, TrendingUp, ArrowRight } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Lightbulb,
      title: 'AI-Powered Estimates',
      description: 'Generate accurate estimates in seconds using AI. Upload blueprints and let our intelligent system create detailed takeoff lists automatically.',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: ClipboardCheck,
      title: 'Smart Project Management',
      description: 'Track costs in real-time, manage tasks efficiently, and keep your entire team aligned with comprehensive project dashboards.',
      color: 'from-secondary-500 to-secondary-600',
    },
    {
      icon: Users,
      title: 'Client Portal',
      description: 'Give clients visibility into their projects. Share updates, collect selections, and maintain transparent communication throughout.',
      color: 'from-accent-purple to-accent-blue',
    },
    {
      icon: DollarSign,
      title: 'Profit Protection',
      description: 'Built-in profit margin locks ensure every estimate meets your business requirements. Never lose money on poorly priced jobs again.',
      color: 'from-accent-orange to-accent-yellow',
    },
    {
      icon: Calendar,
      title: 'Automated Workflows',
      description: 'Set up automatic client communications, reminders, and follow-ups. Let the system handle routine tasks while you focus on growing.',
      color: 'from-primary-400 to-secondary-400',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Analytics',
      description: 'Monitor profitability, track performance metrics, and make data-driven decisions with comprehensive business insights.',
      color: 'from-accent-purple to-primary-500',
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-white via-neutral-50 to-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-40 left-20 w-96 h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-200 rounded-full backdrop-blur-sm">
            <Lightbulb className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-bold text-primary-700">Powerful Features</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-neutral-900 leading-tight">
            Everything You Need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
              Scale Your Business
            </span>
          </h2>
          <p className="text-xl text-neutral-600">
            Powerful features designed specifically for contractors who want to work smarter, not harder.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 bg-white hover:bg-gradient-to-br hover:from-neutral-50 hover:to-white rounded-[2rem] border-2 border-neutral-100 hover:border-primary-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                {/* Icon */}
                <div className={`inline-flex w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-all duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-black text-neutral-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Learn More Link */}
                <button className="inline-flex items-center gap-2 text-primary-600 font-bold hover:gap-3 transition-all group/link">
                  <span>Learn more</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover/link:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature Highlight Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-orange/10 to-accent-yellow/10 border border-accent-orange/30 rounded-full backdrop-blur-sm">
              <svg className="w-4 h-4 text-accent-orange" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-bold text-accent-orange">Most Popular Feature</span>
            </div>

            <h3 className="text-3xl lg:text-4xl font-black text-neutral-900">
              Turn Estimates into Winning Proposals
            </h3>
            <p className="text-lg text-neutral-600">
              Partner transforms your estimates into beautiful, professional proposals that win more deals. Attach files, collect signatures, and wow your clients.
            </p>

            <div className="space-y-4">
              {[
                'AI-generated proposal content',
                'Professional document templates',
                'E-signature integration',
                'Client-facing file attachments',
                'Automated follow-up reminders',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-neutral-700 font-semibold">{item}</span>
                </div>
              ))}
            </div>

            <button className="inline-flex items-center gap-3 text-primary-600 font-bold text-lg hover:gap-4 transition-all group/link">
              <span>Explore Proposals</span>
              <ArrowRight className="w-6 h-6 transition-transform group-hover/link:translate-x-1" />
            </button>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-[2rem] p-10 shadow-2xl">
              <div className="bg-white rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b-2 border-neutral-200">
                  <div>
                    <h4 className="font-black text-neutral-900 text-xl">Bathroom Renovation</h4>
                    <p className="text-sm text-neutral-600 font-semibold">Proposal #2024-245</p>
                  </div>
                  <span className="px-4 py-2 bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 rounded-xl text-sm font-black border border-primary-200">
                    Sent
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                    <span className="text-sm text-neutral-700 font-bold">Project Total</span>
                    <span className="font-black text-neutral-900 text-lg">$28,500</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                    <span className="text-sm text-neutral-700 font-bold">Deposit (50%)</span>
                    <span className="font-black text-primary-600 text-lg">$14,250</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border-2 border-primary-200">
                    <span className="text-sm text-primary-700 font-black">Status</span>
                    <span className="font-black text-primary-700">Awaiting Signature</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-r from-accent-orange to-accent-yellow px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-float">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-black text-white">Live Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;