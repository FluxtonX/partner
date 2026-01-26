import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    product: {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'AI Estimates', href: '#' },
        { name: 'Integrations', href: '#' },
        { name: 'Mobile App', href: '#' },
      ],
    },
    company: {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Press Kit', href: '#' },
        { name: 'Contact', href: '#' },
      ],
    },
    resources: {
      title: 'Resources',
      links: [
        { name: 'Help Center', href: '#' },
        { name: 'Documentation', href: '#' },
        { name: 'Video Tutorials', href: '#' },
        { name: 'Community', href: '#' },
        { name: 'API Reference', href: '#' },
      ],
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Cookie Policy', href: '#' },
        { name: 'GDPR', href: '#' },
      ],
    },
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
  ];

  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-neutral-300 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-accent-purple to-accent-blue rounded-full blur-3xl"></div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <img
                  src="/logo.png"
                  alt="Partner Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Partner</span>
            </div>
            <p className="text-neutral-400 mb-8 leading-relaxed text-lg">
              The all-in-one platform for contractors to manage estimates, projects, and client relationships with AI.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-12 h-12 bg-neutral-800 hover:bg-gradient-to-br hover:from-primary-500 hover:to-secondary-500 rounded-2xl flex items-center justify-center transition-all hover:scale-110 border border-neutral-700 hover:border-transparent"
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-white font-black mb-6 text-lg">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-neutral-400 hover:text-primary-400 transition-colors font-semibold hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 pt-16 border-t-2 border-neutral-800">
          <div className="max-w-2xl">
            <h3 className="text-white font-black mb-4 text-2xl">Stay Updated</h3>
            <p className="text-neutral-400 mb-6 text-lg">
              Get the latest updates on features, tips, and industry insights delivered to your inbox.
            </p>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-800 border-2 border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors font-semibold"
                />
              </div>
              <button
                type="button"
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-2xl flex items-center gap-2"
              >
                Subscribe
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-neutral-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-neutral-500 text-sm font-semibold">
              © 2024 Partner. All rights reserved.
            </p>
            <div className="flex items-center gap-8 text-sm">
              <a href="#" className="text-neutral-500 hover:text-primary-400 transition-colors font-semibold">
                Privacy
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary-400 transition-colors font-semibold">
                Terms
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary-400 transition-colors font-semibold">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;