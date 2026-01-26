import React from 'react';
import { ArrowRight, Play, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

const Button = ({ children, variant = 'primary', size = 'lg', icon, className = '', ...props }) => {
  const baseStyles = "font-bold transition-all duration-300 inline-flex items-center justify-center gap-2";
  const sizes = {
    lg: "px-8 py-4 text-lg rounded-2xl",
  };
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 shadow-2xl hover:shadow-primary hover:scale-105",
    secondary: "bg-white text-primary-600 border-2 border-primary-200 hover:border-primary-400 hover:bg-primary-50 shadow-xl hover:shadow-2xl hover:scale-105",
  };

  return (
    <button className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
      {icon && <span className="transition-transform group-hover:translate-x-1">{icon}</span>}
    </button>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-200 rounded-full backdrop-blur-sm animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-bold text-primary-700">AI-Powered Estimating Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-7xl font-black text-neutral-900 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Close Deals{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 animate-gradient">
                  10x Faster
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 5 100 2 150 2C200 2 250 5 298 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00f074" />
                      <stop offset="100%" stopColor="#00d4ff" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl lg:text-2xl text-neutral-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              AI-powered estimates in seconds. Professional proposals that win. 
              <span className="font-bold text-neutral-900"> Built for contractors who want to grow.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button variant="primary" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                Start Free Trial
              </Button>
              <Button variant="secondary" size="lg" icon={<Play className="w-5 h-5" />}>
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 text-neutral-700">
                <CheckCircle2 className="w-5 h-5 text-primary-500" />
                <span className="font-semibold">7-day free trial</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <CheckCircle2 className="w-5 h-5 text-primary-500" />
                <span className="font-semibold">No credit card</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <CheckCircle2 className="w-5 h-5 text-primary-500" />
                <span className="font-semibold">Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Mockup */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              {/* Main Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white/50 transform hover:scale-105 transition-all duration-500">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-200">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 text-lg">Kitchen Remodel</h3>
                      <p className="text-sm text-neutral-600">Project #2024-158</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-xl">
                    <span className="text-xs font-bold text-primary-700">Active</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-primary-50 to-white p-4 rounded-2xl border border-primary-100">
                    <div className="text-2xl font-black text-neutral-900">$45K</div>
                    <div className="text-xs text-neutral-600 font-semibold mt-1">Budget</div>
                  </div>
                  <div className="bg-gradient-to-br from-secondary-50 to-white p-4 rounded-2xl border border-secondary-100">
                    <div className="text-2xl font-black text-neutral-900">68%</div>
                    <div className="text-xs text-neutral-600 font-semibold mt-1">Complete</div>
                  </div>
                  <div className="bg-gradient-to-br from-accent-orange/10 to-white p-4 rounded-2xl border border-accent-orange/20">
                    <div className="text-2xl font-black text-neutral-900">12d</div>
                    <div className="text-xs text-neutral-600 font-semibold mt-1">Left</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-neutral-700">Progress</span>
                    <span className="text-sm font-black text-primary-600">68%</span>
                  </div>
                  <div className="h-4 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-lg" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>

              {/* Floating AI Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-accent-orange to-accent-yellow text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-float">
                <Sparkles className="w-5 h-5" />
                <span className="font-black text-sm">AI Powered</span>
              </div>

              {/* Floating Stats Badge */}
              <div className="absolute -bottom-4 -left-4 bg-white px-6 py-4 rounded-2xl shadow-2xl border border-primary-100 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-600 font-semibold">Revenue Up</div>
                    <div className="text-xl font-black text-neutral-900">+127%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Banner */}
        <div className="mt-20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-8 lg:p-12 shadow-2xl border border-neutral-700">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-accent-yellow mb-2">+$5.2K</div>
                <div className="text-neutral-400 font-semibold">Weekly Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-2">+14hrs</div>
                <div className="text-neutral-400 font-semibold">Time Saved</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-blue mb-2">+40%</div>
                <div className="text-neutral-400 font-semibold">More Deals</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 mb-2">$85K+</div>
                <div className="text-neutral-400 font-semibold">Annual Profit</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;