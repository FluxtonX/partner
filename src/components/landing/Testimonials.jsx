import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'John Mitchell',
      role: 'General Contractor',
      company: 'Mitchell Construction',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      rating: 5,
      text: 'Partner has completely transformed how we manage our projects. The AI estimates save us hours every week, and our clients love the transparency of the portal.'
    },
    {
      name: 'Sarah Chen',
      role: 'Home Builder',
      company: 'Chen Homes',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      rating: 5,
      text: 'The best investment we\'ve made for our business. The cost tracking features alone have helped us increase our profit margins by 15%.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Remodeling Contractor',
      company: 'Rodriguez Remodeling',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      rating: 5,
      text: 'I can\'t imagine running my business without Partner now. Everything from estimates to invoicing is so streamlined. My team loves it too.'
    },
    {
      name: 'Emily Thompson',
      role: 'Commercial Builder',
      company: 'Thompson Commercial',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      rating: 5,
      text: 'Partner scales perfectly with our growing business. Managing multiple commercial projects has never been easier. The analytics give us insights we never had before.'
    },
    {
      name: 'David Kim',
      role: 'Renovation Specialist',
      company: 'Kim Renovations',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      rating: 5,
      text: 'The client portal is a game-changer. Our customers feel more connected to their projects, and we\'ve seen a huge increase in referrals because of it.'
    },
    {
      name: 'Lisa Anderson',
      role: 'Custom Home Builder',
      company: 'Anderson Custom Homes',
      image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop',
      rating: 5,
      text: 'After trying multiple project management tools, Partner is the only one built specifically for contractors. It just works the way we work.'
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-display-sm text-neutral-900 mb-4">
            Trusted by Contractors Nationwide
          </h2>
          <p className="text-xl text-neutral-600">
            See what construction professionals are saying about Partner.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border border-neutral-100 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Quote className="text-primary-500" size={24} />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="text-warning fill-warning" size={16} />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-neutral-700 leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center space-x-4 pt-4 border-t border-neutral-100">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-neutral-900">{testimonial.name}</h4>
                  <p className="text-sm text-neutral-600">{testimonial.role}</p>
                  <p className="text-xs text-neutral-500">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: '500+', label: 'Active Contractors' },
            { number: '10K+', label: 'Projects Completed' },
            { number: '$50M+', label: 'Revenue Managed' },
            { number: '4.9/5', label: 'Customer Rating' }
          ].map((stat, index) => (
            <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="text-4xl font-bold text-primary-500 mb-2">{stat.number}</div>
              <div className="text-neutral-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;