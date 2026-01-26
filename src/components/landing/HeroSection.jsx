import React from 'react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-200 rounded-full opacity-20 blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary-200 rounded-full opacity-20 blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-soft border border-primary-100">
              <Sparkles className="text-primary-500" size={20} />
              <span className="text-sm font-semibold text-neutral-700">Built for Contractors</span>
            </div>

            {/* Headline */}
            <h1 className="text-display-md lg:text-display-lg text-neutral-900 leading-tight">
              Manage Projects Like a{' '}
              <span className="text-primary-500">Pro</span>
            </h1>

            {/* Subtext */}
            <p className="text-xl text-neutral-600 leading-relaxed max-w-xl">
              Everything you need to run your contracting business — estimates, projects, invoices, and client management — all in one powerful platform.
            </p>

            {/* Benefits */}
            <div className="space-y-3">
              {[
                'AI-Powered Estimates in Minutes',
                'Real-Time Project Tracking',
                'Professional Client Portal',
                'Automated Invoicing & Payments'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle2 className="text-primary-500 flex-shrink-0" size={24} />
                  <span className="text-neutral-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="/signup"
                className="group inline-flex items-center justify-center bg-gradient-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-primary transition-all duration-300 hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center bg-white text-neutral-700 px-8 py-4 rounded-xl font-bold text-lg border-2 border-neutral-200 hover:border-primary-500 hover:text-primary-500 transition-all duration-300"
              >
                Watch Demo
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-6 text-sm text-neutral-600">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-2xl text-primary-500">500+</span>
                <span>Contractors Trust Us</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-2xl text-primary-500">4.9</span>
                <span>Average Rating</span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative animate-fade-in">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop"
                alt="Partner Dashboard"
                className="rounded-2xl shadow-large border-8 border-white"
              />
            </div>
            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-large p-4 animate-float z-20 border border-neutral-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="text-primary-500" size={24} />
                </div>
                <div>
                  <p className="font-bold text-neutral-900">$45,280</p>
                  <p className="text-sm text-neutral-600">Revenue This Month</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-large p-4 animate-pulse-slow z-20 border border-neutral-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="text-success" size={24} />
                </div>
                <div>
                  <p className="font-bold text-neutral-900">12 Active</p>
                  <p className="text-sm text-neutral-600">Projects Running</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;