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
      cardColor: "from-orange-50/50 to-yellow-50/50",
      icon: Mic,
      accentColor: "accent-orange"
    },
    {
      title: "Smart Document Processing",
      description: "Simply upload your drawings, photos, or documents. AI analyzes and generates accurate estimates instantly - no manual typing required.",
      badge: "Most Popular",
      badgeColor: "from-secondary-400 to-secondary-600",
      cardColor: "from-blue-50/50 to-cyan-50/50",
      icon: FileText,
      accentColor: "secondary-500"
    },
    {
      title: "Instant Estimates from Photos",
      description: "Take photos on-site and watch AI create detailed estimates from your images. Works with drawings, blueprints, and site photos.",
      badge: "Game Changer",
      badgeColor: "from-primary-400 to-primary-600",
      cardColor: "from-green-50/50 to-emerald-50/50",
      icon: Camera,
      accentColor: "primary-500"
    },
    {
      title: "Homeowner Financing Integration",
      description: "Boost your close rate by offering financing options directly in your proposals through our integrated financing partners.",
      badge: "Premium",
      badgeColor: "from-accent-purple to-accent-blue",
      cardColor: "from-purple-50/50 to-pink-50/50",
      icon: CreditCard,
      accentColor: "accent-purple"
    },
    {
      title: "Project File Management",
      description: "All your project files organized in one place. Access estimates, photos, documents, and communication history instantly.",
      badge: "Essential",
      badgeColor: "from-neutral-600 to-neutral-800",
      cardColor: "from-neutral-50/50 to-slate-50/50",
      icon: FolderOpen,
      accentColor: "neutral-700"
    },
    {
      title: "Client Communication Hub",
      description: "Keep all client conversations, approvals, and changes in one organized timeline. Never miss important project details.",
      badge: "New Feature",
      badgeColor: "from-accent-blue to-secondary-500",
      cardColor: "from-sky-50/50 to-blue-50/50",
      icon: MessageCircle,
      accentColor: "accent-blue"
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
    <section className="py-24 lg:py-32 bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-secondary-400 to-primary-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-200 rounded-full backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-bold text-primary-700">Powered by AI</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-neutral-900">
            Automate Your Business{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
              With AI
            </span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-4xl mx-auto">
            Everything you need to streamline operations. Create instant estimates, send winning proposals, and get paid faster.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex-shrink-0 w-full px-4">
                    <div className={`bg-gradient-to-br ${feature.cardColor} backdrop-blur-sm rounded-[2.5rem] p-10 lg:p-14 shadow-2xl border-2 border-white/50 hover:shadow-3xl transition-all duration-500 max-w-5xl mx-auto`}>
                      <div className="grid lg:grid-cols-2 gap-10 items-center">
                        {/* Left Content */}
                        <div className="space-y-6">
                          {/* Badge */}
                          <div className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${feature.badgeColor} rounded-2xl text-white font-black text-sm shadow-xl`}>
                            <Sparkles className="w-4 h-4" />
                            {feature.badge}
                          </div>

                          {/* Title */}
                          <h3 className="text-3xl lg:text-4xl font-black text-neutral-900 leading-tight">
                            {feature.title}
                          </h3>

                          {/* Description */}
                          <p className="text-lg text-neutral-700 leading-relaxed">
                            {feature.description}
                          </p>

                          {/* Learn More Link */}
                          <button className="inline-flex items-center gap-2 text-primary-600 font-bold text-lg hover:gap-4 transition-all duration-300 group">
                            <span>Learn more</span>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>

                        {/* Right Visual */}
                        <div className="relative">
                          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-white/50 relative overflow-hidden group">
                            {/* Image Display */}
                            <div className="relative h-80 rounded-2xl overflow-hidden">
                              <img 
                                src={`https://source.unsplash.com/800x600/?${feature.title.toLowerCase().replace(/ /g, ',')},construction,technology`}
                                alt={feature.title}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                              />
                              {/* Overlay with Icon */}
                              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/20 to-transparent flex items-end p-6">
                                <div className={`w-16 h-16 bg-gradient-to-br ${feature.badgeColor} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform`}>
                                  <IconComponent className="w-8 h-8 text-white" strokeWidth={2.5} />
                                </div>
                              </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className={`absolute top-4 right-4 w-24 h-24 bg-${feature.accentColor}/20 rounded-full blur-2xl`}></div>
                            <div className={`absolute bottom-4 left-4 w-32 h-32 bg-${feature.accentColor}/20 rounded-full blur-2xl`}></div>
                          </div>

                          {/* Floating Badge */}
                          <div className={`absolute -top-4 -right-4 bg-gradient-to-r ${feature.badgeColor} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-float`}>
                            <Sparkles className="w-5 h-5" />
                            <span className="font-black text-sm">AI Powered</span>
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
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 lg:-translate-x-16 w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-neutral-700 hover:text-white hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-110 border-2 border-neutral-200 z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 lg:translate-x-16 w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-neutral-700 hover:text-white hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-110 border-2 border-neutral-200 z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex items-center justify-center gap-3 mt-12">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index 
                  ? 'w-12 h-3 bg-gradient-to-r from-primary-500 to-secondary-500 shadow-xl' 
                  : 'w-3 h-3 bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-primary hover:scale-105 transition-all duration-300">
            <span>Explore All Features</span>
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-sm text-neutral-600 mt-4 font-semibold">See how AI can transform your workflow</p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesCarousel;