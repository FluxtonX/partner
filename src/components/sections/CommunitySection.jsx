import React from 'react';

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
    <section className="py-20 lg:py-28 bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 rounded-full text-secondary-700 font-semibold text-sm mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              Join the Community
            </div>

            <h2 className="text-display-sm lg:text-display-md text-neutral-900 font-bold mb-6">
              Facebook{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
                community
              </span>
            </h2>

            <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
              Have questions about Partner or need general business advice? You can speak with other contractors in Partner Nation, our engaging Facebook community.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-white rounded-2xl shadow-soft border border-neutral-100">
              <div className="text-center">
                <div className="text-3xl font-bold text-neutral-900 mb-1">5K+</div>
                <div className="text-sm text-neutral-600">Members</div>
              </div>
              <div className="text-center border-l border-r border-neutral-200">
                <div className="text-3xl font-bold text-neutral-900 mb-1">500+</div>
                <div className="text-sm text-neutral-600">Daily Posts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-neutral-900 mb-1">4.9</div>
                <div className="text-sm text-neutral-600">Rating</div>
              </div>
            </div>

            <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-primary hover:shadow-lg transition-all hover:scale-105">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Join Community
            </button>
          </div>

          {/* Right - Visual */}
          <div className="relative animate-slide-in-left">
            {/* Main Card */}
            <div className="relative bg-white rounded-3xl p-8 shadow-large border border-neutral-200">
              {/* Helper Tooltip */}
              <div className="absolute -top-4 -right-4 bg-white px-6 py-3 rounded-2xl shadow-large border border-neutral-200 animate-float">
                <p className="text-sm text-neutral-700">
                  Just click on the "Add Item" button
                  <br />
                  on the right side and add the items
                </p>
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b border-r border-neutral-200 transform rotate-45"></div>
              </div>

              {/* Profile Images with Chat */}
              <div className="flex items-center justify-center gap-6 mb-8 pt-8">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="relative group animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="relative">
                      <img
                        src={testimonial.image}
                        alt={testimonial.role}
                        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-medium group-hover:scale-110 transition-transform duration-300"
                      />
                      {index === 0 && (
                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-accent-orange rounded-full flex items-center justify-center text-white font-bold shadow-medium">
                          👷
                        </div>
                      )}
                      {index === 1 && (
                        <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center shadow-medium">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Bubble */}
              <div className="relative">
                <div className="bg-secondary-500 text-white px-6 py-4 rounded-3xl rounded-bl-none shadow-medium mb-4 animate-scale-in" style={{ animationDelay: '0.4s' }}>
                  <p className="font-medium">{testimonials[2].message}</p>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>

              {/* Testimonial Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                  #HelpfulCommunity
                </span>
                <span className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold">
                  #ContractorLife
                </span>
              </div>
            </div>

            {/* Facebook Icon */}
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-secondary-500 rounded-2xl flex items-center justify-center shadow-large animate-float" style={{ animationDelay: '0.5s' }}>
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 -bottom-6 -left-6 w-32 h-32 bg-primary-200 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute -z-10 top-1/2 -right-6 w-32 h-32 bg-secondary-200 rounded-full opacity-30 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;