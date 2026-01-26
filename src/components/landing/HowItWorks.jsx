import React from 'react';
import { FileEdit, CheckSquare, Briefcase, TrendingUp, Award } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: FileEdit,
      title: 'Create or AI-Generate Estimates',
      description: 'Start with a professional estimate using our AI assistant or templates. Upload blueprints for automatic takeoff.',
      color: 'bg-primary-500'
    },
    {
      icon: CheckSquare,
      title: 'Client Reviews & Signs',
      description: 'Send estimates through the client portal. Clients can review, approve, and sign digitally in minutes.',
      color: 'bg-secondary-500'
    },
    {
      icon: Briefcase,
      title: 'Project Starts Automatically',
      description: 'Approved estimates convert to projects instantly. Track progress, costs, and timelines in real-time.',
      color: 'bg-success'
    },
    {
      icon: TrendingUp,
      title: 'Track & Invoice',
      description: 'Monitor expenses, manage change orders, and create invoices. Accept payments directly through the platform.',
      color: 'bg-warning'
    },
    {
      icon: Award,
      title: 'Get Paid & Analyze',
      description: 'Receive payments faster and analyze profit margins. Automate review collection to build your reputation.',
      color: 'bg-purple-500'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-display-sm text-neutral-900 mb-4">
            Simple Process, Powerful Results
          </h2>
          <p className="text-xl text-neutral-600">
            From estimate to payment, Partner streamlines your entire workflow in 5 easy steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-purple-500 opacity-20"></div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Step Number */}
                  <div className="flex flex-col items-center text-center">
                    {/* Icon Container */}
                    <div className={`relative w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-large z-10 transform transition-transform hover:scale-110`}>
                      <Icon className="text-white" size={32} />
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-neutral-900 shadow-medium">
                        {index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow - Desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-3 text-neutral-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in-up">
          <a
            href="/signup"
            className="inline-flex items-center bg-gradient-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-primary transition-all duration-300 hover:scale-105"
          >
            Start Your Free Trial
          </a>
          <p className="mt-4 text-neutral-600">No credit card required • 14-day free trial</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;