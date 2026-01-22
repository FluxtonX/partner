import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { History, ArrowRight, Clock, FolderOpen, Users, Calculator, DollarSign, Package, GraduationCap, CreditCard, LayoutDashboard, User, Bell } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

const getIconForPage = (pageName) => {
  const iconMap = {
    'Dashboard': LayoutDashboard,
    'Projects': FolderOpen,
    'Clients': Users,
    'Estimates': Calculator,
    'Financials': DollarSign,
    'Products & Services': Package,
    'Training': GraduationCap,
    'Payroll': CreditCard,
    'My Portal': User,
    'Alerts': Bell
  };
  
  return iconMap[pageName] || FolderOpen;
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM d');
  }
};

export default function RecentViews() {
  const [recentViews, setRecentViews] = useState([]);

  useEffect(() => {
    loadRecentViews();
  }, []);

  const loadRecentViews = () => {
    const views = JSON.parse(localStorage.getItem('recentViews') || '[]');
    setRecentViews(views);
  };

  if (recentViews.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <History className="w-5 h-5" />
            Recent Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No recent activity</p>
            <p className="text-slate-400 text-xs">Your recent page visits will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <History className="w-5 h-5" />
          Recent Views
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentViews.map((view, index) => {
          const IconComponent = getIconForPage(view.pageName);
          
          return (
            <Link
              key={`${view.path}-${index}`}
              to={view.url}
              className="group"
            >
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-slate-200 transition-colors">
                    <IconComponent className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate group-hover:text-emerald-600 transition-colors">
                      {view.pageName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatTimestamp(view.timestamp)}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100" />
              </div>
            </Link>
          );
        })}
        
        {recentViews.length === 0 && (
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm">No recent views</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}