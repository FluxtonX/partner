

import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, BusinessSettings, UserBusiness, Project, Invoice, Business, Alert } from "@/api/entities"; // Added Alert
import { LanguageProvider, useLanguage } from '@/components/providers/LanguageContext';
import {
  LayoutDashboard,
  FolderOpen,
  Users as UsersIcon, // Renamed to avoid conflict
  FileText,
  Calculator,
  DollarSign,
  Settings,
  Package,
  Wrench,
  User as UserAvatarIcon, // Renamed User to UserAvatarIcon to avoid conflict with UsersIcon
  GraduationCap,
  CreditCard,
  MessageSquare,
  Plus,
  Bell,
  Home, // Added for BusinessSwitcher icon
  Warehouse,
  BadgeCheck,
  Receipt,
  Calendar,
  Clock,
  Map,
  ShoppingCart,
  Shield, // Added Shield icon for Insurance
  BookUser, // Added BookUser icon for Rolodex
  Megaphone, // Added Megaphone icon for Marketing
  Edit, // Added Edit icon for Change Orders
  Truck, // Added Truck icon for Company Assets and Vendor Management
  Code, // Added Code icon for Developer section
  Monitor, // Added Monitor icon for Ad Manager
  ClipboardList, // Added ClipboardList for Material Takeoff
  Camera, // Added Camera icon for AR Estimator (BETA)
  Palette, // Added Palette icon for AI Marketing Materials
  Sparkles, // Added Sparkles icon for AI Tools
  ShieldCheck, // Added ShieldCheck icon for Data Integrity
  BarChart3, // Added BarChart3 for Account Usage
  ChevronDown // Added ChevronDown for dropdown
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import MobileNavigation from "./../components/layout/MobileNavigation";
import QuickCreateMenu from "./../components/layout/QuickCreateMenu";
import BusinessSwitcher from "./../components/layout/BusinessSwitcher";

const NewsFeedWidget = () => {
  return (
    <div className="p-2 text-sm text-slate-500 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors duration-200 whitespace-nowrap">
      News Feed
    </div>
  );
};


const getNavigationItems = (userRole, t) => {
  const coreItems = [
    { title: t('dashboard'), url: createPageUrl("Dashboard"), icon: LayoutDashboard },
    { title: 'New', action: 'openQuickCreate', icon: Plus },
    { title: t('my_portal'), url: createPageUrl("MyPortal"), icon: UserAvatarIcon }, // Updated to MyPortal
    { title: t('calendar'), url: createPageUrl("Calendar"), icon: Calendar },
    { title: t('projects'), url: createPageUrl("Projects"), icon: FolderOpen },
    { title: t('feed'), url: createPageUrl("Feed"), icon: MessageSquare }
  ];

  const allBusinessItems = [
    { title: 'Marketing', url: createPageUrl("Marketing"), icon: Megaphone },
    { title: 'CRM', url: createPageUrl("Clients"), icon: UsersIcon },
    { title: t('estimates'), url: createPageUrl("Estimates"), icon: Calculator },
    { title: 'Bid Requests', url: createPageUrl("BidRequests"), icon: FileText },
    { title: 'Change Orders', url: createPageUrl("Projects?view=change_orders"), icon: Edit },
    { title: 'Invoices', url: createPageUrl("Invoices"), icon: Receipt },
    { title: t('service'), url: createPageUrl("Projects?status=service"), icon: Wrench },
    { title: 'Inventory', url: createPageUrl("Inventory"), icon: Warehouse },
    { title: t('products_services'), url: createPageUrl("ProductsServices"), icon: Package },
    { title: t('vendors'), url: createPageUrl("VendorManagement"), icon: Truck },
    { title: t('live_map'), url: createPageUrl("LiveMap"), icon: Map },
    { title: 'Users', url: createPageUrl("Users"), icon: UsersIcon },
    { title: t('training'), url: createPageUrl("Training"), icon: GraduationCap },
    { title: t('payroll'), url: createPageUrl("Payroll"), icon: CreditCard }
  ];

  const managementItems = [
    { title: t('business_settings'), url: createPageUrl("BusinessSettings"), icon: Settings },
    { title: t('financials'), url: createPageUrl("Financials"), icon: DollarSign },
    { title: 'Data Integrity', url: createPageUrl("DataIntegrity"), icon: ShieldCheck },
    { title: t('contracts'), url: createPageUrl("Contracts"), icon: FileText },
    { title: 'Insurance', url: createPageUrl("Insurance"), icon: Shield },
    { title: t('company_assets'), url: createPageUrl("CompanyAssets"), icon: Truck },
    { title: 'User Agreements', url: createPageUrl("UserAgreements"), icon: FileText },
    { title: t('accreditations'), url: createPageUrl("Accreditation"), icon: BadgeCheck },
    { title: 'Rolodex', url: createPageUrl("Rolodex"), icon: BookUser }
  ];

  const platformItems = [
    { title: t('subscription'), url: createPageUrl("Subscription"), icon: CreditCard },
    { title: 'Account Usage', url: createPageUrl("AccountUsage"), icon: BarChart3 },
    { title: 'Marketplace', url: createPageUrl("Marketplace"), icon: ShoppingCart },
    { title: 'Support Chat', url: createPageUrl("SupportChat"), icon: MessageSquare }
  ];

  const developerItems = [
    { title: 'Ad Manager', url: createPageUrl("AdManager"), icon: Monitor },
    { title: 'Developer News', url: createPageUrl("DeveloperNews"), icon: FileText }
  ];

  return {
    core: coreItems,
    business: allBusinessItems,
    management: managementItems,
    platform: platformItems,
    developer: developerItems
  };
};

// Custom hook for user and business data
function useUserAndBusiness() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserAndBusiness = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const currentUser = await User.me();
        setUser(currentUser);
        
        if (currentUser?.current_business_id) {
          setBusinessLoading(true);
          
          // Get business and business settings in parallel
          const [businessData, businessSettings] = await Promise.all([
            Business.get(currentUser.current_business_id),
            BusinessSettings.filter({ business_id: currentUser.current_business_id })
          ]);
          
          // Merge business data with settings if available
          const mergedBusiness = {
            ...businessData,
            ...(businessSettings[0] || {})
          };
          
          setBusiness(mergedBusiness);
          setBusinessLoading(false);
        }
        
      } catch (err) {
        console.error('Error loading user and business:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndBusiness();
  }, []);

  return {
    user,
    business,
    loading,
    businessLoading,
    error
  };
}

function AppLayout({ children, currentPageName }) {
  // All hooks must be called first, unconditionally, at the top level
  const { user, business, loading, error, businessLoading } = useUserAndBusiness();
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  // Define paths and domain checks immediately after hooks, before useState
  const publicPaths = [
    '/Getstimate',
    '/EstimateApproval',
    '/PublicInvoice',
    '/YourPartner',
    '/Onboarding',
    '/JoinTeam',
    '/SubcontractorPortal',
    '/functions/estimateApprovalWebhook',
    '/functions/changeOrderApprovalWebhook'
  ];
  
  const isGetstimateDomain = typeof window !== 'undefined' && 
    (window.location.hostname === 'getstimate.com' || 
     window.location.hostname === 'www.getstimate.com');
  
  const isPublicPage = publicPaths.some((path) => location.pathname.startsWith(path));

  // All state hooks after the variables they depend on
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [showBusinessSwitcher, setShowBusinessSwitcher] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);

  const [quickInsights, setQuickInsights] = useState({
    activeProjects: 0,
    pendingEstimates: 0,
    monthlyRevenue: 0
  });

  const getPageNameFromPath = useCallback((path) => {
    const page = path.split('/').pop().split('?')[0];
    return page || 'Dashboard';
  }, []);

  // Effect to load user alerts
  useEffect(() => {
    const loadAlerts = async () => {
      if (user && !isPublicPage && !isGetstimateDomain) {
        try {
          const unreadAlerts = await Alert.filter({ user_email: user.email, read: false });
          setAlerts(unreadAlerts);
        } catch (err) {
          console.error("Failed to load alerts:", err);
        }
      }
    };
    loadAlerts();
  }, [user, isPublicPage, isGetstimateDomain, location.pathname]);

  // Effect to set language based on business settings from the hook
  useEffect(() => {
    if (business && business.language && business.language !== language) {
      setLanguage(business.language);
    }
  }, [business, language, setLanguage]);

  // Load quick insights data
  useEffect(() => {
    const loadQuickInsights = async () => {
      if (!user?.current_business_id) return;

      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [projectsData, invoicesData] = await Promise.all([
          Project.list('-updated_date'),
          Invoice.filter({ status: 'paid' }, '-updated_date')
        ]);

        const activeProjects = projectsData.filter(p => p.status === 'active').length;
        const pendingEstimates = projectsData.filter(p => p.status === 'estimate' && !p.budget_approved).length;

        const recentPaidInvoices = invoicesData.filter(invoice => {
          if (!invoice.created_date) return false;
          const invoiceDate = new Date(invoice.created_date);
          return invoiceDate >= thirtyDaysAgo;
        });

        const monthlyRevenue = recentPaidInvoices.reduce((sum, invoice) => {
          return sum + (invoice.total_amount || 0);
        }, 0);

        setQuickInsights({
          activeProjects,
          pendingEstimates,
          monthlyRevenue
        });
      } catch (error) {
        console.error('Error loading quick insights:', error);
      }
    };

    if (user && !isPublicPage && !isGetstimateDomain) {
      loadQuickInsights();
    }
  }, [user, isPublicPage, isGetstimateDomain]);

  const trackPageView = useCallback(() => {
    // Only track page views for authenticated users on non-feed/onboarding pages
    if (!user || location.pathname === '/Feed' || isPublicPage || isGetstimateDomain) return;

    const recentViews = JSON.parse(localStorage.getItem('recentViews') || '[]');

    const newView = {
      path: location.pathname,
      pageName: currentPageName || t(getPageNameFromPath(location.pathname)),
      timestamp: new Date().toISOString(),
      url: location.pathname + location.search
    };

    const filteredViews = recentViews.filter((view) => view.path !== location.pathname);
    const updatedViews = [newView, ...filteredViews].slice(0, 5);

    localStorage.setItem('recentViews', JSON.stringify(updatedViews));
  }, [user, location.pathname, location.search, currentPageName, t, isPublicPage, isGetstimateDomain, getPageNameFromPath]);

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  // Now handle conditional rendering after all hooks are called
  // If accessing from getstimate.com domain, only allow the Getstimate page
  if (isGetstimateDomain) {
    // Redirect any non-Getstimate path to the Getstimate page
    if (location.pathname !== '/Getstimate') {
      return <Navigate to="/Getstimate" replace />;
    }
    // Render only the Getstimate page without any layout
    return children;
  }

  // If we're on a public page (but not getstimate.com), render it without authentication checks
  if (isPublicPage && !isGetstimateDomain) {
    return children;
  }

  // Show a generic loading screen while checking user/business status
  if (loading || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t('loading')}...</p>
        </div>
      </div>
    );
  }

  // If there's an error from the hook (e.g., failed authentication for non-public page)
  if (error) {
    console.error('AppLayout encountered an error:', error);
    User.login(); // Re-trigger login
    return null; // Don't render content
  }

  // If user exists but no business is selected/available (after loading) -> onboarding
  if (user && !business) {
    return <Navigate to="/Onboarding" replace />;
  }

  // Determine if the current user has admin/owner privileges for subscription checks and menu rendering
  const isAdmin = user?.current_business_role === 'admin' || user?.current_business_role === 'owner';
  const isSuperAdmin = user?.current_business_role === 'super_admin';

  /*
  // Check if subscription is inactive and redirect to subscription page
  if (isAdmin && !isSuperAdmin && business) {
    const isInactive = business.subscription_status === 'inactive' ||
      business.subscription_status === 'expired' ||
      business.subscription_type === 'Inactive';

    const isTrialExpired = business.subscription_type === 'Trial' &&
      business.subscription_start_date &&
      new Date() > new Date(new Date(business.subscription_start_date).getTime() + 7 * 24 * 60 * 60 * 1000);

    if ((isInactive || isTrialExpired) && location.pathname !== '/Subscription') {
      return <Navigate to="/Subscription" replace />;
    }
  }
  */

  // Redirect root path to Feed (unless it's a super admin)
  if (location.pathname === '/' && !isSuperAdmin) {
    return <Navigate to="/Feed" replace />;
  }

  const navItems = getNavigationItems(user?.current_business_role, t);

  const getUserInitials = (userObj) => {
    const name = userObj?.display_name || userObj?.full_name;
    return name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  // Helper function to determine link classes based on active path
  const getLinkClasses = (url) => {
    const base = "hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 rounded-lg";
    const active = "bg-emerald-50 text-emerald-700 font-semibold shadow-sm border border-emerald-100";
    const inactive = "text-slate-600";
    return `${base} ${location.pathname === url ? active : inactive}`;
  };

  const getAILinkClasses = (url) => {
    const base = "hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 rounded-lg";
    const active = "bg-purple-50 text-purple-700 font-semibold shadow-sm border border-purple-100";
    const inactive = "text-slate-600";
    return `${base} ${location.pathname === url ? active : inactive}`;
  };

  return (
    <SidebarProvider>
      <style global="true">{`
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) rgba(243, 244, 246, 0.5);
        }

        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }

        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background: rgb(209, 213, 219);
        }

        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background: rgb(243, 244, 246);
        }

        /* Smooth horizontal scrolling */
        .overflow-x-auto {
          scroll-behavior: smooth;
        }

        /* Table responsive scrolling */
        .table-container {
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) rgba(243, 244, 246, 0.5);
        }

        .table-container::-webkit-scrollbar {
          height: 8px;
        }

        .table-container::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 4px;
        }

        .table-container::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 4px;
        }

        .table-container::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }

        /* Hide scrollbar for mobile to save space */
        @media (max-width: 768px) {
          .mobile-hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .mobile-hide-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        }
      `}</style>

      <div className="min-h-screen flex w-full bg-slate-50">
        {/* Desktop Sidebar */}
        <Sidebar className="border-r border-slate-200/60 hidden md:flex">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-3">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0168145bd_PartnerLogo.png" alt="Getstimate Logo" className="w-10 h-10" />
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Partner</h2>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            {/* Business Switcher for Super Admin (in sidebar, for large screens) */}
            {isSuperAdmin && (
              <div className="px-3 pb-4 mb-4 border-b border-slate-200/60">
                <Button variant="outline" className="w-full" onClick={() => setShowBusinessSwitcher(true)}>
                  Switch Business
                </Button>
              </div>
            )}

            {/* Core Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                {t('core')}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navItems.core.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {item.action === 'openQuickCreate' ? (
                        <SidebarMenuButton
                          onClick={() => setIsQuickCreateOpen(true)}
                          className={`mb-1 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 rounded-lg w-full flex items-center gap-3 px-4 py-3`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          className={`mb-1 ${getLinkClasses(item.url)}`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Business Operations */}
            {navItems.business.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                  {t('business_operations')}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {navItems.business.map((item) =>
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`mb-1 ${getLinkClasses(item.url)}`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* AI Tools Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Tools BETA
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className={`mb-1 ${getAILinkClasses(createPageUrl('MaterialTakeoff'))}`}>
                          <Link to={createPageUrl('MaterialTakeoff')} className="flex items-center gap-3 px-4 py-3">
                              <ClipboardList className="w-5 h-5" />
                              <span className="font-medium">AI Material Takeoff</span>
                          </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className={`mb-1 ${getAILinkClasses(createPageUrl('AREstimator'))}`}>
                          <Link to={createPageUrl('AREstimator')} className="flex items-center gap-3 px-4 py-3">
                              <Camera className="w-5 h-5" />
                              <span className="font-medium">AI AR Estimator</span>
                          </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className={`mb-1 ${getAILinkClasses(createPageUrl('AIMarketingMaterials'))}`}>
                          <Link to={createPageUrl('AIMarketingMaterials')} className="flex items-center gap-3 px-4 py-3">
                              <Palette className="w-5 h-5" />
                              <span className="font-medium">AI Marketing Materials</span>
                          </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Management */}
            {navItems.management.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                  {t('management')}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {navItems.management.map((item) =>
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`mb-1 ${getLinkClasses(item.url)}`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Platform */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                {t('platform')}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navItems.platform.map((item) =>
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`mb-1 ${getLinkClasses(item.url)}`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Developer Section */}
            {navItems.developer.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Developer
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {navItems.developer.map((item) =>
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 rounded-lg mb-1 ${
                            location.pathname === item.url ?
                              'bg-purple-50 text-purple-700 font-semibold shadow-sm border border-purple-100' :
                              'text-slate-600'
                            }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Quick Insights */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                {t('quick_insights')}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">{t('active_projects')}</span>
                    <span className="font-bold text-slate-800">{quickInsights.activeProjects}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">{t('pending_estimates')}</span>
                    <span className="font-bold text-amber-600">{quickInsights.pendingEstimates}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">30-Day Revenue</span>
                    <span className="font-bold text-emerald-600">
                      ${quickInsights.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4">
            <div className="flex items-center gap-3 p-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profile_image_url} alt={user?.display_name || user?.full_name} />
                <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate flex items-center gap-1">
                  {user?.display_name || user?.full_name || t('user')}
                  {user?.is_trainer &&
                    <GraduationCap className="w-3 h-3 text-emerald-600" title="Certified Trainer" />
                  }
                </p>
                <p className="text-xs text-slate-500 truncate">Project Manager</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          {/* Header for both Mobile and Desktop */}
          <header className="flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-3 sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200 md:hidden" />
              <h1 className="text-xl font-bold text-slate-900 whitespace-nowrap">{currentPageName || t(getPageNameFromPath(location.pathname))}</h1>
            </div>

            {/* Scrollable top navigation items */}
            <div className="flex items-center gap-4">
              <div className="overflow-x-auto mobile-hide-scrollbar">
                <div className="flex items-center gap-2 min-w-max">
                  <NewsFeedWidget />
                  {alerts && alerts.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="relative"
                    >
                      <Link to={createPageUrl('Alerts')}>
                        <span>
                          <Bell className="w-5 h-5" />
                          <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-4 text-xs">
                            {alerts.length}
                          </Badge>
                        </span>
                      </Link>
                    </Button>
                  )}
                  {/* MessageSquare preserved */}
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={createPageUrl('Messenger')}>
                      <MessageSquare className="w-5 h-5 text-slate-600" />
                    </Link>
                  </Button>
                  {/* BusinessSwitcher as a button, triggering the existing modal */}
                  <Button variant="ghost" className="hidden md:flex items-center gap-2 px-3 whitespace-nowrap" onClick={() => setShowBusinessSwitcher(true)}>
                    <Home className="w-5 h-5" />
                    <span className="text-sm font-medium">Switch Business</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 px-3 whitespace-nowrap">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={user?.profile_image_url} alt={user?.full_name} />
                          <AvatarFallback>
                            {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium hidden lg:inline">
                          {user?.display_name || user?.full_name}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('MyPortal')}>{t('my_portal')}</Link> {/* Updated to MyPortal */}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('BusinessSettings')}>{t('business_settings')}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Subscription')}>{t('subscription')}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={User.logout}>
                        {t('logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto pb-20 md:pb-0">
            {children}
          </div>

          {/* Mobile Navigation */}
          <MobileNavigation
            onQuickCreateClick={() => setIsQuickCreateOpen(true)}
            currentUser={user} />

        </main>

        {/* Quick Create Menu */}
        {isQuickCreateOpen &&
          <QuickCreateMenu
            onClose={() => setIsQuickCreateOpen(false)}
            currentUser={user} />
        }

        {/* Business Switcher Modal */}
        {isSuperAdmin && showBusinessSwitcher && (
            <BusinessSwitcher
                isOpen={showBusinessSwitcher}
                onClose={() => setShowBusinessSwitcher(false)}
                currentUser={user}
            />
        )}
      </div>
    </SidebarProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <AppLayout currentPageName={currentPageName}>{children}</AppLayout>
    </LanguageProvider>
  );
}

