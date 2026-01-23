import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';

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
      text: "I'm very impressed. We won a $10,000 job with Handoff in our first month! The AI estimates are incredibly accurate and save us hours of work.",
      highlight: "$10,000 job in first month"
    },
    {
      name: "Chris Martinez",
      company: "Two Crackers and a Nailgun",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris",
      location: "Miami, FL",
      rating: 5,
      text: "I have already told someone about the software. I feel as more updates are added it is going to be an unstoppable competitive software in the construction industry.",
      highlight: "Unstoppable competitive edge"
    },
    {
      name: "Heath Johnson",
      company: "Mayfield Construction",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Heath",
      location: "Bowie, TX",
      rating: 5,
      text: "I am very surprised at how close to my numbers the AI is. I really like the app and the customer support is fantastic.",
      highlight: "Incredibly accurate AI"
    },
    {
      name: "Todd Anderson",
      company: "GoHammer Construction",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Todd",
      location: "Chester, VA",
      rating: 5,
      text: "I've been sold on this from day one. I was ready to write a 1,000-pound check. It's much better than the other guys out there.",
      highlight: "Better than competitors"
    },
    {
      name: "Sarah Williams",
      company: "Elite Renovations LLC",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      location: "Phoenix, AZ",
      rating: 5,
      text: "This software has transformed how we create estimates. We've cut our proposal time by 60% and our win rate has increased significantly.",
      highlight: "60% faster proposals"
    },
    {
      name: "Marcus Thompson",
      company: "Thompson & Co Builders",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      location: "Seattle, WA",
      rating: 5,
      text: "The AI is remarkably accurate. We've been able to take on 3x more projects because the estimating process is so streamlined now.",
      highlight: "3x more projects"
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

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-neutral-50 via-white to-primary-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-secondary-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 font-semibold text-sm mb-4">
            <Star className="w-4 h-4 fill-current" />
            Customer Success Stories
          </div>
          <h2 className="text-display-sm lg:text-display-md text-neutral-900 mb-4">
            AI estimating software{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
              contractors love
            </span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Join thousands of contractors who are closing more deals and saving time with AI-powered estimates
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Cards Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out gap-6"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-3"
                >
                  <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-medium hover:shadow-large transition-all duration-300 hover:-translate-y-2 border border-neutral-100 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full bg-primary-100 ring-4 ring-primary-50"
                      />
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
                    <p className="text-neutral-700 leading-relaxed mb-6 flex-1">
                      "{testimonial.text}"
                    </p>

                    {/* Highlight Badge */}
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-primary-700">{testimonial.highlight}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-neutral-500 text-sm pt-4 border-t border-neutral-100">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      <span>{testimonial.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 w-12 h-12 bg-white rounded-full shadow-large flex items-center justify-center text-neutral-700 hover:text-primary-500 hover:bg-primary-50 transition-all duration-300 hover:scale-110 border border-neutral-200"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 w-12 h-12 bg-white rounded-full shadow-large flex items-center justify-center text-neutral-700 hover:text-primary-500 hover:bg-primary-50 transition-all duration-300 hover:scale-110 border border-neutral-200"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {[...Array(maxIndex + 1)].map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index 
                  ? 'w-8 h-2 bg-gradient-to-r from-primary-500 to-secondary-500' 
                  : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-primary hover:shadow-large hover:-translate-y-1 transition-all duration-300">
            <span>Join 5,000+ Contractors</span>
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-neutral-600 mt-4">Start your free 7-day trial today</p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;