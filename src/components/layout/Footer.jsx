import React from 'react';

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

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Partner Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-primary-500">Partner</span>
          </div>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              The all-in-one platform for contractors to manage estimates, projects, and client relationships.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {['twitter', 'linkedin', 'facebook', 'instagram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-neutral-800 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-neutral-400 hover:text-primary-400 transition-colors"
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
        <div className="mt-12 pt-12 border-t border-neutral-800">
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-3">Stay Updated</h3>
            <p className="text-neutral-400 mb-4">
              Get the latest updates on features, tips, and industry insights.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-sm">
              © 2024 Partner. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <a href="#" className="hover:text-primary-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
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