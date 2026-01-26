import React, { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from 'lucide-react';

const navigate = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles = "font-semibold transition-all duration-300 inline-flex items-center justify-center";
  const sizes = {
    sm: "px-5 py-2.5 text-sm rounded-full",
    md: "px-6 py-3 text-base rounded-full",
  };
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl hover:scale-105",
    ghost: "text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-full",
    outline: "border-2 border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white rounded-full",
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigation = [
    {
      name: "Who we serve",
      href: "/who-we-serve",
      hasDropdown: true,
      dropdownItems: [
        { name: "General Contractors", href: "/general-contractors", icon: "👷" },
        { name: "Remodelers", href: "/remodelers", icon: "🏠" },
        { name: "Home Builders", href: "/home-builders", icon: "🏗️" },
        { name: "Specialty Contractors", href: "/specialty-contractors", icon: "⚡" },
      ],
    },
    {
      name: "Features",
      href: "/features",
      hasDropdown: true,
      dropdownItems: [
        { name: "AI Estimates", href: "/features/ai-estimates", description: "Generate detailed estimates in seconds" },
        { name: "Invoicing", href: "/features/invoicing", description: "Turn proposals into invoices quickly" },
        { name: "Project Management", href: "/features/project-management", description: "Keep all project data organized" },
        { name: "Client Portal", href: "/features/client-management", description: "Store client info and estimates" },
        { name: "Change Orders", href: "/features/change-orders", description: "Manage scope changes with AI" },
        { name: "AI Agent", href: "/features/ai-agent", description: "Your personal AI assistant" },
      ],
    },
    { name: "Pricing", href: "/pricing" },
    { name: "Reviews", href: "/reviews" },
    {
      name: "Resources",
      href: "/resources",
      hasDropdown: true,
      dropdownItems: [
        { name: "Blog", href: "/blog", icon: "📝" },
        { name: "Case Studies", href: "/case-studies", icon: "📊" },
        { name: "Video Tutorials", href: "/tutorials", icon: "🎥" },
        { name: "Help Center", href: "/help", icon: "❓" },
      ],
    },
  ];

  const handleDropdownToggle = (itemName) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-2xl py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo - Enhanced */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <img
                    src="/logo.png"
                    alt="Partner Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Partner
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2" ref={dropdownRef}>
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.hasDropdown ? (
                    <button
                      onClick={() => handleDropdownToggle(item.name)}
                      onMouseEnter={() => setActiveDropdown(item.name)}
                      className="flex items-center gap-1.5 px-4 py-2.5 text-neutral-700 hover:text-primary-600 font-medium transition-all rounded-full hover:bg-primary-50 group"
                    >
                      {item.name}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      className="px-4 py-2.5 text-neutral-700 hover:text-primary-600 font-medium transition-all rounded-full hover:bg-primary-50 block"
                    >
                      {item.name}
                    </a>
                  )}

                  {/* Dropdown Menu - Enhanced */}
                  {item.hasDropdown && activeDropdown === item.name && (
                    <div
                      className="absolute top-full left-0 mt-3 bg-white rounded-3xl shadow-2xl border border-neutral-100 py-3 min-w-[280px] animate-fade-in-up"
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className={item.name === "Features" ? "grid grid-cols-2 gap-2 p-3" : "p-3"}>
                        {item.dropdownItems.map((dropdownItem) => (
                          <a
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="flex items-start gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all group/item"
                          >
                            {dropdownItem.icon && (
                              <span className="text-2xl transform group-hover/item:scale-110 transition-transform">
                                {dropdownItem.icon}
                              </span>
                            )}
                            <div className="flex-1">
                              <div className="font-semibold text-neutral-900 group-hover/item:text-primary-600 transition-colors">
                                {dropdownItem.name}
                              </div>
                              {dropdownItem.description && (
                                <div className="text-xs text-neutral-600 mt-0.5">
                                  {dropdownItem.description}
                                </div>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA Buttons - Enhanced */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate("/signup")}>
                <span>Start Free Trial</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>

            {/* Mobile Menu Button - Enhanced */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Completely Redesigned */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-24 left-0 right-0 bottom-0 z-40 bg-white/98 backdrop-blur-xl animate-fade-in">
          <div className="h-full overflow-y-auto px-4 py-6">
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => (
                <div key={item.name} className="border-b border-neutral-100 pb-2">
                  {item.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => handleDropdownToggle(item.name)}
                        className="flex items-center justify-between w-full px-5 py-4 text-neutral-700 hover:text-primary-600 font-semibold transition-all rounded-2xl hover:bg-primary-50"
                      >
                        {item.name}
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            activeDropdown === item.name ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {activeDropdown === item.name && (
                        <div className="ml-4 mt-2 space-y-1 animate-fade-in-up">
                          {item.dropdownItems.map((dropdownItem) => (
                            <a
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="block px-5 py-3 text-sm text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <div className="flex items-center gap-2">
                                {dropdownItem.icon && (
                                  <span className="text-lg">{dropdownItem.icon}</span>
                                )}
                                <span className="font-medium">{dropdownItem.name}</span>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      className="block px-5 py-4 text-neutral-700 hover:text-primary-600 font-semibold transition-all rounded-2xl hover:bg-primary-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile CTA Buttons */}
            <div className="flex flex-col gap-3 pt-6 mt-6 border-t border-neutral-200">
              <Button variant="ghost" size="md" className="w-full" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button variant="primary" size="md" className="w-full" onClick={() => navigate("/signup")}>
                Start Free Trial
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;