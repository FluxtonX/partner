import React, { useEffect, useRef, useState } from 'react';


const HowItWorksScroll = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);
  const scrollAccumulator = useRef(0);

  const steps = [
    {
      number: '1',
      title: 'Simply describe your project',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
      bgColor: 'from-blue-50 to-cyan-50',
      description: 'Tell us about your project in plain language or upload photos'
    },
    {
      number: '2',
      title: 'Partner generates your estimate with AI',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      bgColor: 'from-purple-50 to-pink-50',
      description: 'AI analyzes your project and creates detailed estimates instantly'
    },
    {
      number: '3',
      title: 'Send the proposal to client and get paid',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
      bgColor: 'from-green-50 to-emerald-50',
      description: 'Professional proposals sent in minutes, with built-in payment processing'
    }
  ];

  useEffect(() => {
    const handleWheel = (e) => {
      if (!isInView) return;
      
      // Prevent default scroll when in the carousel section
      if (currentStep < steps.length - 1 || (currentStep === steps.length - 1 && e.deltaY < 0)) {
        e.preventDefault();
        
        // Accumulate scroll delta
        scrollAccumulator.current += e.deltaY;
        
        // Threshold for changing steps
        const threshold = 100;
        
        if (scrollAccumulator.current > threshold) {
          setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
          scrollAccumulator.current = 0;
        } else if (scrollAccumulator.current < -threshold) {
          setCurrentStep(prev => Math.max(0, prev - 1));
          scrollAccumulator.current = 0;
        }
      }
    };

    const checkInView = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const inView = rect.top <= window.innerHeight / 3 && rect.bottom >= window.innerHeight / 3;
      setIsInView(inView);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', checkInView);
    checkInView();

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', checkInView);
    };
  }, [isInView, currentStep, steps.length]);

  // Calculate transform based on current step
  const transformX = -currentStep * 100;

  return (
    <section 
      ref={containerRef}
      className="py-20 lg:py-28 bg-gradient-to-br from-white via-secondary-50/30 to-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-display-sm lg:text-display-md text-neutral-900 font-bold mb-4">
            How it{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
             Work
          </span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Partner provides a complete toolkit to grow your remodeling business 10x faster 
            without having to work 10x harder.
          </p>
        </div>

        {/* Scrolling Cards Container */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(${transformX}%)` }}
          >
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full px-4"
              >
                <div className="max-w-5xl mx-auto">
                  <div className={`bg-gradient-to-br ${step.bgColor} rounded-3xl p-8 lg:p-12 shadow-large border border-white/50`}>
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      {/* Left Content */}
                      <div>
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-bold text-2xl mb-6 shadow-primary">
                          {step.number}
                        </div>
                        <h3 className="text-heading-lg text-neutral-900 font-bold mb-4">
                          {step.title}
                        </h3>
                        <p className="text-lg text-neutral-700 leading-relaxed mb-6">
                          {step.description}
                        </p>
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-medium font-semibold text-neutral-700">
                          Step {step.number} of {steps.length}
                        </div>
                      </div>

                      {/* Right Visual */}
                      <div className="relative">
                        <div className="bg-white rounded-2xl p-4 shadow-large">
                          <div className="relative h-80 rounded-xl overflow-hidden">
                            <img
                              src={step.image}
                              alt={step.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/30 to-transparent"></div>
                          </div>
                        </div>
                        <div className="absolute -top-3 -right-3 w-24 h-24 bg-primary-200 rounded-full opacity-40 blur-2xl"></div>
                        <div className="absolute -bottom-3 -left-3 w-24 h-24 bg-secondary-200 rounded-full opacity-40 blur-2xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-5xl mx-auto px-4 mt-12">
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full flex-1 transition-all duration-500 ${
                  index === currentStep 
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500' 
                    : index < currentStep 
                    ? 'bg-primary-300' 
                    : 'bg-neutral-200'
                }`}
              ></div>
            ))}
          </div>
          
          {/* Scroll hint */}
          {isInView && currentStep < steps.length - 1 && (
            <div className="text-center mt-6 animate-fade-in">
              <p className="text-sm text-neutral-500">Scroll to see next step</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksScroll