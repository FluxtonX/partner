import React, { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

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
      bgColor: 'from-blue-50/50 to-cyan-50/50',
      accentColor: 'from-secondary-500 to-secondary-600',
      description: 'Tell us about your project in plain language or upload photos. Our AI understands your needs.'
    },
    {
      number: '2',
      title: 'Partner generates your estimate with AI',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      bgColor: 'from-purple-50/50 to-pink-50/50',
      accentColor: 'from-accent-purple to-accent-blue',
      description: 'AI analyzes your project and creates detailed, accurate estimates instantly with itemized costs.'
    },
    {
      number: '3',
      title: 'Send the proposal and get paid',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
      bgColor: 'from-green-50/50 to-emerald-50/50',
      accentColor: 'from-primary-500 to-primary-600',
      description: 'Professional proposals sent in minutes, with built-in payment processing and e-signatures.'
    }
  ];

  useEffect(() => {
    const handleWheel = (e) => {
      if (!isInView) return;
      
      if (currentStep < steps.length - 1 || (currentStep === steps.length - 1 && e.deltaY < 0)) {
        e.preventDefault();
        scrollAccumulator.current += e.deltaY;
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

  const transformX = -currentStep * 100;

  return (
    <section 
      ref={containerRef}
      className="py-24 lg:py-32 bg-gradient-to-br from-neutral-50 via-white to-primary-50/20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-200 rounded-full backdrop-blur-sm">
            <Check className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-bold text-primary-700">3 Simple Steps</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-neutral-900">
            How it{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
              Works
            </span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Partner provides a complete toolkit to grow your remodeling business 
            <span className="font-bold text-neutral-900"> 10x faster without working 10x harder</span>
          </p>
        </div>

        {/* Scrolling Cards Container */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(${transformX}%)` }}
          >
            {steps.map((step, index) => (
              <div key={index} className="flex-shrink-0 w-full px-4">
                <div className="max-w-6xl mx-auto">
                  <div className={`bg-gradient-to-br ${step.bgColor} backdrop-blur-sm rounded-[2.5rem] p-10 lg:p-14 shadow-2xl border-2 border-white/50`}>
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                      {/* Left Content */}
                      <div className="space-y-6">
                        <div className={`inline-flex w-20 h-20 bg-gradient-to-r ${step.accentColor} text-white rounded-3xl font-black text-3xl items-center justify-center shadow-2xl`}>
                          {step.number}
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-black text-neutral-900 leading-tight">
                          {step.title}
                        </h3>
                        <p className="text-lg text-neutral-700 leading-relaxed">
                          {step.description}
                        </p>
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-xl border border-neutral-200">
                          <span className="font-black text-neutral-700">Step {step.number} of {steps.length}</span>
                        </div>
                      </div>

                      {/* Right Visual */}
                      <div className="relative">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-white/50 group">
                          <div className="relative h-80 rounded-2xl overflow-hidden">
                            <img
                              src={step.image}
                              alt={step.title}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 to-transparent"></div>
                          </div>
                        </div>
                        <div className={`absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br ${step.accentColor} rounded-full opacity-30 blur-3xl`}></div>
                        <div className={`absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br ${step.accentColor} rounded-full opacity-30 blur-3xl`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-6xl mx-auto px-4 mt-16">
          <div className="flex items-center justify-center gap-3">
            {steps.map((_, index) => (
              <div key={index} className="flex-1 relative">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    index === currentStep 
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg' 
                      : index < currentStep 
                      ? 'bg-gradient-to-r from-primary-400 to-primary-500' 
                      : 'bg-neutral-200'
                  }`}
                ></div>
                {index === currentStep && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-7 h-7 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-xl flex items-center justify-center">
                      <span className="text-white text-xs font-black">{index + 1}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {isInView && currentStep < steps.length - 1 && (
            <div className="text-center mt-8 animate-bounce">
              <p className="text-sm text-neutral-500 font-semibold">Scroll to see next step</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksScroll;