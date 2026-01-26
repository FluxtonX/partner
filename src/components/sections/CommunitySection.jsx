import React from 'react';
import { Users, MessageCircle, TrendingUp, Facebook } from 'lucide-react';

const CommunitySection = () => {
  const testimonials = [
    {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      message: 'It works! Thanks for your help!',
      role: 'General Contractor',
    },
    {
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      message: 'Game changer for my business',
      role: 'Remodeling Specialist',
    },
    {
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      message: 'Best investment I made this year',
      role: 'Home Builder',
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-white via-secondary-50/20 to-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-secondary-500/10 to-primary-500/10 border border-secondary-200 rounded-full backdrop-blur-sm">
              <Users className="w-4 h-4 text-secondary-600" />
              <span className="text-sm font-bold text-secondary-700">Join the Community</span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-black text-neutral-900 leading-tight">
              Facebook{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-500 to-primary-500">
                Community
              </span>
            </h2>

            <p className="text-xl text-neutral-600 leading-relaxed">
              Have questions about Partner or need general business advice? Connect with 5,000+ contractors in Partner Nation, our engaging Facebook community.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 p-8 bg-white rounded-3xl shadow-xl border-2 border-neutral-100">
              <div className="text-center">
                <div className="text-4xl font-black text-neutral-900 mb-2">5K+</div>
                <div className="text-sm text-neutral-600 font-semibold">Members</div>
              </div>
              <div className="text-center border-l-2 border-r-2 border-neutral-200">
                <div className="text-4xl font-black text-neutral-900 mb-2">500+</div>
                <div className="text-sm text-neutral-600 font-semibold">Daily Posts</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-neutral-900 mb-2">4.9</div>
                <div className="text-sm text-neutral-600 font-semibold">Rating</div>
              </div>
            </div>

            <button className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-secondary hover:scale-105 transition-all duration-300">
              <Facebook className="w-6 h-6" fill="currentColor" />
              Join Community
            </button>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            {/* Main Card */}
            <div className="relative bg-white rounded-[2rem] p-10 shadow-2xl border-2 border-neutral-100">
              {/* Profile Images with Chat */}
              <div className="flex items-center justify-center gap-8 mb-10 pt-6">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="relative group"
                  >
                    <div className="relative">
                      <div className={`w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-300 ${
                        index === 1 ? 'ring-4 ring-primary-400' : ''
                      }`}>
                        <img
                          src={testimonial.image}
                          alt={testimonial.role}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-2 -left-2 w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-yellow rounded-2xl flex items-center justify-center text-white font-bold shadow-xl">
                          👷
                        </div>
                      )}
                      {index === 1 && (
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-xl">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Bubble */}
              <div className="relative space-y-4">
                <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white px-8 py-5 rounded-3xl rounded-bl-none shadow-xl">
                  <p className="font-bold text-lg">{testimonials[2].message}</p>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>

              {/* Testimonial Tags */}
              <div className="flex flex-wrap gap-3 mt-8">
                <span className="px-5 py-2.5 bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 rounded-2xl text-sm font-bold border border-primary-200">
                  #HelpfulCommunity
                </span>
                <span className="px-5 py-2.5 bg-gradient-to-r from-secondary-100 to-secondary-50 text-secondary-700 rounded-2xl text-sm font-bold border border-secondary-200">
                  #ContractorLife
                </span>
              </div>
            </div>

            {/* Facebook Icon Badge */}
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-3xl flex items-center justify-center shadow-2xl animate-float">
              <Facebook className="w-10 h-10 text-white" fill="currentColor" />
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-primary-200 to-primary-400 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute -z-10 top-1/2 -right-8 w-40 h-40 bg-gradient-to-br from-secondary-200 to-secondary-400 rounded-full opacity-30 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;