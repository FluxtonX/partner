import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <CheckCircle2 className="text-white" size={20} />
            <span className="text-sm font-semibold text-white">Join 500+ Contractors Already Using Partner</span>
          </div>

          {/* Headline */}
          <h2 className="text-display-md lg:text-display-lg text-white leading-tight">
            Ready to Transform Your Business?
          </h2>

          {/* Description */}
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Start managing projects the right way. No credit card required. 14-day free trial with full access to all features.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            {[
              'Setup in 5 minutes',
              'Cancel anytime',
              'Free support included'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle2 className="text-white" size={20} />
                <span className="text-white font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <a
              href="/signup"
              className="group inline-flex items-center justify-center bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-large transition-all duration-300 hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg border-2 border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              Schedule Demo
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-white/20">
            <p className="text-white/80 text-sm mb-4">Trusted by leading contractors nationwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              {/* Placeholder for logos */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-24 h-12 bg-white/10 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;