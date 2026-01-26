import React from 'react';
import { ArrowRight, Hammer, Home, Zap } from 'lucide-react';

const WhoIsItFor = () => {
  const audiences = [
    {
      title: 'Remodelers',
      description: 'Grow your business without adding overhead. Scale efficiently with AI-powered tools.',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
      color: 'from-primary-500 to-primary-600',
      icon: Home,
      stats: '+40% more projects'
    },
    {
      title: 'Handyman',
      description: 'Bid on bigger jobs with confidence. Professional estimates that win contracts.',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
      color: 'from-secondary-500 to-secondary-600',
      icon: Hammer,
      stats: '3x faster quotes'
    },
    {
      title: 'Fix and Flip',
      description: 'Instantly assess investment opportunities. Get accurate estimates and funding faster.',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
      color: 'from-accent-orange to-accent-yellow',
      icon: Zap,
      stats: '70% time saved'
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-white via-primary-50/20 to-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-accent-orange to-accent-yellow rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-secondary-500/10 to-primary-500/10 border border-secondary-200 rounded-full backdrop-blur-sm">
            <Hammer className="w-4 h-4 text-secondary-600" />
            <span className="text-sm font-bold text-secondary-700">Built for Contractors</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-neutral-900">
            Who is{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
              Partner for?
            </span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-4xl mx-auto">
            If you own a residential construction business, Partner is for you. 
            <span className="font-bold text-neutral-900"> Supercharge your growth on autopilot.</span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => {
            const IconComponent = audience.icon;
            return (
              <div
                key={index}
                className="group relative rounded-[2rem] overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-3 cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-[500px] overflow-hidden">
                  <img
                    src={audience.image}
                    alt={audience.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                  {/* Icon */}
                  <div className={`inline-flex w-16 h-16 bg-gradient-to-br ${audience.color} rounded-2xl items-center justify-center shadow-2xl group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-black text-white">
                    {audience.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/90 leading-relaxed">
                    {audience.description}
                  </p>

                  {/* Stats Badge */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${audience.color} rounded-xl shadow-lg`}>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-black text-white">{audience.stats}</span>
                  </div>

                  {/* Learn More */}
                  <button className="inline-flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all duration-300 mt-4">
                    <span>Learn more</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Hover Border Effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${audience.color} opacity-20`}></div>
                  <div className={`absolute inset-0 border-4 border-white/50 rounded-[2rem]`}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-primary hover:scale-105 transition-all duration-300">
            <span>Start Your Free Trial</span>
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-sm text-neutral-600 mt-4 font-semibold">No credit card required • 7-day free trial</p>
        </div>
      </div>
    </section>
  );
};

export default WhoIsItFor;