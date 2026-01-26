import React from 'react';
import { ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 border border-white/30 rounded-full backdrop-blur-sm mb-8">
          <Zap className="w-4 h-4 text-white" />
          <span className="text-sm font-bold text-white">Limited Time Offer</span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
          Ready to Transform Your Business?
        </h2>

        {/* Subheadline */}
        <p className="text-xl lg:text-2xl text-primary-100 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of contractors who are already using Partner to 
          <span className="font-black text-white"> win more deals and deliver better projects.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <button className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-primary-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
            <span>Start Free Trial</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all text-lg backdrop-blur-sm border-2 border-white/30 hover:scale-105 duration-300">
            Schedule Demo
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t-2 border-white/20">
          <div className="flex items-center gap-3 text-white">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-bold">7-day free trial</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-bold">No credit card required</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-bold">Cancel anytime</span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20">
          <div className="text-center">
            <div className="text-4xl font-black text-white mb-2">5K+</div>
            <div className="text-primary-100 font-semibold">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-white mb-2">$85M+</div>
            <div className="text-primary-100 font-semibold">Projects Won</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-white mb-2">99%</div>
            <div className="text-primary-100 font-semibold">Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-white mb-2">24/7</div>
            <div className="text-primary-100 font-semibold">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;