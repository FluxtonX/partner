import React, { useState } from 'react';
import { LayoutDashboard, FileText, Users, TrendingUp } from 'lucide-react';

const ProductPreview = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      description: 'Get a complete overview of your business at a glance',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop'
    },
    {
      icon: FileText,
      title: 'Estimates',
      description: 'Create professional estimates with AI assistance',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop'
    },
    {
      icon: Users,
      title: 'Client Portal',
      description: 'Give clients transparency and control over their projects',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&auto=format&fit=crop'
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Track performance and profitability with powerful insights',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-display-sm text-neutral-900 mb-4">
            See Partner in Action
          </h2>
          <p className="text-xl text-neutral-600">
            Explore the intuitive interface designed to make your work easier and more efficient.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === index
                    ? 'bg-gradient-primary text-white shadow-primary'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50 shadow-soft'
                }`}
              >
                <Icon size={20} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="relative">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className={`transition-all duration-500 ${
                activeTab === index
                  ? 'opacity-100 scale-100 animate-fade-in'
                  : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'
              }`}
            >
              {/* Description */}
              <div className="text-center mb-8">
                <p className="text-lg text-neutral-700 font-medium">
                  {tab.description}
                </p>
              </div>

              {/* Screenshot */}
              <div className="relative max-w-5xl mx-auto">
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-large border-8 border-white">
                  <img
                    src={tab.image}
                    alt={tab.title}
                    className="w-full h-auto"
                  />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-200 rounded-full opacity-20 blur-3xl -z-10"></div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary-200 rounded-full opacity-20 blur-3xl -z-10"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in-up">
          <a
            href="/signup"
            className="inline-flex items-center bg-gradient-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-primary transition-all duration-300 hover:scale-105"
          >
            Try It Yourself
          </a>
          <p className="mt-4 text-neutral-600">Start your free 14-day trial today</p>
        </div>
      </div>
    </section>
  );
};

export default ProductPreview;