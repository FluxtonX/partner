import React from 'react';
import { Clock, CheckCircle2, Award, ArrowRight, Sparkles } from 'lucide-react';

const AIBenefitsSection = () => {
  const benefits = [
    {
      icon: Clock,
      title: 'Reclaim Your Time',
      description: 'Regain valuable time with our efficient AI estimator. Let it crunch the numbers for you.',
      color: 'from-accent-orange to-accent-yellow',
    },
    {
      icon: CheckCircle2,
      title: 'Estimate Anywhere, Anytime',
      description: 'Provide the client with an accurate estimate without leaving their house.',
      color: 'from-secondary-500 to-secondary-600',
    },
    {
      icon: Award,
      title: 'Bid with Expertise',
      description: 'Partner ensures accuracy, eliminating worries about bidding.',
      color: 'from-primary-500 to-primary-600',
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-40 left-20 w-96 h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-200 rounded-full backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-bold text-primary-700">AI-Powered Benefits</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-neutral-900 leading-tight">
            Automate your contracting business with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
              AI estimating software
            </span>
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-[2rem] p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 border-neutral-100"
              >
                {/* Icon Container */}
                <div className="mb-8">
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${benefit.color} text-white rounded-3xl shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                  >
                    <IconComponent className="w-10 h-10" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-black text-neutral-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed text-lg">
                  {benefit.description}
                </p>

                {/* Decorative Elements */}
                <div className={`absolute -z-10 top-0 right-0 w-40 h-40 bg-gradient-to-br ${benefit.color} rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <button className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-primary hover:scale-105 transition-all duration-300">
            Get Started Free
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default AIBenefitsSection;