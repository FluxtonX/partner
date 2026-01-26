import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Star, Quote } from 'lucide-react';

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      name: "Glenn Rodriguez",
      company: "Glenn and Sons Remodel",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Glenn",
      location: "Dallas, TX",
      rating: 5,
      text: "I'm very impressed. We won a $10,000 job with Partner in our first month! The AI estimates are incredibly accurate and save us hours of work.",
      highlight: "$10K job in first month",
      color: "from-primary-500 to-primary-600"
    },
    {
      name: "Chris Martinez",
      company: "Two Crackers and a Nailgun",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris",
      location: "Miami, FL",
      rating: 5,
      text: "I have already told someone about the software. I feel as more updates are added it is going to be an unstoppable competitive software in the construction industry.",
      highlight: "Unstoppable edge",
      color: "from-secondary-500 to-secondary-600"
    },
    {
      name: "Heath Johnson",
      company: "Mayfield Construction",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Heath",
      location: "Bowie, TX",
      rating: 5,
      text: "I am very surprised at how close to my numbers the AI is. I really like the app and the customer support is fantastic.",
      highlight: "Incredibly accurate",
      color: "from-accent-orange to-accent-yellow"
    },
    {
      name: "Todd Anderson",
      company: "GoHammer Construction",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Todd",
      location: "Chester, VA",
      rating: 5,
      text: "I've been sold on this from day one. I was ready to write a 1,000-pound check. It's much better than the other guys out there.",
      highlight: "Better than competitors",
      color: "from-accent-purple to-accent-blue"
    },
    {
      name: "Sarah Williams",
      company: "Elite Renovations LLC",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      location: "Phoenix, AZ",
      rating: 5,
      text: "This software has transformed how we create estimates. We've cut our proposal time by 60% and our win rate has increased significantly.",
      highlight: "60% faster",
      color: "from-primary-400 to-secondary-400"
    },
    {
      name: "Marcus Thompson",
      company: "Thompson & Co Builders",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      location: "Seattle, WA",
      rating: 5,
      text: "The AI is remarkably accurate. We've been able to take on 3x more projects because the estimating process is so streamlined now.",
      highlight: "3x more projects",
      color: "from-accent-orange to-primary-500"
    }
  ];

  const itemsPerView = 3;
  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-white via-primary-50/20 to-secondary-50/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-secondary-300 to-secondary-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-200 rounded-full backdrop-blur-sm">
            <Star className="w-4 h-4 text-primary-600 fill-primary-600" />
            <span className="text-sm font-bold text-primary-700">Success Stories</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-neutral-900">
            Loved by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
              5,000+ Contractors
            </span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            See what contractors are saying about transforming their business with AI
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-out gap-6"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-3">
                  <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-neutral-100 h-full flex flex-col relative overflow-hidden">
                    {/* Gradient Accent */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${testimonial.color}`}></div>
                    
                    {/* Quote Icon */}
                    <div className="absolute top-6 right-6 opacity-10">
                      <Quote className="w-16 h-16 text-neutral-900" />
                    </div>

                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6 relative z-10">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${testimonial.color} p-1 shadow-lg`}>
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.name}
                          className="w-full h-full rounded-xl bg-white"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-neutral-900 text-lg">{testimonial.name}</h3>
                        <p className="text-sm text-neutral-600 mb-2">{testimonial.company}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-accent-yellow text-accent-yellow" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-neutral-700 leading-relaxed mb-6 flex-1 relative z-10">
                      "{testimonial.text}"
                    </p>

                    {/* Highlight Badge */}
                    <div className="mb-4 relative z-10">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${testimonial.color} rounded-xl shadow-lg`}>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm font-black text-white">{testimonial.highlight}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-neutral-500 text-sm pt-4 border-t border-neutral-100 relative z-10">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      <span className="font-semibold">{testimonial.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-14 h-14 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-neutral-700 hover:text-white hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-110 border border-neutral-200 z-10"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-14 h-14 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-neutral-700 hover:text-white hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-110 border border-neutral-200 z-10"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-12">
          {[...Array(maxIndex + 1)].map((_, index) => (
            <button
              key={index}
              onClick={() => { setIsAutoPlaying(false); setCurrentIndex(index); }}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index 
                  ? 'w-10 h-3 bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg' 
                  : 'w-3 h-3 bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-primary hover:scale-105 transition-all duration-300">
            <span>Join 5,000+ Contractors</span>
            <ChevronRight className="w-6 h-6" />
          </button>
          <p className="text-sm text-neutral-600 mt-4 font-semibold">Start your free 7-day trial today</p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;