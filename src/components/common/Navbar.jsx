import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-medium py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3">
            <img src="/logo.png" alt="Partner Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold text-neutral-900">Partner</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-neutral-700 hover:text-primary-500 transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/login"
              className="text-neutral-700 hover:text-primary-500 transition-colors font-medium"
            >
              Login
            </a>
            <a
              href="/signup"
              className="bg-gradient-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-primary transition-all duration-300 hover:scale-105"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-neutral-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 animate-fade-in-up bg-white rounded-lg shadow-lg p-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block text-neutral-700 hover:text-primary-500 transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="/login"
              className="block text-neutral-700 hover:text-primary-500 transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </a>
            <a
              href="/signup"
              className="block bg-gradient-primary text-white px-6 py-2.5 rounded-lg font-semibold text-center hover:shadow-primary transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;