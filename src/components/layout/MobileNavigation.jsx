import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MessageSquare, Home, Plus, Calendar, FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/providers/LanguageContext';

export default function MobileNavigation({ onQuickCreateClick, currentUser }) {
  const location = useLocation();
  const { t } = useLanguage();

  const mobileNavItems = [
    {
      title: t('feed'),
      url: createPageUrl("Feed"),
      icon: MessageSquare,
      id: "feed"
    },
    {
      title: t('my_portal'), 
      url: createPageUrl("UserPortal"),
      icon: Home,
      id: "portal"
    },
    {
      title: "New",
      icon: Plus,
      id: "create",
      action: onQuickCreateClick
    },
    {
      title: t('calendar'),
      url: createPageUrl("Calendar"),
      icon: Calendar,
      id: "calendar"
    },
    {
      title: t('projects'),
      url: createPageUrl("Projects"),
      icon: FolderOpen,
      id: "projects"
    }
  ];

  const isActive = (item) => {
    if (item.id === 'feed' && location.pathname.includes('Feed')) return true;
    if (item.id === 'portal' && location.pathname.includes('UserPortal')) return true;
    if (item.id === 'calendar' && location.pathname.includes('Calendar')) return true;
    if (item.id === 'projects' && location.pathname.includes('Projects')) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200/60 px-4 py-2 md:hidden">
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const active = isActive(item);
          const IconComponent = item.icon;

          if (item.action) {
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="flex flex-col items-center justify-center py-2 px-3 min-w-0 relative"
              >
                <div className={`p-2 rounded-full transition-colors ${
                  active ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:text-emerald-600'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-1 font-medium ${
                  active ? 'text-emerald-600' : 'text-slate-500'
                }`}>
                  {item.title}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.url}
              className="flex flex-col items-center justify-center py-2 px-3 min-w-0 relative"
            >
              <div className={`p-2 rounded-full transition-colors ${
                active ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:text-emerald-600'
              }`}>
                <IconComponent className="w-5 h-5" />
                {item.badge && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${
                active ? 'text-emerald-600' : 'text-slate-500'
              }`}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}