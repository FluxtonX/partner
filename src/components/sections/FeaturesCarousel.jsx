import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Mic, FileText, Camera, CreditCard, FolderOpen, MessageCircle } from 'lucide-react';

const FeaturesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const features = [
    {
      title: "AI Voice Transcription",
      description: "Record your site visits and meetings once. Our AI instantly transcribes everything into professional, project-ready documents.",
      badge: "New Feature",
      badgeColor: "from-accent-orange to-accent-yellow",
      cardColor: "from-orange-50 to-yellow-50",
      icon: Mic
    },
    {
      title: "Smart Document Processing",
      description: "Simply upload your drawings, photos, or documents. AI analyzes and generates accurate estimates instantly - no manual typing required.",
      badge: "Most Popular",
      badgeColor: "from-secondary-400 to-secondary-600",
      cardColor: "from-blue-50 to-cyan-50",
      icon: FileText
    },
    {
      title: "Instant Estimates from Photos",
      description: "Take photos on-site and watch AI create detailed estimates from your images. Works with drawings, blueprints, and site photos.",
      badge: "New Feature",
      badgeColor: "from-primary-400 to-primary-600",
      cardColor: "from-green-50 to-emerald-50",
      icon: Camera
    },
    {
      title: "Homeowner Financing Integration",
      description: "Boost your close rate by offering financing options directly in your proposals through our integrated financing partners.",
      badge: "Premium",
      badgeColor: "from-purple-400 to-purple-600",
      cardColor: "from-purple-50 to-pink-50",
      icon: CreditCard
    },
    {
      title: "Project File Management",
      description: "All your project files organized in one place. Access estimates, photos, documents, and communication history instantly.",
      badge: "Essential",
      badgeColor: "from-neutral-600 to-neutral-800",
      cardColor: "from-neutral-50 to-slate-50",
      icon: FolderOpen
    },
    {
      title: "Client Communication Hub",
      description: "Keep all client conversations, approvals, and changes in one organized timeline. Never miss important project details.",
      badge: "New Feature",
      badgeColor: "from-accent-blue to-secondary-500",
      cardColor: "from-sky-50 to-blue-50",
      icon: MessageCircle
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= features.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, features.length]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev >= features.length - 1 ? 0 : prev + 1));
  };

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev <= 0 ? features.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-40 -left-40 w-96 h-96 bg-secondary-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full text-primary-700 font-semibold text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            Powered by AI
          </div>
          <h2 className="text-display-sm lg:text-display-md text-neutral-900 mb-4">
            Automate your contracting{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
              business with AI
            </span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
            Everything you need to streamline operations with Artificial Intelligence. Create instant estimates, send winning proposals, impress your clients, and get paid faster.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Cards Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ 
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex-shrink-0 w-full px-4"
                  >
                    <div className={`bg-gradient-to-br ${feature.cardColor} rounded-3xl p-8 lg:p-12 shadow-large border border-white/50 hover:shadow-xl transition-all duration-300 max-w-4xl mx-auto`}>
                      <div className="grid lg:grid-cols-2 gap-8 items-center">
                        {/* Left Content */}
                        <div>
                          {/* Badge */}
                          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${feature.badgeColor} rounded-full text-white font-semibold text-sm mb-6 shadow-medium`}>
                            <Sparkles className="w-4 h-4" />
                            {feature.badge}
                          </div>

                          {/* Title */}
                          <h3 className="text-heading-lg text-neutral-900 mb-4 font-bold">
                            {feature.title}
                          </h3>

                          {/* Description */}
                          <p className="text-lg text-neutral-700 leading-relaxed mb-6">
                            {feature.description}
                          </p>

                          {/* Learn More Link */}
                          <button className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all duration-300 group">
                            <span>Learn more</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>

                        {/* Right Visual */}
                        <div className="relative">
                          <div className="bg-white rounded-2xl p-4 shadow-large border border-neutral-200 relative overflow-hidden">
                            {/* Image Display */}
                            <div className="relative h-80 rounded-xl overflow-hidden group">
                              <img 
                                src={`https://source.unsplash.com/800x600/?${feature.title.toLowerCase().replace(/ /g, ',')},construction,technology`}
                                alt={feature.title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                              />
                              {/* Overlay with Icon */}
                              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-neutral-900/20 to-transparent flex items-end p-6">
                                <div className={`w-16 h-16 bg-gradient-to-br ${feature.badgeColor} rounded-2xl flex items-center justify-center shadow-large`}>
                                  <IconComponent className="w-8 h-8 text-white" strokeWidth={2} />
                                </div>
                              </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-4 right-4 w-16 h-16 bg-primary-100 rounded-full opacity-50 blur-2xl"></div>
                            <div className="absolute bottom-4 left-4 w-20 h-20 bg-secondary-100 rounded-full opacity-50 blur-2xl"></div>
                          </div>

                          {/* Floating Badge */}
                          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-full shadow-large flex items-center gap-2 animate-float">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-semibold text-sm">AI Powered</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16 w-14 h-14 bg-white rounded-full shadow-large flex items-center justify-center text-neutral-700 hover:text-primary-500 hover:bg-primary-50 transition-all duration-300 hover:scale-110 border border-neutral-200 z-10"
            aria-label="Previous feature"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16 w-14 h-14 bg-white rounded-full shadow-large flex items-center justify-center text-neutral-700 hover:text-primary-500 hover:bg-primary-50 transition-all duration-300 hover:scale-110 border border-neutral-200 z-10"
            aria-label="Next feature"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex items-center justify-center gap-2 mt-12">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index 
                  ? 'w-10 h-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 shadow-primary' 
                  : 'w-2.5 h-2.5 bg-neutral-300 hover:bg-neutral-400'
              }`}
              aria-label={`Go to feature ${index + 1}`}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold text-lg shadow-primary hover:shadow-large hover:-translate-y-1 transition-all duration-300">
            <span>Explore All Features</span>
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-sm text-neutral-600 mt-4">See how AI can transform your workflow</p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesCarousel;