import React from 'react';
import { Hammer, Building2, Compass, PenTool, Ruler } from 'lucide-react';

const UserTypes = () => {
  const userTypes = [
    {
      icon: Hammer,
      title: 'Contractors',
      description: 'Manage residential and commercial projects with ease. From estimates to completion.',
      color: 'bg-primary-500'
    },
    {
      icon: Building2,
      title: 'Builders',
      description: 'Coordinate multiple trades, track budgets, and deliver projects on time.',
      color: 'bg-secondary-500'
    },
    {
      icon: Compass,
      title: 'Architects',
      description: 'Collaborate with clients and contractors seamlessly throughout the design process.',
      color: 'bg-purple-500'
    },
    {
      icon: PenTool,
      title: 'Planners',
      description: 'Organize project timelines, resources, and deliverables in one centralized platform.',
      color: 'bg-warning'
    },
    {
      icon: Ruler,
      title: 'Engineers',
      description: 'Track technical specifications, changes, and compliance requirements efficiently.',
      color: 'bg-success'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-display-sm text-neutral-900 mb-4">
            Built for Construction Professionals
          </h2>
          <p className="text-xl text-neutral-600">
            Whether you're a contractor, builder, architect, or engineer — Partner adapts to your workflow.
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {userTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-2 border border-neutral-100 text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className={`w-16 h-16 ${type.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={32} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  {type.title}
                </h3>

                {/* Description */}
                <p className="text-neutral-600 leading-relaxed">
                  {type.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in-up">
          <p className="text-lg text-neutral-700 mb-6">
            Join thousands of professionals who trust Partner for their business.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center bg-gradient-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-primary transition-all duration-300 hover:scale-105"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </section>
  );
};

export default UserTypes;