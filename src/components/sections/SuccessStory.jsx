import React, { useState } from 'react';
import { Play, MapPin, TrendingUp, Clock, DollarSign, Zap } from 'lucide-react';

const SuccessStory = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-white via-neutral-50 to-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-accent-orange to-accent-yellow rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Video/Image */}
          <div className="relative order-2 lg:order-1">
            {/* Main Video Card */}
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&crop=faces"
                alt="Contractor success story"
                className="w-full h-[600px] object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent"></div>

              {/* Play Button */}
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-primary-500 group-hover:to-secondary-500"
              >
                <Play className="w-10 h-10 text-primary-500 group-hover:text-white ml-1" fill="currentColor" />
              </button>

              {/* Bottom Caption */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl px-8 py-5 shadow-2xl border border-white/50">
                  <p className="text-neutral-900 font-black text-xl">Using Partner to close $118,000</p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-8 right-8 bg-gradient-to-r from-accent-orange to-accent-yellow text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-float">
                <TrendingUp className="w-5 h-5" />
                <span className="font-black text-sm">Success Story</span>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-[2rem] opacity-20 blur-2xl"></div>
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-accent-orange to-accent-yellow rounded-[2rem] opacity-20 blur-2xl"></div>
          </div>

          {/* Right - Content */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-orange/10 to-accent-yellow/10 border border-accent-orange/30 rounded-full backdrop-blur-sm">
              <DollarSign className="w-4 h-4 text-accent-orange" />
              <span className="text-sm font-bold text-accent-orange">Real Results</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 leading-tight">
              How EJ made{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-accent-yellow">
                $118,000
              </span>
              {' '}in his first month
            </h2>

            {/* Description */}
            <p className="text-lg text-neutral-600 leading-relaxed">
              Partner delivered a detailed estimate for a complete high-end remodel that enabled EJ to go from site visit to a $118,000 winning bid in under 24 hours. The AI-powered platform streamlined his entire workflow.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-accent-orange/10 to-white rounded-3xl p-6 border-2 border-accent-orange/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-orange to-accent-yellow rounded-2xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-black text-neutral-900 mb-1">$118K</div>
                <div className="text-sm text-neutral-600 font-bold">First Month Revenue</div>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-white rounded-3xl p-6 border-2 border-primary-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-black text-neutral-900 mb-1">24hrs</div>
                <div className="text-sm text-neutral-600 font-bold">To Winning Bid</div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-gradient-to-r from-neutral-50 to-white rounded-3xl p-6 shadow-xl border-2 border-neutral-100 flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 p-1 shadow-lg">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=EJ"
                  alt="EJ Elliot"
                  className="w-full h-full rounded-xl bg-white"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-neutral-900 text-xl">EJ Elliot</h3>
                <p className="text-neutral-600 text-sm font-semibold mb-2">Bellamore Contracting & Renovations</p>
                <div className="flex items-center gap-2 text-neutral-500 text-sm">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span className="font-semibold">San Antonio, TX</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button className="inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-primary hover:scale-105 transition-all duration-300">
              <span>See More Success Stories</span>
              <TrendingUp className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStory;