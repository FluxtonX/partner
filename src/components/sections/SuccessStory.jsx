import React, { useState } from 'react';
import { Play, MapPin, TrendingUp, Clock, DollarSign } from 'lucide-react';

const SuccessStory = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-white via-primary-50/30 to-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Video/Image */}
          <div className="relative animate-fade-in-up">
            {/* Main Video Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-large group">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&crop=faces"
                alt="Contractor success story"
                className="w-full h-[600px] object-cover"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-transparent"></div>

              {/* Play Button */}
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-large hover:scale-110 transition-all duration-300 group-hover:bg-primary-500"
              >
                <Play className="w-8 h-8 text-primary-500 group-hover:text-white ml-1" fill="currentColor" />
              </button>

              {/* Bottom Caption */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-large">
                  <p className="text-neutral-900 font-bold text-lg">Using Partner to close $118,000</p>
                </div>
              </div>

              {/* Floating Stats Badge */}
              <div className="absolute top-6 right-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-full shadow-large flex items-center gap-2 animate-float">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold text-sm">Success Story</span>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-3xl opacity-20 blur-2xl"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-secondary-400 to-primary-400 rounded-3xl opacity-20 blur-2xl"></div>
          </div>

          {/* Right - Content */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 font-semibold text-sm mb-6">
              <DollarSign className="w-4 h-4" />
              Real Results
            </div>

            {/* Main Heading */}
            <h2 className="text-display-sm lg:text-heading-xl text-neutral-900 mb-6 leading-tight">
              Learn how EJ Elliot made{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
                $118,000
              </span>
              {' '}in his first month using Partner.
            </h2>

            {/* Description */}
            <p className="text-lg text-neutral-600 leading-relaxed mb-8">
              Partner delivered a detailed estimate for a complete high-end remodel that enabled EJ to go from site visit to a $118,000 winning bid in under 24 hours. The AI-powered platform streamlined his entire workflow.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-5 border border-primary-100 hover:shadow-medium transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-neutral-900 mb-1">$118K</div>
                <div className="text-sm text-neutral-600">First Month Revenue</div>
              </div>

              <div className="bg-gradient-to-br from-secondary-50 to-white rounded-2xl p-5 border border-secondary-100 hover:shadow-medium transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-secondary-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-neutral-900 mb-1">24hrs</div>
                <div className="text-sm text-neutral-600">To Winning Bid</div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200 flex items-center gap-4">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=EJ"
                alt="EJ Elliot"
                className="w-16 h-16 rounded-full bg-primary-100 ring-4 ring-primary-50"
              />
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900 text-lg">EJ Elliot</h3>
                <p className="text-neutral-600 text-sm mb-1">Bellamore Contracting & Renovations</p>
                <div className="flex items-center gap-1 text-neutral-500 text-sm">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span>San Antonio, TX</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8">
              <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-primary hover:shadow-large hover:-translate-y-1 transition-all duration-300">
                <span>See More Success Stories</span>
                <TrendingUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStory;