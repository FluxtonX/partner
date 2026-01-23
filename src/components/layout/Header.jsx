import React, { useState, useEffect, useRef } from "react";

// Add this function right after your imports, before the Button component
const navigate = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const Button = ({
  children,
  variant = "primary",
  size = "sm",
  className = "",
  ...props
}) => {
  const baseStyles = "rounded-lg font-medium transition-colors";
  const sizes = {
    sm: "px-4 py-2 text-sm",
  };
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700",
    ghost: "text-neutral-700 hover:bg-neutral-100",
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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
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
        {
          name: "General Contractors",
          href: "/general-contractors",
          icon: "👷",
        },
        { name: "Remodelers", href: "/remodelers", icon: "🏠" },
        { name: "Home Builders", href: "/home-builders", icon: "🏗️" },
        {
          name: "Specialty Contractors",
          href: "/specialty-contractors",
          icon: "⚡",
        },
      ],
    },
    {
      name: "Features",
      href: "/features",
      hasDropdown: true,
      dropdownItems: [
        {
          name: "Instant AI Estimates",
          href: "/features/ai-estimates",
          description: "Generate detailed estimates in seconds",
        },
        {
          name: "Invoicing",
          href: "/features/invoicing",
          description: "Turn proposals into invoices quickly",
        },
        {
          name: "Project Management",
          href: "/features/project-management",
          description: "Keep all project data in one place",
        },
        {
          name: "Client Management System",
          href: "/features/client-management",
          description: "Store client info and estimates",
        },
        {
          name: "Change Orders",
          href: "/features/change-orders",
          description: "Manage scope changes with AI",
        },
        {
          name: "AI Agent",
          href: "/features/ai-agent",
          description: "Personal AI assistant for your business",
        },
        {
          name: "Winning AI Proposals",
          href: "/features/proposals",
          description: "Generate winning proposals automatically",
        },
        {
          name: "File Management",
          href: "/features/file-management",
          description: "Organize drawings and photos",
        },
        {
          name: "Homeowner Financing",
          href: "/features/financing",
          description: "Offer financing on every proposal",
        },
        {
          name: "Creating Estimates from files",
          href: "/features/estimate-from-files",
          description: "From drawings, photos and more",
        },
        {
          name: "AI Documents",
          href: "/features/ai-documents",
          description: "Upload files for instant AI estimates",
        },
        {
          name: "AI Transcription",
          href: "/features/transcription",
          description: "Record and transcribe meetings",
        },
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
        { name: "Community", href: "/community", icon: "👥" },
      ],
    },
    { name: "Help Center", href: "/help" },
    { name: "We're Hiring", href: "/careers" },
  ];

  const handleDropdownToggle = (itemName) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  return (
    <>
      <header
        className={`fixed top-2 left-0 right-0 z-50 transition-all rounded-[20px] lg:rounded-[50px] duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-medium py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Partner Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-primary-500">
                Partner
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav
              className="hidden lg:flex items-center gap-1"
              ref={dropdownRef}
            >
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.hasDropdown ? (
                    <button
                      onClick={() => handleDropdownToggle(item.name)}
                      onMouseEnter={() => setActiveDropdown(item.name)}
                      className="flex items-center gap-1 px-4 py-2 text-neutral-700 hover:text-primary-600 font-medium transition-colors rounded-lg hover:bg-neutral-50"
                    >
                      {item.name}
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      className="px-4 py-2 text-neutral-700 hover:text-primary-600 font-medium transition-colors rounded-lg hover:bg-neutral-50 block"
                    >
                      {item.name}
                    </a>
                  )}

                  {/* Dropdown Menu */}
                  {item.hasDropdown && activeDropdown === item.name && (
                    <div
                      className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-large border border-neutral-200 py-2 min-w-[320px] animate-fade-in-up"
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div
                        className={
                          item.name === "Features"
                            ? "grid grid-cols-3 gap-1 p-2"
                            : "p-2"
                        }
                      >
                        {item.dropdownItems.map((dropdownItem) => (
                          <a
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-primary-50 transition-colors group"
                          >
                            {dropdownItem.icon && (
                              <span className="text-2xl">
                                {dropdownItem.icon}
                              </span>
                            )}
                            <div className="flex-1">
                              <div className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                                {dropdownItem.name}
                              </div>
                              {dropdownItem.description && (
                                <div className="text-sm font-normal text-neutral-600 mt-0.5">
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

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Button variant="ghost" size="sm"
              onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/signup")

                }
              >
                Start an estimate
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-700 hover:text-primary-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Now outside header */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-md rounded-[30px] mx-4 shadow-medium animate-fade-in-up max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col gap-2 p-4">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.hasDropdown ? (
                  <div>
                    <button
                      onClick={() => handleDropdownToggle(item.name)}
                      className="flex items-center justify-between w-full px-4 py-3 text-neutral-700 hover:text-primary-600 font-medium transition-colors rounded-lg hover:bg-neutral-50"
                    >
                      {item.name}
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {activeDropdown === item.name && (
                      <div className="ml-4 mt-2 space-y-1">
                        {item.dropdownItems.map((dropdownItem) => (
                          <a
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="block px-4 py-2 text-sm text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {dropdownItem.icon && (
                              <span className="mr-2">{dropdownItem.icon}</span>
                            )}
                            {dropdownItem.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className="block px-4 py-3 text-neutral-700 hover:text-primary-600 font-medium transition-colors rounded-lg hover:bg-neutral-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
            <div className="flex flex-col gap-3 pt-4 mt-4 border-t border-neutral-200">
              <Button variant="ghost" size="sm" className="w-full">
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => navigate("/signup")}
              >
                Start an estimate
              </Button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
