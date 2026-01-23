import React from 'react';
import { Button } from '../ui/button';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full opacity-20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-200 rounded-full opacity-20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-112 h-112 bg-gradient-radial from-primary-100 to-transparent opacity-30 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 font-semibold text-sm mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              AI-Powered Project Management
            </div>

            {/* Headline */}
            <h1 className="text-display-sm lg:text-display-md text-neutral-900 mb-6 leading-tight">
              Build Winning Proposals with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-accent">
                AI Intelligence
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Transform your construction business with intelligent estimates, seamless project management, and automated workflows. Close more deals in less time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button 
                variant="primary" 
                size="lg"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                }
              >
                Start Free Trial
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Right Content - Mockup */}
          <div className="relative animate-fade-in-up lg:animate-slide-in-left">
            <div className="relative">
              {/* Main Dashboard Card */}
              <div className="bg-white rounded-3xl shadow-large p-6 lg:p-8 border border-neutral-200 animate-float">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">Kitchen Remodel</h3>
                      <p className="text-sm text-neutral-600">Project #2024-158</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-semibold">
                    In Progress
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-neutral-50 rounded-xl">
                    <div className="text-2xl font-bold text-neutral-900">$45K</div>
                    <div className="text-xs text-neutral-600 mt-1">Budget</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-xl">
                    <div className="text-2xl font-bold text-neutral-900">68%</div>
                    <div className="text-xs text-neutral-600 mt-1">Complete</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-xl">
                    <div className="text-2xl font-bold text-neutral-900">12d</div>
                    <div className="text-xs text-neutral-600 mt-1">Remaining</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-700 font-medium">Project Progress</span>
                    <span className="text-primary-600 font-semibold">68%</span>
                  </div>
                  <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-primary rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>

                {/* Task List */}
                <div className="space-y-2">
                  {[
                    { task: 'Demolition', status: 'complete' },
                    { task: 'Electrical Work', status: 'complete' },
                    { task: 'Cabinet Installation', status: 'progress' },
                    { task: 'Countertop Install', status: 'pending' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg transition-colors">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        item.status === 'complete' ? 'bg-primary-500' :
                        item.status === 'progress' ? 'bg-accent-orange' :
                        'bg-neutral-300'
                      }`}>
                        {item.status === 'complete' && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${
                        item.status === 'complete' ? 'text-neutral-500 line-through' : 'text-neutral-900'
                      }`}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating AI Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-accent text-white px-4 py-2 rounded-full shadow-large flex items-center gap-2 animate-float" style={{ animationDelay: '0.5s' }}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                <span className="font-semibold text-sm">AI Powered</span>
              </div>

              {/* Floating Estimate Badge */}
              <div className="absolute -bottom-4 -left-4 bg-white px-4 py-3 rounded-2xl shadow-large flex items-center gap-3 animate-float" style={{ animationDelay: '1s' }}>
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Estimate Created</div>
                  <div className="text-lg font-bold text-neutral-900">$45,200</div>
                </div>
                <div className="ml-2">
                  <div className="flex items-center gap-1 text-primary-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-semibold">+12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

       <div className="mt-20 lg:mt-28 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-3xl p-8 lg:p-12 shadow-large border border-primary-100">
            <div className="grid lg:grid-cols-5 gap-8 items-center">
              {/* Left Content */}
              <div className="lg:col-span-1">
                <h2 className="text-heading-lg text-neutral-900 font-bold leading-tight">
                  See immediate{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-accent">
                    results
                  </span>
                </h2>
              </div>

              {/* Stats Grid */}
              <div className="lg:col-span-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat 1 */}
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-3xl lg:text-4xl font-bold text-accent-orange">+$5,250</div>
                  </div>
                  <p className="text-sm text-neutral-600 font-medium">More earned weekly</p>
                </div>

                {/* Stat 2 */}
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-3xl lg:text-4xl font-bold text-accent-yellow">+14 hrs</div>
                  </div>
                  <p className="text-sm text-neutral-600 font-medium">Saved weekly</p>
                </div>

                {/* Stat 3 */}
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-3xl lg:text-4xl font-bold text-accent-purple">+40%</div>
                  </div>
                  <p className="text-sm text-neutral-600 font-medium">More deals closed</p>
                </div>

                {/* Stat 4 */}
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-3xl lg:text-4xl font-bold text-primary-500">+$85k</div>
                  </div>
                  <p className="text-sm text-neutral-600 font-medium">In annual profit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;