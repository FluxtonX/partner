import React from 'react';
import { FileText, Briefcase, Users, BarChart3, Zap, Shield, Clock, DollarSign } from 'lucide-react';

const FeaturesGrid = () => {
  const featureGroups = [
    {
      title: 'Sales & Estimating',
      color: 'primary',
      features: [
        {
          icon: Zap,
          name: 'AI-Powered Estimates',
          description: 'Generate accurate estimates in minutes with AI assistance and historical data.'
        },
        {
          icon: FileText,
          name: 'Blueprint Takeoff',
          description: 'Extract measurements and materials directly from blueprints automatically.'
        },
        {
          icon: Shield,
          name: 'Profit Lock',
          description: 'Protect your margins with built-in profit tracking and cost controls.'
        },
        {
          icon: Clock,
          name: 'Change Orders',
          description: 'Handle scope changes seamlessly with automated change order management.'
        }
      ]
    },
    {
      title: 'Project Management',
      color: 'secondary',
      features: [
        {
          icon: Briefcase,
          name: 'Project Tracking',
          description: 'Monitor all projects in real-time with comprehensive dashboards and timelines.'
        },
        {
          icon: Clock,
          name: 'Service Orders',
          description: 'Create and track work orders for maintenance and service jobs efficiently.'
        },
        {
          icon: BarChart3,
          name: 'Cost Tracking',
          description: 'Track expenses, labor, and materials against budget in real-time.'
        },
        {
          icon: FileText,
          name: 'Activity Feed',
          description: 'Stay updated on all project activities and team communications in one place.'
        }
      ]
    },
    {
      title: 'Client Experience',
      color: 'success',
      features: [
        {
          icon: Users,
          name: 'Client Portal',
          description: 'Give clients 24/7 access to project status, documents, and invoices.'
        },
        {
          icon: Zap,
          name: 'Auto Communication',
          description: 'Send automated updates, reminders, and notifications to clients.'
        },
        {
          icon: Clock,
          name: 'Timeline & Events',
          description: 'Share project milestones and schedules with clients transparently.'
        },
        {
          icon: Shield,
          name: 'Review Automation',
          description: 'Collect testimonials and reviews automatically after project completion.'
        }
      ]
    },
    {
      title: 'Business Control',
      color: 'warning',
      features: [
        {
          icon: DollarSign,
          name: 'Smart Invoicing',
          description: 'Create professional invoices and accept online payments seamlessly.'
        },
        {
          icon: BarChart3,
          name: 'ICC Calculator',
          description: 'Calculate indirect costs accurately to protect your bottom line.'
        },
        {
          icon: Shield,
          name: 'Business Settings',
          description: 'Configure company details, templates, and workflows to match your brand.'
        },
        {
          icon: Users,
          name: 'User Permissions',
          description: 'Control access and permissions for team members and subcontractors.'
        }
      ]
    }
  ];

  const colorMap = {
    primary: 'bg-primary-50 text-primary-500',
    secondary: 'bg-secondary-50 text-secondary-500',
    success: 'bg-green-50 text-success',
    warning: 'bg-orange-50 text-warning'
  };

  return (
    <section id="features" className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-display-sm text-neutral-900 mb-4">
            Everything You Need to Run Your Business
          </h2>
          <p className="text-xl text-neutral-600">
            Powerful features designed specifically for contractors, builders, and construction professionals.
          </p>
        </div>

        {/* Feature Groups */}
        <div className="space-y-16">
          {featureGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="animate-fade-in-up" style={{ animationDelay: `${groupIndex * 100}ms` }}>
              <h3 className="text-heading-lg text-neutral-900 mb-8 text-center lg:text-left">
                {group.title}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {group.features.map((feature, featureIndex) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={featureIndex}
                      className="bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border border-neutral-100"
                    >
                      <div className={`w-12 h-12 rounded-lg ${colorMap[group.color]} flex items-center justify-center mb-4`}>
                        <Icon size={24} />
                      </div>
                      <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                        {feature.name}
                      </h4>
                      <p className="text-neutral-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
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
            Explore All Features
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;